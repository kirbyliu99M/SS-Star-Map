// S0-4b：呼叫 staging 的 public.ping()，讓 Supabase 免費專案不因 7 天低活動而暫停。
// 只用 anon key（PRD §14.1：service role 不出現在這裡）。
// 本機：讀 .env.staging.local；CI：讀環境變數 STAGING_SUPABASE_URL、STAGING_SUPABASE_ANON_KEY。
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.staging.local")) {
  for (const line of readFileSync(".env.staging.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const url = process.env.STAGING_SUPABASE_URL;
const key = process.env.STAGING_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("缺少 STAGING_SUPABASE_URL 或 STAGING_SUPABASE_ANON_KEY");
  process.exit(1);
}

const res = await fetch(`${url}/rest/v1/rpc/ping`, {
  method: "POST",
  headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: "{}",
});
if (!res.ok) {
  console.error(`ping 失敗：HTTP ${res.status}`);
  process.exit(1);
}
console.log(`staging ping OK：${await res.json()}`);
