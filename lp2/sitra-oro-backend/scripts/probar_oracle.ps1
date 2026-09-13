# Requiere Oracle XE local, sqlplus y autenticación OS / as sysdba.
# Nunca usa ni limpia el esquema de la aplicación.
$ErrorActionPreference = 'Stop'
Push-Location (Join-Path $PSScriptRoot '..')
$schemaPrueba = 'SITRA_T_' + ([guid]::NewGuid().ToString('N').Substring(0, 12).ToUpperInvariant())
$clavePrueba = 'T' + [guid]::NewGuid().ToString('N').Substring(0, 24)
$creado = $false
$prevUser = $env:ORACLE_TEST_USER
$prevPassword = $env:ORACLE_TEST_PASSWORD
try {
    $salidaSql = @"
whenever sqlerror exit failure
set echo off feedback off
alter session set container = XEPDB1;
create user $schemaPrueba identified by "$clavePrueba" quota 100M on USERS;
grant create session, create table, create sequence to $schemaPrueba;
exit
"@ | & sqlplus -L -s '/ as sysdba'
    if ($LASTEXITCODE -ne 0) {
        $codigoOracle = ($salidaSql | Select-String 'ORA-[0-9]+').Matches.Value -join ', '
        throw "No se pudo preparar el esquema Oracle aislado ($codigoOracle). Revise acceso SYSDBA y XEPDB1."
    }
    $creado = $true
    # Reproducir BD2, no generar un esquema distinto mediante Hibernate.
    # Rutas relativas ASCII: SQL*Plus puede alterar las tildes de rutas absolutas.
    $ddlBd2 = '../../bd2/S01_03_tablas_bomerp_app.sql'
    $indicesBd2 = '../../bd2/S05_indices.sql'
    $salidaBd2 = @"
whenever sqlerror exit failure
whenever oserror exit failure
set echo off feedback off
connect $schemaPrueba/"$clavePrueba"@localhost:1521/XEPDB1
@"$ddlBd2"
@"$indicesBd2"
exit
"@ | & sqlplus -L -s /nolog
    if ($LASTEXITCODE -ne 0 -or ($salidaBd2 -match 'SP2-')) {
        $codigoOracle = ($salidaBd2 | Select-String '(ORA|SP2)-[0-9]+').Matches.Value -join ', '
        throw "Falló la instalación de los scripts BD2 en el esquema aislado ($codigoOracle)."
    }
    $env:ORACLE_TEST_USER = $schemaPrueba
    $env:ORACLE_TEST_PASSWORD = $clavePrueba
    & .\mvnw.cmd test '-Dspring.profiles.active=oracle-test' '-Dtest=ApiU1IntegrationTest,MayoristaServiceIntegrationTest'
    if ($LASTEXITCODE -ne 0) { throw 'Fallaron las pruebas de integración contra Oracle.' }
    Write-Host 'Oracle + DDL e índices BD2: CRUD, validación, CORS, consultas, commit y rollback verificados.'
} finally {
    if ($creado -and $schemaPrueba -match '^SITRA_T_[A-F0-9]{12}$') {
        $salidaLimpieza = @"
whenever sqlerror exit failure
alter session set container = XEPDB1;
drop user $schemaPrueba cascade;
exit
"@ | & sqlplus -L -s '/ as sysdba'
        if ($LASTEXITCODE -ne 0) { Write-Warning "No se pudo eliminar el esquema temporal $schemaPrueba" }
    }
    $env:ORACLE_TEST_USER = $prevUser
    $env:ORACLE_TEST_PASSWORD = $prevPassword
    Pop-Location
}
