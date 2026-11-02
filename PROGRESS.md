# PROGRESS

> 規則見 `AGENTS.md` §7。每個 session 結束時更新任務板，並在 Session Log 最上面新增一筆。

**目前階段：** P0 驗證 · S0（11/02–11/15）
**最後更新：** 2026-11-02（套件資安更新）

---

## Task Board

計畫細節：`docs/plans/2026-11-01-s0-s1-plan.md`

### 環境準備 — ✅
- [x] Node 24、pnpm 10.17.0、Docker Desktop、gh、vercel、Claude Code
- [x] git 身分（GitHub noreply）、本機 repo
- [x] Supabase CLI 2.122.0（devDependency）、本機 Supabase 啟動成功
- [x] Supabase staging `fuyouxing-staging`（東京）建立並 link
- [x] PRD v0.3.2、ADR 0001（LinkedIn 互補＋擷取管線）
- [x] GitHub private repo `kirbyliu99M/SS-Star-Map`，`main` 已 push（2026-11-01）

### S0 · repo 可以跑（11/02–11/15）
- [x] S0-1 AGENTS.md、PROGRESS.md（`.editorconfig`、`.gitattributes`、`.env.example` 待補）
- [x] S0-2 monorepo 骨架（apps/web、packages/*、turbo）— typecheck／lint／build 通過
  - 版本（exact pin，規則：發布滿 14 天）：next 16.4.2、react 19.3.1、tailwindcss 4.3.3（v4，CSS-first，無 preset）、typescript 5.9.3、eslint 9.39.5、eslint-config-next 16.4.2、turbo 2.11.9、@types/node 24.19.2
  - TS 7.0、ESLint 10 未採用：create-next-app 16.4.2 範本仍用 TS 5／ESLint 9，Next 對新主版本的支援未查證
- [ ] S0-3 Tailwind、shadcn/ui、字體、星夜 token 第一版（設計用 Pencil 畫，AGY 輔助；Owner 2026-11-02）
  - [x] Pencil 初稿：色票板、元件（按鈕、標籤、Offer 卡）、手機個人網頁 `/@anan`，三組配色並排
  - [ ] 主意象：書房 vs 星空，做 5 秒測試再定（`docs/design/concept-test.md`）；Pencil 已有兩版首頁測試稿。配色等這一項
  - [ ] 配色：AGY 已分析並新增 D 組，四組對比度都過 AA；待 Owner 拍板（`docs/design/palette-brief.md`）
  - [ ] 文案：AGY 已審 1–35 項，待 Owner 拍板（`docs/design/copy-draft.md`）
  - [ ] pen 檔存進 repo `design/starry-night.pen`（Owner 在 Pencil 另存）
  - [ ] 程式端：tokens.css、theme.json、字體、shadcn（等配色定案）
- [x] S0-4 Supabase config（project_id `ss-star-map`）、migration `enable_extensions`（vector、pg_cron、pg_net）、pgTAP smoke、已 push 到 staging
- [x] S0-4b `public.ping()`＋`scripts/ping-staging.mjs`（anon key）；`pnpm db:ping:staging` 成功。**CI keepalive 上線前每週手動跑一次**（下次：11/08）
- [x] S0-5 `@supabase/ssr` server／browser client、Zod 驗證公開環境變數、首頁顯示 DB 狀態（Vercel production 不顯示）
  - 版本：@supabase/ssr 0.12.7、@supabase/supabase-js 2.118.0、zod 4.6.7、server-only 0.0.1
  - session 更新（proxy.ts）留到 S2 接登入時再加
- [x] S0-6 Vitest（env 驗證 2 tests）、Playwright 首頁 smoke（桌機＋375 px）；`pnpm test`、`pnpm e2e`
  - 版本：vitest 5.0.5、vite 8.3.4、@playwright/test 1.64.1
- [ ] S0-7 CI（ci.yml、keepalive.yml）〔可延到 S2〕
- [ ] S0-8 vercel.json（hnd1、ignoreCommand）〔可延到 S2〕
- [ ] S0-9 安全掃描腳本＋postbuild＋pre-commit〔可延到 S2〕

### S1 · spike 與 P0 Gate（11/16–11/29，順序 ③→⑤→①→②→④）
- [x] ③ PGroonga 中文搜尋 — **通過**：最佳策略（同義詞標籤優先＋查詢切 2-gram 再 OR）30/30 前 5 筆命中，staging 與本機一致。結論見 `docs/spikes/03-pgroonga.md`；索引設定與查詢策略為未拍板（candidate）
- [ ] ⑤ 擷取管線（只用本人或假履歷，spike 文件不貼原文）
- [ ] ① 星圖 600 顆 ≥ 30 fps（先做星夜動效預算 ADR）〔可延到 S2〕
- [ ] ② LINE 內建瀏覽器 OTP 登入（Supabase 內建 SMTP＋Cloudflare Tunnel）
- [ ] ④ 寄信送達率（11/16 前沒網域就延到 S2）
- [ ] P0 Gate（Owner：首圈訪談）

### 待 Owner
- [x] 計畫核可（`docs/plans/2026-11-01-s0-s1-plan.md`）
- [x] 寄信網域：`ssmail.kirby-fivesenses.com`（Cloudflare）；Resend 等 spike ④ 要用時再設定
- [ ] Anthropic API key（11/16）、Resend 帳號（spike ④ 前）
- [ ] 測試手機：中階 Android＋iPhone，各裝 LINE（11/16）
- [ ] 首圈 15 人名單與第二位圈主（PRD §22 #1，11/15）
- [ ] PRD【待決】：外圈信上限 10 封、P3 Gate 檢視日、SEO 預設、擷取管線起始 Sprint

---

## Decision Log（摘要，細節在 `docs/decisions/`）

| 日期 | 決定 |
|---|---|
| 2026-11-01 | Node 24（不跟參考 repo 的 22）；Supabase CLI 用專案 devDependency；git 作者用 GitHub noreply |
| 2026-11-01 | ADR 0001：LinkedIn 定位為互補；擷取管線進 MVP，來源只有履歷 PDF 與 LinkedIn「存為 PDF」，不做資料副本 ZIP |
| 2026-11-01 | ADR 0001：AI 搜尋改低成本版（結果少才由使用者按鈕呼叫、只挑現有標籤、快取、每人每天 20 次） |
| 2026-11-01 | 審查的 BLOCKER／MAJOR 修正併入 PRD v0.3.2（資安檢查分兩段、P1 個資規則、一鍵動作 GET＋POST 等） |
| 2026-11-01 | GitHub repo `kirbyliu99M/SS-Star-Map`（private）；CI 與 Vercel 能省就省 |
| 2026-11-02 | 資安更新：pnpm 10.17.0 → 12.16.1（10.17 有多個 high 漏洞）；next 16.4.3、eslint 10.14.0、typescript 6.0.3、turbo 2.11.10、vite 8.3.5。資安修補優先於「發布滿 14 天」規則（Owner 同意用最新版） |
| 2026-11-02 | TS 7 暫不升：typescript-eslint 只支援 TS < 6.1；@types/node 跟執行環境維持 24.x |
| 2026-11-02 | minimatch（GHSA-g3hv-75wg-m249）：10.x 用 override 升到 11.0.3；3.1.5 不含漏洞程式碼，audit 設為忽略並註明原因 |
| 2026-11-02 | UI 設計用 Pencil，AGY 輔助；文案與配色都要跟 AGY 審查／共同處理，Claude Code 不單獨定案 |
| 2026-11-02 | 配色不沿用 PRD 附錄 B 舊色，重新設計（未拍板 candidate） |
| 2026-11-02 | spike ③ 通過；建議 TokenBigramSplitSymbolAlphaDigit＋NormalizerNFKC150、查詢走 RPC（未拍板 candidate） |
| 2026-11-02 | 資安事件：staging DB 密碼經 `-p` 參數被 pnpm 印到 session 輸出；改用 `scripts/db-push-staging.mjs` 經環境變數傳遞。是否輪替密碼待 Owner 決定 |
| 2026-11-02 | GitHub 暫停推送，只做本機 commit，Owner 說再推 |
| 2026-11-02 | 主意象出現「書櫃 vs 浮游星」的提議；先用兩版首頁做 5 秒測試，結果出來再寫 ADR 改 PRD §13.1（未拍板 candidate） |
| 2026-11-01 | 保留 AGENTS.md 為唯一規則檔，另建只有 `@AGENTS.md` 的 CLAUDE.md |
| 2026-11-01 | 寄信網域：`ssmail.kirby-fivesenses.com`（Cloudflare），給 Resend 用；Resend 專案設定等 spike ④ 需要時再做 |

---

## Session Log

### 2026-11-02 · Claude Code · AGY 審查、意象測試稿
- Did: 用 `agy -p --mode accept-edits` 派 AGY 審文案與配色（headless 不能執行終端機指令，計算由 Claude Code 先做好再交給它）。驗算四組配色對比度並修正 AGY 高估的 AAA 說法。Pencil 做書房版／星空版圈內首頁，寫 5 秒測試設計，AGY 審後改成兩階段、質化判讀。
- Changed: `docs/design/copy-draft.md`、`docs/design/palette-brief.md`、`docs/design/concept-test.md`、`PROGRESS.md`
- Verify: 對比度用 WCAG 2.1 公式計算（腳本在 session scratchpad，未進 repo）；Pencil 截圖檢查版面。
- Next: Owner 安排 5 秒測試 → 定主意象 → 定配色與文案 → tokens.css／theme.json、PRD §13.1 與附錄 B、ADR。
- Blockers / 待 Owner: 5 秒測試的受測者；配色與文案拍板；Pencil 另存到 `design/`；staging 密碼是否輪替。

### 2026-11-02 · Claude Code · S0-3 設計初稿、spike ③
- Did: Pencil 畫星夜初稿（色票、元件、手機個人網頁，三組新配色）；文案與配色交給 AGY（`docs/design/`）。派 Sonnet agent 跑 spike ③，通過。修正 staging 推送方式，避免密碼出現在指令列。
- Changed: `docs/design/`、`docs/spikes/03-pgroonga.md`、`spikes/03-pgroonga/`、`supabase/migrations/20261101180716_enable_pgroonga.sql`、`supabase/tests/database/00_smoke.test.sql`、`scripts/db-push-staging.mjs`、`package.json`、`AGENTS.md`
- Verify: `pnpm test:db` 6/6；`pnpm db:push:staging --dry-run` 顯示 staging 已是最新，輸出不含密碼。
- Next: spike ⑤ 擷取管線（需要 Anthropic API key 與 Owner 自己的履歷，放 `inbox/`）；配色與文案等 AGY。
- Blockers / 待 Owner: 是否輪替 staging DB 密碼；Pencil 檔另存到 `design/starry-night.pen`；Anthropic API key。

### 2026-11-02 · Claude Code · 套件資安更新（pnpm 12）
- Did: 推送 S0-5／S0-6（Owner 同意）。pnpm 升到 12.16.1（全域＋`packageManager`），lockfile 依 pnpm 12 的供應鏈政策重建；套件升到最新可用版；處理 minimatch 漏洞。
- Changed: `package.json`、`apps/web/package.json`、`packages/*/package.json`、`pnpm-workspace.yaml`（overrides、auditConfig、allowBuilds）、`pnpm-lock.yaml`
- Verify: `pnpm audit` 無未處理漏洞（`--prod` 為 0）；typecheck、lint、build、test 2/2、e2e 2/2、test:db 5/5 全過；ESLint 10 規則實測會觸發。
- Next: S0-3 UI（Pencil＋AGY）或 S1 spike ③，待 Owner 決定順序。
- Blockers / 待 Owner: eslint-config-next 內的 import／react／jsx-a11y 外掛尚未宣告支援 ESLint 10（peer 警告，功能正常）；TS 7 等 typescript-eslint 支援。

### 2026-11-01 · Claude Code · S0-5 Supabase 連線、S0-6 測試工具
- Did: 推送 S0-2～S0-4 到 `main`（Owner 同意）；記錄寄信網域；完成 S0-5（Supabase SSR client、Zod 環境變數驗證、首頁 DB 狀態）與 S0-6（Vitest、Playwright）。
- Changed: `apps/web/lib/`、`apps/web/app/{page,layout,db-status}.tsx`、`apps/web/{vitest,playwright}.config.ts`、`apps/web/e2e/`、`turbo.json`（build 的 env／inputs）、`AGENTS.md` §6
- Verify: `pnpm typecheck`、`pnpm lint`、`pnpm build` 通過；`pnpm test` 2/2；`pnpm e2e` 2/2（桌機、375 px）；`pnpm test:db` 5/5。
- Next: S0 剩下的都可延到 S2（S0-3 UI、S0-7 CI、S0-8 vercel.json、S0-9 安全掃描）；Owner 決定要先做哪些，或直接進 S1 spike ③。
- Blockers / 待 Owner: npm 標示 eslint 9.39.5 已 deprecated（尚未評估換 ESLint 10）；11/08 手動 staging ping。

### 2026-11-01 · Claude Code · 新設備環境、PRD LinkedIn 審查、S0＋S1 計畫
- Did: 盤點並補齊開發環境；建立本機 repo 並把 PRD 移到 `docs/`；派一個 Sonnet agent 審查 PRD 與 LinkedIn 整合；依 Owner 決定更新 PRD 到 v0.3.2 並寫 ADR 0001；建立 Supabase staging；寫 S0＋S1 計畫、AGENTS.md、PROGRESS.md。
- Changed: `package.json`、`.nvmrc`、`.gitignore`、`supabase/config.toml`、`docs/PRD.md`、`docs/decisions/0001-*.md`、`docs/reviews/2026-11-01-prd-linkedin-integration.md`、`docs/proposals/PRD-v0.4-linkedin-patch.md`、`docs/plans/2026-11-01-s0-s1-plan.md`、`AGENTS.md`、`PROGRESS.md`
- Verify: `pnpm db:start` 後 `pnpm db:status` 有 API／Studio 網址；`pnpm supabase projects list` 看得到 `fuyouxing-staging`（linked）。
- Next: Owner 核可計畫後開始 S0-2 monorepo 骨架。
- Blockers / 待 Owner: 寄信網域（11/16）、API key、測試手機、首圈名單；見任務板「待 Owner」。
