-- Migración para agregar el campo isActive a las entidades
-- Ejecutar estas sentencias en orden en la base de datos PostgreSQL

-- Agregar columna isActive a la tabla paciente
ALTER TABLE paciente ADD COLUMN "isActive" BOOLEAN DEFAULT true NOT NULL;

-- Agregar columna isActive a la tabla medico
ALTER TABLE medico ADD COLUMN "isActive" BOOLEAN DEFAULT true NOT NULL;

-- Agregar columna isActive a la tabla diagnostico
ALTER TABLE diagnostico ADD COLUMN "isActive" BOOLEAN DEFAULT true NOT NULL;

-- Agregar columna isActive a la tabla receta
ALTER TABLE receta ADD COLUMN "isActive" BOOLEAN DEFAULT true NOT NULL;

-- Agregar columna isActive a la tabla area
ALTER TABLE area ADD COLUMN "isActive" BOOLEAN DEFAULT true NOT NULL;

-- Agregar columna isActive a la tabla sede
ALTER TABLE sede ADD COLUMN "isActive" BOOLEAN DEFAULT true NOT NULL;

-- Agregar columna isActive a la tabla historia_clinica
ALTER TABLE historia_clinica ADD COLUMN "isActive" BOOLEAN DEFAULT true NOT NULL;

-- Verificar que las columnas se agregaron correctamente
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('paciente', 'medico', 'diagnostico', 'receta', 'area', 'sede', 'historia_clinica')
    AND column_name = 'isActive'
ORDER BY table_name;