// Vercel preview 只留最新一個（AGENTS.md §9.2）。由 .github/workflows/vercel-prune-previews.yml 在 preview 部署成功後執行。
// 預設只列出會刪哪些；環境變數 PRUNE=1 才真的刪。production 一律不碰。
const { VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_SLUG, PRUNE } = process.env;
for (const [name, value] of Object.entries({ VERCEL_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_SLUG })) {
  if (!value) {
    console.error(`缺少 ${name}`);
    process.exit(1);
  }
}

async function api(path, init = {}) {
  const url = new URL(`https://api.vercel.com${path}`);
  url.searchParams.set("slug", VERCEL_TEAM_SLUG);
  const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } });
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} → ${res.status}`);
  return res.json();
}

const { deployments } = await api(`/v6/deployments?projectId=${VERCEL_PROJECT_ID}&target=preview&limit=100`);
const previews = deployments.filter((d) => d.target !== "production").sort((a, b) => b.created - a.created);
const newestReady = previews.find((d) => d.state === "READY");
if (!newestReady) {
  console.log("沒有 READY 的 preview，不刪任何東西");
  process.exit(0);
}
// 比最新 READY 還新的（還在 build）也留著。
const stale = previews.filter((d) => d.created < newestReady.created);
console.log(`保留：${newestReady.url}`);
for (const d of stale) {
  console.log(`${PRUNE === "1" ? "刪除" : "（試跑，不刪）"}：${d.url}（${d.state}）`);
  if (PRUNE === "1") await api(`/v13/deployments/${d.uid}`, { method: "DELETE" });
}
