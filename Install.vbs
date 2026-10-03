Option Explicit
Dim shell, files, script, result
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
script = files.BuildPath(files.GetParentFolderName(WScript.ScriptFullName), "install.ps1")
result = shell.Run("powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & script & """", 0, True)
If result = 0 Then
    MsgBox "Codex Skins is installed. Open the Codex Skins shortcut on your desktop.", 64, "Codex Skins"
Else
    MsgBox "Installation failed. See %LOCALAPPDATA%\Codex Skins\install.log.", 48, "Codex Skins"
End If
