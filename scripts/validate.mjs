// 公開する配布物の点検。公開repositoryの直下に置いた時も、
// 開発用repositoryの plugin/ の下に置いた時も、同じように動く。
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const pluginName = "stod-crm";
const marketplaceName = "stod-crm";
const serverName = "stod-crm";
const pluginPath = `plugins/${pluginName}`;
const pluginRoot = join(root, "plugins", pluginName);
const expectedVersion = "0.2.1";
const expectedRepository = "https://github.com/stod-inc/crm-mcp-plugin";
// MCPの接続先。変える時はここと .mcp.json を同時に変える。
const expectedHost = "crm-mcp.matchstod.com";
const expectedUrl = `https://${expectedHost}/mcp`;
const entryTool = "crm_guide";

const readText = (path) => readFileSync(join(root, path), "utf8");
const readJson = (path) => JSON.parse(readText(path));
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const codexMarketplace = readJson(".agents/plugins/marketplace.json");
const claudeMarketplace = readJson(".claude-plugin/marketplace.json");
const codexPlugin = readJson(`${pluginPath}/.codex-plugin/plugin.json`);
const claudePlugin = readJson(`${pluginPath}/.claude-plugin/plugin.json`);
const mcp = readJson(`${pluginPath}/.mcp.json`);

assert(codexMarketplace.name === marketplaceName, `Codex marketplace name must be ${marketplaceName}`);
assert(claudeMarketplace.name === marketplaceName, `Claude marketplace name must be ${marketplaceName}`);
assert(codexMarketplace.plugins?.length === 1 && codexMarketplace.plugins[0]?.name === pluginName, "Codex marketplace must list exactly this Plugin");
assert(claudeMarketplace.plugins?.length === 1 && claudeMarketplace.plugins[0]?.name === pluginName, "Claude marketplace must list exactly this Plugin");
assert(codexMarketplace.plugins?.[0]?.source?.path === `./${pluginPath}`, "Codex marketplace source must stay local to this repository");
assert(claudeMarketplace.plugins?.[0]?.source === `./${pluginPath}`, "Claude marketplace source must stay local to this repository");
assert(codexPlugin.name === pluginName && claudePlugin.name === pluginName, "Plugin name is out of sync");
assert(codexPlugin.version === expectedVersion, "Codex Plugin version is out of sync");
assert(claudePlugin.version === expectedVersion, "Claude Plugin version is out of sync");
assert(claudeMarketplace.plugins?.[0]?.version === expectedVersion, "Claude marketplace version is out of sync");
assert(codexPlugin.repository === expectedRepository, "Codex repository metadata is incorrect");
assert(claudePlugin.repository === expectedRepository, "Claude repository metadata is incorrect");
assert(JSON.stringify(codexPlugin.interface?.capabilities) === JSON.stringify(["Read", "Write"]), "Codex Plugin must declare the Read and Write capabilities");
assert(JSON.stringify(Object.keys(mcp.mcpServers ?? {})) === JSON.stringify([serverName]), `MCP config must define exactly one server named ${serverName}`);
assert(mcp.mcpServers?.[serverName]?.type === "http", "MCP transport must be HTTP");
assert(mcp.mcpServers?.[serverName]?.url === expectedUrl, "MCP endpoint is incorrect");
assert(
  !("headers" in (mcp.mcpServers?.[serverName] ?? {})) && !("env" in (mcp.mcpServers?.[serverName] ?? {})),
  "MCP config must not carry headers or environment values",
);

const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const publicFiles = walk(root)
  .map((path) => relative(root, path).split(sep).join("/"))
  .filter((path) => path !== ".git" && !path.startsWith(".git/"))
  .sort();

const expectedFiles = [
  ".agents/plugins/marketplace.json",
  ".claude-plugin/marketplace.json",
  ".github/CODEOWNERS",
  ".github/workflows/validate.yml",
  "LICENSE",
  "README.md",
  "SECURITY.md",
  "SETUP_PROMPT.md",
  `${pluginPath}/.claude-plugin/plugin.json`,
  `${pluginPath}/.codex-plugin/plugin.json`,
  `${pluginPath}/.mcp.json`,
  `${pluginPath}/skills/${pluginName}/SKILL.md`,
  `${pluginPath}/skills/${pluginName}/agents/openai.yaml`,
  `${pluginPath}/skills/${pluginName}/references/connection.md`,
  "scripts/validate.mjs",
].sort();

const unexpected = publicFiles.filter((path) => !expectedFiles.includes(path));
const missing = expectedFiles.filter((path) => !publicFiles.includes(path));
assert(unexpected.length === 0, `Unexpected public files: ${unexpected.join(", ")}`);
assert(missing.length === 0, `Missing public files: ${missing.join(", ")}`);

const texts = publicFiles.filter((path) => expectedFiles.includes(path)).map((path) => [path, readText(path)]);
const publicText = texts.map(([, text]) => text).join("\n");

// 鍵やトークンらしい文字列が紛れ込んでいないこと。
// この点検ファイル自身が引っかからないよう、語を分けて書く。
const forbiddenFragments = [
  ["BEGIN ", "PRIVATE KEY"].join(""),
  ["gh", "p_"].join(""),
  ["github", "_pat_"].join(""),
  ["s", "k-"].join(""),
  ["Bear", "er "].join(""),
];
for (const forbidden of forbiddenFragments) {
  assert(!publicText.includes(forbidden), `Public distribution contains forbidden text: ${forbidden}`);
}

// 自社ドメインのホスト名は、MCPの接続先1つだけ。
const companyHosts = new Set(publicText.match(/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.matchstod\.com/giu) ?? []);
for (const host of companyHosts) {
  assert(host.toLowerCase() === expectedHost, `Public distribution names an internal hostname other than the MCP endpoint: ${host}`);
}
assert(companyHosts.size === 1, "Public distribution must name the MCP endpoint hostname");

// メールアドレスを載せない。
const emails = publicText.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}/gu) ?? [];
assert(emails.length === 0, `Public distribution contains an email address (${emails.length})`);

// Skill は入口のツールだけを案内し、それ以外の中身はログイン後にサーバーが返す。
const skill = readText(`${pluginPath}/skills/${pluginName}/SKILL.md`);
assert(skill.includes(`\`${entryTool}\``), `SKILL.md does not mention the entry tool ${entryTool}`);
assert(new RegExp(`^---\\nname: ${pluginName}\\ndescription: .+\\n---\\n`, "u").test(skill), "SKILL.md front matter is missing or malformed");
assert(skill.includes("取得時刻") && skill.includes("省略"), "SKILL.md must tell the assistant to state the fetch time and truncation");
assert(
  skill.includes("書く前に見せる") && skill.includes("了承") && skill.includes("読み直す") && skill.includes("送り直さない"),
  "SKILL.md must tell the assistant to confirm before writing, read back, and not resend blindly",
);

const readme = readText("README.md");
assert(readme.includes(`${pluginName}@${marketplaceName}`), "README install commands are out of sync");

assert(statSync(pluginRoot).isDirectory(), "Plugin root is missing");

if (failures.length > 0) {
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validated ${publicFiles.length} public files for Plugin v${expectedVersion}`);
