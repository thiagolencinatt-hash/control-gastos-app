Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class CredReader {
    [DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
    public static extern bool CredRead(string t, int ty, int f, out IntPtr c);
    [DllImport("advapi32.dll")]
    public static extern void CredFree(IntPtr c);
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    public struct CRED {
        public int Flags; public int Type; public string TargetName; public string Comment;
        public long LastWritten; public int CredentialBlobSize; public IntPtr CredentialBlob;
        public int Persist; public int AttributeCount; public IntPtr Attributes;
        public string TargetAlias; public string UserName;
    }
    public static string GetPassword(string t) {
        IntPtr p;
        if (!CredRead(t, 1, 0, out p)) return "";
        var c = (CRED)Marshal.PtrToStructure(p, typeof(CRED));
        byte[] b = new byte[c.CredentialBlobSize];
        Marshal.Copy(c.CredentialBlob, b, 0, c.CredentialBlobSize);
        CredFree(p);
        return System.Text.Encoding.UTF8.GetString(b);
    }
}
"@

$pwd = [CredReader]::GetPassword("GitHub - https://api.github.com/thiagolencinatt-hash")
if ($pwd) {
    [Console]::Write($pwd)
}
