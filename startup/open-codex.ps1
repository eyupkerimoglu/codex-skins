param([switch]$ValidateOnly)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$stateDir = Join-Path $env:LOCALAPPDATA 'Codex Skins'
New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
$registration = $null
$activated = $false
try {
    . (Join-Path $PSScriptRoot 'package-shell.ps1')
    $registration = Resolve-CodexPackage
    [MatrixPackageShell]::Open($registration.ShellPath, '', $true)
    $nodePath = Join-Path $root 'runtime\node.exe'
    if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Codex Skins runtime is missing. Run Install.vbs again.' }
    if ($ValidateOnly) { Write-Output ('Resolved: ' + $registration.ShellPath); return }
    $flags = '--remote-debugging-address=127.0.0.1 --remote-debugging-port=9229 --remote-allow-origins=http://127.0.0.1:9229'
    [MatrixPackageShell]::Open($registration.ShellPath, $flags, $false)
    $activated = $true
    $deadline = [DateTime]::UtcNow.AddSeconds(15)
    do {
        $gui = Get-CimInstance Win32_Process -Filter "Name='ChatGPT.exe'" | Where-Object {
            $_.ExecutablePath -ieq $registration.Executable -and $_.CommandLine -notmatch '\s--type='
        } | Select-Object -First 1
        if ($gui) { break }
        Start-Sleep -Milliseconds 150
    } while ([DateTime]::UtcNow -lt $deadline)
    if (-not $gui) { throw 'Official Codex desktop process did not start.' }
    $arguments = '"' + (Join-Path $root 'skin-manager\controller.cjs') + '" ' + $gui.ProcessId
    Start-Process -FilePath $nodePath -ArgumentList $arguments -WindowStyle Hidden
    Add-Content -LiteralPath (Join-Path $stateDir 'launcher.log') -Value ((Get-Date -Format o) + ' appId=' + $registration.AppId)
} catch {
    Add-Content -LiteralPath (Join-Path $stateDir 'launcher.log') -Value ((Get-Date -Format o) + ' ' + $_.Exception.Message)
    if (-not $ValidateOnly) {
        if (-not $activated -and $registration) { Start-Process -FilePath explorer.exe -ArgumentList $registration.ShellPath -WindowStyle Hidden }
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'Codex Skins', 'OK', 'Warning') | Out-Null
    }
    exit 1
}
