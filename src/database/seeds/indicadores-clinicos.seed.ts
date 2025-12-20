import { DataSource } from 'typeorm';
import { CategoriaIndicador } from 'src/modules/indicadores-clinicos/entities/categorias-indicadores.entity';
import { IndicadorClinico } from 'src/modules/indicadores-clinicos/entities/indicadores-clinicos.entity';
import { IndicadorUnidad } from 'src/common/enums/indicador-unidad.enum';

export async function seedIndicadoresClinicos(dataSource: DataSource) {
  const categorias = await dataSource.manager.save(CategoriaIndicador, [
    { descripcion: 'Curso y gravedad de la EM' },
    { descripcion: 'Indicadores neurocognitivos y evaluación psicológica' },
    { descripcion: 'Comorbilidad y carga terapéutica' },
    { descripcion: 'Síntomas e impacto funcional global' },
  ]);

  const indicadores = [
    {
      nombre: 'EDSS',
      descripcion:
        'Expanded Disability Status Scale (0-10) para gravedad global.',
      unidad: IndicadorUnidad.NUMERO,
      categoriaIndicador: categorias[0],
    },
    {
      nombre: 'T25FW',
      descripcion:
        'Timed 25-Foot Walk. Tiempo en segundos, velocidad de marcha.',
      unidad: IndicadorUnidad.NUMERO,
      categoriaIndicador: categorias[0],
    },
    {
      nombre: '9HPT',
      descripcion:
        'Nine-Hole Peg Test. Tiempo en segundos para destreza manual.',
      unidad: IndicadorUnidad.NUMERO,
      categoriaIndicador: categorias[0],
    },
    {
      nombre: 'RM',
      descripcion: 'Resonancia magnética. Número de lesiones y atrofia.',
      unidad: IndicadorUnidad.NUMERO,
      categoriaIndicador: categorias[0],
    },
    {
      nombre: 'SDMT',
      descripcion: 'Symbol Digit Modalities Test. Velocidad de procesamiento.',
      unidad: IndicadorUnidad.NUMERO,
      categoriaIndicador: categorias[1],
    },
    {
      nombre: 'PASAT',
      descripcion: 'Paced Auditory Serial Addition Test. Atención sostenida.',
      unidad: IndicadorUnidad.NUMERO,
      categoriaIndicador: categorias[1],
    },
    {
      nombre: 'Número de comorbilidades',
      descripcion: 'Recuento de diagnósticos crónicos adicionales.',
      unidad: IndicadorUnidad.NUMERO,
      categoriaIndicador: categorias[2],
    },
    {
      nombre: 'Número de fármacos concomitantes',
      descripcion: 'Medicamentos no DMT; evalúa polifarmacia.',
      unidad: IndicadorUnidad.NUMERO,
      categoriaIndicador: categorias[2],
    },
    {
      nombre: 'Fatiga clínicamente significativa',
      descripcion: 'Fatiga medida con escalas validadas o valoración clínica.',
      unidad: IndicadorUnidad.TEXTO,
      categoriaIndicador: categorias[3],
    },
    {
      nombre: 'Impacto funcional global',
      descripcion:
        'Movilidad, marcha, manos, caídas, espasticidad, dolor, etc.',
      unidad: IndicadorUnidad.TEXTO,
      categoriaIndicador: categorias[3],
    },
  ];

  await dataSource.manager.save(IndicadorClinico, indicadores);
}
