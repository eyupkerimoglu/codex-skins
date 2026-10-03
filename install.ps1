$ErrorActionPreference = 'Stop'
$stateDir = Join-Path $env:LOCALAPPDATA 'Codex Skins'
$applicationRoot = Join-Path $stateDir 'app'
function Invoke-SkinsUninstaller([string]$Executable,[string]$Action) {
    $native = Start-Process -FilePath $Executable -ArgumentList $Action -WindowStyle Hidden -PassThru
    if (-not $native.WaitForExit(10000)) { throw 'Codex Skins setup did not finish. Please retry.' }
    if ($native.ExitCode -ne 0) { throw 'Codex Skins setup registration failed.' }
}
New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
try {
    . (Join-Path $PSScriptRoot 'startup\package-shell.ps1')
    $registration = Resolve-CodexPackage
    [MatrixPackageShell]::Open($registration.ShellPath, '', $true)
    if (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'startup\watch-codex.cjs')) {
        New-Item -ItemType File -Path (Join-Path $PSScriptRoot '.matrix-startup-disabled') -Force | Out-Null
    }
    # ZIP and EXE installations share the same native ownership/registry logic.
    $packageUninstaller = Join-Path $PSScriptRoot 'Uninstall.exe'
    if (-not (Test-Path -LiteralPath $packageUninstaller -PathType Leaf)) { throw 'Uninstall.exe is missing. Use the complete FINAL package or CodexSkinsSetup.exe.' }
    Invoke-SkinsUninstaller $packageUninstaller '--prepare'
    $manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'release-manifest.json') -Raw | ConvertFrom-Json
    foreach ($relative in $manifest.files) {
        $source = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot $relative))
        $destination = [IO.Path]::GetFullPath((Join-Path $applicationRoot $relative))
        if (-not $source.StartsWith($PSScriptRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase) -or
            -not $destination.StartsWith($applicationRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid release path.' }
        if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw ('Release file is missing: ' + $relative) }
        New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
        if ($source -ine $destination) { Copy-Item -LiteralPath $source -Destination $destination -Force }
    }
    $disabled = Join-Path $applicationRoot '.codex-skins-disabled'
    if (Test-Path -LiteralPath $disabled) { Remove-Item -LiteralPath $disabled }
    & (Join-Path $applicationRoot 'startup\install-shortcut.ps1') -ApplicationRoot $applicationRoot
    $installedUninstaller = Join-Path $stateDir 'Uninstall.exe'
    if ($packageUninstaller -ine $installedUninstaller) { Copy-Item -LiteralPath $packageUninstaller -Destination $installedUninstaller -Force }
    Invoke-SkinsUninstaller $installedUninstaller '--register'
    Add-Content -LiteralPath (Join-Path $stateDir 'install.log') -Value ((Get-Date -Format o) + ' Installed FINAL v1')
} catch {
    Add-Content -LiteralPath (Join-Path $stateDir 'install.log') -Value ((Get-Date -Format o) + ' ' + $_.Exception.Message)
    Write-Error $_
    exit 1
}
