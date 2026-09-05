// Script para subir y sincronizar el proyecto a GitHub de forma automatizada
const { execSync } = require("child_process");
const path = require("path");

const OWNER = "thiagolencinatt-hash";
const REPO = "control-gastos-app";
const BRANCH = "main";

function getGitHubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    const scriptPath = path.join(__dirname, "read-cred.ps1");
    const result = execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`,
      { encoding: "utf8" }
    ).trim();
    if (result && result.length > 10) return result;
  } catch (e) {}
  return null;
}

function main() {
  console.log("🔑 Verificando credenciales de GitHub...");
  const token = getGitHubToken();
  if (!token) {
    console.error("❌ No se encontró token de GitHub.");
    process.exit(1);
  }

  const rootDir = path.resolve(__dirname, "..");
  const remoteUrl = `https://${OWNER}:${token}@github.com/${OWNER}/${REPO}.git`;

  try {
    console.log(`🚀 Subiendo cambios a GitHub (${OWNER}/${REPO}:${BRANCH})...`);
    execSync(`git push "${remoteUrl}" ${BRANCH}:${BRANCH} -u`, {
      cwd: rootDir,
      stdio: "inherit",
    });
    console.log("✅ ¡Proyecto sincronizado exitosamente con GitHub!");
  } catch (err) {
    console.error("❌ Error al sincronizar con GitHub:", err.message);
    process.exit(1);
  }
}

main();
