param (
    [int]$Numero = 1
)

$clases = @(
    @{ Num = 1;  Nombre = "TransaccionG2";          Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\acopio\acopiador\entity\TransaccionG2.java";          Linea = 15; Desc = "Compra de acopio (pesos, precio, total, IDs escalares)" },
    @{ Num = 2;  Nombre = "Minero";                 Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\acopio\parametros\entity\Minero.java";                 Linea = 12; Desc = "Datos del minero (DNI, nombres, relación unidireccional)" },
    @{ Num = 3;  Nombre = "LiquidacionG1";          Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\acopio\mayorista\entity\LiquidacionG1.java";          Linea = 18; Desc = "Liquidación mayorista (cotizaciones, total, @OneToMany)" },
    @{ Num = 4;  Nombre = "DetalleLiquidacionG1";   Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\acopio\mayorista\entity\DetalleLiquidacionG1.java";   Linea = 16; Desc = "Detalle por color (peso fundido, subtotal, UQ_DET_LIQ)" },
    @{ Num = 5;  Nombre = "RecepcionMayorista";     Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\acopio\mayorista\entity\RecepcionMayorista.java";     Linea = 18; Desc = "Recepción mayorista (@ManyToOne Centro, adelanto y total)" },
    @{ Num = 6;  Nombre = "DatosOro";               Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\acopio\mayorista\entity\DatosOro.java";               Linea = 10; Desc = "Embeddable sin ID propio (pesaje y cotización por color)" },
    @{ Num = 7;  Nombre = "CentroAcopio";           Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\acopio\mayorista\entity\CentroAcopio.java";           Linea = 10; Desc = "Sede de acopio (nombre, zona, idCuentaAcopiador)" },
    @{ Num = 8;  Nombre = "ParametrosSistema";      Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\acopio\parametros\entity\ParametrosSistema.java";      Linea = 15; Desc = "Parámetros diarios de cotización (tabla autónoma)" },
    @{ Num = 9;  Nombre = "AjusteCompraG2";         Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\acopio\acopiador\entity\AjusteCompraG2.java";         Linea = 14; Desc = "Auditoría de compras (snapshots de pesos anteriores)" },
    @{ Num = 10; Nombre = "LoteExportacion";        Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\acopio\mayorista\entity\LoteExportacion.java";        Linea = 18; Desc = "Lote de exportación (enum EstadoLoteExportacion, partidas)" },
    @{ Num = 11; Nombre = "PartidaLoteExportacion"; Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\acopio\mayorista\entity\PartidaLoteExportacion.java"; Line = 12; Desc = "Partida de exportación (vínculo con LiquidacionG1)" },
    @{ Num = 12; Nombre = "CuentaAcceso";           Ruta = "lp2\sitra-oro-backend\src\main\java\pe\edu\upeu\sitraoro\seguridad\entity\CuentaAcceso.java";           Linea = 16; Desc = "Seguridad (rol con RolCuenta, IDs escalares desacoplados)" }
)

$item = $clases | Where-Object { $_.Num -eq $Numero }

if ($item) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host " [Captura $($item.Num)/12] $($item.Nombre)" -ForegroundColor Yellow
    Write-Host " Qué mostrar: $($item.Desc)" -ForegroundColor Green
    Write-Host " Archivo: $($item.Ruta)" -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan
    code -g "$($item.Ruta):$($item.Linea)"
    Write-Host "-> Abierto en VS Code. Toma la captura con reloj visible y guárdala en ads/img_clases/captura-$($item.Num.ToString('00'))-$($item.Nombre.ToLower()).png" -ForegroundColor White
} else {
    Write-Host "Uso: .\ads\abrir_clase.ps1 <numero del 1 al 12>" -ForegroundColor Red
}
