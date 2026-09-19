import { registerAs } from '@nestjs/config';

export default registerAs('openrouter', () => ({
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
  model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
  baseUrl:
    process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  /** Límite de tokens de salida por sugerencia (control de costo en OpenRouter). */
  maxTokens: Number.parseInt(process.env.OPENROUTER_MAX_TOKENS ?? '512', 10) || 512,
  /** Reutilizar la última sugerencia del mismo diagnóstico (segundos). 0 = desactivado. */
  cacheTtlSeconds:
    Number.parseInt(process.env.OPENROUTER_CACHE_TTL_SECONDS ?? '90', 10) || 0,
}));
