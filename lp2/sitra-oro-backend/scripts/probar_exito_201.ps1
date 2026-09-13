$ErrorActionPreference = "Stop"
$apiBase = "http://localhost:8081"

Write-Host "`n=== S4: LIQUIDACION CABECERA-DETALLE EXITOSA ===" -ForegroundColor Cyan

$stockInicial = Invoke-RestMethod "$apiBase/api/v1/acopio/acumulados-semanales"
if ([decimal]$stockInicial.totalGramosRojo -ne 0 -or [decimal]$stockInicial.totalGramosVerde -ne 0) {
    throw "La demo requiere una BD sin stock abierto. Hay ROJO=$($stockInicial.totalGramosRojo)g y VERDE=$($stockInicial.totalGramosVerde)g; no se modificaron datos."
}

$mineros = @(Invoke-RestMethod "$apiBase/api/v1/acopio/mineros")
if ($mineros.Count -eq 0) {
    $documento = (Get-Random -Minimum 10000000 -Maximum 99999999).ToString()
    $nuevoMinero = @{
        documentoIdentidad = $documento
        nombresApellidos = "Minero Demo S06"
        telefono = "900000000"
        zonaProcedencia = "Puno"
    } | ConvertTo-Json
    $minero = Invoke-RestMethod -Method Post "$apiBase/api/v1/acopio/mineros" -ContentType "application/json" -Body $nuevoMinero
} else {
    $minero = $mineros[0]
}

foreach ($lote in @(
    @{ tipo = "ROJO"; bruto = 52.000; neto = 50.000 },
    @{ tipo = "VERDE"; bruto = 31.500; neto = 30.000 }
)) {
    $compra = @{
        idMinero = $minero.idMinero
        pesoSinFundirG = $lote.bruto
        pesoFundidoNetoG = $lote.neto
        tipoOro = $lote.tipo
    } | ConvertTo-Json
    Invoke-RestMethod -Method Post "$apiBase/api/v1/acopio/transacciones" -ContentType "application/json" -Body $compra | Out-Null
}

# El cierre semanal incluye todo el stock abierto creado por este script.
$stock = Invoke-RestMethod "$apiBase/api/v1/acopio/acumulados-semanales"
$payload = @{
    nombreAcopiadorG2 = "Acopiador Demo S06"
    cotizacionOnzaUsd = 2650.00
    tipoCambioUsdPen = 3.7500
    detalles = @(
        @{ tipoOro = "ROJO"; pesoFundidoG = $stock.totalGramosRojo },
        @{ tipoOro = "VERDE"; pesoFundidoG = $stock.totalGramosVerde }
    )
} | ConvertTo-Json -Depth 5

$respuesta = Invoke-RestMethod -Method Post "$apiBase/api/v1/mayorista/liquidaciones" -ContentType "application/json" -Body $payload
$despues = Invoke-RestMethod "$apiBase/api/v1/acopio/acumulados-semanales"

$respuesta | ConvertTo-Json -Depth 6
Write-Host "HTTP 201: liquidacion $($respuesta.idLiquidacionG1) creada." -ForegroundColor Green
Write-Host "Stock abierto despues: ROJO=$($despues.totalGramosRojo)g; VERDE=$($despues.totalGramosVerde)g"

if ([decimal]$despues.totalGramosRojo -ne 0 -or [decimal]$despues.totalGramosVerde -ne 0) {
    throw "La liquidacion se creo, pero quedaron lotes abiertos inesperadamente."
}
