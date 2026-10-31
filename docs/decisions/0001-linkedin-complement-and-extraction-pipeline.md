# 0001 LinkedIn 互補定位與擷取管線

- 日期：2026-11-01
- 狀態：Owner（Kirby）決定；細節仍有【待決】項目
- 依據：`docs/reviews/2026-11-01-prd-linkedin-integration.md`、`docs/proposals/PRD-v0.4-linkedin-patch.md`

## 背景

Owner 想把產品與 LinkedIn 深度整合，作為互補。審查查證後發現，LinkedIn 開放一般開發者自助申請的 API 只有 OIDC 登入（姓名、照片、email）；經歷、技能、人脈資料都要加入合作夥伴計畫。PRD v0.3.1 的非目標寫著「不爬 LinkedIn」。

## 決定

1. **互補定位**：LinkedIn 放公開履歷，浮游星放圈內的「我能幫你什麼、我正在找什麼、朋友怎麼說」。改寫 §1 與 §3.2。
2. **擷取管線進 MVP**：產品提供個人網頁模板，資料可以從使用者上傳的檔案自動帶入：來源 → 擷取 → 對應區塊 → 逐項確認 → 寫入。以 §9.5 原本的「履歷 PDF 一鍵初稿」擴充，M3-5 從 P4／Should 改為 MVP／Must。
3. **來源只有兩種**：(A) 個人履歷 PDF；(B) LinkedIn「存為 PDF」。**不做** LinkedIn 資料副本 ZIP。

## 不做

匯入 LinkedIn 人脈、聯絡人、訊息；爬取 LinkedIn 或使用代爬服務；用 API 代使用者發文；資料副本 ZIP。

## 影響

- 工時增加約 44–60 小時（粗估 ±50%，含 Timeline、Projects 區塊），排在 S6 起，目標是 S9 填資料派對可用【待決】。
- S1 新增 spike ⑤：實測 PDF 文字層、中文編碼、LLM 結構化輸出與成本。
- LinkedIn「存為 PDF」限桌機、限英文檔案，部分台灣會員可能用不了，所以來源 A 是主力。
- AI 成本以 Haiku 等級模型估算，首圈一年約新台幣 50 元以內（未實測）。

## 仍待決（見 PRD §22 #14–16）

- 工時怎麼換（AI 搜尋改低成本簡化版，或其他延後項目）
- 是否向 LinkedIn 或法律意見確認上傳「存為 PDF」的條款
- 保存期限、管線寫入區塊的預設可見度、原則第 10 條
