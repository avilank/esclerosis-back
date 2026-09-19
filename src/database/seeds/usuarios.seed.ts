import { DataSource, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol } from 'src/modules/auth/roles/entities/role.entity';
import { Usuario } from 'src/modules/usuarios/entities/usuario.entity';
import { Paciente } from 'src/modules/pacientes/entities/paciente.entity';
import { Medico } from 'src/modules/medicos/entities/medico.entity';
import { Area } from 'src/modules/areas/entities/area.entity';
import { Sede } from 'src/modules/sedes/entities/sede.entity';

export async function seedUsuarios(dataSource: DataSource) {
  console.log('👥 [3/3] Roles, usuarios, médico y paciente demo...');

  const rolesData = [
    { nombre: 'admin', descripcion: 'Acceso total al sistema' },
    { nombre: 'medico', descripcion: 'Rol clínico' },
    { nombre: 'paciente', descripcion: 'Usuario paciente' },
  ];

  await dataSource.manager.upsert(Rol, rolesData, ['nombre']);
  const roles = await dataSource.manager.find(Rol, {
    where: { nombre: In(rolesData.map((r) => r.nombre)) },
  });
  const rolByName = Object.fromEntries(roles.map((r) => [r.nombre, r]));

  // 2. Usuarios (admin, médico, paciente)
  const password = await bcrypt.hash('password123', 10);
  const usersData = [
    {
      username: 'admin',
      email: 'admin@esclerosis.com',
      password,
      estado: true,
      idRol: rolByName['admin']?.idRol,
    },
    {
      username: 'dr_demo',
      email: 'dr.demo@esclerosis.com',
      password,
      estado: true,
      idRol: rolByName['medico']?.idRol,
    },
    {
      username: 'paciente_demo',
      email: 'paciente.demo@esclerosis.com',
      password,
      estado: true,
      idRol: rolByName['paciente']?.idRol,
    },
  ];

  await dataSource.manager.upsert(Usuario, usersData, ['username']);
  const usuarios = await dataSource.manager.find(Usuario, {
    where: { username: In(usersData.map((u) => u.username)) },
  });
  const userByUsername = Object.fromEntries(
    usuarios.map((u) => [u.username, u]),
  );

  // 3. Soportes para médico (Área y Sede mínimas)
  let savedArea = await dataSource.manager.findOneBy(Area, {
    descripcion: 'Neurología',
  });
  if (!savedArea) {
    savedArea = await dataSource.manager.save(Area, {
      descripcion: 'Neurología',
    });
  }

  let savedSede = await dataSource.manager.findOneBy(Sede, {
    nombre: 'Sede Central',
  });
  if (!savedSede) {
    savedSede = await dataSource.manager.save(Sede, {
      nombre: 'Sede Central',
      direccion: 'Principal 123',
    });
  }

  // 4. Paciente ligado a su usuario
  const pacienteUser = userByUsername['paciente_demo'];
  if (pacienteUser) {
    await dataSource.manager.upsert(
      Paciente,
      [
        {
          idPaciente: pacienteUser.idUsuario,
          dniPaciente: '90000001',
          nombrePaciente: 'Paciente Demo',
          edadPaciente: 35,
          generoPaciente: 'Femenino',
          direccionPaciente: 'Av. Salud 123',
          telefonoPaciente: '900000001',
          fechaNacimiento: new Date('1990-01-01').toDateString(),
        },
      ],
      ['idPaciente'],
    );
  }

  // 5. Médico ligado a su usuario, área y sede
  const medicoUser = userByUsername['dr_demo'];
  if (medicoUser && savedArea && savedSede) {
    await dataSource.manager.upsert(
      Medico,
      [
        {
          idMedico: medicoUser.idUsuario,
          nombre: 'Dr. Demo',
          genero: 'Masculino',
          area: savedArea,
          sede: savedSede,
        },
      ],
      ['idMedico'],
    );
  }

  console.log('   ✅ Usuarios demo (password: password123)');
  console.log('      admin | dr_demo | paciente_demo');
}
