# Codex Skins Setup — uninstall/reinstall revision

Created by Eyra

Date: 2026-10-03. Installer and uninstall registration version: 1.0.0.

The GUI/uninstall/reinstall tests were canceled by the user. No Windows uninstall
window was opened, no application was removed/reinstalled, and the live installation
was left unchanged during this revision. Earlier isolated test results do not prove
this revised flow has passed real installation tests.

| TEST | RESULT | NOTE |
|---|---|---|
| Setup / Uninstall EXE compilation | PASS | Windows .NET Framework; native GUI executables |
| Publisher / version metadata | PASS | Eyra; FileVersion 1.0.0.0 |
| Installed Apps record | MANUAL | HKCU 64-bit Eyra.CodexSkins; DisplayVersion 1.0.0 |
| Start uninstall | MANUAL | Direct Uninstall.exe shortcut; no Control Panel command |
| File cleanup | MANUAL | App and logs removed; config and existing backups retained as backups |
| Shortcut cleanup | MANUAL | Desktop, Start launcher and Start uninstall shortcut |
| Original Codex preservation | MANUAL | No original Codex shortcut migration in the ZIP installer |
| Reinstall | MANUAL | EXE and ZIP use the same native registration |
| Second uninstall | MANUAL | User will perform the real cycle |
| Final reinstall | MANUAL | User will leave the final installation in place |

Artifacts: CodexSkinsSetup.exe, Uninstall.exe, CodexSkins_FINAL_v1.zip,
CodexSkinsSource_v1.0.2.zip and CodexSkins_SHA256SUMS.txt.