// 密鑰掃描。找到問題時只印位置和規則名稱，絕不印出密鑰本身。
//
//   node scripts/security/scan.mjs --staged      pre-commit：掃已 stage 的變更
//   node scripts/security/scan.mjs --push        pre-push：掃即將推出去的 commit（從 stdin 讀 refs）
//   node scripts/security/scan.mjs --all         掃整段 git 歷史（一次性稽核、CI）
//   node scripts/security/scan.mjs --dir <path>  掃建置輸出（例如 apps/web/.next/static）
//
// 單行要豁免時，在該行加上 `secret-scan:allow` 並在 PR 說明原因。
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

const PATTERNS = [
  ["anthropic-key", /sk-ant-[A-Za-z0-9_-]{10,}/],
  ["resend-key", /\bre_[A-Za-z0-9]{20,}/],
  ["supabase-secret-key", /\bsb_secret_[A-Za-z0-9_-]{10,}/],
  ["supabase-access-token", /\bsbp_[a-f0-9]{40}\b/],
  ["github-token", /\b(?:gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{50,})\b/],
  ["aws-access-key", /\bAKIA[0-9A-Z]{16}\b/],
  ["private-key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["service-role-env", /SUPABASE_SERVICE_ROLE_KEY\s*[=:]\s*["']?[A-Za-z0-9._-]{20,}/],
  ["secret-assignment", /\b[A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN|API_KEY|PRIVATE_KEY)\s*=\s*["']?(?![$<{])[^\s"'`]{8,}/],
];

// 本機 Supabase 的公開預設值（文件與 supabase CLI 都會印），不算外洩。
const LOCAL_DB_URL = /postgres(?:ql)?:\/\/postgres:postgres@(?:127\.0\.0\.1|localhost)[:/]/;
const DB_URL = /postgres(?:ql)?:\/\/[^@\s:/]+:[^@\s]+@/;
const JWT = /eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g;

const FORBIDDEN_PATHS = [
  ["env-file", /(^|\/)\.env(\.(?!example$)[^/]+)?$/],
  ["pencil-file", /\.pen$/],
  ["inbox-file", /^inbox\//],
  ["key-file", /\.(pem|key|p12|pfx)$/],
];

// 會進 repo 的 UI 改動；推送時沒附 design/screens/ 截圖就提醒。
const UI_PATHS = /^(apps\/web\/(app|components)\/|packages\/(themes|blocks|graph)\/).*\.(tsx|css)$/;

const knownSecrets = loadKnownSecrets();
const findings = [];
const mode = process.argv[2];

if (mode === "--staged") {
  scanDiff(git(["diff", "--cached", "-U0", "--no-color", "--diff-filter=ACMR"]), "staged");
  checkPaths(git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]).split("\n"), "staged");
} else if (mode === "--push") {
  const ranges = readFileSync(0, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split(" "))
    .filter(([, localSha]) => !/^0+$/.test(localSha))
    .map(([, localSha, , remoteSha]) => (/^0+$/.test(remoteSha) ? [localSha, "--not", "--remotes"] : [`${remoteSha}..${localSha}`]));
  const touched = new Set();
  for (const range of ranges) {
    scanLog(range);
    for (const f of git(["log", "--name-only", "--format=", "--diff-filter=ACMR", ...range]).split("\n")) if (f) touched.add(f);
  }
  checkPaths([...touched], "push");
  const ui = [...touched].some((f) => UI_PATHS.test(f));
  const screens = [...touched].some((f) => f.startsWith("design/screens/"));
  if (ui && !screens) console.error("⚠ 這次推送有 UI 變更，但沒有更新 design/screens/ 的截圖（AGENTS.md §9）。");
} else if (mode === "--all") {
  scanLog(["--all"]);
  checkPaths(git(["log", "--all", "--name-only", "--format=", "--diff-filter=A"]).split("\n"), "history");
} else if (mode === "--dir" && process.argv[3]) {
  scanDir(process.argv[3]);
} else {
  console.error("用法：scan.mjs --staged | --push | --all | --dir <path>");
  process.exit(2);
}

if (findings.length) {
  console.error(`✖ 密鑰掃描發現 ${findings.length} 個問題（不顯示內容）：`);
  for (const f of findings) console.error(`  ${f}`);
  console.error("處理方式：移除後重新 commit；已推送的密鑰一律視為外洩，要輪替。");
  process.exit(1);
}
console.log("✓ 密鑰掃描通過");

function git(args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 28 });
}

function loadKnownSecrets() {
  const out = [];
  const dirs = [root, ...["apps", "packages"].flatMap((d) => (existsSync(join(root, d)) ? readdirSync(join(root, d)).map((s) => join(root, d, s)) : []))];
  for (const dir of dirs) {
    if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
    for (const name of readdirSync(dir)) {
      if (!/^\.env/.test(name) || name === ".env.example") continue;
      for (const line of readFileSync(join(dir, name), "utf8").split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*["']?(.*?)["']?\s*$/);
        if (!m) continue;
        const [, key, value] = m;
        // NEXT_PUBLIC_* 本來就會進瀏覽器；不含帳密的網址也不是密鑰。
        if (key.startsWith("NEXT_PUBLIC_") || value.length < 8 || (/^https?:\/\//.test(value) && !value.includes("@"))) continue;
        out.push({ key, value, file: relative(root, join(dir, name)).replaceAll("\\", "/") });
      }
    }
  }
  return out;
}

function scanLine(text, where) {
  if (text.includes("secret-scan:allow")) return;
  for (const [rule, re] of PATTERNS) if (re.test(text)) findings.push(`${where}  ${rule}`);
  if (DB_URL.test(text) && !LOCAL_DB_URL.test(text)) findings.push(`${where}  db-url-with-password`);
  for (const jwt of text.match(JWT) ?? []) {
    try {
      const payload = Buffer.from(jwt.split(".")[1], "base64url").toString("utf8");
      if (/"role"\s*:\s*"service_role"/.test(payload)) findings.push(`${where}  service-role-jwt`);
    } catch {}
  }
  for (const s of knownSecrets) if (text.includes(s.value)) findings.push(`${where}  value-of ${s.key}（${s.file}）`);
}

function scanDiff(diff, label) {
  let file = "?";
  let line = 0;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("COMMIT ")) label = raw.slice(7, 15);
    else if (raw.startsWith("+++ ")) file = raw.slice(6);
    else if (raw.startsWith("@@")) line = Number(raw.match(/\+(\d+)/)?.[1] ?? 0);
    else if (raw.startsWith("+")) scanLine(raw.slice(1), `${label} ${file}:${line++}`);
  }
}

function scanLog(range) {
  scanDiff(git(["log", "-p", "-U0", "--no-color", "--no-ext-diff", "--format=COMMIT %H", ...range]), "commit");
}

function checkPaths(paths, label) {
  for (const p of new Set(paths.filter(Boolean)))
    for (const [rule, re] of FORBIDDEN_PATHS) if (re.test(p)) findings.push(`${label} ${p}  ${rule}`);
}

function scanDir(dir) {
  const abs = join(process.cwd(), dir);
  if (!existsSync(abs)) {
    console.error(`找不到 ${dir}`);
    process.exit(2);
  }
  for (const entry of readdirSync(abs, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    if (statSync(path).size > 5 << 20) continue;
    readFileSync(path, "utf8")
      .split("\n")
      .forEach((text, i) => scanLine(text, `${relative(process.cwd(), path).replaceAll("\\", "/")}:${i + 1}`));
  }
}
