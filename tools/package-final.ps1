$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content -LiteralPath (Join-Path $root 'release-manifest.json') -Raw | ConvertFrom-Json
$stageRoot = Join-Path $root 'release'
$stage = [IO.Path]::GetFullPath((Join-Path $stageRoot 'CodexSkins-FINAL-v1'))
if (-not $stage.StartsWith([IO.Path]::GetFullPath($stageRoot) + '\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid release staging path.' }
if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage -Force | Out-Null
foreach ($relative in $manifest.files) {
    $source = [IO.Path]::GetFullPath((Join-Path $root $relative))
    $target = [IO.Path]::GetFullPath((Join-Path $stage $relative))
    if (-not $source.StartsWith($root + '\',[StringComparison]::OrdinalIgnoreCase) -or -not $target.StartsWith($stage + '\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid release file.' }
    New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $target
}
Get-ChildItem -LiteralPath $stage -Recurse -File | ForEach-Object {
    [pscustomobject]@{file=$_.FullName.Substring($stage.Length+1).Replace('\','/');sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $stage 'SHA256SUMS.json') -Encoding UTF8
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$zip = Join-Path $root 'CodexSkins_FINAL_v1.zip'
if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip }
$archive = [IO.Compression.ZipFile]::Open($zip,[IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem -LiteralPath $stage -Recurse -File | Sort-Object FullName | ForEach-Object {
        $entryName = 'CodexSkins-FINAL-v1/' + $_.FullName.Substring($stage.Length+1).Replace('\','/')
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$_.FullName,$entryName,[IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
} finally { $archive.Dispose() }
Write-Output $zip
