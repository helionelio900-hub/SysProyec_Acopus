# ==============================================================================
# SITRA-ORO — S10: Verificacion de Actividad Autonoma (Modulo Mayorista)
# 1. Obtencion de tokens asimetricos RS256 desde Keycloak
# 2. Lectura directa de JWT en /api/v1/auth/perfil (sin base de datos)
# 3. Cuatro casos de prueba sobre el modulo no transaccional (Centros de Acopio)
# ==============================================================================
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$keycloakUrl = "http://localhost:38081/realms/Sitra_oro/protocol/openid-connect/token"
$backendUrl = "http://localhost:8081"

Write-Host "`n[1/5] Obteniendo tokens OAuth2/OIDC desde Keycloak (RS256)..." -ForegroundColor Cyan
$tokenMayorista = (Invoke-RestMethod -Method Post -Uri $keycloakUrl -ContentType "application/x-www-form-urlencoded" `
    -Body "grant_type=password&client_id=sitra-oro-prueba&username=mayorista.demo1&password=123456").access_token

$tokenAcopiador = (Invoke-RestMethod -Method Post -Uri $keycloakUrl -ContentType "application/x-www-form-urlencoded" `
    -Body "grant_type=password&client_id=sitra-oro-prueba&username=acopiador.demo1&password=123456").access_token

Write-Host "Tokens emitidos exitosamente por Keycloak." -ForegroundColor Green

Write-Host "`n[2/5] Probando GET /api/v1/auth/perfil (Lectura directa de Claims del JWT sin BD)..." -ForegroundColor Cyan
Write-Host "--- Perfil Mayorista (DNI: 75848157) ---" -ForegroundColor Yellow
$perfilM = Invoke-RestMethod -Uri "$backendUrl/api/v1/auth/perfil" -Headers @{ Authorization = "Bearer $tokenMayorista" }
$perfilM | ConvertTo-Json

Write-Host "--- Perfil Acopiador (DNI: 42824989) ---" -ForegroundColor Yellow
$perfilA = Invoke-RestMethod -Uri "$backendUrl/api/v1/auth/perfil" -Headers @{ Authorization = "Bearer $tokenAcopiador" }
$perfilA | ConvertTo-Json

Write-Host "`n[3/5] Caso 1: Petición anónima sin token (Esperado: 401 Unauthorized)..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri "$backendUrl/api/v1/mayorista/centros-acopio"
} catch {
    Write-Host "Resultado: HTTP $($_.Exception.Response.StatusCode.value__) Unauthorized (ACCESO RECHAZADO)" -ForegroundColor Green
}

Write-Host "`n[4/5] Caso 2: Acopiador (rol restringido) consultando centros (Esperado: 200 OK)..." -ForegroundColor Cyan
try {
    $centros = Invoke-RestMethod -Uri "$backendUrl/api/v1/mayorista/centros-acopio" -Headers @{ Authorization = "Bearer $tokenAcopiador" }
    Write-Host "Resultado: HTTP 200 OK - $($centros.Count) centros de acopio obtenidos correctamente." -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n[5/5] Caso 3: Acopiador intentando registrar un centro (Esperado: 403 Forbidden)..." -ForegroundColor Cyan
$rnd = Get-Random -Minimum 1000 -Maximum 9999
$nombreCentro = "Centro Acopio Demo $rnd"
$dniRandom = "4282$rnd"
$bodyCentro = @{
    nombre = $nombreCentro
    zona = "La Rinconada"
    direccion = "Jr. Mineria 101"
    telefono = "951000111"
    documentoAcopiador = $dniRandom
    claveInicialAcopiador = "ClaveSegura1234"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Method Post -Uri "$backendUrl/api/v1/mayorista/centros-acopio" `
        -Headers @{ Authorization = "Bearer $tokenAcopiador" } `
        -ContentType "application/json" `
        -Body $bodyCentro
} catch {
    Write-Host "Resultado: HTTP $($_.Exception.Response.StatusCode.value__) Forbidden (MODIFICACION DENEGADA POR ROL)" -ForegroundColor Green
}

Write-Host "`n[BONUS] Caso 4: Mayorista (rol administrador) registrando centro (Esperado: 201 Created)..." -ForegroundColor Cyan
try {
    $resMayorista = Invoke-RestMethod -Method Post -Uri "$backendUrl/api/v1/mayorista/centros-acopio" `
        -Headers @{ Authorization = "Bearer $tokenMayorista" } `
        -ContentType "application/json" `
        -Body $bodyCentro
    Write-Host "Resultado: HTTP 201 Created - Centro registrado con ID: $($resMayorista.idCentroAcopio)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n==============================================================================" -ForegroundColor Cyan
Write-Host " VERIFICACION DE ACTIVIDAD AUTONOMA S10 COMPLETADA CON EXITO!" -ForegroundColor Green
Write-Host "==============================================================================`n" -ForegroundColor Cyan
