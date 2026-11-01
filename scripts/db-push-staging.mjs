// 把 migration 推到 staging。密碼只經由環境變數 SUPABASE_DB_PASSWORD 交給 Supabase CLI，
// 不放在指令列（`-p` 會被 pnpm 印出來，2026-11-02 曾因此外洩到 session 輸出）。
// 本機：讀 .env.staging.local 的 SUPABASE_STAGING_DB_PASSWORD。
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.staging.local")) {
  for (const line of readFileSync(".env.staging.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const password = process.env.SUPABASE_STAGING_DB_PASSWORD;
if (!password) {
  console.error("缺少 SUPABASE_STAGING_DB_PASSWORD（見 .env.staging.local）");
  process.exit(1);
}

const result = spawnSync("pnpm", ["exec", "supabase", "db", "push", "--linked", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, SUPABASE_DB_PASSWORD: password },
});
process.exit(result.status ?? 1);
