$ErrorActionPreference = 'Stop'

function Resolve-CodexPackage {
    $package = Get-AppxPackage -Name OpenAI.Codex | Sort-Object Version -Descending | Select-Object -First 1
    if (-not $package) { throw 'Official Codex Windows package was not found.' }
    $manifest = Get-AppxPackageManifest $package
    $application = @($manifest.Package.Applications.Application) | Where-Object { $_.Executable -and $_.EntryPoint -eq 'Windows.FullTrustApplication' } | Select-Object -First 1
    if (-not $application) { $application = @($manifest.Package.Applications.Application) | Where-Object { $_.Executable } | Select-Object -First 1 }
    if (-not $application) { throw 'Official Codex desktop application entry was not found.' }
    [pscustomobject]@{
        Package = $package
        AppId = $package.PackageFamilyName + '!' + $application.Id
        ShellPath = 'shell:AppsFolder\' + $package.PackageFamilyName + '!' + $application.Id
        # Resource lookup and process identification only; never a launch target.
        Executable = Join-Path $package.InstallLocation $application.Executable
    }
}

# Execute the registered AppsFolder shell item with the debugging arguments
# needed by the existing watcher/injector. No physical executable launch target.
if (-not ('MatrixPackageShell' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
public static class MatrixPackageShell {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    struct ExecuteInfo {
        public uint cbSize, fMask;
        public IntPtr hwnd;
        public string verb, file, parameters, directory;
        public int show;
        public IntPtr instance, idList;
        public string className;
        public IntPtr classKey;
        public uint hotKey;
        public IntPtr iconOrMonitor, process;
    }
    [DllImport("shell32.dll", CharSet = CharSet.Unicode)]
    static extern int SHParseDisplayName(string name, IntPtr context, out IntPtr idList, uint attributes, out uint resultAttributes);
    [DllImport("shell32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    static extern bool ShellExecuteEx(ref ExecuteInfo info);
    [DllImport("kernel32.dll")]
    static extern bool CloseHandle(IntPtr handle);
    public static void Open(string shellPath, string arguments, bool validateOnly) {
        IntPtr idList;
        uint attributes;
        Marshal.ThrowExceptionForHR(SHParseDisplayName(shellPath, IntPtr.Zero, out idList, 0, out attributes));
        try {
            if (validateOnly) return;
            ExecuteInfo info = new ExecuteInfo();
            info.cbSize = (uint)Marshal.SizeOf(typeof(ExecuteInfo));
            // INVOKEIDLIST + NOCLOSEPROCESS + NOASYNC + FLAG_NO_UI
            info.fMask = 0x0000054C;
            info.verb = "open";
            info.idList = idList;
            info.parameters = arguments;
            info.show = 1;
            if (!ShellExecuteEx(ref info)) throw new Win32Exception(Marshal.GetLastWin32Error());
            if (info.process != IntPtr.Zero) CloseHandle(info.process);
        } finally { Marshal.FreeCoTaskMem(idList); }
    }
}
'@
}
