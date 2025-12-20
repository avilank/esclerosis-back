import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIndicadoresClinicosUnidadEnum1765676835183
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si el tipo enum ya existe
    const enumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM pg_type 
        WHERE typname = 'indicadores_clinicos_unidad_enum'
      );
    `);

    // Si el tipo enum no existe, crearlo
    if (!enumExists[0].exists) {
      await queryRunner.query(`
        CREATE TYPE "public"."indicadores_clinicos_unidad_enum" AS ENUM('numero', 'texto', 'booleano');
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Verificar si el tipo enum existe antes de eliminarlo
    const enumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 
        FROM pg_type 
        WHERE typname = 'indicadores_clinicos_unidad_enum'
      );
    `);

    // Si el tipo enum existe, eliminarlo
    if (enumExists[0].exists) {
      await queryRunner.query(`
        DROP TYPE IF EXISTS "public"."indicadores_clinicos_unidad_enum";
      `);
    }
  }
}
