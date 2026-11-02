# AGENTS.md — 浮游星 ✦ 人脈書櫃

> 本 repo **唯一**寫規則的 agent 指令檔。所有 agent（Claude Code、AGY 或其他工具）都先讀這份。
> `CLAUDE.md` 只有一行 `@AGENTS.md`，讓 Claude Code 自動載入本檔（Owner 2026-11-01 決定），不在那裡寫規則。不建立 `GEMINI.md`、`.cursorrules` 等其他工具的指令檔。

## 0. 每個 session 的讀序

1. `AGENTS.md`（本檔）：規則、結構、慣例
2. `docs/PRD.md`：要做什麼、為什麼
3. `PROGRESS.md`：目前狀態、任務板、上一個 session 的交接

結束 session 前，在 `PROGRESS.md` 的 Session Log 最上面新增一筆（格式見 §7）。

---

## 1. 規則

1. **有必要才 dispatch。** 能自己做的就自己做，不預設開多 agent workflow；真的要派 agent 時優先用 Sonnet。
2. **語言**：文件與介面文案用繁體中文（台灣用語）；程式碼、commit message、識別名稱用英文。
3. **未定案的事要標示。** Owner 沒有明確決定的事，文件中標「未拍板（candidate）」或 PRD 的【待決】，不寫成定案。不確定的事實就說不確定。
4. **push 到 `main`、建立或刪除雲端資源（GitHub repo、Supabase 專案、Vercel 專案、網域）需要 Owner 同意。** 本機 commit 可以直接做。
5. **對外的東西先出草稿**：公告、信件樣板、官網文案送出或上線前，先給 Owner 看過。
6. **省錢**：CI 能 skip 就 skip（路徑過濾、concurrency 取消舊的執行）；Vercel deployment storage 盡量少用（`ignoreCommand`、只部署 PR 與 main、大檔不放 Vercel）。

---

## 2. 專案一覽

| | |
|---|---|
| 是什麼 | 給 ≤ 15 人高信任小圈子用的人脈 canvas：模組化個人網頁、浮游星圖、人脈書櫃＋引薦、星光與謝禮；之後用「人」把圈子接成星系 |
| 前端 | Next.js App Router＋TypeScript strict，Vercel（Functions 在 hnd1） |
| 後端 | Supabase 東京：Auth（Email 6 位數 OTP，經 Resend SMTP）、Postgres RLS、PGroonga、pgvector、pg_cron＋pg_net、Storage、Edge Functions |
| UI | Tailwind＋CSS 變數＋shadcn/ui；Motion；react-force-graph-2d；dnd-kit；React Hook Form＋Zod |
| Repo | pnpm workspaces＋Turborepo；Node 24（`.nvmrc`） |
| 測試 | pgTAP（RLS 正反例）、Vitest、Playwright、axe |
| 環境 | 本機 Supabase（Docker）；staging `fuyouxing-staging`；production 尚未建立 |

---

## 3. Repo 結構（PRD 附錄 A）

```
AGENTS.md            ← 本檔（唯一寫規則的 agent 檔）
CLAUDE.md            ← 只有 @AGENTS.md
apps/web/AGENTS.md   ← Next.js 自動產生（`next dev` 會加回）：寫 Next 程式前先讀 node_modules/next/dist/docs/。保留，不在裡面加本專案規則
PROGRESS.md          ← 任務板＋決策摘要＋session log
apps/web/            ← Next.js
packages/
  blocks/            ← 區塊定義：Zod schema、Render、Editor、migrate
  themes/            ← starry-night/、paper/、gallery/
  graph/             ← 星圖元件與佈局
  config/            ← eslint、tsconfig、tailwind preset
supabase/
  migrations/        ← 所有 schema 變更（不在 Dashboard 手動改）
  functions/         ← Edge Functions
  tests/             ← pgTAP
  seed.sql           ← 40 人假圈（只用假資料）
spikes/              ← S1 技術驗證的拋棄式程式
design/screens/      ← UI 截圖（PNG，從 Pencil 匯出或實機截圖）；.pen 不進 repo（§9）
scripts/security/    ← 密鑰掃描 scan.mjs（§9）
.githooks/           ← pre-commit、pre-push（`pnpm run prepare` 啟用）
docs/
  PRD.md
  decisions/         ← ADR：NNNN-title.md
  reviews/           ← 審查報告：YYYY-MM-DD-topic.md
  plans/             ← 實作計畫
  spikes/            ← spike 結論
  proposals/         ← PRD 修改提案
  design/            ← 文案草稿、配色交接（給 AGY 審查）
  runbooks/
.github/workflows/   ← ci.yml、keepalive.yml、backup.yml
```

---

## 4. 慣例

- **依賴版本 exact pin**（`pnpm add -E`）。預設只用發布滿 14 天的版本；資安修補例外，可直接用最新版。pnpm 12 另有內建的發布時間門檻，lockfile 被擋時先看 `pnpm-lock.yaml` 的變更再處理。
- **pnpm 12**：build script 權限寫在 `pnpm-workspace.yaml` 的 `allowBuilds`，用 `pnpm approve-builds` 修改。
- **權限寫在資料庫**：可見度一律由 RLS 執行，每條政策都要有 pgTAP 正例與反例。service role 金鑰只用在 Edge Functions、排程、不需登入的 token 端點（PRD §14.1）。
- **ADR**：會改變 PRD 的決定寫 `docs/decisions/NNNN-title.md`（背景、決定、影響），並同步更新 PRD 與 PROGRESS 的 Decision Log。
- **審查**：寫在 `docs/reviews/YYYY-MM-DD-topic.md`，問題標 `BLOCKER / MAJOR / MINOR / NIT`，每項附最小修正（Smallest fix）。
- **完成定義**：照 PRD §18.6。

---

## 5. 個資與密鑰

- repo 裡不放任何真實會員資料。測試與設計一律用 `seed.sql` 的假圈。
- 履歷、LinkedIn PDF 等測試檔放在 gitignored 的 `inbox/`，不 commit。
- 密鑰只放 `.env*`（gitignored）或 Vercel／Supabase 後台；`.env.example` 只寫變數名稱。staging DB 密碼在 `.env.staging.local`。
- 不在對話或 log 中印出密鑰；需要時用 `grep -v` 過濾。密鑰一律經環境變數傳遞，不放在指令列參數（pnpm、docker 都可能把參數印出或留在程序清單）。

---

## 6. 指令

```bash
pnpm install
pnpm db:start        # 啟動本機 Supabase（需要 Docker Desktop）
pnpm db:status       # 顯示本機 API、Studio、Mailpit 網址
pnpm db:reset        # 重建本機 DB＋seed
pnpm db:stop
pnpm test:db         # pgTAP（supabase/tests/）
pnpm db:push:staging # 把 migration 推到 staging（腳本自己讀 .env.staging.local；不要用 -p 傳密碼，pnpm 會把指令列印出來）
pnpm db:ping:staging # staging 保活
pnpm supabase <cmd>  # 其他 Supabase CLI 指令

pnpm dev             # Next.js 開發伺服器（apps/web）
pnpm build
pnpm lint
pnpm typecheck
pnpm test            # Vitest（apps/web 的 *.test.ts）
pnpm e2e             # 先 build，再用 Playwright 跑首頁 smoke（桌機＋375 px）；需要 pnpm db:start
pnpm scan:secrets    # 掃整段 git 歷史有沒有密鑰（§9）
pnpm run prepare     # 啟用 .githooks（clone 後必跑一次；pnpm install 不一定會觸發）
```

第一次跑 e2e 前：`pnpm --filter web exec playwright install chromium`。
本機 app 的環境變數放 `apps/web/.env.local`（gitignored），值用 `pnpm db:status -o env` 查。
注意：`supabase migration up` 要加 `--local`，否則可能卡住等待輸入。

---

## 7. PROGRESS.md 規則

在 Session Log **最上面**新增：

```md
### YYYY-MM-DD · <Agent> · <短標題>
- Did: …
- Changed: <路徑>
- Verify: <怎麼驗證>
- Next: …
- Blockers / 待 Owner: …
```

然後更新任務板勾選。內容保持精簡，細節放 `docs/`。

---

## 8. 交付前檢查（每次結束前）

- [ ] `pnpm build`、`pnpm lint`、`pnpm typecheck` 無錯誤
- [ ] `pnpm test`、`pnpm test:db` 全綠（動到 RLS 時必跑）
- [ ] 最新審查沒有未處理的 BLOCKER／MAJOR（或已在 `docs/decisions/` 記錄豁免）
- [ ] 安全掃描沒有發現；diff 裡沒有密鑰或個資（hook 會擋，見 §9）
- [ ] 有 UI 變更時，`design/screens/` 的截圖已更新
- [ ] 有畫面變更時，在手機寬度（375 px）與桌機看過；reduced-motion 檢查過
- [ ] `PROGRESS.md` 已更新
- [ ] push 到 `main` 只在 Owner 同意後

---

## 9. Commit 與 Push（Owner 2026-11-02，為邀請協作夥伴而訂）

推送 `main` 仍需 Owner 同意（§1 第 4 條）。以下規則所有人、所有 agent 都適用。

### 9.1 UI 截圖隨 push，`.pen` 不進 repo
- 有 UI 變更的 push，要同時更新 `design/screens/` 的 PNG，讓沒有 Pencil 的夥伴也看得到畫面：
  - Pencil 設計稿：用 Pencil 匯出 PNG（2x），檔名用 kebab-case 說明畫面，例如 `circle-home-library-test.png`。同一畫面改版就覆蓋舊檔，歷史交給 git。
  - 程式畫面：手機 375 px 與桌機各一張。
  - PR 說明裡嵌入改動前後的截圖。
- `.pen` 已列入 `.gitignore`，不 commit。設計檔怎麼分享給夥伴，未拍板（candidate）。
- pre-push hook 發現 UI 程式有變更、卻沒有更新 `design/screens/` 時會提醒，但不會擋下。

### 9.2 Vercel preview 只留一個
- 新的 preview 部署成功後，刪除先前所有 preview，同一時間只留最新的一個；production 不刪。目的是省 deployment storage（§1 第 6 條）。
- 實作還沒做：在 S0-7／S0-8 的 CI 部署完成後，呼叫 Vercel API 刪掉舊 preview（`VERCEL_TOKEN` 放 GitHub secrets）。Vercel 專案建立前要 Owner 同意。

### 9.3 嚴格防止密鑰外洩
- `.githooks/pre-commit` 掃 staged 變更，`.githooks/pre-push` 掃所有即將推出的 commit。clone 後先跑 `pnpm run prepare` 啟用 hook。
- **禁止 `--no-verify`**。被擋下時，把密鑰移出檔案後重新 commit；如果密鑰已經進了 commit，要改寫那個 commit，不能只在後面再加一個 commit 刪掉。
- 掃描項目（`scripts/security/scan.mjs`）：
  - 已知格式：Anthropic、Resend、Supabase secret／access token、service_role JWT、帶密碼的 Postgres 網址、GitHub token、AWS key、私鑰、`*PASSWORD=`／`*SECRET=` 一類的賦值。
  - 本機 `.env*` 裡每個非 `NEXT_PUBLIC_*` 變數的實際值（例如 staging DB 密碼）。這是抓到自訂密碼唯一的方法。
  - 禁止進 repo 的檔案：`.env*`（`.env.example` 除外）、`.pen`、`inbox/`、`.pem`／`.key`。
- `apps/web` 的 build 會掃 `.next/static`，避免密鑰被打包進前端。
- 誤判時，在該行加 `secret-scan:allow`，並在 PR 說明原因。
- **已推送的密鑰一律視為外洩**：先輪替，再清理歷史。
- 結果只印位置與規則名稱，不印密鑰內容；回報問題時也不要貼出密鑰。
