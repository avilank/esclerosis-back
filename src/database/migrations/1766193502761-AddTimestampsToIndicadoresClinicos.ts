import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToIndicadoresClinicos1766193502761
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columnas createdAt y updatedAt a la tabla indicadores_clinicos
    await queryRunner.query(`
      ALTER TABLE "indicadores_clinicos"
      ADD COLUMN "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now();
    `);

    // Crear trigger para actualizar updatedAt automáticamente
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await queryRunner.query(`
      CREATE TRIGGER update_indicadores_clinicos_updated_at
        BEFORE UPDATE ON "indicadores_clinicos"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar trigger
    await queryRunner.query(`
      DROP TRIGGER IF EXISTS update_indicadores_clinicos_updated_at ON "indicadores_clinicos";
    `);

    // Eliminar función
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS update_updated_at_column();
    `);

    // Eliminar columnas
    await queryRunner.query(`
      ALTER TABLE "indicadores_clinicos"
      DROP COLUMN "createdAt",
      DROP COLUMN "updatedAt";
    `);
  }
}
