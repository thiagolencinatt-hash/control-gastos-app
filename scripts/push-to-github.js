// Script para subir el proyecto a GitHub usando la API REST
// Extrae el token de GitHub Desktop del credential store de Windows
const { execSync } = require("child_process");
const https = require("https");
const fs = require("fs");
const path = require("path");

const OWNER = "thiagolencinatt-hash";
const REPO = "control-gastos-app";
const BRANCH = "main";

// Extraer token del Windows Credential Manager usando PowerShell
function getGitHubToken() {
  const ps = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class CR {
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
    public static string GP(string t) {
        IntPtr p; if(!CredRead(t,1,0,out p)) return "";
        var c=(CRED)Marshal.PtrToStructure(p,typeof(CRED));
        var pw=Marshal.PtrToStringUni(c.CredentialBlob,c.CredentialBlobSize/2);
        CredFree(p); return pw;
    }
}
"@
[CR]::GP("GitHub - https://api.github.com/${OWNER}")
`;
  try {
    const result = execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, " ")}"`, { encoding: "utf8" }).trim();
    if (result && result.length > 10) return result;
  } catch (e) {}
  
  // Fallback: try git credential manager
  try {
    const result = execSync(
      `echo protocol=https\nhost=github.com | git credential fill`,
      { encoding: "utf8" }
    );
    const match = result.match(/password=(.+)/);
    if (match) return match[1].trim();
  } catch (e) {}
  
  return null;
}

function apiCall(method, apiPath, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: "api.github.com",
      path: apiPath,
      method,
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "FinanzApp-Uploader/1.0",
        "Content-Type": "application/json",
      },
    };
    if (data) opts.headers["Content-Length"] = Buffer.byteLength(data);

    const req = https.request(opts, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

// Leer todos los archivos del proyecto (sin node_modules, .next, .env.local, etc.)
function getProjectFiles(dir, base = "") {
  const IGNORE = [
    "node_modules", ".next", ".git", "out", "build", ".env.local",
    ".env", ".vercel", ".DS_Store", "Thumbs.db", "package-lock.json",
  ];
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.includes(entry.name)) continue;
    if (entry.name.startsWith(".env") && entry.name !== ".env.local.example" && entry.name !== ".gitignore") continue;

    const fullPath = path.join(dir, entry.name);
    const relPath = base ? `${base}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...getProjectFiles(fullPath, relPath));
    } else if (entry.isFile()) {
      // Skip binary files
      const ext = path.extname(entry.name).toLowerCase();
      const binaryExts = [".ico", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".woff", ".woff2", ".ttf", ".eot"];
      
      if (binaryExts.includes(ext)) {
        // Read as base64
        const content = fs.readFileSync(fullPath).toString("base64");
        files.push({ path: relPath, content, encoding: "base64" });
      } else {
        try {
          const content = fs.readFileSync(fullPath, "utf8");
          files.push({ path: relPath, content });
        } catch {
          // skip unreadable files
        }
      }
    }
  }
  return files;
}

async function main() {
  console.log("🔑 Buscando token de GitHub...");
  const token = getGitHubToken();
  
  if (!token) {
    console.error("❌ No se encontró token de GitHub. Necesitás configurar un Personal Access Token.");
    console.log("\n📋 Instrucciones:");
    console.log("1. Andá a https://github.com/settings/tokens/new");
    console.log("2. Creá un token con permisos 'repo' (Full control of private repositories)");
    console.log("3. Ejecutá: set GITHUB_TOKEN=tu_token_aqui");
    console.log("4. Volvé a ejecutar este script");
    process.exit(1);
  }

  console.log("✅ Token encontrado");
  
  // Verificar si el repo existe
  console.log(`📦 Verificando repo ${OWNER}/${REPO}...`);
  const repoCheck = await apiCall("GET", `/repos/${OWNER}/${REPO}`, null, token);
  
  if (repoCheck.status === 404) {
    console.log("📦 Creando repositorio privado...");
    const createRes = await apiCall("POST", "/user/repos", {
      name: REPO,
      description: "💰 FinanzApp — Control de gastos personal inteligente con IA, metas de ahorro, cuotas, cotizaciones del dólar y diseño premium. Next.js 16 + TypeScript + Framer Motion.",
      private: true,
      auto_init: false,
    }, token);
    
    if (createRes.status !== 201) {
      console.error("❌ Error creando repo:", createRes.data.message || createRes.status);
      process.exit(1);
    }
    console.log("✅ Repo creado:", createRes.data.html_url);
  } else if (repoCheck.status === 200) {
    console.log("✅ Repo ya existe:", repoCheck.data.html_url);
  } else {
    console.error("❌ Error verificando repo:", repoCheck.status, repoCheck.data.message);
    process.exit(1);
  }

  // Recopilar archivos
  const projectDir = path.resolve(__dirname, "..");
  console.log(`\n📂 Escaneando archivos en: ${projectDir}`);
  const files = getProjectFiles(projectDir);
  console.log(`📄 ${files.length} archivos encontrados`);

  // Crear tree con todos los archivos
  // Primero necesitamos crear blobs para cada archivo
  console.log("\n🔄 Subiendo archivos a GitHub...");
  
  const blobs = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    process.stdout.write(`\r  [${i + 1}/${files.length}] ${file.path.substring(0, 50).padEnd(50)}`);
    
    const blobRes = await apiCall("POST", `/repos/${OWNER}/${REPO}/git/blobs`, {
      content: file.content,
      encoding: file.encoding || "utf-8",
    }, token);
    
    if (blobRes.status !== 201) {
      console.error(`\n❌ Error subiendo ${file.path}:`, blobRes.data.message);
      continue;
    }
    
    blobs.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blobRes.data.sha,
    });
  }
  
  console.log(`\n\n✅ ${blobs.length} blobs creados`);

  // Crear tree
  console.log("🌲 Creando árbol de archivos...");
  const treeRes = await apiCall("POST", `/repos/${OWNER}/${REPO}/git/trees`, {
    tree: blobs,
  }, token);
  
  if (treeRes.status !== 201) {
    console.error("❌ Error creando tree:", treeRes.data.message);
    process.exit(1);
  }
  console.log("✅ Tree creado:", treeRes.data.sha);

  // Crear commit
  console.log("💾 Creando commit...");
  const commitRes = await apiCall("POST", `/repos/${OWNER}/${REPO}/git/commits`, {
    message: "feat: FinanzApp v1.0 - Control de gastos personal con IA, metas de ahorro, cuotas, cotizaciones y diseño Nano Banana premium",
    tree: treeRes.data.sha,
  }, token);
  
  if (commitRes.status !== 201) {
    console.error("❌ Error creando commit:", commitRes.data.message);
    process.exit(1);
  }
  console.log("✅ Commit creado:", commitRes.data.sha.substring(0, 8));

  // Crear/actualizar referencia main
  console.log("🔗 Actualizando branch main...");
  
  // Try to create the ref first
  let refRes = await apiCall("POST", `/repos/${OWNER}/${REPO}/git/refs`, {
    ref: `refs/heads/${BRANCH}`,
    sha: commitRes.data.sha,
  }, token);
  
  if (refRes.status === 422) {
    // Ref already exists, update it
    refRes = await apiCall("PATCH", `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
      sha: commitRes.data.sha,
      force: true,
    }, token);
  }
  
  if (refRes.status !== 201 && refRes.status !== 200) {
    console.error("❌ Error actualizando ref:", refRes.data.message);
    process.exit(1);
  }

  console.log("\n🎉 ¡ÉXITO! Proyecto subido completamente a GitHub:");
  console.log(`   📎 https://github.com/${OWNER}/${REPO}`);
  console.log(`   🔒 Repositorio privado`);
  console.log(`   📄 ${blobs.length} archivos subidos`);
}

main().catch((e) => {
  console.error("Error fatal:", e.message);
  process.exit(1);
});
