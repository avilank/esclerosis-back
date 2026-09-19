import { DataSource } from 'typeorm';
import { Tratamiento } from 'src/modules/tratamientos/entities/tratamiento.entity';
import { Receta } from 'src/modules/recetas/entities/receta.entity';

const tratamientos = [
  {
    nombre: 'Interferones beta (IFN beta-1a, beta-1b, pegilado) - SC/IM',
    descripcion:
      'Interferones beta - administración subcutánea o intramuscular',
    bloqueado: true,
  },
  {
    nombre: 'Acetato de glatiramero - SC',
    descripcion: 'Acetato de glatiramero - administración subcutánea',
    bloqueado: true,
  },
  {
    nombre: 'Teriflunomida - oral',
    descripcion: 'Teriflunomida por vía oral',
    bloqueado: true,
  },
  {
    nombre: 'Dimetilfumarato - oral',
    descripcion: 'Dimetilfumarato por vía oral',
    bloqueado: true,
  },
  {
    nombre: 'Rituximab',
    descripcion: 'Rituximab',
    bloqueado: true,
  },
  {
    nombre: 'Natalizumab - IV',
    descripcion: 'Natalizumab por vía intravenosa',
    bloqueado: true,
  },
  {
    nombre: 'Ocrelizumab - IV (anti-CD20)',
    descripcion: 'Ocrelizumab por vía intravenosa (anti-CD20)',
    bloqueado: true,
  },
  {
    nombre: 'Fingolimod / siponimod - orales',
    descripcion: 'Fingolimod y siponimod por vía oral',
    bloqueado: true,
  },
  {
    nombre: 'Cladribina - oral por ciclos',
    descripcion: 'Cladribina por vía oral en ciclos',
    bloqueado: true,
  },
  {
    nombre: 'Alemtuzumab - IV por ciclos',
    descripcion: 'Alemtuzumab por vía intravenosa en ciclos',
    bloqueado: true,
  },
  {
    nombre: 'Mitoxantrone',
    descripcion: 'Mitoxantrone',
    bloqueado: true,
  },
  {
    nombre: 'Siponimod',
    descripcion: 'Siponimod',
    bloqueado: true,
  },
  {
    nombre: 'Ozanimod',
    descripcion: 'Ozanimod',
    bloqueado: true,
  },
  {
    nombre: 'Ponesimod',
    descripcion: 'Ponesimod',
    bloqueado: true,
  },
];

/**
 * @param reset Si es true, borra recetas y tratamientos antes de insertar (solo uso manual).
 */
export async function seedTratamientos(
  dataSource: DataSource,
  options?: { reset?: boolean },
) {
  const tratamientoRepo = dataSource.getRepository(Tratamiento);
  const recetaRepo = dataSource.getRepository(Receta);

  if (options?.reset) {
    await recetaRepo.createQueryBuilder().delete().where('1=1').execute();
    await tratamientoRepo.createQueryBuilder().delete().where('1=1').execute();
  } else {
    const existentes = await tratamientoRepo.count({ where: { isActive: true } });
    if (existentes > 0) {
      console.log(`💊 Ya hay ${existentes} tratamientos activos; seed omitido`);
      return;
    }
  }

  const rows = tratamientos.map((t) => ({ ...t, isActive: true }));
  await tratamientoRepo.save(rows);
  console.log(`💊 ${rows.length} tratamientos creados (catálogo DMT)`);
}
