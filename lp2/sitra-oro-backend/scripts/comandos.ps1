# ============================================================
# SITRA-ORO — comandos rapidos del proyecto (LP2 / sitra-oro-backend)
# Cargar en tu perfil de PowerShell (ver instrucciones abajo)
# y despues solo escribes el nombre de la funcion, ej:  sitra-run
# ============================================================

$Global:SitraOroRoot = "E:\Cursos_Ciclo_4\Lenguaje de Programación II\Sitra_oro"

function sitra-oracle {
    <# Levanta Oracle XE en Docker #>
    Set-Location "$Global:SitraOroRoot\lp2\sitra-oro-backend"
    docker compose -f compose-dev.yml up -d
    docker compose -f compose-dev.yml ps
}

function sitra-run {
    <# Arranca el backend (perfil dev). Dejala corriendo en su propia terminal #>
    Set-Location "$Global:SitraOroRoot\lp2\sitra-oro-backend"
    .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
}

function sitra-test {
    <# Corre toda la suite de pruebas #>
    Set-Location "$Global:SitraOroRoot\lp2\sitra-oro-backend"
    .\mvnw.cmd test
}

function sitra-seed {
    <# Carga indices S5 + datos de demo (mineros, parametros) en Oracle #>
    Set-Location "$Global:SitraOroRoot\lp2\sitra-oro-backend"
    docker cp ..\..\bd2\S05_indices.sql bomerp-oracle:/tmp/indices.sql
    docker cp ..\..\bd2\S05_seed_demo.sql bomerp-oracle:/tmp/seed.sql
    docker exec bomerp-oracle sqlplus -S BOMERP_APP/123456@//localhost:1521/XEPDB1 @/tmp/indices.sql
    docker exec bomerp-oracle sqlplus -S BOMERP_APP/123456@//localhost:1521/XEPDB1 @/tmp/seed.sql
}

function sitra-health {
    <# Salud + un endpoint basico #>
    Invoke-RestMethod http://localhost:8081/actuator/health
    Invoke-RestMethod http://localhost:8081/api/v1/acopio/mineros
}

function sitra-demo-exito {
    <# Caso de exito 201 (cabecera-detalle) #>
    Set-Location "$Global:SitraOroRoot\lp2\sitra-oro-backend"
    .\scripts\probar_exito_201.ps1
}

function sitra-demo-rollback {
    <# Caso de rollback 409 (cabecera-detalle) #>
    Set-Location "$Global:SitraOroRoot\lp2\sitra-oro-backend"
    .\scripts\probar_rollback_409.ps1
}

function sitra-reporte {
    <# Filtros y reporte S5 #>
    Invoke-RestMethod "http://localhost:8081/api/v1/mayorista/liquidaciones?estado=REGISTRADA&ordenarPor=totalPagadoG2Pen&direccion=ASC"
    Invoke-RestMethod http://localhost:8081/api/v1/mayorista/liquidaciones/resumen
}

function sitra-down {
    <# Apaga Oracle (el backend lo detienes con Ctrl+C en su terminal) #>
    Set-Location "$Global:SitraOroRoot\lp2\sitra-oro-backend"
    docker compose -f compose-dev.yml down
}

function sitra-cd {
    <# Ir a la carpeta del backend #>
    Set-Location "$Global:SitraOroRoot\lp2\sitra-oro-backend"
}

function sitra-help {
    Write-Host ""
    Write-Host "Comandos SITRA-ORO disponibles:" -ForegroundColor Cyan
    Write-Host "  sitra-oracle        -> levanta Oracle XE (Docker)"
    Write-Host "  sitra-run           -> arranca el backend (dev)"
    Write-Host "  sitra-test          -> corre los tests"
    Write-Host "  sitra-seed          -> indices + datos de demo"
    Write-Host "  sitra-health        -> salud + prueba rapida"
    Write-Host "  sitra-demo-exito    -> demo cabecera-detalle 201"
    Write-Host "  sitra-demo-rollback -> demo cabecera-detalle 409"
    Write-Host "  sitra-reporte       -> filtros y reporte S5"
    Write-Host "  sitra-down          -> apaga Oracle"
    Write-Host "  sitra-cd            -> ir a la carpeta del backend"
    Write-Host ""
}

Write-Host "SITRA-ORO: comandos cargados. Escribe 'sitra-help' para verlos." -ForegroundColor Green
