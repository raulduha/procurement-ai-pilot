$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Dist = Join-Path $Root "dist\skills"

New-Item -ItemType Directory -Force -Path $Dist | Out-Null

$SkillFolders = @(
  Get-ChildItem (Join-Path $Root "vendor\upstream\arun-procurement-ai\agent-skills") -Directory
  Get-ChildItem (Join-Path $Root "vendor\upstream\maxbase-procurement-skills") -Directory |
    Where-Object { Test-Path (Join-Path $_.FullName "SKILL.md") }
)

foreach ($Folder in $SkillFolders) {
  $Destination = Join-Path $Dist ($Folder.Name + ".zip")
  if (Test-Path $Destination) { Remove-Item $Destination }
  Compress-Archive -Path $Folder.FullName -DestinationPath $Destination
  Write-Host "Creado: $Destination"
}

Write-Host "Skills listas en dist\skills"
