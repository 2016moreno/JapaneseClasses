# GitHub Pages Manual Deploy Script (FIXED FOR SECURITY)
Write-Host "Starting deployment..."

# 1. Build the project
Write-Host "Step 1: Building project..."
npm run build
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Error: Build failed!"
    exit $LASTEXITCODE 
}

# 2. Switch to gh-pages branch
Write-Host "Step 2: Switching to gh-pages branch..."
git checkout -f gh-pages
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Creating new gh-pages branch..."
    git checkout -b gh-pages 
}

# CRITICAL CHECK: Ensure we are NOT on main branch before cleaning
$currentBranch = (git branch --show-current).Trim()
if ($currentBranch -eq "main") {
    Write-Host "ERROR: Failed to switch branches. Aborting to protect source code!" -ForegroundColor Red
    exit 1
}

# 3. Clean the directory COMPLETELY (Except .git and the new build)
# This removes .env, node_modules, and scripts from the public branch
Write-Host "Step 3: Purging all files from $currentBranch branch..."
Get-ChildItem -Exclude .git, dist | Remove-Item -Recurse -Force

# 4. Move files from dist to root
Write-Host "Step 4: Moving build files..."
Copy-Item -Path "dist\*" -Destination "." -Recurse -Force
Remove-Item -Path "dist" -Recurse -Force

# 5. Commit and Push
Write-Host "Step 5: Pushing CLEAN build to GitHub..."
git add .
git commit -m "Secure automated deploy: $(Get-Date)"
git push origin gh-pages --force

# 6. Return to main
Write-Host "Step 6: Returning to main branch..."
git checkout main

Write-Host "Done! Site updated and secrets removed from public branch."
