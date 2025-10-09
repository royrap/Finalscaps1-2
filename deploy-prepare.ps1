# Quick Deploy Script for Vercel
# Run this script to prepare your project for deployment

Write-Host "🚀 Auto-Repair System - Vercel Deployment Preparation" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "❌ Git not initialized. Initializing now..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized`n" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized`n" -ForegroundColor Green
}

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  No .env file found. Creating from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file - PLEASE EDIT IT WITH YOUR SUPABASE CREDENTIALS`n" -ForegroundColor Green
    Write-Host "📝 Edit .env and add your Supabase URL and Keys`n" -ForegroundColor Magenta
} else {
    Write-Host "✅ .env file exists`n" -ForegroundColor Green
}

# Check if node_modules exists
if (-not (Test-Path node_modules)) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed`n" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed`n" -ForegroundColor Green
}

# Test build
Write-Host "🔨 Testing build process..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!`n" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please fix errors before deploying.`n" -ForegroundColor Red
    exit 1
}

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "✅ Your project is ready for Vercel deployment!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Create GitHub repository: https://github.com/new" -ForegroundColor White
Write-Host "2. Push your code:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Initial commit'" -ForegroundColor Gray
Write-Host "   git remote add origin https://github.com/YOUR-USERNAME/auto-repair-system.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main`n" -ForegroundColor Gray
Write-Host "3. Go to https://vercel.com and import your repository" -ForegroundColor White
Write-Host "4. Add environment variables in Vercel (see DEPLOYMENT_GUIDE.md)" -ForegroundColor White
Write-Host "5. Click Deploy!`n" -ForegroundColor White

Write-Host "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md`n" -ForegroundColor Cyan
