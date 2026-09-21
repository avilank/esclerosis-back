# Esclerosis Back

API NestJS + TypeORM (PostgreSQL) para SclerK. El cliente es la app Flutter
`esclerosis-mobile`.

## Arranque para un integrante nuevo

1. Postgres local con la base `clinica-bd` (usuario `postgres`). Si no existe,
   el script de migración la crea.
2. En esta carpeta:

```bash
npm install
copy .env.example .env
```

En Mac/Linux: `cp .env.example .env`. Ajusta usuario/password de Postgres y
**definí un `JWT_SECRET` propio** en `.env`.

3. Crea **todo** el esquema en `clinica-bd` (usuarios, roles, clínica y reportes)
   y carga el seed (indicadores + tratamientos + usuarios demo):

```bash
npm run migrate:schema
npm run seed
```

O todo junto: `npm run setup`.

4. Levanta el API (escucha en el puerto de `PORT`, por defecto 4027; la app
   Flutter apunta ahí en `env/dev.json`):

```bash
npm run dev
```

### Usuarios demo (password: `password123`)

| Usuario         | Rol      |
|-----------------|----------|
| `admin`         | admin    |
| `dr_demo`       | medico   |
| `paciente_demo` | paciente |

### Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run migrate:schema` | Crea `clinica-bd` si falta y todas las tablas (auth, clínica, Dim/Hecho) |
| `npm run seed` | Indicadores + tratamientos + usuarios demo en esa misma base |
| `npm run seed:tratamientos` | Solo reinicia el catálogo DMT (borra recetas) |
| `npm run setup` | `migrate:schema` + `seed` |
| `npm run dev` | API en watch |
| `npm test` | Tests unitarios y de integración (no necesitan base de datos) |
| `npm run test:e2e` | E2E contra Postgres (se salta solo si la base no responde) |

## Base de datos

Todo vive en una sola base Postgres (`DB_NAME`, por defecto `clinica-bd`): las
tablas operativas y las de reportes (`Dim*` / `Hecho*`). Ya **no** hay una
segunda conexión ni la base `esclerosisd`, y el ETL ya no usa `dblink`.

- `npm run migrate:schema` crea la base si falta y aplica
  `src/database/migrations/create_clinica_bd_schema.sql` +
  `create_reportes_tables.sql`. Es idempotente.
- El script que los ejecuta vive en `src/database/scripts/`, **no** en
  `migrations/`: el glob de `migrations` en `typeorm.config.ts` importa todos los
  `.ts` de esa carpeta, y ese archivo se ejecuta al importarse (la suite e2e
  disparaba la migración completa como efecto colateral).
- `DimTiempo.Fecha_Id` es la fecha como entero `YYYYMMDD` (no un autoincremental).
  La pantalla de reportes de la app depende de ese formato
  (`ReportesScreen._toFechaId`).

### Columnas `date` y TypeORM

TypeORM hidrata las columnas `type: 'date'` como **string** `'YYYY-MM-DD'`, no
como `Date`. Por eso `fechaDiagnostico`, `fechaReceta`, `fechaMedicion` y
`fechaIngreso` están declaradas `string` en las entidades, y las utilidades para
descomponerlas están en `src/common/utils/fecha.ts`. Declararlas `Date` hacía que
llamar `.toISOString()` reventara en tiempo de ejecución y tumbara el ETL.

### Dos ETL en paralelo (pendiente)

Hay dos implementaciones que escriben las mismas tablas de hechos:

| | Cuándo corre | Grano de `HechoRecetas` |
|---|---|---|
| `ScheduledEtlService` (SQL directo) | al arrancar el server y a las 2 AM | agregado (`GROUP BY` modelo/tiempo/organización) |
| `AnalyticsEtlsService` (`POST /analytics/etl/*`) | a pedido | una fila por receta |

Las dos son idempotentes (limpian antes de cargar), pero **no producen el mismo
resultado**: el reporte depende de cuál corrió último. Conviene quedarse con una
sola; la de SQL directo es la que se ejecuta sola.

## Seguridad

### Autenticación

`JwtAuthGuard` está registrado como **guard global** (`app.module.ts`): todos
los endpoints exigen `Authorization: Bearer <jwt>`. Las dos únicas excepciones
son `POST /api/auth/login` y `POST /api/auth/register`, marcadas con
`@Public()`.

El token se firma con `JWT_SECRET`. Es obligatorio: en `NODE_ENV=production` el
arranque falla si no está definido, y en desarrollo se avisa por log. Generá uno
con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Autorización

`RolesGuard` corre después y valida el decorador `@Roles(...)` del handler o del
controller. Sin `@Roles(...)` basta con estar autenticado. La comparación
normaliza acentos y mayúsculas, así que `"Médico"` y `"medico"` son el mismo rol.

| Recurso | admin | medico | paciente |
|---|---|---|---|
| `/usuarios`, `/roles`, `/permisos`, `/sedes`, `/areas`, `/pacientes` | ✅ | ❌ | ❌ |
| `/tratamientos`, `/indicadores-clinicos`, `/categorias-indicadores`, `/medicos` | ✅ completo | 🔍 solo lectura | ❌ |
| `/historias-clinicas` (listar, crear, editar) | ✅ | ✅ | ❌ |
| `DELETE /historias-clinicas/:id` | ✅ | ❌ | ❌ |
| `/historias-clinicas/paciente/:idPaciente` | ✅ | ✅ | 🔒 solo la propia |
| `/diagnosticos` (crear, editar, borrar) | ✅ | ✅ | ❌ |
| `/diagnosticos/:id` | ✅ | ✅ | 🔒 solo los propios |
| `/diagnosticos/medico/:idMedico`, `/diagnosticos/stats/:idMedico` | ✅ | 🔒 solo los propios | ❌ |
| `/diagnosticos/stats/paciente/:idPaciente` | ✅ | ✅ | 🔒 solo el propio |
| `/diagnostico-indicadores`, `/recetas`, `/ia/recetas/sugerir` | ✅ | ✅ | ❌ |
| `GET /analytics/etl/*` (reportes) | ✅ | ✅ | ✅ |
| `POST /analytics/etl/*` (disparar ETL) | ✅ | ❌ | ❌ |

🔒 = además del rol, se valida **pertenencia**: un paciente solo accede a su
propio `idPaciente` y un médico a su propio `idMedico` (`common/utils/ownership.ts`).
Sin eso, cambiar el id de la URL permitía leer la historia clínica de otra
persona.

### Validación de entrada

`ValidationPipe` global con `whitelist: true`: los decoradores de
`class-validator` de los DTOs sí se ejecutan, y las propiedades que no están
declaradas en el DTO se descartan antes de llegar al servicio (evita
mass assignment sobre las entidades).

Política de contraseñas (`RegisterDto` y `CreateUsuarioDto`): mínimo 8
caracteres, combinando letras y números. La app Flutter valida lo mismo en
`core/validation/password_policy.dart`.

### Datos sensibles

- `Usuario.password` es `select: false`: el hash bcrypt no sale en ningún
  `find`, join ni relación eager. El único lugar que lo pide es el login, con
  `addSelect`.
- El login responde `401` con un mensaje genérico tanto si el email no existe
  como si la contraseña es incorrecta (no se filtra qué emails están registrados).
- `LoggingInterceptor` registra `método url user=<id> rol=<rol> ip status ms` y
  marca `[AUDIT]` las peticiones que modifican estado. Nunca loguea el body
  (llevaría contraseñas y datos clínicos).
- `CORS_ORIGINS` define la lista blanca de orígenes. Vacío = se refleja
  cualquier origen (solo aceptable en desarrollo).
- `DB_SYNCHRONIZE` controla si TypeORM altera el esquema solo. Por defecto se
  apaga con `NODE_ENV=production`.

### Pendientes conocidos

- No hay rate limiting en `/auth/login` (requiere `@nestjs/throttler`).
- Los `GET /analytics/etl/*` devuelven los hechos de todos los pacientes y el
  filtrado por paciente se hace en el cliente. Acotarlo requiere rediseñar esos
  endpoints por rol.
- `UsuariosService.create` compensa con borrados manuales en vez de usar una
  transacción (`AuthService.register` sí es transaccional).
- No hay tabla de auditoría persistente; la trazabilidad vive en los logs.
- Quedan dos ETL en paralelo (ver «Base de datos»).
- `Modelo_IA` se guarda siempre como `'OpenRouter'`, pero `HechoRecetas` mide
  `CantidadRecetasGeneradasCopilot` / `...Deepseek`: esas dos columnas quedan en
  0 y el reporte de dominancia usa el fallback transaccional de la app.
