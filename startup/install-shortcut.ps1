param([string]$ApplicationRoot = (Split-Path -Parent $PSScriptRoot))
$ErrorActionPreference = 'Stop'
$shell = New-Object -ComObject WScript.Shell
$links = @(
    (Join-Path ([Environment]::GetFolderPath('Desktop')) 'Codex Skins.lnk'),
    (Join-Path ([Environment]::GetFolderPath('Programs')) 'Codex Skins.lnk')
)
foreach ($link in $links) {
    $shortcut = $shell.CreateShortcut($link)
    $shortcut.TargetPath = Join-Path $env:SystemRoot 'System32\wscript.exe'
    $shortcut.Arguments = '"' + (Join-Path $ApplicationRoot 'Launch.vbs') + '"'
    $shortcut.WorkingDirectory = $ApplicationRoot
    $shortcut.IconLocation = (Join-Path $ApplicationRoot 'assets\codex-skins.ico') + ',0'
    $shortcut.Description = 'Codex Skins'
    $shortcut.WindowStyle = 7
    $shortcut.Save()
    Write-Output ('Created: ' + $link)
}
