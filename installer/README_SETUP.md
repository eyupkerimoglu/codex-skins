# Codex Skins — Windows Setup

Created by Eyra

Publisher: **Eyra** · Author: **Eyra** · Installer / Installed Apps version: **1.0.0**

## Install

Double-click `CodexSkinsSetup.exe` and choose **Install**. The installer contains the current FINAL ZIP; no separate download, PowerShell command or VBS file is needed. Official Codex Desktop must already be installed.

Files are installed to `%LOCALAPPDATA%\Codex Skins\app`. **Codex Skins** shortcuts are created on the desktop and in the Start menu group. **Codex Skins → Uninstall** directly runs the installed `Uninstall.exe`. The original Codex shortcut stays unchanged. Installation does not launch or close Codex.

Updating or removing stops only the owned Codex Skins controller through its existing shutdown signal; the official Codex process stays open. The installer preserves `%LOCALAPPDATA%\Codex Skins\config.json`. An existing application folder is backed up under `%LOCALAPPDATA%\Codex Skins\backup` before replacement.

## Remove

Use **Windows Settings → Apps → Installed apps → Codex Skins → Uninstall**, **Start → Codex Skins → Uninstall**, or open `%LOCALAPPDATA%\Codex Skins\Uninstall.exe`. Skin files, all three owned shortcuts, runtime logs and the uninstall entry are removed. Preferences are moved to `%LOCALAPPDATA%\Codex Skins\backup\config-*.json`; existing backups are retained. A subsequent clean reinstall uses default preferences unless a saved config is restored to `config.json`. Official Codex remains installed.

Registration is per user at `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\Eyra.CodexSkins` (64-bit view). EXE and ZIP installations register the same native uninstaller. DisplayName is **Codex Skins**, Publisher is **Eyra**, and DisplayVersion is **1.0.0**. An older ZIP installation without this record can be repaired by running the updated `CodexSkinsSetup.exe`.

Upgrade/repair preserves the current `config.json` and backs up the previous app folder. Owned flat Start-menu links and old VBS/Control Panel uninstall links are replaced by the new group. Duplicate/incomplete Codex Skins uninstall records are removed only when their identity belongs to this installation. For a short non-interactive repair, run `CodexSkinsSetup.exe /repair /quiet`; errors are recorded in `%LOCALAPPDATA%\Codex Skins\repair-error.log`.

## GitHub Release

- `CodexSkinsSetup.exe`: single Windows installer.
- `Uninstall.exe`: the same native uninstaller embedded in Setup and included in the FINAL ZIP.
- `CodexSkinsSource_v1.0.2.zip`: application source, bundled runtime and installer build source.
- `CodexSkins_FINAL_v1.zip`: preserved original payload.
- `CodexSkins_SHA256SUMS.txt`: release checksums.

The EXE is currently unsigned; Publisher/Author metadata identifies Eyra, but no verified signing certificate is embedded.

## Build

Run `installer/build-setup.ps1` on Windows 10/11 x64. It uses the Windows .NET Framework compiler and the existing `CodexSkins_FINAL_v1.zip`, verifies the payload inventory and produces the setup EXE plus a source ZIP. No application code is rewritten.

Short installer validation uses `CodexSkinsSetup.exe --self-test <fresh CodexSkins-Setup-Test-* directory>`. It installs, upgrades and removes the payload in an isolated test directory, creates test shortcuts there and uses an isolated test registry key. It never launches Codex or touches the real installation.
