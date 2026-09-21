/**
 * Las columnas `type: 'date'` de Postgres las devuelve TypeORM como string
 * 'YYYY-MM-DD' (ver `PostgresDriver.prepareHydratedValue` ->
 * `DateUtils.mixedDateToDateString`), NO como `Date`. Llamar metodos de `Date`
 * sobre esos valores revienta en tiempo de ejecucion.
 *
 * Estos helpers trabajan directamente sobre el string y evitan los desfases de
 * huso horario de `new Date('YYYY-MM-DD')` (que interpreta UTC).
 */

/** Partes de una fecha `date`, ya sea string 'YYYY-MM-DD' o `Date`. */
export interface PartesFecha {
  anio: number;
  mes: number;
  dia: number;
  trimestre: number;
  /** Clave de `DimTiempo.Fecha_Id`: YYYYMMDD como entero. */
  fechaId: number;
}

/** `'2026-09-20'` (o un `Date`) -> `'2026-09-20'`. `null` si no se puede leer. */
export function aFechaIso(
  valor: string | Date | null | undefined,
): string | null {
  if (!valor) return null;
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime())
      ? null
      : valor.toISOString().substring(0, 10);
  }
  const texto = String(valor).trim();
  return /^\d{4}-\d{2}-\d{2}/.test(texto) ? texto.substring(0, 10) : null;
}

/** Descompone una fecha `date` sin pasar por `Date` (sin desfase de huso). */
export function partesDeFecha(
  valor: string | Date | null | undefined,
): PartesFecha | null {
  const iso = aFechaIso(valor);
  if (!iso) return null;

  const anio = Number.parseInt(iso.substring(0, 4), 10);
  const mes = Number.parseInt(iso.substring(5, 7), 10);
  const dia = Number.parseInt(iso.substring(8, 10), 10);
  if (!anio || !mes || !dia) return null;

  return {
    anio,
    mes,
    dia,
    trimestre: Math.floor((mes - 1) / 3) + 1,
    fechaId: anio * 10000 + mes * 100 + dia,
  };
}
