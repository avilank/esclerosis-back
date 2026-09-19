# Esclerosis Back

API NestJS + TypeORM (PostgreSQL).

## Arranque para un integrante nuevo

1. Crea en Postgres las bases `esclerosis_db` y `esclerosisd` (vacías).
2. En esta carpeta:

```bash
npm install
copy .env.example .env
```

En Mac/Linux: `cp .env.example .env`. Ajusta usuario/password de Postgres en `.env`.

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
