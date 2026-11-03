param(
    [Parameter(Mandatory=$true)]
    [int]$Numero
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$img = [System.Windows.Forms.Clipboard]::GetImage()
if (-not $img) {
    Write-Error "No hay imagen en el portapapeles. Copia o toma la captura primero."
    exit 1
}

$names = @{
    1 = "captura01_ng_build_stats.png"
    2 = "captura02_network_lazy_loading.png"
    3 = "captura03_cache_control_header.png"
    4 = "captura04_disk_memory_cache.png"
    5 = "captura05_redis_keys.png"
    6 = "captura06_logging_comparacion.png"
    7 = "captura07_actuator_restringido.png"
    8 = "captura08_archivos_prod_sin_secretos.png"
    9 = "captura09_produccion_end_to_end.png"
}

$filename = $names[$Numero]
if (-not $filename) {
    Write-Error "Número inválido. Debe ser de 1 a 9."
    exit 1
}

$destDir = "E:\Cursos_Ciclo_4\Lenguaje de Programación II\Sitra_oro\docs\img_S13_FaijoCalisaya"
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$dest = Join-Path $destDir $filename
$img.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Captura $Numero guardada en: $dest"

# Regenerar el documento Word automáticamente
python "E:\Cursos_Ciclo_4\Lenguaje de Programación II\Sitra_oro\docs\build_s13_document.py"
