# ==========================================================
# TEST 2: CASO DE ROLLBACK (HTTP 409 CONFLICT)
# ==========================================================
Write-Host "`n=== 1. ESTADO ANTES DEL ROLLBACK EN ORACLE ===" -ForegroundColor Cyan
@'
SET LINESIZE 200;
SELECT COUNT(*) AS LIQUIDACIONES FROM LIQUIDACIONES_G1;
SELECT COUNT(*) AS DETALLES FROM DETALLE_LIQUIDACIONES_G1;
EXIT;
'@ | sqlplus -S BOMERP_APP/123456@localhost:1521/XEPDB1

Write-Host "`n=== 2. ENVIANDO POST CON EXCESO DE STOCK (VERDE 999999g) ===" -ForegroundColor Red
$payloadExceso = @{
    nombreAcopiadorG2 = "Acopiador Central Juliaca"
    cotizacionOnzaUsd = 2650.00
    tipoCambioUsdPen = 3.7500
    detalles = @(
        @{ tipoOro = "ROJO"; pesoFundidoG = 10.000 },
        @{ tipoOro = "VERDE"; pesoFundidoG = 999999.000 }
    )
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/mayorista/liquidaciones" -Method Post -Body $payloadExceso -ContentType "application/json"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Respuesta HTTP Error (Esperado 409 Conflict):" -ForegroundColor Yellow
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $errorBody = $reader.ReadToEnd()
    $errorBody
}

Write-Host "`n=== 3. ESTADO DESPUES EN ORACLE (DEMOSTRACION DE ROLLBACK INTACTO) ===" -ForegroundColor Cyan
@'
SET LINESIZE 200;
SELECT COUNT(*) AS LIQUIDACIONES FROM LIQUIDACIONES_G1;
SELECT COUNT(*) AS DETALLES FROM DETALLE_LIQUIDACIONES_G1;
EXIT;
'@ | sqlplus -S BOMERP_APP/123456@localhost:1521/XEPDB1
