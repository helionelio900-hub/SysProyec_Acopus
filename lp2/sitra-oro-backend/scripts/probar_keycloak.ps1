[CmdletBinding()]
param(
    [ValidateSet('MINERO', 'G2_ACOPIADOR', 'G1_MAYORISTA')]
    [string]$Rol = 'G1_MAYORISTA',
    [string]$ClientId = 'sitra-oro-prueba'
)
$ErrorActionPreference = 'Stop'
$issuerSitra = if ($env:KEYCLOAK_ISSUER_URI) { $env:KEYCLOAK_ISSUER_URI.TrimEnd('/') } else { 'http://localhost:38081/realms/Sitra_oro' }
$usernameSitra = (Read-Host 'Usuario de Keycloak').Trim()
if (-not $usernameSitra) { throw 'Escribe el usuario de Keycloak.' }
$secretSitra = Read-Host 'Contraseña de Keycloak' -AsSecureString
$passwordSitra = [System.Net.NetworkCredential]::new('', $secretSitra).Password
try {
    $loginSitra = Invoke-RestMethod -Method Post -Uri "$issuerSitra/protocol/openid-connect/token" `
        -ContentType 'application/x-www-form-urlencoded' -Body @{
            grant_type = 'password'
            client_id = $ClientId
            username = $usernameSitra
            password = $passwordSitra
        }
    if (-not $loginSitra.access_token) { throw 'Keycloak no devolvió un access_token.' }
    $rutaSitra = switch ($Rol) {
        'MINERO' { '/api/v1/minero/perfil' }
        'G2_ACOPIADOR' { '/api/v1/acopio/acumulados-semanales' }
        'G1_MAYORISTA' { '/api/v1/mayorista/recepciones' }
    }
    $respuestaSitra = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:8081$rutaSitra" `
        -Headers @{ Authorization = "Bearer $($loginSitra.access_token)" }
    Write-Host "Keycloak emitió el token. Backend respondió HTTP $($respuestaSitra.StatusCode) en $rutaSitra."
    # El token y las credenciales no se muestran ni se guardan en archivos.
} catch {
    if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
    throw
} finally {
    $passwordSitra = $null
    $secretSitra = $null
    $loginSitra = $null
}
