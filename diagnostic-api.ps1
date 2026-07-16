<#
.SYNOPSIS
    Script de diagnostic et correction pour les erreurs 500 API - M-IA
.DESCRIPTION
    Analyse les processus, variables d'environnement, base de données, dépendances
    et endpoints API pour diagnostiquer et corriger les erreurs 500.
    À exécuter depuis la racine du projet (m-ia).
.NOTES
    Version : 1.0
    Auteur  : M-IA Team
#>

$ErrorActionPreference = "Continue"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Resolve-Path "$scriptPath"
$logFile = "$rootDir\diagnostic-api.log"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        DIAGNOSTIC DES ERREURS 500 API" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Start-Transcript -Path $logFile -Append -ErrorAction SilentlyContinue | Out-Null

# ============================================================
# 1. VÉRIFICATION DES PROCESSUS
# ============================================================
Write-Host "1. VERIFICATION DES PROCESSUS..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

Write-Host "Processus Node.js en cours :" -ForegroundColor Gray
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Format-Table Id, ProcessName, @{N="CPU (s)";E={[math]::Round($_.CPU,1)}}, @{N="Mem (MB)";E={[math]::Round($_.WorkingSet64/1MB,1)}} -AutoSize | Out-String | Write-Host
} else {
    Write-Host "  Aucun processus Node.js en cours" -ForegroundColor Red
}
Write-Host ""

Write-Host "Ports utilises :" -ForegroundColor Gray
$ports = @{5173="Frontend (Vite)"; 5000="Backend (Express)"; 1433="SQL Server"}
foreach ($port in $ports.Keys) {
    $conn = netstat -ano | Select-String ":$port\s" | Select-String "LISTENING"
    if ($conn) {
        Write-Host "  Port $port ($($ports[$port])) : Utilise" -ForegroundColor Green
    } else {
        Write-Host "  Port $port ($($ports[$port])) : Libre" -ForegroundColor DarkGray
    }
}
Write-Host ""

# ============================================================
# 2. VÉRIFICATION DU FICHIER .ENV
# ============================================================
Write-Host "2. VERIFICATION DU FICHIER .ENV..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

$envFile = "$rootDir\backend\.env"
if (Test-Path $envFile) {
    Write-Host "  Fichier .env trouve : $envFile" -ForegroundColor Green
    Write-Host "  Variables definies :" -ForegroundColor Gray
    Get-Content $envFile | Where-Object { $_ -match "^[A-Z_]+=" } | ForEach-Object {
        $varName = ($_ -split "=")[0]
        Write-Host "    - $varName" -ForegroundColor Gray
    }
} else {
    Write-Host "  Fichier .env manquant !" -ForegroundColor Red
    Write-Host "  Creation d'un fichier .env exemple..." -ForegroundColor Gray
    
    $exampleEnv = @"
# Base de donnees SQL Server
DB_USER=
DB_PASSWORD=
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=M_IA_DB
DB_ENCRYPT=true
DB_TRUST_CERT=true

# Serveur
PORT=5000
NODE_ENV=development

# Securite
JWT_SECRET=m-ia-dev-secret-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_DAYS=7

# Authentification
AUTH_MODE=local
LOCAL_LOGIN_ENABLED=true
MFA_REQUIRED_ADMIN=true
DEFAULT_ROLE_NAME=Utilisateur
"@
    
    Set-Content -Path $envFile -Value $exampleEnv -Encoding UTF8
    Write-Host "  Fichier .env cree. Veuillez le configurer avec vos vraies valeurs." -ForegroundColor Yellow
}
Write-Host ""

# ============================================================
# 3. VÉRIFICATION DE LA BASE DE DONNÉES (SQL Server)
# ============================================================
Write-Host "3. VERIFICATION DE LA BASE DE DONNEES (SQL Server)..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

# Vérifier si le service SQL Server est en cours d'exécution
$sqlService = Get-Service -Name "MSSQL*" -ErrorAction SilentlyContinue
if ($sqlService) {
    Write-Host "  Service SQL Server detecte : $($sqlService.DisplayName)" -ForegroundColor Gray
    if ($sqlService.Status -eq "Running") {
        Write-Host "  SQL Server est en cours d'execution" -ForegroundColor Green
    } else {
        Write-Host "  SQL Server n'est PAS en cours d'execution (Status: $($sqlService.Status))" -ForegroundColor Red
        Write-Host "  Demarrage de SQL Server..." -ForegroundColor Yellow
        try {
            Start-Service -Name $sqlService.Name -ErrorAction Stop
            Write-Host "  SQL Server demarre avec succes !" -ForegroundColor Green
        } catch {
            Write-Host "  Impossible de demarrer SQL Server automatiquement." -ForegroundColor Red
            Write-Host "  Demarrez-le manuellement depuis Services.msc ou SQL Server Configuration Manager." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  Aucun service SQL Server detecte." -ForegroundColor DarkGray
    Write-Host "  Verifiez que SQL Server Express est installe." -ForegroundColor Yellow
    
    # Vérifier si sqlcmd est disponible
    $sqlcmd = Get-Command "sqlcmd" -ErrorAction SilentlyContinue
    if ($sqlcmd) {
        Write-Host "  sqlcmd trouve : $($sqlcmd.Source)" -ForegroundColor Green
    } else {
        Write-Host "  sqlcmd non trouve. Installez SQL Server Management Studio (SSMS) ou les outils en ligne de commande." -ForegroundColor DarkGray
    }
}
Write-Host ""

# ============================================================
# 4. VÉRIFICATION DES DÉPENDANCES (Backend)
# ============================================================
Write-Host "4. VERIFICATION DES DEPENDANCES..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

$backendNodeModules = "$rootDir\backend\node_modules"
if (Test-Path $backendNodeModules) {
    Write-Host "  Backend : node_modules trouve" -ForegroundColor Green
    Write-Host "  Verification des dependances critiques..." -ForegroundColor Gray
    $criticalPkgs = @("express", "cors", "dotenv", "mssql")
    foreach ($pkg in $criticalPkgs) {
        $pkgPath = "$backendNodeModules\$pkg"
        if (Test-Path $pkgPath) {
            Write-Host "    - $pkg : OK" -ForegroundColor Green
        } else {
            Write-Host "    - $pkg : MANQUANT" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  Backend : node_modules manquant !" -ForegroundColor Red
    Write-Host "  Installation des dependances backend..." -ForegroundColor Yellow
    Push-Location "$rootDir\backend"
    npm install 2>&1 | Out-Host
    Pop-Location
    Write-Host "  Installation terminee." -ForegroundColor Green
}
Write-Host ""

# Vérifier le frontend
$frontendNodeModules = "$rootDir\frontend\node_modules"
if (Test-Path $frontendNodeModules) {
    Write-Host "  Frontend : node_modules trouve" -ForegroundColor Green
} else {
    Write-Host "  Frontend : node_modules manquant !" -ForegroundColor Red
    Write-Host "  Installation des dependances frontend..." -ForegroundColor Yellow
    Push-Location "$rootDir\frontend"
    npm install 2>&1 | Out-Host
    Pop-Location
    Write-Host "  Installation terminee." -ForegroundColor Green
}
Write-Host ""

# ============================================================
# 5. TEST DES ENDPOINTS API
# ============================================================
Write-Host "5. TEST DES ENDPOINTS API..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

# Définir les endpoints à tester
$endpoints = @(
    "/api",
    "/api/token/usage",
    "/api/llm/sessions",
    "/api/admin/providers",
    "/api/tickets",
    "/api/auth"
)

# S'assurer que le backend tourne
$backendRunning = $false
try {
    $testRoot = Invoke-WebRequest -Uri "http://localhost:5000/api" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    $backendRunning = $true
    Write-Host "  Backend deja en cours d'execution sur http://localhost:5000" -ForegroundColor Green
} catch {
    Write-Host "  Backend non detecte. Demarrage..." -ForegroundColor Yellow
    Push-Location "$rootDir\backend"
    $backendProcess = Start-Process -FilePath "node" -ArgumentList "src/server.js" -PassThru -NoNewWindow -RedirectStandardOutput "$rootDir\backend-startup.log" -RedirectStandardError "$rootDir\backend-error.log"
    Pop-Location
    Write-Host "  Attente du demarrage du backend (10 secondes)..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    try {
        $testRoot = Invoke-WebRequest -Uri "http://localhost:5000/api" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        $backendRunning = $true
        Write-Host "  Backend demarre avec succes !" -ForegroundColor Green
    } catch {
        Write-Host "  Impossible de demarrer le backend." -ForegroundColor Red
        Write-Host "  Logs d'erreur :" -ForegroundColor Red
        if (Test-Path "$rootDir\backend-error.log") {
            Get-Content "$rootDir\backend-error.log" -Tail 20 | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
        }
    }
}
Write-Host ""

if ($backendRunning) {
    foreach ($endpoint in $endpoints) {
        $url = "http://localhost:5000$endpoint"
        try {
            $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            $statusCode = [int]$response.StatusCode
            if ($statusCode -eq 200 -or $statusCode -eq 201 -or $statusCode -eq 204) {
                Write-Host "  $endpoint - OK (HTTP $statusCode)" -ForegroundColor Green
            } elseif ($statusCode -ge 400 -and $statusCode -lt 500) {
                Write-Host "  $endpoint - ERREUR CLIENT (HTTP $statusCode)" -ForegroundColor Yellow
                try { $body = $response.Content | ConvertFrom-Json; Write-Host "    Message: $($body.error)" -ForegroundColor Yellow } catch {}
            } else {
                Write-Host "  $endpoint - ERREUR SERVEUR (HTTP $statusCode)" -ForegroundColor Red
                try { $body = $response.Content | ConvertFrom-Json; Write-Host "    Message: $($body.error)" -ForegroundColor Red } catch {}
            }
        } catch {
            $statusCode = if ($_.Exception.Response.StatusCode) { [int]$_.Exception.Response.StatusCode } else { "N/A" }
            Write-Host "  $endpoint - ERREUR (HTTP $statusCode)" -ForegroundColor Red
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $body = $reader.ReadToEnd() | ConvertFrom-Json
                Write-Host "    Details : $($body.error)" -ForegroundColor Red
                $reader.Close()
            } catch {
                Write-Host "    Impossible de lire le corps de la reponse." -ForegroundColor DarkGray
            }
        }
    }
} else {
    Write-Host "  Les tests d'endpoints sont ignorés car le backend n'est pas demarre." -ForegroundColor DarkGray
}
Write-Host ""

# ============================================================
# 6. CORRECTIONS AUTOMATIQUES
# ============================================================
Write-Host "6. CORRECTIONS AUTOMATIQUES..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

$serverFile = "$rootDir\backend\src\server.js"
$modifiedServer = $false

if (Test-Path $serverFile) {
    $serverContent = Get-Content $serverFile -Raw
    
    # 6a. Vérifier si le middleware d'erreur global existe
    if ($serverContent -notmatch "errorHandler" -and $serverContent -notmatch "middleware d.erreur") {
        Write-Host "  Ajout du middleware d'erreur global..." -ForegroundColor Gray
        $errorMiddleware = @"

// Middleware d'erreur global (diagnostic automatique)
app.use((err, req, res, next) => {
    console.error('ERREUR:', err.stack || err.message || err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Erreur interne du serveur',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
"@
        $serverContent = $serverContent + $errorMiddleware
        $modifiedServer = $true
    }

    # 6b. Vérifier la gestion des promesses non rattrapées
    if ($serverContent -notmatch "unhandledRejection" -and $serverContent -notmatch "uncaughtException") {
        Write-Host "  Ajout de la gestion des exceptions globales..." -ForegroundColor Gray
        $processHandlers = @"

// Gestion des erreurs non capturees
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
"@
        $serverContent = $serverContent + $processHandlers
        $modifiedServer = $true
    }

    if ($modifiedServer) {
        Set-Content -Path $serverFile -Value $serverContent -Encoding UTF8
        Write-Host "  Fichier server.js mis a jour avec les correctifs." -ForegroundColor Green
    } else {
        Write-Host "  Aucune correction necessaire dans server.js." -ForegroundColor Green
    }
} else {
    Write-Host "  Fichier server.js introuvable a l'emplacement attendu : $serverFile" -ForegroundColor Red
}
Write-Host ""

# ============================================================
# 7. VÉRIFICATION DES ROUTES BACKEND
# ============================================================
Write-Host "7. VERIFICATION DES FICHIERS DE ROUTES..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

$routesDir = "$rootDir\backend\src\modules"
$expectedRoutes = @(
    "auth\authRoutes.js",
    "token-guard\tokenRoutes.js",
    "admin\adminRoutes.js",
    "tickets\ticketRoutes.js",
    "llm-gateway\llmRoutes.js"
)

foreach ($route in $expectedRoutes) {
    $routePath = "$routesDir\$route"
    if (Test-Path $routePath) {
        Write-Host "  $route : Present" -ForegroundColor Green
    } else {
        Write-Host "  $route : MANQUANT" -ForegroundColor Red
    }
}
Write-Host ""

# ============================================================
# 8. REDÉMARRAGE (optionnel)
# ============================================================
Write-Host "8. REDEMARRAGE DES SERVICES..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

Write-Host "  Arret des processus Node.js existants..." -ForegroundColor Gray
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "  Demarrage du backend (http://localhost:5000)..." -ForegroundColor Gray
Push-Location "$rootDir\backend"
$backendProc = Start-Process -FilePath "node" -ArgumentList "src/server.js" -PassThru -NoNewWindow
Pop-Location
Write-Host "  Backend demarre (PID: $($backendProc.Id))" -ForegroundColor Green

Write-Host "  Demarrage du frontend (http://localhost:5173)..." -ForegroundColor Gray
Push-Location "$rootDir\frontend"
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx vite" -PassThru -NoNewWindow
Pop-Location
Write-Host "  Frontend demarre (PID: $($frontendProc.Id))" -ForegroundColor Green
Write-Host ""

# ============================================================
# 9. VÉRIFICATION FINALE
# ============================================================
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "              VERIFICATION FINALE" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend  : http://localhost:5000" -ForegroundColor White
Write-Host "  API Root : http://localhost:5000/api" -ForegroundColor White
Write-Host ""

# Attendre que les serveurs soient prets
Start-Sleep -Seconds 5

Write-Host "  Tests rapides des endpoints :" -ForegroundColor Yellow
$testEndpoints = @("/api", "/api/token/usage", "/api/llm/sessions")
foreach ($ep in $testEndpoints) {
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:5000$ep" -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "    $ep : OK (HTTP $([int]$resp.StatusCode))" -ForegroundColor Green
    } catch {
        $code = if ($_.Exception.Response.StatusCode) { [int]$_.Exception.Response.StatusCode } else { "N/A" }
        Write-Host "    $ep : Erreur HTTP $code" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "              RAPPORT FINAL" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Le diagnostic est termine." -ForegroundColor White
Write-Host "  Logs sauvegardes dans : $logFile" -ForegroundColor Gray
Write-Host ""
Write-Host "  Si les erreurs persistent :" -ForegroundColor Yellow
Write-Host "  1. Verifiez les logs backend dans : $rootDir\backend-error.log" -ForegroundColor Gray
Write-Host "  2. Assurez-vous que SQL Server est bien configure et accessible" -ForegroundColor Gray
Write-Host "  3. Verifiez les identifiants de base de donnees dans backend\.env" -ForegroundColor Gray
Write-Host "  4. Consultez les erreurs detaillees dans la console du navigateur (F12)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Commandes utiles pour le debug :" -ForegroundColor Yellow
Write-Host "  - Voir les logs backend : Get-Content .\backend-error.log -Tail 20" -ForegroundColor Gray
Write-Host "  - Tester un endpoint   : Invoke-RestMethod http://localhost:5000/api/token/usage" -ForegroundColor Gray
Write-Host "  - Processus Node       : Get-Process node" -ForegroundColor Gray
Write-Host "  - Ports ecoutes        : netstat -ano | findstr LISTENING" -ForegroundColor Gray
Write-Host ""

Stop-Transcript -ErrorAction SilentlyContinue | Out-Null