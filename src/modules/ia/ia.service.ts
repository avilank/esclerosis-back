import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  BadGatewayException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiagnosticosService } from '../diagnosticos/services/diagnosticos.service';
import { TratamientosService } from '../tratamientos/services/tratamientos.service';
import { Diagnostico } from '../diagnosticos/entities/diagnostico.entity';
import { Tratamiento } from '../tratamientos/entities/tratamiento.entity';

export type SugerenciaRecetaIa = {
  modelo: string;
  tratamiento_seleccionado: string;
  tratamiento_ids: number[];
  descripcion_receta: string;
  justificacion: string;
  aviso_seguridad: string;
};

type ModeloJson = {
  tratamiento_ids?: unknown;
  tratamiento_seleccionado?: unknown;
  descripcion_receta?: unknown;
  justificacion?: unknown;
  aviso_seguridad?: unknown;
};

type CacheEntry = { at: number; result: SugerenciaRecetaIa };

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly sugerenciaCache = new Map<number, CacheEntry>();

  constructor(
    private readonly configService: ConfigService,
    private readonly diagnosticosService: DiagnosticosService,
    private readonly tratamientosService: TratamientosService,
  ) {}

  /** Lee la API key en cada petición (tras cambiar `.env` hace falta reiniciar `npm run dev`). */
  private resolveOpenRouterApiKey(): string {
    const fromConfig = this.configService.get<string>('openrouter.apiKey') ?? '';
    const fromEnv = process.env.OPENROUTER_API_KEY ?? '';
    return (fromConfig || fromEnv).trim();
  }

  async sugerirReceta(
    idDiagnostico: number,
    regenerar = false,
  ): Promise<SugerenciaRecetaIa> {
    const apiKey = this.resolveOpenRouterApiKey();
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OPENROUTER_API_KEY no está configurada en el backend.',
      );
    }

    const cacheTtlMs = this.cacheTtlMs();
    if (!regenerar && cacheTtlMs > 0) {
      const cached = this.sugerenciaCache.get(idDiagnostico);
      if (cached && Date.now() - cached.at < cacheTtlMs) {
        this.logger.debug(
          `Sugerencia IA en caché para diagnóstico ${idDiagnostico} (sin llamar a OpenRouter)`,
        );
        return cached.result;
      }
    }

    const diagnostico = await this.diagnosticosService.findOne(idDiagnostico);
    const tratamientos = await this.tratamientosService.findAll();
    if (!tratamientos.length) {
      throw new UnprocessableEntityException(
        'No hay tratamientos activos para sugerir una receta.',
      );
    }

    const model =
      this.configService.get<string>('openrouter.model') || 'google/gemini-2.5-flash';
    const baseUrl = (
      this.configService.get<string>('openrouter.baseUrl') ||
      'https://openrouter.ai/api/v1'
    ).replace(/\/$/, '');

    const maxTokens =
      this.configService.get<number>('openrouter.maxTokens') ?? 512;

    const content = await this.callOpenRouter({
      apiKey,
      baseUrl,
      model,
      maxTokens,
      system: this.systemPrompt(),
      user: this.userPrompt(diagnostico, tratamientos),
    });

    const parsed = this.parseModelJson(content);
    const matched = this.matchTratamiento(parsed, tratamientos);
    if (!matched) {
      throw new UnprocessableEntityException(
        'La IA no devolvió un tratamiento del catálogo.',
      );
    }

    const result: SugerenciaRecetaIa = {
      modelo: 'OpenRouter',
      tratamiento_seleccionado: matched.nombre,
      tratamiento_ids: [matched.idTratamiento],
      descripcion_receta: this.asString(parsed.descripcion_receta),
      justificacion: this.asString(parsed.justificacion),
      aviso_seguridad:
        this.asString(parsed.aviso_seguridad) ||
        'Esta recomendación es orientativa y debe ser validada por un neurólogo especialista.',
    };

    if (cacheTtlMs > 0) {
      this.sugerenciaCache.set(idDiagnostico, { at: Date.now(), result });
    }

    return result;
  }

  private cacheTtlMs(): number {
    const seconds =
      this.configService.get<number>('openrouter.cacheTtlSeconds') ?? 90;
    return seconds > 0 ? seconds * 1000 : 0;
  }

  private systemPrompt(): string {
    return [
      'Asistente de prescripción en EM. Elige UN tratamiento del catálogo (por id).',
      'Responde solo JSON con: tratamiento_ids, tratamiento_seleccionado, descripcion_receta, justificacion, aviso_seguridad.',
      'Textos breves. No inventes ids. Sugerencia orientativa para el médico.',
    ].join(' ');
  }

  private userPrompt(
    diagnostico: Diagnostico,
    tratamientos: Tratamiento[],
  ): string {
    const paciente = diagnostico.historiaClinica?.paciente;
    const indicadores = (diagnostico.IndicadoresClinicos ?? [])
      .filter((item) => item.valor?.trim())
      .map((item) => ({
        n: item.indicadorClinico?.nombre,
        v: item.valor,
        u: item.indicadorClinico?.unidad,
      }));

    const payload = {
      dx: {
        estado: diagnostico.estadoSalud,
        grado: diagnostico.gradoEnfermedad,
        obs: diagnostico.observaciones?.slice(0, 500) ?? null,
        inicial: diagnostico.es_diagnostico_inicial,
        paciente: paciente
          ? { edad: paciente.edadPaciente, genero: paciente.generoPaciente }
          : null,
        ind: indicadores,
      },
      catalogo: tratamientos.map((t) => ({
        id: t.idTratamiento,
        nombre: t.nombre,
      })),
    };

    return JSON.stringify(payload);
  }

  private async callOpenRouter(params: {
    apiKey: string;
    baseUrl: string;
    model: string;
    maxTokens: number;
    system: string;
    user: string;
  }): Promise<string> {
    let response: Response;
    try {
      response = await fetch(`${params.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${params.apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'Esclerosis',
        },
        body: JSON.stringify({
          model: params.model,
          messages: [
            { role: 'system', content: params.system },
            { role: 'user', content: params.user },
          ],
          temperature: 0.2,
          max_tokens: params.maxTokens,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(120_000),
      });
    } catch (error) {
      this.logger.error('Fallo de red hacia OpenRouter', error);
      throw new BadGatewayException('No se pudo contactar OpenRouter.');
    }

    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };

    const usage = body.usage;
    if (usage?.total_tokens != null) {
      this.logger.log(
        `OpenRouter tokens (prompt=${usage.prompt_tokens ?? '?'}, completion=${usage.completion_tokens ?? '?'}, total=${usage.total_tokens})`,
      );
    }

    if (!response.ok) {
      const detail = body.error?.message || `HTTP ${response.status}`;
      this.logger.error(`OpenRouter respondió error: ${detail}`);
      throw new BadGatewayException(
        `OpenRouter no pudo generar la receta: ${detail}`,
      );
    }

    const content = body.choices?.[0]?.message?.content;
    if (!content?.trim()) {
      throw new BadGatewayException('OpenRouter devolvió una respuesta vacía.');
    }
    return content;
  }

  private parseModelJson(content: string): ModeloJson {
    const raw = this.extractJsonObject(content);
    try {
      return JSON.parse(raw) as ModeloJson;
    } catch {
      this.logger.error(`JSON inválido de OpenRouter: ${content.slice(0, 500)}`);
      throw new UnprocessableEntityException(
        'La IA no devolvió un JSON válido.',
      );
    }
  }

  private extractJsonObject(content: string): string {
    const trimmed = content.trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = (fenced?.[1] ?? trimmed).trim();
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start < 0 || end <= start) {
      throw new UnprocessableEntityException(
        'La IA no devolvió un JSON válido.',
      );
    }
    return candidate.slice(start, end + 1);
  }

  private matchTratamiento(
    parsed: ModeloJson,
    tratamientos: Tratamiento[],
  ): Tratamiento | undefined {
    const ids = this.parseIds(parsed.tratamiento_ids);
    for (const id of ids) {
      const byId = tratamientos.find((t) => t.idTratamiento === id);
      if (byId) return byId;
    }
    const nombre = this.asString(parsed.tratamiento_seleccionado)
      .trim()
      .toLowerCase();
    if (!nombre) return undefined;
    return tratamientos.find((t) => t.nombre.trim().toLowerCase() === nombre);
  }

  private parseIds(raw: unknown): number[] {
    if (Array.isArray(raw)) {
      return raw
        .map((item) => Number.parseInt(String(item), 10))
        .filter((n) => Number.isFinite(n));
    }
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return [Math.trunc(raw)];
    }
    if (typeof raw === 'string' && raw.trim()) {
      return raw
        .split(/[,\s]+/)
        .map((part) => Number.parseInt(part, 10))
        .filter((n) => Number.isFinite(n));
    }
    return [];
  }

  private asString(value: unknown): string {
    if (value == null) return '';
    return String(value).trim();
  }
}
