using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

internal static class NativeMetadata {
    [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern IntPtr BeginUpdateResource(string file,bool deleteExisting);
    [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool UpdateResource(IntPtr handle,IntPtr type,IntPtr name,ushort language,byte[] data,uint size);
    [DllImport("kernel32.dll",SetLastError=true)] static extern bool EndUpdateResource(IntPtr handle,bool discard);
    [DllImport("version.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern uint GetFileVersionInfoSize(string file,out uint handle);
    [DllImport("version.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool GetFileVersionInfo(string file,uint handle,uint length,byte[] data);
    [DllImport("version.dll",CharSet=CharSet.Unicode)] static extern bool VerQueryValue(byte[] block,string query,out IntPtr value,out uint length);
    static void Pad(BinaryWriter writer){while(writer.BaseStream.Position%4!=0)writer.Write((byte)0);}
    static byte[] Block(string key,ushort valueLength,ushort type,byte[] value,params byte[][] children) {
        using(var stream=new MemoryStream())using(var writer=new BinaryWriter(stream)) {
            writer.Write((ushort)0);writer.Write(valueLength);writer.Write(type);writer.Write(Encoding.Unicode.GetBytes(key+"\0"));Pad(writer);
            writer.Write(value);Pad(writer);foreach(var child in children){writer.Write(child);Pad(writer);}
            long length=stream.Length;stream.Position=0;writer.Write((ushort)length);return stream.ToArray();
        }
    }
    static byte[] Metadata(string description) {
        var strings=new Dictionary<string,string>{{"CompanyName","Eyra"},{"Publisher","Eyra"},{"Author","Eyra"},{"ProductName","Codex Skins"},
            {"FileDescription",description},{"FileVersion","1.0.0.0"},{"ProductVersion","1.0.0"},{"Comments","Created by Eyra"},{"LegalCopyright","Created by Eyra"}};
        var fields=new List<byte[]>();foreach(var item in strings)fields.Add(Block(item.Key,(ushort)(item.Value.Length+1),1,Encoding.Unicode.GetBytes(item.Value+"\0")));
        var table=Block("040904b0",0,1,new byte[0],fields.ToArray());var stringInfo=Block("StringFileInfo",0,1,new byte[0],table);
        var varInfo=Block("VarFileInfo",0,1,new byte[0],Block("Translation",4,0,new byte[]{0x09,0x04,0xb0,0x04}));
        byte[] fixedInfo;using(var stream=new MemoryStream())using(var writer=new BinaryWriter(stream)) {
            foreach(uint n in new uint[]{0xFEEF04BD,0x10000,0x10000,0,0x10000,0,0x3F,0,0x40004,1,0,0,0})writer.Write(n);fixedInfo=stream.ToArray();
        }
        return Block("VS_VERSION_INFO",52,0,fixedInfo,stringInfo,varInfo);
    }
    static int Main(string[] args) {
        try {
            if(args.Length==2 && args[0]=="--read") {
                uint unused;uint size=GetFileVersionInfoSize(args[1],out unused);if(size==0)throw new Win32Exception();var data=new byte[size];
                if(!GetFileVersionInfo(args[1],0,size,data))throw new Win32Exception();
                foreach(string key in new[]{"CompanyName","Publisher","Author","ProductName","Comments","FileVersion"}) {
                    IntPtr value;uint length;if(!VerQueryValue(data,"\\StringFileInfo\\040904b0\\"+key,out value,out length))throw new Exception("Missing metadata: "+key);
                    Console.WriteLine(key+"="+Marshal.PtrToStringUni(value));
                }return 0;
            }
            if(args.Length!=2)throw new Exception("Expected executable and file description.");
            byte[] metadata=Metadata(args[1]);
            for(int attempt=0;attempt<4;attempt++) {
                try {
                    IntPtr handle=BeginUpdateResource(args[0],false);if(handle==IntPtr.Zero)throw new Win32Exception();
                    if(!UpdateResource(handle,(IntPtr)16,(IntPtr)1,0,metadata,(uint)metadata.Length)){int error=Marshal.GetLastWin32Error();EndUpdateResource(handle,true);throw new Win32Exception(error);}
                    if(!EndUpdateResource(handle,false))throw new Win32Exception();return 0;
                }catch(Win32Exception error){if(attempt==3 || (error.NativeErrorCode!=32 && error.NativeErrorCode!=33 && error.NativeErrorCode!=110))throw;Thread.Sleep(150);}
            }
            return 1;
        }catch(Exception e){Console.Error.WriteLine(e.Message);return 1;}
    }
}
