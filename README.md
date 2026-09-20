# Esclerosis Back

API NestJS + TypeORM (PostgreSQL) para SclerK. El cliente es la app Flutter
`esclerosis-mobile`.

## Arranque para un integrante nuevo

1. Crea en Postgres las bases `esclerosis_db` y `esclerosisd` (vacías).
2. En esta carpeta:

```bash
npm install
copy .env.example .env
```

En Mac/Linux: `cp .env.example .env`. Ajusta usuario/password de Postgres y
**definí un `JWT_SECRET` propio** en `.env`.

3. Carga **todo** el seed de una vez (indicadores + tratamientos + usuarios demo):

```bash
npm run seed
```

4. Levanta el API:

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
| `npm run seed` | Schema + indicadores + tratamientos + usuarios |
| `npm run seed:tratamientos` | Solo reinicia el catálogo DMT (borra recetas) |
| `npm run dev` | API en watch |
| `npm test` | Tests unitarios y de integración (no necesitan base de datos) |
| `npm run test:e2e` | E2E contra Postgres (se salta solo si la base no responde) |

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
