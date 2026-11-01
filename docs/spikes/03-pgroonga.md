# Spike ③：PGroonga 繁中搜尋

日期：2026-11-02　狀態：已跑完（結論為 spike 層級，非 Owner 拍板；採用與否仍是未拍板（candidate））

## 問題

PGroonga 對繁體中文短 Offer（「我能幫上什麼忙」）的切詞與同義詞夠用嗎？
通過標準（`docs/plans/2026-11-01-s0-s1-plan.md`）：30 句查詢中 ≥ 25 句前 5 筆含正確答案；staging 結果與本機一致。

## 做法

- 環境：本機 Docker 與 staging 皆為 PG 17.11、pgroonga 3.2.5。啟用 migration：`supabase/migrations/20261101180716_enable_pgroonga.sql`（`with schema extensions`）。
- 資料（全部虛構）：30 筆 Offer、13 個標籤、35 個別名（`tag_aliases`）、20 筆 offer_tags。30 句查詢分四類：exact 10、colloquial 8、synonym 8、partial 4；每句有 1–3 個可接受的正確 id（任一進前 5 即命中）。
- 比較 6 組索引設定（見下表），並比較 5 種查詢策略：
  - **F**：整句當 keyword（`&@`）
  - **G**：app 端把查詢切成重疊 2-gram，再 OR（`&@|`），依 `pgroonga_score` 排序
  - **S**：只用同義詞標籤
  - **FS／GS**：同義詞標籤命中排最前，其後接全文分數（PRD §14 排名：標籤＋同義詞第一、PGroonga 第二）
- 全程 `set enable_seqscan = off`，並用 `EXPLAIN` 確認走 `Index Scan using ..._idx`。
- 程式與重跑方式：`spikes/03-pgroonga/`（`./run.sh local|staging`）。全部包在 transaction 內 ROLLBACK；staging 驗證後確認無 `spike` schema 殘留。

## 結果（hit@5 / 30，括號為 hit@1）

| 設定 | F | G | S | FS | GS |
|---|---|---|---|---|---|
| 1 TokenBigram + NormalizerAuto（預設） | 13 (13) | 25 (25) | 23 (23) | 27 (26) | **30 (29)** |
| 2 TokenBigram + NFKC150 | 13 | 25 | — | 27 | 30 |
| 3 TokenBigramSplitSymbolAlphaDigit + NFKC150 | 13 | 25 | — | 27 | 30 |
| 4 TokenNgram(unify_alphabet=false, unify_digit=false) + NFKC150 | 13 | 25 | — | 27 | 30 |
| 5 TokenNgram(n=3) + NFKC150（對照組） | 13 | 25 | — | 27 | 30 |
| 6 設定 4 加 `NormalizerNFKC150("unify_kana", true)` | 13 | 25 | — | 27 | 30 |

（S 與 tokenizer 無關，只算一次。）

分類型（設定 2）：

| 策略 | exact/10 | colloquial/8 | synonym/8 | partial/4 |
|---|---|---|---|---|
| F | 9 | 0 | 1 | 3 |
| G | 10 | 8 | 4 | 3 |
| S | 6 | 5 | 8 | 4 |
| FS | 10 | 5 | 8 | 4 |
| GS | 10 | 8 | 8 | 4 |

補充探針（15 個英文片段、全形、大小寫、數字字串；`03_probe.sql`，F 模式命中筆數）：

- 預設 TokenBigram（設定 1、2）把英文／數字當整詞：`tagram`（Instagram 中段）、`GPT`（ChatGPT 後半）命中 0。
- 設定 3、4、6（拆英數）可命中這兩者，但 `iso14064`（缺空白連字號）反而變 0；預設與 trigram 能命中。
- 全形 `ＳＥＯ`、`ｐｙｔｈｏｎ`、大小寫：所有設定都能命中（NormalizerAuto 與 NFKC150 皆處理）。
- 單字 `剪`、詞中段 `盤查` 皆命中。`next js` 對 `Next.js` 全部 0。
- 3-gram（設定 5）在這批資料上與 2-gram 無差異，因為 Groonga 對短於 n 的查詢會退成前綴比對；但索引較大、短詞行為較難預期，不建議。

## 結論

**通過。** 最佳組合 GS：30/30 前 5 筆含答案（hit@1 為 29），遠高於 25 的門檻；staging 與本機 25 組（設定 × 策略）的 hit 數與「30 句完整 top 5 排名」md5 指紋全部一致。

重要但要誠實講的三點：

1. **tokenizer 在這 30 句上分不出高下**。設定 1–6 的 hit 數相同。差異只出現在補充探針（英文片段）。所以選 tokenizer 的依據是探針，不是 30 句的分數。
2. **只靠 PGroonga 的整句查詢不夠**（F 只有 13/30）。口語句（「我想找人幫我剪 YouTube 影片」）必須在 app 端切 2-gram 後 OR（G），或另有斷詞。
3. **同義詞貢獻明確**：synonym 類從 4/8（G）提升到 8/8（GS）。但別名表是我依測試句寫的，覆蓋率偏樂觀；真實覆蓋率要看上線後的搜尋紀錄。

## 建議（均為 spike 建議，未拍板（candidate））

- tokenizer／normalizer：`TokenBigramSplitSymbolAlphaDigit` + `NormalizerNFKC150`。理由：繁中 2-gram；英文與數字可從詞中匹配（`GPT`→`ChatGPT`）；全形半形與大小寫統一。已知代價：`iso14064` 這類缺分隔符寫法會漏，可用別名補。

```sql
create index offers_body_pgroonga_idx on public.offers
  using pgroonga (body)
  with (tokenizer = 'TokenBigramSplitSymbolAlphaDigit', normalizers = 'NormalizerNFKC150');
```

（`public.offers` 是 PRD 的預定表名，此 spike 未建立；實際欄位名以正式 migration 為準。若 Offer 另有標題、標籤文字欄位，可改用多欄位 `pgroonga (array[title, body])`，本 spike 未測。）

- 查詢策略：GS。
  1. **標籤層**：查詢字串（小寫後）若包含任一 `tag_aliases.alias` 或 `tags.name`，取該標籤的 offers 排最前。別名比對用 `position(alias in lower(q)) > 0`（子字串包含，因為查詢是整句口語）。
  2. **全文層**：app 端（或 SQL function）把查詢切成：ASCII 連續字串整段保留、CJK 連續字串重疊 2-gram，用 `body &@| grams` 查，依 `pgroonga_score` 排序。參考實作 `spike.grams()` 在 `spikes/03-pgroonga/02_run.sql`。
  3. 排序：標籤命中 → 全文分數 → id。
- 同義詞維護：`tag_aliases` 由 Owner／幹部維護的小表（PRD M5-2），別名一律存小寫；新增別名即時生效，不需重建索引。這點比 PGroonga 的 synonym 表（`pgroonga_query_expand`）直觀，也能放進 RLS 與後台。`pgroonga_query_expand` 本 spike 未測。

## 限制與未驗證

- 只有 30 筆 Offer、30 句；資料量小，排名噪音與效能（毫秒級）無法外推到數百至數千筆。
- 查詢與別名是同一人撰寫，有 overfit 風險；沒有真人查詢紀錄。
- G 策略沒有停用詞：「我想」「幫我」之類的 2-gram 在大量資料下會造成雜訊，可能需要簡單停用詞表或對高頻 gram 降權。本 spike 未測。
- 未測 `TokenMecab`／其他需要字典的 tokenizer（Supabase 託管環境是否提供，我沒有確認）。
- 未測並發寫入、索引大小、`REINDEX` 成本，也未測 Supabase PostgREST／supabase-js 呼叫 `&@|` 的方式（預期要包成 RPC function，未驗證）。
- `iso14064`、`next js` 這類「少寫／多寫分隔符」查詢目前靠別名處理，無通用解法。

## 若不通過的替代方案（本次不需要）

- `pg_trgm` GIN：對 CJK 的 trigram 對 2 字詞效果差，需搭配 LIKE；可當保底。
- 在 app 端用 `Intl.Segmenter('zh-TW')` 先斷詞，再以 `to_tsquery` 或 PGroonga `&@|` 查。
- 使用 pgvector 語意搜尋（PRD 已預留 `vector`，P5）補足口語查詢，但要 embedding 成本與延遲。
