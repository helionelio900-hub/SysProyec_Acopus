$item = Get-Item "docs\S13_LP2_Equipo05_FaijoCalisayaHelioPaul.docx"
$docxPath = $item.FullName
$pdfPath = [System.IO.Path]::ChangeExtension($docxPath, ".pdf")

$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $doc = $word.Documents.Open($docxPath)
    $doc.ExportAsFixedFormat($pdfPath, 17) # 17 = wdExportFormatPDF
    $doc.Close(0)
    Write-Host "PDF generado exitosamente en: $pdfPath"
} catch {
    Write-Error $_
} finally {
    $word.Quit()
}
