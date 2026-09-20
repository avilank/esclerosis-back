# Crea la base clinica-bd (si no existe) y el esquema completo
# (usuarios, roles, clínica + reportes).
# Uso, desde esclerosis-back:
#   powershell -ExecutionPolicy Bypass -File scripts/setup-clinica-bd.ps1
#
# Prefiere `npm run migrate:schema` (lee el .env y no depende de psql).

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env"

if (-not (Test-Path $envFile)) {
  throw "No existe $envFile"
}

$envMap = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $parts = $_.Split('=', 2)
  $envMap[$parts[0].Trim()] = $parts[1].Trim()
}

$hostName = if ($envMap.DB_HOST) { $envMap.DB_HOST } else { "localhost" }
$port = if ($envMap.DB_PORT) { $envMap.DB_PORT } else { "5432" }
$user = if ($envMap.DB_USERNAME) { $envMap.DB_USERNAME } else { "postgres" }
$password = $envMap.DB_PASSWORD
$dbName = if ($envMap.DB_NAME) { $envMap.DB_NAME } else { "clinica-bd" }
$schemaFile = Join-Path $root "src\database\migrations\create_clinica_bd_schema.sql"
$reportesFile = Join-Path $root "src\database\migrations\create_reportes_tables.sql"

$env:PGPASSWORD = $password

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  Write-Host "psql no está en el PATH. Usá: npm run migrate:schema"
  exit 1
}

$exists = & psql -h $hostName -p $port -U $user -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$dbName'"
if (-not $exists) {
  & psql -h $hostName -p $port -U $user -d postgres -c "CREATE DATABASE `"$dbName`""
  Write-Host "Base $dbName creada."
} else {
  Write-Host "Base $dbName ya existe."
}

& psql -h $hostName -p $port -U $user -d $dbName -f $schemaFile
& psql -h $hostName -p $port -U $user -d $dbName -f $reportesFile
Write-Host "Esquema completo listo en $dbName (auth, clínica y reportes)."
