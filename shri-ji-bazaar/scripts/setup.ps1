Write-Host "Setting up Shri Ji Bazaar..."
Copy-Item backend/.env.example backend/.env
Write-Host "Environment configured. Run docker-compose up to start services."
