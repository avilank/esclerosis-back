import { DataSource } from 'typeorm';
import { Area } from 'src/modules/areas/entities/area.entity';
import { Sede } from 'src/modules/sedes/entities/sede.entity';
import { CategoriaIndicador } from 'src/modules/indicadores-clinicos/entities/categorias-indicadores.entity';
import { Tratamiento } from 'src/modules/tratamientos/entities/tratamiento.entity';
import { Rol } from 'src/modules/auth/roles/entities/role.entity';
import { Permiso } from 'src/modules/auth/permisos/entities/permiso.entity';
import { Usuario } from 'src/modules/usuarios/entities/usuario.entity';
import { Paciente } from 'src/modules/pacientes/entities/paciente.entity';
import { Medico } from 'src/modules/medicos/entities/medico.entity';
import { HistoriaClinica } from 'src/modules/historias-clinicas/entities/historias-clinica.entity';
import { IndicadorClinico } from 'src/modules/indicadores-clinicos/entities/indicadores-clinicos.entity';
import { Diagnostico } from 'src/modules/diagnosticos/entities/diagnostico.entity';
import { Receta } from 'src/modules/recetas/entities/receta.entity';
import { PermisoRol } from 'src/modules/auth/permisos/entities/permiso-rol.entity';
import { IndicadorClinicoDiagnostico } from 'src/modules/indicadores-clinicos/entities/indicador-clinico-diagnostico.entity';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(dataSource: DataSource) {
  console.log('🌱 Iniciando seeders...');

  try {
    // Limpiar tablas (en orden inverso de dependencias)
    await dataSource.manager.delete(IndicadorClinicoDiagnostico, {});
    await dataSource.manager.delete(Receta, {});
    await dataSource.manager.delete(Diagnostico, {});
    await dataSource.manager.delete(HistoriaClinica, {});
    await dataSource.manager.delete(IndicadorClinico, {});
    await dataSource.manager.delete(Medico, {});
    await dataSource.manager.delete(Paciente, {});
    await dataSource.manager.delete(Usuario, {});
    await dataSource.manager.delete(PermisoRol, {});
    await dataSource.manager.delete(Permiso, {});
    await dataSource.manager.delete(Rol, {});
    await dataSource.manager.delete(Tratamiento, {});
    await dataSource.manager.delete(CategoriaIndicador, {});
    await dataSource.manager.delete(Sede, {});
    await dataSource.manager.delete(Area, {});

    // 1. Areas
    console.log('📋 Creando áreas...');
    const areas = [
      { descripcion: 'Neurología' },
      { descripcion: 'Reumatología' },
      { descripcion: 'Fisioterapia' },
      { descripcion: 'Psicología' },
      { descripcion: 'Medicina General' },
    ];
    const savedAreas = await dataSource.manager.save(Area, areas);
    console.log(`✅ ${savedAreas.length} áreas creadas`);

    // 2. Sedes
    console.log('🏥 Creando sedes...');
    const sedes = [
      { nombre: 'Sede Central', direccion: 'Av. Principal 123' },
      { nombre: 'Sede Norte', direccion: 'Calle Norte 456' },
      { nombre: 'Sede Sur', direccion: 'Av. Sur 789' },
    ];
    const savedSedes = await dataSource.manager.save(Sede, sedes);
    console.log(`✅ ${savedSedes.length} sedes creadas`);

    // 3. Categorías de Indicadores
    console.log('📊 Creando categorías de indicadores...');
    const categoriasIndicadores = [
      { descripcion: 'Signos Vitales' },
      { descripcion: 'Función Motora' },
      { descripcion: 'Función Cognitiva' },
      { descripcion: 'Función Sensorial' },
      { descripcion: 'Calidad de Vida' },
    ];
    const savedCategoriasIndicadores = await dataSource.manager.save(
      CategoriaIndicador,
      categoriasIndicadores,
    );
    console.log(`✅ ${savedCategoriasIndicadores.length} categorías creadas`);

    // 4. Indicadores Clínicos
    console.log('📈 Creando indicadores clínicos...');
    const indicadoresClinicos = [
      {
        idCategoriaIndicador: savedCategoriasIndicadores[0].idTipoIndicador,
        nombre: 'Presión Arterial',
        unidad: 'mmHg',
        descripcion: 'Medición de presión arterial sistólica y diastólica',
      },
      {
        idCategoriaIndicador: savedCategoriasIndicadores[0].idTipoIndicador,
        nombre: 'Frecuencia Cardíaca',
        unidad: 'bpm',
        descripcion: 'Latidos por minuto',
      },
      {
        idCategoriaIndicador: savedCategoriasIndicadores[1].idTipoIndicador,
        nombre: 'Fuerza Muscular',
        unidad: 'escala 0-5',
        descripcion: 'Evaluación de fuerza muscular',
      },
      {
        idCategoriaIndicador: savedCategoriasIndicadores[1].idTipoIndicador,
        nombre: 'Amplitud de Movimiento',
        unidad: 'grados',
        descripcion: 'Rango de movimiento articular',
      },
      {
        idCategoriaIndicador: savedCategoriasIndicadores[2].idTipoIndicador,
        nombre: 'Escala EDSS',
        unidad: '0-10',
        descripcion: 'Escala expandida del estado de discapacidad',
      },
    ];
    const savedIndicadoresClinicos = await dataSource.manager.save(
      IndicadorClinico,
      indicadoresClinicos,
    );
    console.log(`✅ ${savedIndicadoresClinicos.length} indicadores creados`);

    // 5. Tratamientos
    console.log('💊 Creando tratamientos...');
    const tratamientos = [
      { nombre: 'Interferón Beta-1a' },
      { nombre: 'Interferón Beta-1b' },
      { nombre: 'Glatiramer Acetato' },
      { nombre: 'Fingolimod' },
      { nombre: 'Natalizumab' },
      { nombre: 'Ocrelizumab' },
      { nombre: 'Fisioterapia' },
      { nombre: 'Terapia Ocupacional' },
    ];
    const savedTratamientos = await dataSource.manager.save(
      Tratamiento,
      tratamientos,
    );
    console.log(`✅ ${savedTratamientos.length} tratamientos creados`);

    // 6. Roles
    console.log('👤 Creando roles...');
    const roles = [
      { nombre: 'Administrador', descripcion: 'Administrador del sistema' },
      { nombre: 'Médico', descripcion: 'Médico especialista' },
      { nombre: 'Paciente', descripcion: 'Paciente del sistema' },
      { nombre: 'Secretario', descripcion: 'Personal administrativo' },
    ];
    const savedRoles = await dataSource.manager.save(Rol, roles);
    console.log(`✅ ${savedRoles.length} roles creados`);

    // 7. Permisos
    console.log('🔐 Creando permisos...');
    const permisos = [
      { nombre: 'ver_pacientes', descripcion: 'Ver información de pacientes' },
      { nombre: 'crear_pacientes', descripcion: 'Crear nuevos pacientes' },
      { nombre: 'editar_pacientes', descripcion: 'Editar información de pacientes' },
      { nombre: 'ver_diagnosticos', descripcion: 'Ver diagnósticos' },
      { nombre: 'crear_diagnosticos', descripcion: 'Crear diagnósticos' },
      { nombre: 'editar_diagnosticos', descripcion: 'Editar diagnósticos' },
      { nombre: 'ver_recetas', descripcion: 'Ver recetas médicas' },
      { nombre: 'crear_recetas', descripcion: 'Crear recetas médicas' },
      { nombre: 'administrar_sistema', descripcion: 'Administrar sistema completo' },
    ];
    const savedPermisos = await dataSource.manager.save(Permiso, permisos);
    console.log(`✅ ${savedPermisos.length} permisos creados`);

    // 8. Permisos por Rol
    console.log('🔗 Asignando permisos a roles...');
    const permisosRoles = [
      // Admin tiene todos los permisos
      ...savedPermisos.map((p) => ({
        idRol: savedRoles[0].idRol, // Administrador
        idPermiso: p.idPermiso,
      })),
      // Médico tiene permisos de pacientes y diagnósticos
      { idRol: savedRoles[1].idRol, idPermiso: savedPermisos[0].idPermiso }, // ver_pacientes
      { idRol: savedRoles[1].idRol, idPermiso: savedPermisos[1].idPermiso }, // crear_pacientes
      { idRol: savedRoles[1].idRol, idPermiso: savedPermisos[2].idPermiso }, // editar_pacientes
      { idRol: savedRoles[1].idRol, idPermiso: savedPermisos[3].idPermiso }, // ver_diagnosticos
      { idRol: savedRoles[1].idRol, idPermiso: savedPermisos[4].idPermiso }, // crear_diagnosticos
      { idRol: savedRoles[1].idRol, idPermiso: savedPermisos[5].idPermiso }, // editar_diagnosticos
      { idRol: savedRoles[1].idRol, idPermiso: savedPermisos[6].idPermiso }, // ver_recetas
      { idRol: savedRoles[1].idRol, idPermiso: savedPermisos[7].idPermiso }, // crear_recetas
      // Paciente solo puede ver su propia información
      { idRol: savedRoles[2].idRol, idPermiso: savedPermisos[0].idPermiso }, // ver_pacientes (solo propio)
      { idRol: savedRoles[2].idRol, idPermiso: savedPermisos[3].idPermiso }, // ver_diagnosticos (solo propios)
      { idRol: savedRoles[2].idRol, idPermiso: savedPermisos[6].idPermiso }, // ver_recetas (solo propias)
    ];
    await dataSource.manager.save(PermisoRol, permisosRoles);
    console.log(`✅ Permisos asignados a roles`);

    // 9. Usuarios
    console.log('👥 Creando usuarios...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const usuarios = [
      {
        username: 'admin',
        email: 'admin@esclerosis.com',
        password: hashedPassword,
        estado: true,
        idRol: savedRoles[0].idRol, // Administrador
      },
      {
        username: 'dr_garcia',
        email: 'dr.garcia@esclerosis.com',
        password: hashedPassword,
        estado: true,
        idRol: savedRoles[1].idRol, // Médico
      },
      {
        username: 'dr_rodriguez',
        email: 'dr.rodriguez@esclerosis.com',
        password: hashedPassword,
        estado: true,
        idRol: savedRoles[1].idRol, // Médico
      },
      {
        username: 'paciente1',
        email: 'paciente1@esclerosis.com',
        password: hashedPassword,
        estado: true,
        idRol: savedRoles[2].idRol, // Paciente
      },
      {
        username: 'paciente2',
        email: 'paciente2@esclerosis.com',
        password: hashedPassword,
        estado: true,
        idRol: savedRoles[2].idRol, // Paciente
      },
    ];
    const savedUsuarios = await dataSource.manager.save(Usuario, usuarios);
    console.log(`✅ ${savedUsuarios.length} usuarios creados`);

    // 10. Médicos
    console.log('👨‍⚕️ Creando médicos...');
    const medicos = [
      {
        nombre: 'Dr. Carlos García',
        genero: 'Masculino',
        especialidad: 'Neurología',
        numeroColegiatura: 'NEU001',
        idArea: savedAreas[0].idArea, // Neurología
        idSede: savedSedes[0].idSede, // Sede Central
        idUsuario: savedUsuarios[1].idUsuario, // dr_garcia
      },
      {
        nombre: 'Dra. Ana Rodríguez',
        genero: 'Femenino',
        especialidad: 'Reumatología',
        numeroColegiatura: 'REU001',
        idArea: savedAreas[1].idArea, // Reumatología
        idSede: savedSedes[0].idSede, // Sede Central
        idUsuario: savedUsuarios[2].idUsuario, // dr_rodriguez
      },
    ];
    const savedMedicos = await dataSource.manager.save(Medico, medicos);
    console.log(`✅ ${savedMedicos.length} médicos creados`);

    // 11. Pacientes
    console.log('🏥 Creando pacientes...');
    const fechaNacimiento1 = new Date('1985-05-15');
    const fechaNacimiento2 = new Date('1990-08-20');
    const pacientes = [
      {
        dniPaciente: '12345678',
        nombrePaciente: 'Juan Pérez',
        edadPaciente: 39,
        generoPaciente: 'Masculino',
        direccionPaciente: 'Calle Principal 123',
        telefonoPaciente: '987654321',
        fechaNacimiento: fechaNacimiento1,
        idUsuario: savedUsuarios[3].idUsuario, // paciente1
      },
      {
        dniPaciente: '87654321',
        nombrePaciente: 'María López',
        edadPaciente: 34,
        generoPaciente: 'Femenino',
        direccionPaciente: 'Av. Libertad 456',
        telefonoPaciente: '987654322',
        fechaNacimiento: fechaNacimiento2,
        idUsuario: savedUsuarios[4].idUsuario, // paciente2
      },
    ];
    const savedPacientes = await dataSource.manager.save(Paciente, pacientes);
    console.log(`✅ ${savedPacientes.length} pacientes creados`);

    // 12. Historias Clínicas
    console.log('📋 Creando historias clínicas...');
    const historiasClinicas = [
      {
        idPaciente: savedPacientes[0].idPaciente,
        estado: 'activa',
        fechaIngreso: new Date('2023-01-15'),
      },
      {
        idPaciente: savedPacientes[1].idPaciente,
        estado: 'activa',
        fechaIngreso: new Date('2023-02-20'),
      },
    ];
    const savedHistoriasClinicas = await dataSource.manager.save(
      HistoriaClinica,
      historiasClinicas,
    );
    console.log(`✅ ${savedHistoriasClinicas.length} historias clínicas creadas`);

    // 13. Diagnósticos
    console.log('🔍 Creando diagnósticos...');
    const diagnosticos = [
      {
        idhistoriaClinica: savedHistoriasClinicas[0].idHistoriaClinica,
        idMedico: savedMedicos[0].idMedico,
        fechaDiagnostico: new Date('2023-01-20'),
        estadoSalud: 'Estable',
        observaciones: 'Paciente con esclerosis múltiple remitente-recurrente. En tratamiento con interferón beta.',
        es_diagnostico_inicial: true,
      },
      {
        idhistoriaClinica: savedHistoriasClinicas[1].idHistoriaClinica,
        idMedico: savedMedicos[0].idMedico,
        fechaDiagnostico: new Date('2023-02-25'),
        estadoSalud: 'Estable',
        observaciones: 'Paciente con esclerosis múltiple. Iniciando tratamiento con glatiramer acetato.',
        es_diagnostico_inicial: true,
      },
    ];
    const savedDiagnosticos = await dataSource.manager.save(
      Diagnostico,
      diagnosticos,
    );
    console.log(`✅ ${savedDiagnosticos.length} diagnósticos creados`);

    // 14. Indicadores Clínicos por Diagnóstico
    console.log('📊 Asignando indicadores a diagnósticos...');
    const indicadoresDiagnostico = [
      {
        idDiagnostico: savedDiagnosticos[0].idDiagnostico,
        idIndicador: savedIndicadoresClinicos[0].idIndicador, // Presión Arterial
        valor: '120/80',
        fechaMedicion: new Date('2023-01-20'),
      },
      {
        idDiagnostico: savedDiagnosticos[0].idDiagnostico,
        idIndicador: savedIndicadoresClinicos[1].idIndicador, // Frecuencia Cardíaca
        valor: '72',
        fechaMedicion: new Date('2023-01-20'),
      },
      {
        idDiagnostico: savedDiagnosticos[0].idDiagnostico,
        idIndicador: savedIndicadoresClinicos[4].idIndicador, // EDSS
        valor: '3.5',
        fechaMedicion: new Date('2023-01-20'),
      },
      {
        idDiagnostico: savedDiagnosticos[1].idDiagnostico,
        idIndicador: savedIndicadoresClinicos[0].idIndicador, // Presión Arterial
        valor: '118/78',
        fechaMedicion: new Date('2023-02-25'),
      },
      {
        idDiagnostico: savedDiagnosticos[1].idDiagnostico,
        idIndicador: savedIndicadoresClinicos[4].idIndicador, // EDSS
        valor: '2.0',
        fechaMedicion: new Date('2023-02-25'),
      },
    ];
    await dataSource.manager.save(
      IndicadorClinicoDiagnostico,
      indicadoresDiagnostico,
    );
    console.log(`✅ Indicadores asignados a diagnósticos`);

    // 15. Recetas
    console.log('💊 Creando recetas...');
    const recetas = [
      {
        idDiagnostico: savedDiagnosticos[0].idDiagnostico,
        idTratamiento: savedTratamientos[0].idTratamiento, // Interferón Beta-1a
        Modelo_IA: 'GPT-4',
        fechaReceta: new Date('2023-01-20'),
        instrucciones: 'Aplicar 30 mcg por vía intramuscular una vez por semana',
      },
      {
        idDiagnostico: savedDiagnosticos[1].idDiagnostico,
        idTratamiento: savedTratamientos[2].idTratamiento, // Glatiramer Acetato
        Modelo_IA: 'GPT-4',
        fechaReceta: new Date('2023-02-25'),
        instrucciones: 'Aplicar 20 mg por vía subcutánea una vez al día',
      },
    ];
    await dataSource.manager.save(Receta, recetas);
    console.log(`✅ ${recetas.length} recetas creadas`);

    console.log('✨ Seeders completados exitosamente!');
  } catch (error) {
    console.error('❌ Error durante los seeders:', error);
    throw error;
  }
}

