import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CitasService } from './citas.service';
import { Cita } from '../entities/cita.entity';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';
import { Sede } from '../../sedes/entities/sede.entity';
import { HistoriaClinica } from '../../historias-clinicas/entities/historias-clinica.entity';

/** Repositorio falso con solo lo que usa el servicio. */
function fakeRepo(overrides: Record<string, unknown> = {}) {
  return {
    findOne: jest.fn().mockResolvedValue(null),
    find: jest.fn().mockResolvedValue([]),
    create: jest.fn((x: unknown) => x),
    save: jest.fn().mockResolvedValue({ idCita: 1 }),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn(),
    ...overrides,
  };
}

describe('CitasService', () => {
  let service: CitasService;
  let citaRepo: ReturnType<typeof fakeRepo>;
  let pacienteRepo: ReturnType<typeof fakeRepo>;
  let medicoRepo: ReturnType<typeof fakeRepo>;
  let historiaRepo: ReturnType<typeof fakeRepo>;

  const dto = {
    idPaciente: 3,
    idMedico: 2,
    fechaCita: '2026-10-01',
    horaCita: '09:00',
  };

  beforeEach(async () => {
    citaRepo = fakeRepo();
    pacienteRepo = fakeRepo({
      findOne: jest.fn().mockResolvedValue({ idPaciente: 3, isActive: true }),
    });
    medicoRepo = fakeRepo({
      findOne: jest.fn().mockResolvedValue({
        idMedico: 2,
        isActive: true,
        sede: { idSede: 7 },
      }),
    });
    historiaRepo = fakeRepo({
      findOne: jest
        .fn()
        .mockResolvedValue({ idHistoriaClinica: 1, idPaciente: 3 }),
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        CitasService,
        { provide: getRepositoryToken(Cita), useValue: citaRepo },
        { provide: getRepositoryToken(Paciente), useValue: pacienteRepo },
        { provide: getRepositoryToken(Medico), useValue: medicoRepo },
        { provide: getRepositoryToken(Sede), useValue: fakeRepo() },
        {
          provide: getRepositoryToken(HistoriaClinica),
          useValue: historiaRepo,
        },
      ],
    }).compile();

    service = moduleRef.get(CitasService);
  });

  describe('create', () => {
    it('409 si el médico ya tiene una cita a esa fecha y hora', async () => {
      citaRepo.findOne = jest
        .fn()
        .mockResolvedValueOnce({ idCita: 99 }) // choque del médico
        .mockResolvedValue(null);

      await expect(service.create(dto, 4)).rejects.toThrow(ConflictException);
      expect(citaRepo.save).not.toHaveBeenCalled();
    });

    it('409 si el PACIENTE ya tiene una cita a esa fecha y hora', async () => {
      citaRepo.findOne = jest
        .fn()
        .mockResolvedValueOnce(null) // médico libre
        .mockResolvedValueOnce({ idCita: 98 }); // paciente ocupado

      await expect(service.create(dto, 4)).rejects.toThrow(ConflictException);
    });

    it('400 si el paciente no tiene historia clínica activa', async () => {
      historiaRepo.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.create(dto, 4)).rejects.toThrow(
        /historia clínica activa/,
      );
    });

    it('404 si el médico no existe o está inactivo', async () => {
      medicoRepo.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.create(dto, 4)).rejects.toThrow(NotFoundException);
    });

    it('copia la sede del médico y guarda al creador del JWT', async () => {
      // findOne del repo de citas: los 2 chequeos de choque y el findOne final.
      citaRepo.findOne = jest.fn().mockResolvedValue(null);
      citaRepo.save = jest.fn().mockResolvedValue({ idCita: 10 });
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue({ idCita: 10 } as unknown as Cita);

      await service.create(dto, 4);

      const guardada = citaRepo.create.mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(guardada.idSede).toBe(7);
      expect(guardada.idUsuarioCreador).toBe(4);
      expect(guardada.estado).toBe('programada');
    });
  });

  describe('cambiarEstado', () => {
    it('no permite cancelar una cita ya atendida', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue({ idCita: 1, estado: 'atendida' } as Cita);

      await expect(service.cambiarEstado(1, 'cancelada')).rejects.toThrow(
        ConflictException,
      );
    });

    it('permite no_asistio sobre una cita programada', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue({ idCita: 1, estado: 'programada' } as Cita);

      await service.cambiarEstado(1, 'no_asistio');
      expect(citaRepo.update).toHaveBeenCalledWith(1, {
        estado: 'no_asistio',
      });
    });
  });

  describe('remove', () => {
    it('soft delete: isActive=false y estado=cancelada', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue({ idCita: 1, estado: 'programada' } as Cita);

      const res = await service.remove(1);
      expect(citaRepo.update).toHaveBeenCalledWith(1, {
        isActive: false,
        estado: 'cancelada',
      });
      expect(res.deleted).toBe(true);
    });

    it('no borra una cita ya atendida', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue({ idCita: 1, estado: 'atendida' } as Cita);

      await expect(service.remove(1)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('no reprograma una cita que no está programada', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({
        idCita: 1,
        estado: 'atendida',
        idPaciente: 3,
        idMedico: 2,
        fechaCita: '2026-10-01',
        horaCita: '09:00',
      } as Cita);

      await expect(
        service.update(1, { fechaCita: '2026-10-02' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('hoy', () => {
    it('devuelve la fecha local en formato YYYY-MM-DD', () => {
      expect(service.hoy()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
