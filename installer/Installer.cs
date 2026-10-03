using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Web.Script.Serialization;
using System.Windows.Forms;
using Microsoft.Win32;

[assembly: AssemblyTitle("Codex Skins")]
[assembly: AssemblyProduct("Codex Skins")]
[assembly: AssemblyCompany("Eyra")]
[assembly: AssemblyDescription("Created by Eyra")]
[assembly: AssemblyCopyright("Created by Eyra")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]

internal sealed class Context {
    internal string Root, Desktop, Programs, RegistryPath;
    internal string App { get { return Path.Combine(Root, "app"); } }
    internal static string ProductionRoot { get { return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Codex Skins"); } }
    internal static Context Production() {
        return new Context { Root = ProductionRoot, Desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),
            Programs = Environment.GetFolderPath(Environment.SpecialFolder.Programs), RegistryPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\Eyra.CodexSkins" };
    }
    internal static Context Test(string root) {
        root = Path.GetFullPath(root);
        if (!Path.GetFileName(root).StartsWith("CodexSkins-Setup-Test-", StringComparison.Ordinal) ||
            (Directory.Exists(root) && Directory.GetFileSystemEntries(root).Length != 0)) throw new Exception("Self-test requires a fresh, named test directory.");
        return new Context { Root = root, Desktop = Path.Combine(root,"Desktop"), Programs = Path.Combine(root,"Programs"),
            RegistryPath = @"Software\Eyra\CodexSkins\SetupTests\" + Guid.NewGuid().ToString("N") };
    }
    internal void Validate() {
        Root = Path.GetFullPath(Root).TrimEnd(Path.DirectorySeparatorChar);
        if (Directory.Exists(Root) && (File.GetAttributes(Root) & FileAttributes.ReparsePoint) != 0) throw new Exception("Installation folder cannot be a junction or symbolic link.");
        if (Directory.Exists(App) && (File.GetAttributes(App) & FileAttributes.ReparsePoint) != 0) throw new Exception("Application folder cannot be a junction or symbolic link.");
    }
}
internal sealed class Sum { public string file { get; set; } public string sha256 { get; set; } }
internal sealed class Owner { public int pid { get; set; } public string root { get; set; } }
internal sealed class LegacyRegistration {
    internal string Path;
    internal readonly Dictionary<string,object> Values = new Dictionary<string,object>();
    internal readonly Dictionary<string,RegistryValueKind> Kinds = new Dictionary<string,RegistryValueKind>();
}

internal static class Package {
    internal const string Version = "1.0.0";
    internal static readonly JavaScriptSerializer Json = new JavaScriptSerializer();
    internal static string Hash(Stream stream) { using (var sha=SHA256.Create()) return BitConverter.ToString(sha.ComputeHash(stream)).Replace("-","").ToLowerInvariant(); }
    internal static string Child(string root, string relative) {
        string prefix=Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar)+Path.DirectorySeparatorChar;
        string result=Path.GetFullPath(Path.Combine(root,relative.Replace('/',Path.DirectorySeparatorChar)));
        if (!result.StartsWith(prefix,StringComparison.OrdinalIgnoreCase)) throw new Exception("Invalid package path: "+relative);
        return result;
    }
    internal static void CheckController(Context context) {
        string file=Path.Combine(context.Root,"controller.json");
        if (!File.Exists(file)) return;
        Owner owner;
        try { owner=Json.Deserialize<Owner>(File.ReadAllText(file).TrimStart('\uFEFF')); }
        catch { throw new Exception("Controller state is invalid. Close Codex Skins before continuing."); }
        if(owner==null || owner.pid<=0) return;
        try {
            using(var process=Process.GetProcessById(owner.pid)) {
                if(process.HasExited || !process.ProcessName.Equals("node",StringComparison.OrdinalIgnoreCase)) return;
                if(!String.Equals(owner.root,context.App,StringComparison.OrdinalIgnoreCase) ||
                    !String.Equals(process.MainModule.FileName,Path.Combine(context.App,"runtime","node.exe"),StringComparison.OrdinalIgnoreCase)) return;
                // Stop only our owned controller using its existing shutdown signal; keep Codex open.
                File.WriteAllText(Path.Combine(context.App,".codex-skins-disabled"),String.Empty);
                if(!process.WaitForExit(4000)) throw new InvalidOperationException("Codex Skins is still stopping. Please retry; your Codex work was not closed.");
            }
        } catch(ArgumentException) { }
    }
    internal static List<Sum> Extract(string destination) {
        using(var stream=Assembly.GetExecutingAssembly().GetManifestResourceStream("payload.zip")) {
            if(stream==null) throw new Exception("Installer payload is missing.");
            if(Hash(stream)!=PayloadIdentity.Sha256) throw new Exception("Installer payload checksum mismatch.");
            stream.Position=0;
            using(var zip=new ZipArchive(stream,ZipArchiveMode.Read)) {
                const string prefix="CodexSkins-FINAL-v1/";
                var seen=new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                foreach(var entry in zip.Entries) {
                    if(!entry.FullName.StartsWith(prefix,StringComparison.Ordinal)) throw new Exception("Unexpected archive entry.");
                    string relative=entry.FullName.Substring(prefix.Length);
                    if(relative.Length==0 || relative.EndsWith("/",StringComparison.Ordinal)) continue;
                    if(!seen.Add(relative)) throw new Exception("Duplicate archive entry.");
                    string target=Child(destination,relative); Directory.CreateDirectory(Path.GetDirectoryName(target));
                    using(var input=entry.Open()) using(var output=new FileStream(target,FileMode.CreateNew,FileAccess.Write)) input.CopyTo(output);
                }
                var sums=Json.Deserialize<List<Sum>>(File.ReadAllText(Path.Combine(destination,"SHA256SUMS.json")).TrimStart('\uFEFF'));
                if(sums==null || seen.Count!=sums.Count+1) throw new Exception("Invalid payload inventory.");
                foreach(var sum in sums) using(var file=File.OpenRead(Child(destination,sum.file))) {
                    if(Hash(file)!=sum.sha256) throw new Exception("Payload file checksum mismatch: "+sum.file);
                }
                return sums;
            }
        }
    }
    internal static object Shell() { return Activator.CreateInstance(Type.GetTypeFromProgID("WScript.Shell",true)); }
    internal static object Get(object instance,string property) { return instance.GetType().InvokeMember(property,BindingFlags.GetProperty,null,instance,null); }
    internal static void Set(object instance,string property,object value) { instance.GetType().InvokeMember(property,BindingFlags.SetProperty,null,instance,new object[]{value}); }
    internal static object Call(object instance,string name,params object[] args) { return instance.GetType().InvokeMember(name,BindingFlags.InvokeMethod,null,instance,args); }
    internal static bool OwnsLink(string file,Context context) {
        if(!File.Exists(file)) return true;
        object shell=Shell(),link=null;
        try {
            link=Call(shell,"CreateShortcut",file);
            if(String.Equals(file,UninstallLink(context),StringComparison.OrdinalIgnoreCase))
                return (String.Equals((string)Get(link,"TargetPath"),Path.Combine(context.Root,"Uninstall.exe"),StringComparison.OrdinalIgnoreCase) && String.IsNullOrEmpty((string)Get(link,"Arguments"))) || LegacyUninstallTarget(file,context,(string)Get(link,"TargetPath"),(string)Get(link,"Arguments"));
            return String.Equals((string)Get(link,"Arguments"),"\""+Path.Combine(context.App,"Launch.vbs")+"\"",StringComparison.OrdinalIgnoreCase);
        }
        finally { if(link!=null) Marshal.FinalReleaseComObject(link); Marshal.FinalReleaseComObject(shell); }
    }
    internal static string UninstallLink(Context context) { return Path.Combine(context.Programs,"Codex Skins","Uninstall.lnk"); }
    internal static string[] Links(Context context) { return new[]{Path.Combine(context.Desktop,"Codex Skins.lnk"),Path.Combine(context.Programs,"Codex Skins","Codex Skins.lnk"),UninstallLink(context)}; }
    internal static bool LegacyUninstallTarget(string file,Context context,string target,string arguments) {
        string folder=Path.Combine(context.Programs,"Codex Skins");
        bool inGroup=String.Equals(Path.GetDirectoryName(file),folder,StringComparison.OrdinalIgnoreCase);
        bool branded=Path.GetFileNameWithoutExtension(file).Equals("Uninstall Codex Skins",StringComparison.OrdinalIgnoreCase) || Path.GetFileNameWithoutExtension(file).Equals("Codex Skins Uninstall",StringComparison.OrdinalIgnoreCase) || Path.GetFileNameWithoutExtension(file).Equals("Remove Codex Skins",StringComparison.OrdinalIgnoreCase);
        if(!branded && !(inGroup && Path.GetFileNameWithoutExtension(file).Equals("Uninstall",StringComparison.OrdinalIgnoreCase))) return false;
        if(String.Equals(target,Path.Combine(context.Root,"Uninstall.exe"),StringComparison.OrdinalIgnoreCase)) return true;
        if((target??String.Empty).IndexOf(context.Root+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase)>=0 || (arguments??String.Empty).IndexOf(context.Root+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase)>=0) return true;
        // Only a branded/scoped old shortcut may point at Windows' generic uninstall panel.
        string name=Path.GetFileName(target??String.Empty);
        return (name.Equals("control.exe",StringComparison.OrdinalIgnoreCase) && ((arguments??String.Empty).IndexOf("appwiz",StringComparison.OrdinalIgnoreCase)>=0 || (arguments??String.Empty).IndexOf("ProgramsAndFeatures",StringComparison.OrdinalIgnoreCase)>=0)) ||
            (name.Equals("rundll32.exe",StringComparison.OrdinalIgnoreCase) && (arguments??String.Empty).IndexOf("appwiz",StringComparison.OrdinalIgnoreCase)>=0);
    }
    internal static string[] LegacyLinks(Context context) {
        var result=new List<string>();
        string flat=Path.Combine(context.Programs,"Codex Skins.lnk");
        if(File.Exists(flat) && OwnsLink(flat,context)) result.Add(flat);
        foreach(string file in new[]{Path.Combine(context.Programs,"Codex Skins","Uninstall Codex Skins.lnk"),Path.Combine(context.Programs,"Codex Skins","Remove Codex Skins.lnk"),Path.Combine(context.Programs,"Uninstall Codex Skins.lnk"),Path.Combine(context.Programs,"Codex Skins Uninstall.lnk")}) {
            if(!File.Exists(file)) continue;
            object shell=Shell(),link=null;
            try { link=Call(shell,"CreateShortcut",file);if(LegacyUninstallTarget(file,context,(string)Get(link,"TargetPath"),(string)Get(link,"Arguments"))) result.Add(file); }
            finally { if(link!=null)Marshal.FinalReleaseComObject(link);Marshal.FinalReleaseComObject(shell); }
        }
        return result.ToArray();
    }
    internal static void CreateLink(string file,Context context) {
        Directory.CreateDirectory(Path.GetDirectoryName(file)); object shell=Shell(),link=null;
        try {
            link=Call(shell,"CreateShortcut",file);
            bool removing=String.Equals(file,UninstallLink(context),StringComparison.OrdinalIgnoreCase);
            Set(link,"TargetPath",removing?Path.Combine(context.Root,"Uninstall.exe"):Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows),"System32","wscript.exe"));
            Set(link,"Arguments",removing?String.Empty:"\""+Path.Combine(context.App,"Launch.vbs")+"\""); Set(link,"WorkingDirectory",removing?context.Root:context.App);
            Set(link,"IconLocation",Path.Combine(context.App,"assets","codex-skins.ico")+",0"); Set(link,"Description",removing?"Uninstall Codex Skins":"Codex Skins — Created by Eyra"); Set(link,"WindowStyle",removing?1:7); Call(link,"Save");
        } finally { if(link!=null) Marshal.FinalReleaseComObject(link); Marshal.FinalReleaseComObject(shell); }
    }
    internal static RegistryKey UserRegistry() { return RegistryKey.OpenBaseKey(RegistryHive.CurrentUser,RegistryView.Registry64); }
    internal static void Register(Context context,long size) {
        using(var user=UserRegistry()) using(var key=user.CreateSubKey(context.RegistryPath)) {
            string exe=Path.Combine(context.Root,"Uninstall.exe");
            key.SetValue("DisplayName","Codex Skins"); key.SetValue("DisplayVersion",Version);
            key.SetValue("Publisher","Eyra"); key.SetValue("Author","Eyra"); key.SetValue("Comments","Created by Eyra");
            key.SetValue("InstallLocation",context.Root); key.SetValue("DisplayIcon",Path.Combine(context.App,"assets","codex-skins.ico"));
            key.SetValue("UninstallString","\""+exe+"\""); key.SetValue("QuietUninstallString","\""+exe+"\" /quiet");
            key.SetValue("EstimatedSize",(int)(size/1024),RegistryValueKind.DWord); key.SetValue("NoModify",1,RegistryValueKind.DWord); key.SetValue("NoRepair",1,RegistryValueKind.DWord);
            key.SetValue("InstallDate",DateTime.Now.ToString("yyyyMMdd"));
            key.SetValue("SystemComponent",0,RegistryValueKind.DWord);
            key.SetValue("NoRemove",0,RegistryValueKind.DWord); key.SetValue("WindowsInstaller",0,RegistryValueKind.DWord);
            key.DeleteValue("ParentKeyName",false); key.DeleteValue("ParentDisplayName",false);
        }
    }
    internal static bool OwnedLegacyRegistration(string name,RegistryKey key,Context context) {
        string display=key.GetValue("DisplayName") as string, publisher=key.GetValue("Publisher") as string;
        string location=key.GetValue("InstallLocation") as string, command=key.GetValue("UninstallString") as string;
        bool branded=String.Equals(display,"Codex Skins",StringComparison.OrdinalIgnoreCase) || new[]{"CodexSkins","Codex Skins","Eyra.CodexSkins"}.Contains(name,StringComparer.OrdinalIgnoreCase);
        if(!branded) return false;
        bool sameLocation=String.Equals((location??String.Empty).TrimEnd('\\','/'),context.Root,StringComparison.OrdinalIgnoreCase) || String.Equals((location??String.Empty).TrimEnd('\\','/'),context.App,StringComparison.OrdinalIgnoreCase);
        bool sameCommand=(command??String.Empty).IndexOf(context.Root+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase)>=0;
        return sameLocation || sameCommand || (String.IsNullOrEmpty(location) && String.IsNullOrEmpty(command) && (String.IsNullOrEmpty(publisher) || String.Equals(publisher,"Eyra",StringComparison.OrdinalIgnoreCase)));
    }
    internal static void CleanLegacyRegistrations(Context context) {
        const string standard=@"Software\Microsoft\Windows\CurrentVersion\Uninstall";
        if(!String.Equals(context.RegistryPath,standard+@"\Eyra.CodexSkins",StringComparison.OrdinalIgnoreCase)) return;
        var old=new List<LegacyRegistration>();
        using(var user=UserRegistry()) {
            foreach(string parent in new[]{standard,@"Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"}) using(var folder=user.OpenSubKey(parent)) {
                if(folder==null)continue;
                foreach(string name in folder.GetSubKeyNames()) {
                    string path=parent+"\\"+name;if(String.Equals(path,context.RegistryPath,StringComparison.OrdinalIgnoreCase))continue;
                    using(var key=user.OpenSubKey(path)) {
                        if(key==null || !OwnedLegacyRegistration(name,key,context))continue;
                        var saved=new LegacyRegistration{Path=path};
                        foreach(string field in key.GetValueNames()){saved.Values[field]=key.GetValue(field,null,RegistryValueOptions.DoNotExpandEnvironmentNames);saved.Kinds[field]=key.GetValueKind(field);}
                        old.Add(saved);
                    }
                }
            }
            try { foreach(var saved in old)user.DeleteSubKeyTree(saved.Path,false); }
            catch { foreach(var saved in old)using(var key=user.CreateSubKey(saved.Path))foreach(var field in saved.Values)key.SetValue(field.Key,field.Value,saved.Kinds[field.Key]);throw; }
        }
    }
    internal static void RegisterExisting(Context context) {
        context.Validate();
        if(!File.Exists(Path.Combine(context.Root,"Uninstall.exe")) || !File.Exists(Path.Combine(context.App,"Launch.vbs"))) throw new Exception("Installation files are missing. Reinstall Codex Skins.");
        foreach(string link in Links(context)) if(!OwnsLink(link,context)) throw new Exception("A different shortcut already uses the name Codex Skins.");
        string[] legacy=LegacyLinks(context);
        foreach(string link in Links(context)) CreateLink(link,context);
        Register(context,Directory.GetFiles(context.App,"*",SearchOption.AllDirectories).Sum(file=>new FileInfo(file).Length));
        CleanLegacyRegistrations(context);
        foreach(string link in legacy)File.Delete(link);
    }
    internal static void DeleteTree(string folder) {
        // Delete directory links themselves, never follow their external targets.
        foreach(string child in Directory.GetDirectories(folder)) {
            if((File.GetAttributes(child)&FileAttributes.ReparsePoint)!=0) Directory.Delete(child);
            else DeleteTree(child);
        }
        foreach(string file in Directory.GetFiles(folder)) File.Delete(file);
        Directory.Delete(folder);
    }
    internal static void Resource(string name,string target) {
        using(var input=Assembly.GetExecutingAssembly().GetManifestResourceStream(name)) {
            if(input==null) throw new Exception("Installer resource missing: "+name);
            using(var output=File.Create(target)) input.CopyTo(output);
        }
    }
    internal static void Install(Context context) {
        context.Validate(); CheckController(context);
        foreach(string link in Links(context)) if(!OwnsLink(link,context)) throw new Exception("A different shortcut already uses the name Codex Skins. Move that shortcut before installing.");
        Directory.CreateDirectory(context.Root);
        string stage=Child(context.Root,".setup-"+Guid.NewGuid().ToString("N"));
        string backup=Child(context.Root,"backup/app-"+DateTime.Now.ToString("yyyyMMdd-HHmmss")+"-"+Guid.NewGuid().ToString("N").Substring(0,8));
        bool moved=false,swapped=false;var links=new Dictionary<string,byte[]>();
        string[] legacyLinks=LegacyLinks(context);
        foreach(string link in Links(context).Concat(legacyLinks)) links[link]=File.Exists(link)?File.ReadAllBytes(link):null;
        byte[] previousUninstaller=File.Exists(Path.Combine(context.Root,"Uninstall.exe"))?File.ReadAllBytes(Path.Combine(context.Root,"Uninstall.exe")):null;
        byte[] previousReadme=File.Exists(Path.Combine(context.Root,"README_SETUP.md"))?File.ReadAllBytes(Path.Combine(context.Root,"README_SETUP.md")):null;
        var registryValues=new Dictionary<string,object>();var registryKinds=new Dictionary<string,RegistryValueKind>();bool hadRegistry=false;
        using(var user=UserRegistry()) using(var key=user.OpenSubKey(context.RegistryPath)) if(key!=null){hadRegistry=true;foreach(string name in key.GetValueNames()){registryValues[name]=key.GetValue(name);registryKinds[name]=key.GetValueKind(name);}}
        try {
            Directory.CreateDirectory(stage); Extract(stage);
            long size=Directory.GetFiles(stage,"*",SearchOption.AllDirectories).Sum(file=>new FileInfo(file).Length);
            if(Directory.Exists(context.App)) { Directory.CreateDirectory(Path.GetDirectoryName(backup)); Directory.Move(context.App,backup); moved=true; }
            Directory.Move(stage,context.App); swapped=true;
            Resource("uninstall.exe",Path.Combine(context.Root,"Uninstall.exe")); Resource("readme.md",Path.Combine(context.Root,"README_SETUP.md"));
            foreach(string link in Links(context)) CreateLink(link,context);
            Register(context,size); File.AppendAllText(Path.Combine(context.Root,"install.log"),DateTime.Now.ToString("o")+" EXE installed "+Version+"; Created by Eyra"+Environment.NewLine);
            foreach(string link in legacyLinks)File.Delete(link);
            CleanLegacyRegistrations(context);
        } catch {
            if(swapped && Directory.Exists(context.App)) DeleteTree(context.App);
            if(moved) Directory.Move(backup,context.App);
            foreach(var item in links) { if(item.Value==null) File.Delete(item.Key);else File.WriteAllBytes(item.Key,item.Value); }
            RestoreFile(Path.Combine(context.Root,"Uninstall.exe"),previousUninstaller); RestoreFile(Path.Combine(context.Root,"README_SETUP.md"),previousReadme);
            using(var user=UserRegistry()) { user.DeleteSubKeyTree(context.RegistryPath,false); if(hadRegistry) using(var key=user.CreateSubKey(context.RegistryPath))foreach(var item in registryValues)key.SetValue(item.Key,item.Value,registryKinds[item.Key]); }
            throw;
        } finally { if(Directory.Exists(stage)) DeleteTree(stage); }
    }
    internal static void RestoreFile(string file,byte[] bytes) { if(bytes==null)File.Delete(file);else File.WriteAllBytes(file,bytes); }
    internal static void Uninstall(Context context) {
        context.Validate(); CheckController(context);
        string config=Path.Combine(context.Root,"config.json");
        if(File.Exists(config)) { string backup=Child(context.Root,"backup/config-"+DateTime.Now.ToString("yyyyMMdd-HHmmss")+"-"+Guid.NewGuid().ToString("N").Substring(0,8)+".json"); Directory.CreateDirectory(Path.GetDirectoryName(backup)); File.Move(config,backup); }
        foreach(string link in Links(context)) if(OwnsLink(link,context)) File.Delete(link);
        string startFolder=Path.GetDirectoryName(UninstallLink(context));
        if(Directory.Exists(startFolder) && Directory.GetFileSystemEntries(startFolder).Length==0) Directory.Delete(startFolder);
        if(Directory.Exists(context.App)) DeleteTree(context.App);
        using(var user=UserRegistry()) user.DeleteSubKeyTree(context.RegistryPath,false);
        File.Delete(Path.Combine(context.Root,"Uninstall.exe")); File.Delete(Path.Combine(context.Root,"README_SETUP.md"));
        File.Delete(Path.Combine(context.Root,"controller.json")); File.Delete(Path.Combine(context.Root,"open-selector.json"));
        foreach(string name in new[]{"install.log","launcher.log","controller.log","controller.log.old"}) File.Delete(Path.Combine(context.Root,name));
        if(Directory.Exists(context.Root) && Directory.GetFileSystemEntries(context.Root).Length==0) Directory.Delete(context.Root);
    }
    internal static void Require(bool condition,string message) { if(!condition)throw new Exception("Self-test failed: "+message); }
    internal static void SelfTest(string root) {
        Context c=Context.Test(root); Directory.CreateDirectory(c.Root);
        var results=new List<string>();
        string config=Path.Combine(c.Root,"config.json"),original="{\"skin\":\"matrix\",\"remember\":true,\"hideOnStartup\":false}";
        File.WriteAllText(config,original);
        try {
            Install(c); Require(File.ReadAllText(config)==original,"config preservation");results.Add("PASS install/config preservation");
            using(var user=UserRegistry())using(var key=user.OpenSubKey(c.RegistryPath)) {
                Require((string)key.GetValue("Publisher")=="Eyra" && (string)key.GetValue("Author")=="Eyra" && (string)key.GetValue("DisplayVersion")=="1.0.0","Eyra registry identity/version");
                Require((string)key.GetValue("UninstallString")=="\""+Path.Combine(c.Root,"Uninstall.exe")+"\"","uninstall entry");
            } results.Add("PASS registry and uninstall command");
            foreach(string link in Links(c)) {
                Require(File.Exists(link)&&OwnsLink(link,c),"shortcut ownership");object shell=Shell(),shortcut=null;
                try{shortcut=Call(shell,"CreateShortcut",link);Require((string)Get(shortcut,"TargetPath")== (link==UninstallLink(c)?Path.Combine(c.Root,"Uninstall.exe"):Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows),"System32","wscript.exe")),"shortcut target");Require(((string)Get(shortcut,"IconLocation")).Contains("codex-skins.ico"),"custom icon");}
                finally{if(shortcut!=null)Marshal.FinalReleaseComObject(shortcut);Marshal.FinalReleaseComObject(shell);}
            } results.Add("PASS desktop/start-menu shortcut generation");
            Install(c);Require(File.ReadAllText(config)==original,"upgrade preservation");Require(Directory.GetDirectories(Path.Combine(c.Root,"backup")).Length==1,"upgrade backup");results.Add("PASS reinstall and backup");
            File.WriteAllText(Path.Combine(c.Root,"controller.json"),"{\"pid\":"+Process.GetCurrentProcess().Id+"}");
            // Current process is this setup EXE, not a Node controller: stale/reused PID cannot stop it.
            CheckController(c);results.Add("PASS stale controller identity handling");File.Delete(Path.Combine(c.Root,"controller.json"));
            Uninstall(c);Require(!Directory.Exists(c.App),"application removed");Require(Links(c).All(link=>!File.Exists(link)),"shortcuts removed");
            using(var user=UserRegistry())using(var key=user.OpenSubKey(c.RegistryPath))Require(key==null,"uninstall registry removed");
            Require(Directory.GetFiles(Path.Combine(c.Root,"backup"),"config-*.json").Any(file=>File.ReadAllText(file)==original),"config backup");
            results.Add("PASS uninstall/config backup");
        } finally { using(var user=UserRegistry())user.DeleteSubKeyTree(c.RegistryPath,false); }
        File.WriteAllText(Path.Combine(c.Root,"test-results.json"),Json.Serialize(results));
    }
}

internal sealed class SetupWindow : Form {
    readonly bool uninstall; bool working,finished; readonly Label status; readonly Button action;
    internal SetupWindow(bool removing) {
        uninstall=removing;Text=removing?"Remove Codex Skins":"Codex Skins Setup";
        ClientSize=new Size(470,265);FormBorderStyle=FormBorderStyle.FixedDialog;MaximizeBox=false;MinimizeBox=false;StartPosition=FormStartPosition.CenterScreen;
        Font=new Font("Segoe UI",9);BackColor=Color.White;Icon=Icon.ExtractAssociatedIcon(Assembly.GetExecutingAssembly().Location);
        var title=new Label{Text=removing?"Remove Codex Skins":"Install Codex Skins",Font=new Font("Segoe UI",16,FontStyle.Bold),AutoSize=true,Location=new Point(24,22)};
        var credits=new Label{Text="Created by Eyra",AutoSize=true,ForeColor=Color.DimGray,Location=new Point(25,61)};
        var detail=new Label{Text=removing?"Removes Codex Skins and its shortcuts.\r\nYour official Codex installation is preserved.\r\nSkin preferences are backed up.":"Matrix skin and IDE integration for Codex Desktop.\r\nInstalled for your Windows user; no administrator access needed.\r\nYour existing skin preferences are preserved.",Location=new Point(24,96),Size=new Size(422,65)};
        status=new Label{Text=removing?"":"Location: %LOCALAPPDATA%\\Codex Skins",Location=new Point(24,172),Size=new Size(422,35),ForeColor=Color.DimGray};
        action=new Button{Text=removing?"Remove":"Install",Location=new Point(331,219),Size=new Size(115,30)};
        var cancel=new Button{Text="Close",Location=new Point(213,219),Size=new Size(105,30)};cancel.Click+=(s,e)=>Close();
        action.Click+=(s,e)=>Run();FormClosing+=(s,e)=>{if(working)e.Cancel=true;};
        Controls.AddRange(new Control[]{title,credits,detail,status,action,cancel});AcceptButton=action;CancelButton=cancel;
    }
    void Run() {
        if(finished){Close();return;}
        working=true;action.Enabled=false;status.Text=uninstall?"Removing...":"Installing...";Refresh();
        try { if(uninstall)Package.Uninstall(Context.Production());else Package.Install(Context.Production());
            status.Text=uninstall?"Codex Skins removed. Preferences backed up.":"Installed. Open Codex Skins from your desktop or Start menu.";action.Text="Done";action.Enabled=true;finished=true;working=false;
        } catch(Exception error) { status.Text="Could not complete the operation.";working=false;action.Enabled=true;MessageBox.Show(this,error.Message,Text,MessageBoxButtons.OK,MessageBoxIcon.Warning); }
    }
}
internal static class Program {
#if UNINSTALL
    static readonly bool IsUninstaller=true;
#else
    static readonly bool IsUninstaller=false;
#endif
    [STAThread] static int Main(string[] args) {
        try {
            if(!IsUninstaller && args.Length==2 && args[0]=="--self-test") { Package.SelfTest(args[1]);return 0; }
            if(!IsUninstaller && args.Length==2 && args[0]=="/repair" && args[1]=="/quiet") { Package.Install(Context.Production());return 0; }
            if(IsUninstaller && args.Length==1 && args[0]=="--register") { Package.RegisterExisting(Context.Production());return 0; }
            if(IsUninstaller && args.Length==1 && args[0]=="--prepare") { var context=Context.Production();context.Validate();Package.CheckController(context);return 0; }
            if(IsUninstaller && (args.Length==0 || (args.Length==1 && args[0]=="/quiet"))) {
                // External/package copies can remove the installed files synchronously.
                if(!String.Equals(Assembly.GetExecutingAssembly().Location,Path.Combine(Context.ProductionRoot,"Uninstall.exe"),StringComparison.OrdinalIgnoreCase)) {
                    if(args.Length==1) { Package.Uninstall(Context.Production());return 0; }
                    Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);Application.Run(new SetupWindow(true));return 0;
                }
                // Run from an owned temp directory so the installed uninstaller can be removed.
                string temp=Path.Combine(Path.GetTempPath(),"CodexSkins-Uninstall-"+Guid.NewGuid().ToString("N"));Directory.CreateDirectory(temp);
                string worker=Path.Combine(temp,"Uninstall.exe");File.Copy(Assembly.GetExecutingAssembly().Location,worker);
                Process.Start(new ProcessStartInfo(worker,"--remove "+(args.Length==1?"/quiet":"/ui")+" "+Process.GetCurrentProcess().Id){UseShellExecute=false});return 0;
            }
            if(IsUninstaller && (args.Length!=3 || args[0]!="--remove" || (args[1]!="/quiet" && args[1]!="/ui")))throw new Exception("Invalid uninstall arguments.");
            if(IsUninstaller) {
                int parent;if(!Int32.TryParse(args[2],out parent) || parent<=0)throw new Exception("Invalid uninstall parent.");
                try { using(var original=Process.GetProcessById(parent)) if(!original.WaitForExit(2000))throw new Exception("Uninstaller is still closing. Please retry."); } catch(ArgumentException) { }
            }
            if(IsUninstaller && args[1]=="/quiet") { Package.Uninstall(Context.Production());return 0; }
            Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);Application.Run(new SetupWindow(IsUninstaller));return 0;
        } catch(Exception error) {
            if(!IsUninstaller && args.Length==2 && args[0]=="/repair" && args[1]=="/quiet") { Directory.CreateDirectory(Context.ProductionRoot);File.WriteAllText(Path.Combine(Context.ProductionRoot,"repair-error.log"),error.ToString()); }
            else if(args.Length==2 && args[0]=="--self-test") { Directory.CreateDirectory(args[1]);File.WriteAllText(Path.Combine(args[1],"test-error.txt"),error.ToString()); }
            else MessageBox.Show(error.Message,"Codex Skins",MessageBoxButtons.OK,MessageBoxIcon.Error);
            return 1;
        }
    }
}
