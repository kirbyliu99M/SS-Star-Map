# 配色交接：星夜主題（給 AGY）

> 狀態：**未拍板（candidate）**。Owner 2026-11-02 決定：
> 1. 不沿用 PRD 附錄 B `theme.json` 的舊色（#0B1020／#9DB4FF），要設計全新的配色；
> 2. 色系要跟 AGY 一起處理，Claude Code 不單獨定案。
>
> 下面三組只是 Claude Code 先放在 Pencil 上的**討論起點**，不是建議定案。

## 限制（來自 PRD）

- 深色為預設（§13.1），星圖、個人網頁、Console 共用同一套 token。
- ✦ 是品牌符號；「星光」需要一個獨立的強調色（目前 token 叫 `starlight`）。
- 文字對比要過 WCAG AA（內文 4.5:1）；主題合約見 PRD §9.3、§15.4。

## Pencil 檔裡的三組起點

Pencil 文件用 `palette` 主題軸切換（aurora／candle／coral），同一張手機頁面並排三份，改變數就會同步。

| token | A 深海極光 | B 墨紫燭光 | C 石墨珊瑚 |
|---|---|---|---|
| bg | #070D12 | #120E17 | #0F1114 |
| surface | #0E1A20 | #1B1522 | #181B20 |
| surface-2 | #142630 | #251C2F | #20242B |
| border | #1F3A44 | #3A2E47 | #2F343D |
| fg | #E6F2EF | #F3ECE4 | #EDEBE6 |
| muted | #86A3A0 | #A598AE | #9A9A94 |
| accent | #5EE6C5 | #F2A65A | #FF8466 |
| accent-fg | #04201A | #1E1206 | #1A0A05 |
| starlight | #F4C46A | #FFE6A8 | #FFF1C2 |
| glow（含透明度） | #5EE6C540 | #F2A65A40 | #FF846640 |
| star（含透明度） | #E6F2EF99 | #F3ECE499 | #EDEBE699 |

對比度尚未逐一實測（未驗證）。

## 請 AGY 協助

- 從頭提案或改良上面三組；方向、命名都可以推翻。
- 實測每組 fg／muted／accent 對 bg、surface 的對比度。
- 定案後：更新 Pencil 變數 → `packages/themes/starry-night/tokens.css`、`theme.json` → 同步 PRD 附錄 B，並在 PROGRESS 的 Decision Log 記一筆。
