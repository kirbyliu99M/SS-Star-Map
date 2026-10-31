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
docs/
  PRD.md
  decisions/         ← ADR：NNNN-title.md
  reviews/           ← 審查報告：YYYY-MM-DD-topic.md
  plans/             ← 實作計畫
  spikes/            ← spike 結論
  proposals/         ← PRD 修改提案
  runbooks/
.github/workflows/   ← ci.yml、keepalive.yml、backup.yml
```

---

## 4. 慣例

- **依賴版本 exact pin**（`pnpm add -E`）。
- **權限寫在資料庫**：可見度一律由 RLS 執行，每條政策都要有 pgTAP 正例與反例。service role 金鑰只用在 Edge Functions、排程、不需登入的 token 端點（PRD §14.1）。
- **ADR**：會改變 PRD 的決定寫 `docs/decisions/NNNN-title.md`（背景、決定、影響），並同步更新 PRD 與 PROGRESS 的 Decision Log。
- **審查**：寫在 `docs/reviews/YYYY-MM-DD-topic.md`，問題標 `BLOCKER / MAJOR / MINOR / NIT`，每項附最小修正（Smallest fix）。
- **完成定義**：照 PRD §18.6。

---

## 5. 個資與密鑰

- repo 裡不放任何真實會員資料。測試與設計一律用 `seed.sql` 的假圈。
- 履歷、LinkedIn PDF 等測試檔放在 gitignored 的 `inbox/`，不 commit。
- 密鑰只放 `.env*`（gitignored）或 Vercel／Supabase 後台；`.env.example` 只寫變數名稱。staging DB 密碼在 `.env.staging.local`。
- 不在對話或 log 中印出密鑰；需要時用 `grep -v` 過濾。

---

## 6. 指令

```bash
pnpm install
pnpm db:start        # 啟動本機 Supabase（需要 Docker Desktop）
pnpm db:status       # 顯示本機 API、Studio、Mailpit 網址
pnpm db:reset        # 重建本機 DB＋seed
pnpm db:stop
pnpm test:db         # pgTAP（supabase/tests/）
pnpm db:push:staging # 把 migration 推到 staging（需要 DB 密碼：-p，或先 set -a; . ./.env.staging.local）
pnpm db:ping:staging # staging 保活
pnpm supabase <cmd>  # 其他 Supabase CLI 指令

pnpm dev             # Next.js 開發伺服器（apps/web）
pnpm build
pnpm lint
pnpm typecheck
```

S0 完成後補上：`pnpm test`、`pnpm e2e`。
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
- [ ] 安全掃描沒有發現；diff 裡沒有密鑰或個資
- [ ] 有畫面變更時，在手機寬度（375 px）與桌機看過；reduced-motion 檢查過
- [ ] `PROGRESS.md` 已更新
- [ ] push 到 `main` 只在 Owner 同意後
