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

export async function seedTratamientos(dataSource: DataSource) {
  const tratamientoRepo = dataSource.getRepository(Tratamiento);
  const recetaRepo = dataSource.getRepository(Receta);

  // Limpieza respetando FKs (delete con where true para evitar criterio vacío)
  await recetaRepo.createQueryBuilder().delete().where('1=1').execute();
  await tratamientoRepo.createQueryBuilder().delete().where('1=1').execute();

  await tratamientoRepo.save(tratamientos);
  console.log(`💊 ${tratamientos.length} tratamientos creados (bloqueados)`);
}
