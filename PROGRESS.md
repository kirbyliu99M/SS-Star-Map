# PROGRESS

> 規則見 `AGENTS.md` §7。每個 session 結束時更新任務板，並在 Session Log 最上面新增一筆。

**目前階段：** P0 驗證 · S0（11/02–11/15）
**最後更新：** 2026-11-01

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
- [ ] S0-3 Tailwind、shadcn/ui、字體、星夜 token 第一版
- [ ] S0-4 Supabase config、migration 0001（vector、pg_cron、pg_net）、pgTAP smoke、push 到 staging
- [ ] S0-4b staging 手動保活腳本（anon key）；**repo 建立前每週跑一次 `pnpm db:ping:staging`**（下次：11/08）
- [ ] S0-5 Supabase client＋環境變數驗證
- [ ] S0-6 Vitest、Playwright smoke
- [ ] S0-7 CI（ci.yml、keepalive.yml）〔可延到 S2〕
- [ ] S0-8 vercel.json（hnd1、ignoreCommand）〔可延到 S2〕
- [ ] S0-9 安全掃描腳本＋postbuild＋pre-commit〔可延到 S2〕

### S1 · spike 與 P0 Gate（11/16–11/29，順序 ③→⑤→①→②→④）
- [ ] ③ PGroonga 中文搜尋（含啟用 PGroonga）
- [ ] ⑤ 擷取管線（只用本人或假履歷，spike 文件不貼原文）
- [ ] ① 星圖 600 顆 ≥ 30 fps（先做星夜動效預算 ADR）〔可延到 S2〕
- [ ] ② LINE 內建瀏覽器 OTP 登入（Supabase 內建 SMTP＋Cloudflare Tunnel）
- [ ] ④ 寄信送達率（11/16 前沒網域就延到 S2）
- [ ] P0 Gate（Owner：首圈訪談）

### 待 Owner
- [ ] 計畫核可（`docs/plans/2026-11-01-s0-s1-plan.md`）
- [ ] 寄信網域：spike ④ 需要，比 PRD §22 #2 的 12/13 早（11/16）
- [ ] Anthropic API key、Resend 帳號（11/16）
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
| 2026-11-01 | 保留 AGENTS.md 為唯一規則檔，另建只有 `@AGENTS.md` 的 CLAUDE.md |
| 2026-11-01 | 寄信網域：Owner 有 Cloudflare 上的網域，可給 Resend 用（spike ④ 不必延期） |

---

## Session Log

### 2026-11-01 · Claude Code · 新設備環境、PRD LinkedIn 審查、S0＋S1 計畫
- Did: 盤點並補齊開發環境；建立本機 repo 並把 PRD 移到 `docs/`；派一個 Sonnet agent 審查 PRD 與 LinkedIn 整合；依 Owner 決定更新 PRD 到 v0.3.2 並寫 ADR 0001；建立 Supabase staging；寫 S0＋S1 計畫、AGENTS.md、PROGRESS.md。
- Changed: `package.json`、`.nvmrc`、`.gitignore`、`supabase/config.toml`、`docs/PRD.md`、`docs/decisions/0001-*.md`、`docs/reviews/2026-11-01-prd-linkedin-integration.md`、`docs/proposals/PRD-v0.4-linkedin-patch.md`、`docs/plans/2026-11-01-s0-s1-plan.md`、`AGENTS.md`、`PROGRESS.md`
- Verify: `pnpm db:start` 後 `pnpm db:status` 有 API／Studio 網址；`pnpm supabase projects list` 看得到 `fuyouxing-staging`（linked）。
- Next: Owner 核可計畫後開始 S0-2 monorepo 骨架。
- Blockers / 待 Owner: 寄信網域（11/16）、API key、測試手機、首圈名單；見任務板「待 Owner」。
