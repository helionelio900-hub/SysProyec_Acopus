$ErrorActionPreference = "Stop"
$apiBase = "http://localhost:8081"

Write-Host "`n=== S4: ROLLBACK REAL EN EL SEGUNDO DETALLE ===" -ForegroundColor Cyan

$stockInicial = Invoke-RestMethod "$apiBase/api/v1/acopio/acumulados-semanales"
if ([decimal]$stockInicial.totalGramosRojo -ne 0 -or [decimal]$stockInicial.totalGramosVerde -ne 0) {
    throw "La demo requiere una BD sin stock abierto. Hay ROJO=$($stockInicial.totalGramosRojo)g y VERDE=$($stockInicial.totalGramosVerde)g; no se modificaron datos."
}

$minero = Invoke-RestMethod "$apiBase/api/v1/acopio/mineros" |
    Where-Object { $null -ne $_.idMinero } |
    Select-Object -First 1
if ($null -eq $minero) {
    throw "Primero registre un minero o ejecute probar_exito_201.ps1."
}
$idMinero = $minero.idMinero

function Registrar-Lote([string]$tipo, [decimal]$bruto, [decimal]$neto) {
    $body = @{
        idMinero = $idMinero
        pesoSinFundirG = $bruto
        pesoFundidoNetoG = $neto
        tipoOro = $tipo
        precioAplicadoPen = 285.50
    } | ConvertTo-Json
    Invoke-RestMethod -Method Post "$apiBase/api/v1/acopio/transacciones" -ContentType "application/json" -Body $body
}

$loteRojo = Registrar-Lote "ROJO" 11.000 10.000
$null = Registrar-Lote "VERDE" 6.000 5.000
$stockAntes = Invoke-RestMethod "$apiBase/api/v1/acopio/acumulados-semanales"
$liquidacionesAntes = @(Invoke-RestMethod "$apiBase/api/v1/mayorista/liquidaciones").Count

# ROJO coincide y se procesa primero. VERDE no cierra todo el lote pendiente (deja 1g
# sin liquidar) y obliga a revertir ROJO: el cierre debe coincidir EXACTAMENTE con el
# stock disponible, no solo "no exceder" - un cierre incompleto tambien es invalido.
$payload = @{
    nombreAcopiadorG2 = "Acopiador Rollback S06"
    cotizacionOnzaUsd = 2650.00
    tipoCambioUsdPen = 3.7500
    detalles = @(
        @{ tipoOro = "ROJO"; pesoFundidoG = $stockAntes.totalGramosRojo },
        @{ tipoOro = "VERDE"; pesoFundidoG = ([decimal]$stockAntes.totalGramosVerde - 1) }
    )
} | ConvertTo-Json -Depth 5

$codigo = 0
try {
    Invoke-RestMethod -Method Post "$apiBase/api/v1/mayorista/liquidaciones" -ContentType "application/json" -Body $payload | Out-Null
} catch {
    $codigo = [int]$_.Exception.Response.StatusCode
    Write-Host "HTTP $codigo recibido (esperado: 409)." -ForegroundColor Yellow
}

$stockDespues = Invoke-RestMethod "$apiBase/api/v1/acopio/acumulados-semanales"
$liquidacionesDespues = @(Invoke-RestMethod "$apiBase/api/v1/mayorista/liquidaciones").Count

Write-Host "Liquidaciones antes/despues: $liquidacionesAntes / $liquidacionesDespues"
Write-Host "Stock ROJO antes/despues: $($stockAntes.totalGramosRojo) / $($stockDespues.totalGramosRojo)"
Write-Host "Lote ROJO usado para comprobar rollback: $($loteRojo.idTransaccionG2)"

if ($codigo -ne 409) {
    throw "Se esperaba HTTP 409 y se obtuvo HTTP $codigo."
}
if ($liquidacionesAntes -ne $liquidacionesDespues) {
    throw "El rollback fallo: cambio la cantidad de liquidaciones."
}
if ([decimal]$stockAntes.totalGramosRojo -ne [decimal]$stockDespues.totalGramosRojo) {
    throw "El rollback fallo: el primer color quedo liquidado."
}
if ([decimal]$stockAntes.totalGramosVerde -ne [decimal]$stockDespues.totalGramosVerde) {
    throw "El rollback fallo: cambio el stock VERDE."
}

Write-Host "ROLLBACK verificado: no quedo cabecera y el primer color sigue disponible." -ForegroundColor Green
