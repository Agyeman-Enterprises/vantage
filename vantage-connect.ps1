# vantage-connect.ps1
# One-click: adds Vantage as an MCP server in Claude Code's config
# Run from PowerShell: .\vantage-connect.ps1

$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
$mcpUrl = "http://localhost:3100/mcp"

# Load existing config or start fresh
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
} else {
    New-Item -ItemType Directory -Force -Path (Split-Path $configPath) | Out-Null
    $config = [PSCustomObject]@{}
}

# Ensure mcpServers key exists
if (-not $config.PSObject.Properties["mcpServers"]) {
    $config | Add-Member -MemberType NoteProperty -Name "mcpServers" -Value ([PSCustomObject]@{})
}

# Add vantage entry
$vantageEntry = [PSCustomObject]@{
    url  = $mcpUrl
    type = "streamable-http"
}
$config.mcpServers | Add-Member -MemberType NoteProperty -Name "vantage" -Value $vantageEntry -Force

# Write back
$config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8

Write-Host ""
Write-Host "Vantage connected as MCP server." -ForegroundColor Green
Write-Host "  Config: $configPath"
Write-Host "  URL:    $mcpUrl"
Write-Host ""
Write-Host "Make sure Vantage is running first:" -ForegroundColor Yellow
Write-Host "  cd C:\dev\vantage && node dist/index.js"
Write-Host ""
Write-Host "Then restart Claude Code to pick up the new MCP server." -ForegroundColor Cyan
