import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsActiveToEntities1766120118062 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar isActive a la tabla paciente
    await queryRunner.addColumn(
      'paciente',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
    );

    // Agregar isActive a la tabla medico
    await queryRunner.addColumn(
      'medico',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
    );

    // Agregar isActive a la tabla diagnostico
    await queryRunner.addColumn(
      'diagnostico',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
    );

    // Agregar isActive a la tabla receta
    await queryRunner.addColumn(
      'receta',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
    );

    // Tratamiento ya tiene isActive, no es necesario agregarlo

    // IndicadorClinico ya tiene isActive, no es necesario agregarlo

    // Agregar isActive a la tabla area
    await queryRunner.addColumn(
      'area',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
    );

    // Agregar isActive a la tabla sede
    await queryRunner.addColumn(
      'sede',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
    );

    // Agregar isActive a la tabla historia_clinica
    await queryRunner.addColumn(
      'historia_clinica',
      new TableColumn({
        name: 'isActive',
        type: 'boolean',
        default: true,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar isActive de la tabla historia_clinica
    await queryRunner.dropColumn('historia_clinica', 'isActive');

    // Eliminar isActive de la tabla sede
    await queryRunner.dropColumn('sede', 'isActive');

    // Eliminar isActive de la tabla area
    await queryRunner.dropColumn('area', 'isActive');

    // Eliminar isActive de la tabla receta
    await queryRunner.dropColumn('receta', 'isActive');

    // Eliminar isActive de la tabla diagnostico
    await queryRunner.dropColumn('diagnostico', 'isActive');

    // Eliminar isActive de la tabla medico
    await queryRunner.dropColumn('medico', 'isActive');

    // Eliminar isActive de la tabla paciente
    await queryRunner.dropColumn('paciente', 'isActive');
  }
}
