$ErrorActionPreference = 'Stop'
$stateDir = Join-Path $env:LOCALAPPDATA 'Codex Skins'
$uninstaller = Join-Path $stateDir 'Uninstall.exe'
if (-not (Test-Path -LiteralPath $uninstaller -PathType Leaf)) {
    throw 'Uninstall.exe is missing. Run CodexSkinsSetup.exe to repair this installation.'
}
# The external copy can synchronously remove the installed executable without a worker loop.
$removeTemp = Join-Path ([IO.Path]::GetTempPath()) ('CodexSkins-Uninstall-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $removeTemp | Out-Null
$removeCopy = Join-Path $removeTemp 'Uninstall.exe'
try {
    Copy-Item -LiteralPath $uninstaller -Destination $removeCopy
    $removeProcess = Start-Process -FilePath $removeCopy -ArgumentList '/quiet' -WindowStyle Hidden -PassThru
    if (-not $removeProcess.WaitForExit(10000)) { throw 'Codex Skins removal did not finish. Please retry.' }
    if ($removeProcess.ExitCode -ne 0) { throw 'Codex Skins removal failed.' }
} finally {
    if (-not $removeProcess -or $removeProcess.HasExited) {
        Remove-Item -LiteralPath $removeCopy -Force -ErrorAction SilentlyContinue
        [IO.Directory]::Delete($removeTemp)
    }
}