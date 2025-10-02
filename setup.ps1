# Rwanda Government Intelligence Platform - Development Setup Script
# Requires PowerShell execution policy: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Write-Host "🇷🇼 Rwanda Government Intelligence Platform Setup" -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue

# Check prerequisites
Write-Host "`n✅ Checking Prerequisites..." -ForegroundColor Green

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
    
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 18) {
        Write-Host "❌ Node.js 18+ is required. Please upgrade." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Cyan
} catch {
    Write-Host "❌ npm is not available" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is available (optional)
try {
    $pgVersion = psql --version
    Write-Host "PostgreSQL: $pgVersion" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  PostgreSQL not found. Using Docker for database." -ForegroundColor Yellow
}

Write-Host "`n📦 Installing Dependencies..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "`n⚙️  Setting up Environment..." -ForegroundColor Green

if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env file from template" -ForegroundColor Cyan
    
    Write-Host "`n⚠️  Please edit .env file with your configuration:" -ForegroundColor Yellow
    Write-Host "   - Add your Google AI API key for Gemini integration" -ForegroundColor Yellow
    Write-Host "   - Configure database connection if not using Docker" -ForegroundColor Yellow
    Write-Host "   - Set a secure JWT secret for production" -ForegroundColor Yellow
} else {
    Write-Host ".env file already exists" -ForegroundColor Cyan
}

Write-Host "`n🐳 Docker Setup (Optional)..." -ForegroundColor Green

# Check if Docker is available
try {
    docker --version | Out-Null
    Write-Host "Docker is available" -ForegroundColor Cyan
    Write-Host "To run with Docker: docker-compose up -d" -ForegroundColor Cyan
} catch {
    Write-Host "Docker not found. Manual database setup required." -ForegroundColor Yellow
}

Write-Host "`n🗄️  Database Setup..." -ForegroundColor Green

# Ask user about database setup
$dbChoice = Read-Host "Do you want to set up the database now? (y/n)"

if ($dbChoice -eq "y" -or $dbChoice -eq "Y") {
    # Check if PostgreSQL is available locally
    try {
        # Try to create database
        Write-Host "Creating database 'rwanda_gov_intelligence'..." -ForegroundColor Cyan
        
        $dbExists = psql -lqt | Select-String -Pattern "rwanda_gov_intelligence" -Quiet
        if (!$dbExists) {
            createdb rwanda_gov_intelligence
            Write-Host "✅ Database created successfully" -ForegroundColor Green
        } else {
            Write-Host "Database already exists" -ForegroundColor Cyan
        }
        
    } catch {
        Write-Host "❌ Could not create database. Please create it manually:" -ForegroundColor Red
        Write-Host "   createdb rwanda_gov_intelligence" -ForegroundColor Yellow
    }
}

Write-Host "`n🚀 Starting Development Servers..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Database Admin (if using Docker): http://localhost:8080" -ForegroundColor Cyan

Write-Host "`n👤 Demo Users:" -ForegroundColor Green
Write-Host "Minister: minister@gov.rw / password123" -ForegroundColor Cyan
Write-Host "Permanent Secretary: ps@gov.rw / password123" -ForegroundColor Cyan

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "Run 'npm run dev:full' to start both frontend and backend" -ForegroundColor Cyan

# Ask if user wants to start now
$startChoice = Read-Host "`nStart the application now? (y/n)"

if ($startChoice -eq "y" -or $startChoice -eq "Y") {
    Write-Host "Starting Rwanda Government Intelligence Platform..." -ForegroundColor Green
    npm run dev:full
}