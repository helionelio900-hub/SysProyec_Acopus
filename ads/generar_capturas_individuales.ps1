# Generador de capturas individuales de cada clase para Miro con las 3 columnas y altura completa
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$brainDir = "C:\Users\Paul\.gemini\antigravity\brain\5218b7a5-3b00-4b21-81cf-49e1465ddc4b"

$entidades = @(
    @{ Name = "sesion3_01_minero"; Id = "entidad-minero"; Height = 670 },
    @{ Name = "sesion3_02_compra_acopio"; Id = "entidad-compra"; Height = 680 },
    @{ Name = "sesion3_03_liquidacion_mayorista"; Id = "entidad-liquidacion"; Height = 680 },
    @{ Name = "sesion3_04_detalle_liquidacion"; Id = "entidad-detalle"; Height = 670 },
    @{ Name = "sesion3_05_centro_acopio"; Id = "entidad-centro"; Height = 670 }
)

$templateFile = Join-Path $scriptDir "sesion3_transformacion_objeto_relacional.html"
$template = [System.IO.File]::ReadAllText($templateFile, [System.Text.Encoding]::UTF8)

# Extraer el CSS del head
$cssMatch = [regex]::Match($template, '(?s)<style>(.*?)</style>')
$css = $cssMatch.Groups[1].Value

foreach ($e in $entidades) {
    $startToken = '<div class="entity-row" id="' + $e.Id + '">'
    $startIndex = $template.IndexOf($startToken)
    if ($startIndex -ge 0) {
        $searchFrom = $startIndex + $startToken.Length
        $nextIndex = $template.IndexOf('<div class="entity-row"', $searchFrom)
        if ($nextIndex -lt 0) {
            $nextIndex = $template.IndexOf('</body>', $searchFrom)
        }
        $block = $template.Substring($startIndex, $nextIndex - $startIndex).Trim()

        $html = @"
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    $css
    body { padding: 24px; width: 1780px; margin: 0; }
    .entity-row { margin-bottom: 0; }
  </style>
</head>
<body>
$block
</body>
</html>
"@
        $tempHtml = Join-Path $scriptDir "temp_$($e.Name).html"
        $outPng = Join-Path $scriptDir "$($e.Name).png"
        [System.IO.File]::WriteAllText($tempHtml, $html, [System.Text.Encoding]::UTF8)

        $winSize = "1820,$($e.Height)"
        $fileUri = [System.Uri]::new($tempHtml).AbsoluteUri
        $cmd = "start /wait `"`" `"$chrome`" --headless=new --screenshot=`"$outPng`" --window-size=$winSize `"$fileUri`""
        cmd /c $cmd

        if (Test-Path $outPng) {
            Copy-Item $outPng (Join-Path $brainDir "$($e.Name).png") -Force
            Write-Host "Generado completo: $($e.Name).png"
        }
        Remove-Item $tempHtml -ErrorAction SilentlyContinue
    }
}
