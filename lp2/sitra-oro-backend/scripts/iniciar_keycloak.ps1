[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'

# Usar Java 21, evitando el lanzador Java 8 que aparece primero en el PATH de esta PC.
$jdkActual21 = $false
if ($env:JAVA_HOME) {
    $releaseSitra = Join-Path $env:JAVA_HOME 'release'
    $jdkActual21 = (Test-Path $releaseSitra) -and
        (Select-String -LiteralPath $releaseSitra -Pattern '^JAVA_VERSION="21(\.|"|\+)' -Quiet)
}
if (-not $jdkActual21) {
    $jdkSitra = Get-ChildItem 'C:\Program Files\Eclipse Adoptium' -Directory -Filter 'jdk-21*' -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending | Select-Object -First 1
    if (-not $jdkSitra) { throw 'Configure JAVA_HOME con un JDK 21 antes de iniciar el backend.' }
    $env:JAVA_HOME = $jdkSitra.FullName
}
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Push-Location (Join-Path $PSScriptRoot '..')
try {
    & .\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=dev,keycloak'
    if ($LASTEXITCODE -ne 0) { throw "El backend terminó con código $LASTEXITCODE." }
} finally {
    Pop-Location
}
