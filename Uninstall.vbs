Option Explicit
Dim shell, files, script, result
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
script = files.BuildPath(files.GetParentFolderName(WScript.ScriptFullName), "uninstall.ps1")
result = shell.Run("powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & script & """", 0, True)
If result = 0 Then
    MsgBox "Codex Skins is removed. Your official Codex installation is unchanged.", 64, "Codex Skins"
Else
    MsgBox "Could not remove Codex Skins. See %LOCALAPPDATA%\Codex Skins\install.log.", 48, "Codex Skins"
End If
