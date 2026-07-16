Write-Host "Verification du dossier..." -ForegroundColor Cyan

# Ce script doit etre lance depuis n importe quel dossier: il verifie quand meme que package.json existe dans ./frontend
$frontendDir = Join-Path (Get-Location) "frontend"
if (-Not (Test-Path (Join-Path $frontendDir "package.json"))) {
    Write-Host "ERREUR : pas de package.json ici (dans ./frontend)." -ForegroundColor Red
    Write-Host "  Places-toi d'abord dans le dossier frontend :" -ForegroundColor Yellow
    Write-Host "  cd $frontendDir" -ForegroundColor Yellow
    exit 1
}

Write-Host "Lancement du build pour reveler l'erreur exacte..." -ForegroundColor Cyan
Write-Host ""

$errFile = Join-Path $frontendDir "erreur-build.txt"

# Lance le build dans ./frontend
Push-Location $frontendDir
try {
    # Capture stdout+stderr et sauvegarde aussi dans erreur-build.txt
    # (Tee-Object ecrase automatiquement le fichier de sortie)
    npm run build 2>&1 | Tee-Object -FilePath $errFile
} finally {
    Pop-Location
}




Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Resultat sauvegarde aussi dans erreur-build.txt" -ForegroundColor Green
Write-Host "Copie-colle tout le texte rouge ci-dessus (ou le contenu du fichier) a Claude." -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

