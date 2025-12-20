import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTimestampsToDiagnosticoAndReceta1765611396455
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar timestamps a la tabla diagnostico
    await queryRunner.addColumn(
      'diagnostico',
      new TableColumn({
        name: 'createdAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'diagnostico',
      new TableColumn({
        name: 'updatedAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );

    // Agregar timestamps a la tabla receta
    await queryRunner.addColumn(
      'receta',
      new TableColumn({
        name: 'createdAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'receta',
      new TableColumn({
        name: 'updatedAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    );

    // Crear función para actualizar updatedAt automáticamente en PostgreSQL
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Crear triggers para actualizar updatedAt automáticamente
    await queryRunner.query(`
      CREATE TRIGGER update_diagnostico_updated_at
      BEFORE UPDATE ON diagnostico
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_receta_updated_at
      BEFORE UPDATE ON receta
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar triggers
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_receta_updated_at ON receta;`,
    );
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_diagnostico_updated_at ON diagnostico;`,
    );

    // Eliminar función
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column();`,
    );

    // Eliminar timestamps de la tabla receta
    await queryRunner.dropColumn('receta', 'updatedAt');
    await queryRunner.dropColumn('receta', 'createdAt');

    // Eliminar timestamps de la tabla diagnostico
    await queryRunner.dropColumn('diagnostico', 'updatedAt');
    await queryRunner.dropColumn('diagnostico', 'createdAt');
  }
}
