# PostgreSQL path
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"

# Database configuration
$dbName = "mingle_finder"
$dbUser = "postgres"

Write-Host "Creating database if it doesn't exist..."
$dbExists = & psql -U $dbUser -t -c "SELECT 1 FROM pg_database WHERE datname='$dbName'"
if (!$dbExists) {
    & createdb -U $dbUser $dbName
    Write-Host "Database created successfully!"
} else {
    Write-Host "Database already exists!"
}

Write-Host "Running schema..."
Get-Content "schema.sql" | & psql -U $dbUser -d $dbName

Write-Host "Database setup completed!" 