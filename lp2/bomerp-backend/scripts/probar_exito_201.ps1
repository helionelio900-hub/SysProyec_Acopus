# ==========================================================
# TEST 1: CASO DE ÉXITO (HTTP 201 CREATED)
# ==========================================================
Write-Host "`n=== 1. ESTADO ANTES EN ORACLE ===" -ForegroundColor Cyan
@'
SET LINESIZE 200;
SELECT COUNT(*) AS LIQUIDACIONES FROM LIQUIDACIONES_G1;
SELECT COUNT(*) AS DETALLES FROM DETALLE_LIQUIDACIONES_G1;
EXIT;
'@ | sqlplus -S BOMERP_APP/123456@localhost:1521/XEPDB1

Write-Host "`n=== 2. ENVIANDO POST EXITOSO (ROJO 50g, VERDE 30g) ===" -ForegroundColor Green
$payloadExito = @{
    nombreAcopiadorG2 = "Acopiador Central Juliaca"
    cotizacionOnzaUsd = 2650.00
    tipoCambioUsdPen = 3.7500
    detalles = @(
        @{ tipoOro = "ROJO"; pesoFundidoG = 50.000 },
        @{ tipoOro = "VERDE"; pesoFundidoG = 30.000 }
    )
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/mayorista/liquidaciones" -Method Post -Body $payloadExito -ContentType "application/json"
$response | ConvertTo-Json -Depth 5

Write-Host "`n=== 3. ESTADO DESPUÉS EN ORACLE ===" -ForegroundColor Cyan
@'
SET LINESIZE 200;
SELECT COUNT(*) AS LIQUIDACIONES FROM LIQUIDACIONES_G1;
SELECT COUNT(*) AS DETALLES FROM DETALLE_LIQUIDACIONES_G1;
EXIT;
'@ | sqlplus -S BOMERP_APP/123456@localhost:1521/XEPDB1
