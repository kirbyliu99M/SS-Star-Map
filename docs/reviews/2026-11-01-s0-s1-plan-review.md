# S0＋S1 計畫審查（2026-11-01）

- 審查者：Claude Code（Sonnet subagent，獨立審查，只讀）
- 對象：`docs/plans/2026-11-01-s0-s1-plan.md` 初版
- 處理：Claude Code 於同日修訂計畫

| # | 嚴重度 | 問題 | 處理 |
|---|---|---|---|
| 1 | BLOCKER | keepalive 要等 GitHub repo 才會跑，staging 免費專案 7 天低活動會暫停 | 新增 S0-4b：anon key 手動 ping，PROGRESS 每週提醒 |
| 2 | BLOCKER | spike ②④ 依賴網域與 Resend；Mailpit 測不到手機上的 LINE | ② 改用 Supabase 內建 SMTP＋Cloudflare Tunnel；④ 加降級規則（沒網域就延到 S2） |
| 3 | MAJOR | 工時低估；40 小時容量沒有緩衝 | S0 改 24–34、S1 改 25–38 小時；明列可延後項目與 spike 延後順序 |
| 4 | MAJOR | staging 擴充版本沒查證；四個擴充打包在一支 migration | 已查證：staging 與本機完全一致（PG 17.11、PGroonga 3.2.5 等）。migration 拆開，PGroonga 移到 spike ③；擴充 schema 依官方文件 |
| 5 | MAJOR | P0 Gate 技術條件不在 PRD 裡，也沒標 candidate；④ 延期會讓 Gate 達不到 | 標「未拍板（candidate）」；①④可延期 |
| 6 | MAJOR | 掃描樣式 `re_` 太短；漏掉 service_role JWT、DB 連線字串；沒有自動執行 | 樣式更新；接 `postbuild`＋pre-commit |
| 7 | MAJOR | spike ⑤ 會把個人資料送到 LLM，spike 文件可能帶出原文 | 只用本人或假履歷；spike 文件只記數字與錯誤類型 |
| 8 | MINOR | keepalive 用哪種 key 沒寫 | 明寫只用 anon key |
| 9 | MINOR | Next／Tailwind／shadcn 版本未定；v4 沒有 preset | S0-2 開工前先查證並記錄版本 |
| 10 | MINOR | PRD 附錄 A 寫 `docs/adr/`，實際用 `docs/decisions/` | PRD 附錄 A 已更新 |
| 11 | NIT | 首頁顯示 DB 狀態可能在正式環境洩漏資訊 | 只在非 production 顯示 |
