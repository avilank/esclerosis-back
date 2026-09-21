import { DataSource } from 'typeorm';
import { CategoriaIndicador } from 'src/modules/indicadores-clinicos/entities/categorias-indicadores.entity';
import { IndicadorClinico } from 'src/modules/indicadores-clinicos/entities/indicadores-clinicos.entity';
import { IndicadorUnidad } from 'src/common/enums/indicador-unidad.enum';

const CATEGORIAS = [
  'Curso y gravedad de la EM',
  'Indicadores neurocognitivos y evaluación psicológica',
  'Comorbilidad y carga terapéutica',
  'Síntomas e impacto funcional global',
] as const;

type IndicadorSeed = {
  nombre: string;
  descripcion: string;
  unidad: IndicadorUnidad;
  categoriaIndex: number;
};

const INDICADORES: IndicadorSeed[] = [
  {
    nombre: 'EDSS',
    descripcion:
      'Expanded Disability Status Scale (0-10) para gravedad global.',
    unidad: IndicadorUnidad.NUMERO,
    categoriaIndex: 0,
  },
  {
    nombre: 'T25FW',
    descripcion: 'Timed 25-Foot Walk. Tiempo en segundos, velocidad de marcha.',
    unidad: IndicadorUnidad.NUMERO,
    categoriaIndex: 0,
  },
  {
    nombre: '9HPT',
    descripcion: 'Nine-Hole Peg Test. Tiempo en segundos para destreza manual.',
    unidad: IndicadorUnidad.NUMERO,
    categoriaIndex: 0,
  },
  {
    nombre: 'RM',
    descripcion: 'Resonancia magnética. Número de lesiones y atrofia.',
    unidad: IndicadorUnidad.NUMERO,
    categoriaIndex: 0,
  },
  {
    nombre: 'SDMT',
    descripcion: 'Symbol Digit Modalities Test. Velocidad de procesamiento.',
    unidad: IndicadorUnidad.NUMERO,
    categoriaIndex: 1,
  },
  {
    nombre: 'PASAT',
    descripcion: 'Paced Auditory Serial Addition Test. Atención sostenida.',
    unidad: IndicadorUnidad.NUMERO,
    categoriaIndex: 1,
  },
  {
    nombre: 'Número de comorbilidades',
    descripcion: 'Recuento de diagnósticos crónicos adicionales.',
    unidad: IndicadorUnidad.NUMERO,
    categoriaIndex: 2,
  },
  {
    nombre: 'Número de fármacos concomitantes',
    descripcion: 'Medicamentos no DMT; evalúa polifarmacia.',
    unidad: IndicadorUnidad.NUMERO,
    categoriaIndex: 2,
  },
  {
    nombre: 'Fatiga clínicamente significativa',
    descripcion: 'Fatiga medida con escalas validadas o valoración clínica.',
    unidad: IndicadorUnidad.TEXTO,
    categoriaIndex: 3,
  },
  {
    nombre: 'Impacto funcional global',
    descripcion: 'Movilidad, marcha, manos, caídas, espasticidad, dolor, etc.',
    unidad: IndicadorUnidad.TEXTO,
    categoriaIndex: 3,
  },
];

export async function seedIndicadoresClinicos(dataSource: DataSource) {
  console.log('📊 [1/3] Indicadores clínicos...');

  const catRepo = dataSource.getRepository(CategoriaIndicador);
  const indRepo = dataSource.getRepository(IndicadorClinico);

  const categorias: CategoriaIndicador[] = [];
  let catsCreadas = 0;

  for (const descripcion of CATEGORIAS) {
    let cat = await catRepo.findOne({ where: { descripcion } });
    if (!cat) {
      cat = await catRepo.save(
        catRepo.create({ descripcion, isActive: true, bloqueado: false }),
      );
      catsCreadas++;
    }
    categorias.push(cat);
  }

  let indsCreados = 0;
  for (const item of INDICADORES) {
    const existe = await indRepo.findOne({ where: { nombre: item.nombre } });
    if (existe) continue;

    await indRepo.save(
      indRepo.create({
        nombre: item.nombre,
        descripcion: item.descripcion,
        unidad: item.unidad,
        categoriaIndicador: categorias[item.categoriaIndex],
        isActive: true,
        bloqueado: false,
      }),
    );
    indsCreados++;
  }

  console.log(
    `   ✅ Categorías: ${catsCreadas} nuevas / Indicadores: ${indsCreados} nuevos`,
  );
}
