param([string]$PayloadZip = (Join-Path (Split-Path -Parent $PSScriptRoot) 'CodexSkins_FINAL_v1.zip'))
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$work = Join-Path $PSScriptRoot 'build'
New-Item -ItemType Directory -Path $work -Force | Out-Null
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path -LiteralPath $compiler)) { throw 'Windows .NET Framework compiler is required.' }
$identity = Join-Path $work 'PayloadIdentity.cs'
$removeIdentity = Join-Path $work 'UninstallPayloadIdentity.cs'
# The uninstaller never extracts the install payload. A separate constant avoids ZIP/EXE recursion.
[IO.File]::WriteAllText($removeIdentity, 'internal static class PayloadIdentity { internal const string Sha256 = "unused"; }')
$references = @('/r:System.Windows.Forms.dll','/r:System.Drawing.dll','/r:System.IO.Compression.dll','/r:System.Web.Extensions.dll')
$common = @('/nologo','/target:winexe','/platform:x64','/optimize+',('/win32manifest:' + (Join-Path $PSScriptRoot 'app.manifest')),('/win32icon:' + (Join-Path $root 'assets\codex-skins.ico'))) + $references
$source = Join-Path $PSScriptRoot 'Installer.cs'
$uninstaller = Join-Path $root 'Uninstall.exe'
& $compiler @common '/define:UNINSTALL' ('/out:' + $uninstaller) $source $removeIdentity
if ($LASTEXITCODE -ne 0) { throw 'Uninstaller compilation failed.' }
$metadataTool = Join-Path $work 'NativeMetadata.exe'
& $compiler '/nologo' '/target:exe' ('/out:' + $metadataTool) (Join-Path $PSScriptRoot 'NativeMetadata.cs')
if ($LASTEXITCODE -ne 0) { throw 'Metadata tool compilation failed.' }
& $metadataTool $uninstaller 'Codex Skins Uninstaller'
if ($LASTEXITCODE -ne 0) { throw 'Uninstaller metadata failed.' }

# Update only installation/removal payload files; all Matrix/IDE/skin entries stay unchanged.
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$archive = [IO.Compression.ZipFile]::Open($PayloadZip,[IO.Compression.ZipArchiveMode]::Update)
try {
    $prefix = 'CodexSkins-FINAL-v1/'
    $sumEntry = $archive.GetEntry($prefix + 'SHA256SUMS.json')
    $reader = [IO.StreamReader]::new($sumEntry.Open())
    try { $sums = @($reader.ReadToEnd() | ConvertFrom-Json) } finally { $reader.Dispose() }
    foreach ($file in @('Uninstall.exe','install.ps1','uninstall.ps1','release-manifest.json','README_FINAL.md')) {
        $entry = $archive.GetEntry($prefix + $file)
        if ($entry) { $entry.Delete() }
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,(Join-Path $root $file),($prefix + $file),[IO.Compression.CompressionLevel]::Optimal) | Out-Null
        $sum = $sums | Where-Object { $_.file -eq $file }
        if (-not $sum) { $sum = [pscustomobject]@{file=$file;sha256=''}; $sums += $sum }
        $sum.sha256 = (Get-FileHash -LiteralPath (Join-Path $root $file) -Algorithm SHA256).Hash.ToLowerInvariant()
    }
    $sumEntry.Delete()
    $writer = [IO.StreamWriter]::new($archive.CreateEntry($prefix + 'SHA256SUMS.json').Open(),[Text.UTF8Encoding]::new($false))
    try { $writer.Write(($sums | ConvertTo-Json)) } finally { $writer.Dispose() }
} finally { $archive.Dispose() }
$payloadHash = (Get-FileHash -LiteralPath $PayloadZip -Algorithm SHA256).Hash.ToLowerInvariant()
[IO.File]::WriteAllText($identity, ('internal static class PayloadIdentity { internal const string Sha256 = "' + $payloadHash + '"; }'))
$setup = Join-Path $root 'CodexSkinsSetup.exe'
& $compiler @common ('/out:' + $setup) ('/resource:' + $PayloadZip + ',payload.zip') ('/resource:' + $uninstaller + ',uninstall.exe') ('/resource:' + (Join-Path $PSScriptRoot 'README_SETUP.md') + ',readme.md') $source $identity
if ($LASTEXITCODE -ne 0) { throw 'Setup compilation failed.' }
& $metadataTool $setup 'Codex Skins Setup'
if ($LASTEXITCODE -ne 0) { throw 'Setup metadata failed.' }
& $metadataTool '--read' $setup
if ($LASTEXITCODE -ne 0) { throw 'Setup metadata verification failed.' }

# Source release contains the original payload and packaging source, never local state.
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$sourceZip = Join-Path $root 'CodexSkinsSource_v1.0.2.zip'
if (Test-Path -LiteralPath $sourceZip) { Remove-Item -LiteralPath $sourceZip }
$inputZip = [IO.Compression.ZipFile]::OpenRead($PayloadZip)
$outputZip = [IO.Compression.ZipFile]::Open($sourceZip,[IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($entry in $inputZip.Entries) {
        $name = 'CodexSkinsSource-v1.0.2/' + $entry.FullName.Substring('CodexSkins-FINAL-v1/'.Length)
        if ($entry.FullName -eq 'CodexSkins-FINAL-v1/SHA256SUMS.json' -or $entry.FullName -eq 'CodexSkins-FINAL-v1/README_FINAL.md') { continue }
        $newEntry = $outputZip.CreateEntry($name,[IO.Compression.CompressionLevel]::Optimal)
        $input = $entry.Open(); $output = $newEntry.Open()
        try { $input.CopyTo($output) } finally { $input.Dispose(); $output.Dispose() }
    }
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($outputZip,(Join-Path $root 'README_FINAL.md'),'CodexSkinsSource-v1.0.2/README_FINAL.md',[IO.Compression.CompressionLevel]::Optimal) | Out-Null
    foreach ($file in @('Installer.cs','NativeMetadata.cs','app.manifest','build-setup.ps1','README_SETUP.md','TEST_RESULTS.md')) {
        [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($outputZip,(Join-Path $PSScriptRoot $file),('CodexSkinsSource-v1.0.2/installer/' + $file),[IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($outputZip,$PayloadZip,'CodexSkinsSource-v1.0.2/CodexSkins_FINAL_v1.zip',[IO.Compression.CompressionLevel]::NoCompression) | Out-Null
} finally { $inputZip.Dispose(); $outputZip.Dispose() }
$checksums = @($setup,$uninstaller,$sourceZip,$PayloadZip) | ForEach-Object { (Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash.ToLowerInvariant() + '  ' + [IO.Path]::GetFileName($_) }
[IO.File]::WriteAllLines((Join-Path $root 'CodexSkins_SHA256SUMS.txt'),$checksums,[Text.UTF8Encoding]::new($false))
Write-Output $setup
Write-Output $uninstaller
Write-Output $sourceZip
