# PRD v0.3.1 審查：LinkedIn 互補整合＋一般審查

> 審查日期：2026-11-01｜對象：`docs/PRD.md`（v0.3.1，未修改）｜查證時間：2026-11-01
> 本文所有決策性建議一律為「**未拍板（candidate）**」，未經 Owner 與正式討論確認，不得寫入 PRD 當定案。
> 本文不是法律意見。涉及個資法、LinkedIn 條款的判斷，上線前請律師看過。

---

## 1. 結論

**一句話定位（未拍板，candidate）**：LinkedIn 是「公開履歷與弱連結的櫥窗」，浮游星是「圈內信任、需要時找得到人的書櫃」；兩者只用「使用者自己放上去的連結」與「使用者自己上傳自己的檔案」相接，不互相搬運別人的資料。

重點：

1. **官方可自助用的 LinkedIn 能力很窄**：登入（OIDC，只拿姓名／照片／email／語系）、分享（`w_member_social`）、Add to Profile（限證書或學位發證單位）、分享按鈕外掛。完整經歷、人脈清單、第二度連結，沒有自助管道，要走合作夥伴計畫；搜尋結果裡查不到 Taiwan 一般開發者能申請的路徑。
2. **Verified on LinkedIn 對新開發者目前是死路**：官方「Lite 層」頁面（2026-10-14 更新）寫明「不再開放新開發者申請」；只剩僅限開發者應用程式管理員的 Development 層，以及要談商務合作的 Plus 層。官方 FAQ 與該頁互相矛盾，我採較新的那一頁。
3. **Member Data Portability API 只開給歐洲經濟區與瑞士會員**，台灣會員不能用。
4. **依 Owner 收斂後的範圍（2026-11-01），主軸是「擷取管線」**：資料來源（使用者自己的 LinkedIn 輸出：Save to PDF、資料副本 CSV；或使用者自己的履歷 PDF）→ 擷取 → 對應到區塊 → 使用者逐項確認 → 寫入。這條管線不需要任何 LinkedIn API，也不爬取，在 PRD §9.5 的「履歷 PDF 一鍵初稿」上擴充。粗估 40–55 小時（約 300 小時的 13–18%），要拉進 MVP 就得砍東西，見 §3A。
5. **管線有三個關鍵事實**：(a) LinkedIn 的 Save to PDF 官方頁寫「僅限檔案語言設為英文的會員」，很多台灣會員會走不通，資料副本 CSV 變成主力 LinkedIn 路徑；(b) 官方資料副本分類清單很明確，包含 Profile、Positions、Education、Skills、Recommendations Received 等，但**逐欄位名稱官方頁沒列**，要拿真檔實測；(c) 官方頁**沒有任何一句**允許或禁止「使用者把自己的匯出檔上傳給第三方」，我查不到，不能推論為可以，建議向 LinkedIn 或律師確認。
6. **其他輕量整合**（不需 API，約 8–11 小時）：LinkedIn 網址欄位、引薦後交換 LinkedIn 連結、「分享我的頁面」複製連結、互補話術。OIDC 若只拿來預填姓名，價值小，見 L6。
7. **不要做**：匯入 Connections.csv 等人脈檔（管線要主動拒收）、任何爬取、用 API 自動發文、拿 LinkedIn 資料餵星圖或排序、Verified 徽章當權限條件、把推薦信（Recommendations Received）寫進任何公開區塊。理由見第 4 節。
8. **一般審查找到 2 個 BLOCKER、6 個 MAJOR**，其中一個（外部資安檢查排在外圈上線之後 10 週）跟「零筆未經同意的外圈資料」這條護欄直接衝突，比 LinkedIn 整合更急。

---

## 2. LinkedIn 現況查證表（查證日 2026-11-01）

信心：高＝官方頁面直接寫明；中＝官方頁面有但文件之間有出入或只讀到部分；低＝只有第三方說法。
「查不到」＝沒有找到官方依據，我不推論。

| 機制 | 可用性（一般開發者） | 可拿到什麼 | 限制與注意 | 官方來源 | 信心 |
|---|---|---|---|---|---|
| Sign In with LinkedIn（OIDC） | 自助。在 Developer Portal 的 Products 分頁申請；LinkedIn 說「Open Permissions 是唯一不需特別核准的」 | scope `openid`、`profile`、`email`。userinfo 欄位：`sub`、`name`、`given_name`、`family_name`、`picture`、`locale`、`email`（選填）、`email_verified`（選填） | 官方註明**不驗證使用者身分，不得以此宣傳為身分驗證**。`email` 可能缺。`getting-access` 頁寫 profile 含 headline，但 OIDC 頁的欄位表沒有 headline，**兩頁不一致，headline 拿不拿得到要實測** | https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2 ；https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access | 高（欄位）／中（headline） |
| Supabase Auth 支援 LinkedIn | 支援，provider 名稱 `linkedin_oidc`；舊的 `linkedin` provider 已停止維護並將移除 | 查不到。Supabase 文件沒有列 `user_metadata` 會有哪些欄位，也沒有明列 scope | 需在測試環境登入一次，看 `raw_user_meta_data` 實際內容。同 email 的帳號是否自動連結，我沒查，需實測 | https://supabase.com/docs/guides/auth/social-login/auth-linkedin | 高（支援與名稱）／低（欄位） |
| Share on LinkedIn | 自助。Products 分頁加入 Share on LinkedIn，取得 `w_member_social` | 以會員身分發文（文字、網址、圖片、影片）；可選可見度 `CONNECTIONS` 或 `PUBLIC` | 每會員每日 150 次、每應用每日 100,000 次。API 使用條款有「禁止用 API 或內容自動化在 LinkedIn 發文」的條文，與「會員自己按下發文」的界線我讀不出來，**需向 LinkedIn 或律師確認** | https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin ；https://www.linkedin.com/legal/l/api-terms-of-use | 高（機制）／低（自動化界線） |
| Share 外掛（JS 按鈕） | 自助，不需核准；貼一段 script 即可 | 彈出 LinkedIn 分享視窗，網址可預設或留給使用者填 | 該頁最後更新 2022-03，是否仍維護未確認；受 Plugins Terms of Use 約束 | https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/plugins/share-plugin | 中 |
| `share-offsite` 純網址分享 | **查不到官方文件。** 只找到第三方程式碼與討論，說明這個網址格式被廣泛使用，且 LinkedIn 已不接受自訂標題等參數 | — | 手機 App 行為不一致（Adobe 社群回報）。不要把它寫成「官方保證可用」 | 無官方來源（第三方：https://github.com/kytta/shareon/pull/93） | 低 |
| Add to Profile | 自助、免費、不需審核，**但限「有 LinkedIn Page 的證書或學位發證單位」**；LinkedIn Help 說現在提供靜態網址產生按鈕，不再針對個別證書客製 | 讓持證人一鍵把證書加到自己 LinkedIn 檔案 | 我們不是發證單位；要有浮游星的 LinkedIn Page。查詢參數官方頁沒列（第三方有列，不採信） | https://www.linkedin.com/help/linkedin/answer/a528030 ；https://addtoprofile.linkedin.com （301 轉址至前者） | 高（資格）／低（參數） |
| 完整經歷、職稱、人脈清單（Profile／Connections API） | **沒有自助管道。** 官方 `getting-access` 頁：「多數權限與合作夥伴計畫需 LinkedIn 明確核准」；自助的消費者權限只有登入與分享。舊的 r_fullprofile、r_network 在官方現行頁面查不到狀態 | 自助路徑拿不到 | 第二度連結任何情況都沒有。Sales Navigator、Talent、Marketing 皆為合作夥伴計畫，且用途是銷售、招募、廣告，與本產品不符 | https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access | 高（沒有自助）／低（舊權限狀態） |
| Member Data Portability API（會員資料可攜，DMA） | 自助申請，**但會員限歐洲經濟區與瑞士**，台灣會員無法授權 | 會員自己的 Snapshot（歷史資料）與 Changelog（近 28 天） | 需用官方指定的預設公司頁建立應用程式 | https://learn.microsoft.com/en-us/linkedin/dma/member-data-portability/member-data-portability-member | 高 |
| 使用者自行下載「資料副本」 | 使用者在 Settings → Data privacy → Get a copy of your data 申請封存檔，寄到主要 email | 我先讀到的 a566336 頁只提 connections、verifications、contacts 等與 CSV、vCard 兩種格式；**另一頁官方說明 a1339364 才有完整類別清單**（見下一列）。CSV 與 vCard「不支援所有字元」（中文可能受影響）；只有允許他人看到 email 的連結才會帶 email；不含非一度連結 | 官方頁沒有任何關於「上傳給第三方」的規範，**查不到**，不能推論為可以。封存檔內容大部分是別人的個資 | https://www.linkedin.com/help/linkedin/answer/a566336 | 高（內容）／查不到（第三方上傳條款） |
| 個人檔案「Save to PDF」 | 桌機版功能，手機 App 沒有；僅限檔案語言設為英文的會員；每月 200 次；可存自己或**其他會員**的檔案 | 履歷格式 PDF | 頁面沒有任何第三方使用規範；「可存他人檔案」這點讓「代建」有風險（見 §5） | https://www.linkedin.com/help/linkedin/answer/a541960 | 高（功能）／查不到（第三方規範） |
| 資料副本的類別清單（管線的輸入） | 使用者自助。官方 a1339364 頁分兩組：**約 10 分鐘可取**（官方原文兩處時限不一致，分組標題寫 48 小時、內文寫 24 小時，實際時限不確定）：Profile、Positions、Education、Skills、Certifications、Courses、Projects、Languages、Honors、Publications、Patents、Articles、Recommendations Given、Recommendations Received、Endorsements、Verifications、Phone Numbers 等；**較大型下載（48 小時）**：Connections、Contacts、Email Addresses、Messages、Comments、Shares、Profile Summary、Resume data、Volunteering、Test Scores 等。只提供與帳號有關的類別（沒有證照就沒有該檔）。下載連結 72 小時有效 | 官方 Positions 說明（answer/50191）：公司名稱、職稱、工作描述、地點、起訖時間。**其他檔案的欄位名稱官方頁沒列；Recommendations 的實際檔名第三方資料無法確認** | 檔案會混有他人資料：Recommendations Received（推薦人寫的文字）、Connections、Contacts、Messages。「Profile Summary」被放在 48 小時那組，所以自我介紹文字不一定在快速組。**中文可能受影響**（官方說 CSV 不支援所有字元） | https://www.linkedin.com/help/linkedin/answer/a1339364 ；https://www.linkedin.com/help/linkedin/answer/50191 | 高（類別）／低（欄位與檔名） |
| Verified on LinkedIn（驗證標章 API） | **Development 層**：只有開發者應用程式管理員能授權，免費。**Lite 層**：官方 Lite 頁（2026-10-14 更新）寫「不再開放新開發者申請」，但官方 FAQ（2026-08 更新）仍把 Lite 寫成可用，兩者矛盾，我採較新的 Lite 頁。**Plus 層**：要提交合作夥伴申請，由 LinkedIn 商務團隊審查 | Development／Lite：驗證類別（IDENTITY、WORKPLACE）與基本檔案（姓名、email、照片、檔案網址）。Plus 才有組織名稱、驗證方式、學歷、現職 | 驗證本身只在部分地區可用，**台灣有沒有，官方頁沒寫，查不到**。不得用於聘用、背景調查、平台風險評分等；驗證資料「不得無限期儲存」；標章只能在 API 回傳已驗證時顯示，不得顯示快取或手動輸入的結果 | https://learn.microsoft.com/en-us/linkedin/consumer/integrations/verified-on-linkedin/overview ；.../faq ；.../guides/upgrade-to-lite-tier ；https://www.linkedin.com/help/linkedin/answer/a1359065 | 中 |
| API 使用條款：儲存與保存 | 條款（2022-12 版，頁面標示現有開發者 2023-01-13 生效） | — | §4.1 不得擷取、複製、快取或儲存內容，只在提供服務所需期間儲存，且要能辨識與選擇性刪除；§4.4 會員要求刪除或關閉帳號時必須刪除；§4.3 儲存個人檔案資料須有會員合法同意，且僅在會員實際使用應用程式時取用，不得排程自動抓 | https://www.linkedin.com/legal/l/api-terms-of-use | 高 |
| API 使用條款：爬取與用途限制 | 同上 | — | §3.1(24) 禁止以爬取方式在 API 之外取得 LinkedIn 內容；§3.1(8) 不得出售彙整後的會員檔案集合；§3.1(9) 內容不得用於「讓使用者使用內容」以外的目的；§3.1(10) 不得用於廣告；§3.1(17) 不得作為資格判定的輸入 | 同上 | 高 |
| 使用者協議（User Agreement） | — | — | §8.2：禁止以軟體、腳本、機器人等方式爬取或複製服務內容，包含個人檔案；禁止使用機器人等未經授權的自動化存取；未經內容擁有者同意，不得複製、使用、顯示或散布從服務取得的資訊，包含透過第三方取得；不得暗示與 LinkedIn 有關聯或獲其背書 | https://www.linkedin.com/legal/user-agreement | 高 |
| 品牌 | 官方品牌頁：只能依規範或取得書面同意使用 | — | API 條款 §6.1：品牌特徵只能在應用程式內用來標示 LinkedIn 整合；對外行銷、廣告、宣傳需事先送審。第三方文章說「in」圖示可用作連到自己檔案的社群按鈕，但**官方頁我只讀到片段，無法確認完整條款**；要用就從官方下載頁取素材，不要自己畫 | https://brand.linkedin.com/ ；https://www.linkedin.com/legal/l/api-terms-of-use | 中 |
| 開發者應用程式需要 LinkedIn 公司頁 | 我只在 Member Data Portability 頁看到「需要公司頁」，**一般登入／分享產品是否也要，本次沒有查證** | — | 依 PRD §22 #2、#12，名稱與營運主體都還沒定，若需要公司頁會卡在這兩題 | 見上 | 低 |

---

## 3. 建議採用的整合點（全部：未拍板（candidate））

工時為粗估（Kirby 單人、AI 輔助，誤差約 ±50%）。主軸是 3A 的擷取管線；3B 的 L1–L4 是不需要 API 的輕量點。

### 3A．主軸：「資料來源 → 擷取 → 對應區塊 → 逐項確認 → 寫入」管線（以 PRD §9.5、§15.5 為基礎擴充）

**現有基礎**：§15.5 已有 5 步（上傳私有 bucket、Edge Function 抽文字層、LLM 依區塊 Zod schema 回 JSON、使用者逐項勾選、原檔與文字立即刪除）。本管線不改這五步的骨架，只補三件事：多種來源、ZIP／CSV 的前置過濾、第三人資料與保存期限規則。

**① 三種來源**

| 來源 | 輸入 | 擷取方式 | 優缺點 |
|---|---|---|---|
| A. 使用者自己的履歷 PDF | PDF（≤ 5 MB，文字層；掃描檔 MVP 不支援，沿用 §15.5） | 抽文字 → LLM 結構化輸出 → Zod 驗證 | 覆蓋沒有 LinkedIn 的人（PRD 自己的數字：台灣會員滲透率約 16–17%，來源不一致）；版面五花八門，準確度最不穩 |
| B. LinkedIn「Save to PDF」 | PDF | 同 A（版面較一致，但**本次沒有拿到實際檔案，版面需實測**） | **官方頁：僅限檔案語言為英文的會員、僅桌機、每月 200 次**；中文檔案的會員可能走不通 |
| C. LinkedIn 資料副本 ZIP | 使用者自行下載的 CSV 壓縮檔 | **瀏覽器端解壓，只讀白名單檔**，確定性解析（不需要 LLM）；自由文字欄位（工作描述、摘要）才進 LLM 潤飾或分段 | 欄位結構穩定、便宜、準；但**欄位名稱官方沒列，要用真檔實測**；中文編碼要實測；Profile Summary 在 48 小時那組，使用者要等 |

**② 前置過濾（C 來源的關鍵設計）**
- **白名單**：只讀 Profile、Positions、Education、Skills、Certifications、Projects、Languages、Honors、Publications（及 Courses、Patents 視需要）。
- **黑名單，一律不讀、不上傳**：Connections、Contacts、Email Addresses、Messages、Comments、Shares、Invitations、Search Queries 等。**在使用者的瀏覽器裡解壓與過濾，其他檔案根本不離開使用者的電腦**；若使用者誤傳整包 ZIP 到伺服器端，一律拒收並刪除。這點同時回應「人脈名單匯入降為不建議」。
- **Recommendations Received 預設關閉**（理由見下方第三人資料）。

**③ 對應到區塊（Mapping，全部先進「草稿」，不直接寫入）**

| 來源欄位 | 對應區塊 | 備註 |
|---|---|---|
| 姓名、標題（headline） | Hero | 姓名可由 OIDC 預填（L6），非必要 |
| 摘要 | About | 長度截斷到區塊上限，提示使用者重寫成自己的口吻 |
| Positions、Education | Timeline | 日期格式正規化；工作描述中的他人姓名標示（見下） |
| Projects、Publications、Honors | Projects | 附連結才保留連結 |
| Skills | **Offers 的候選草稿**，不是直接寫入 | 技能≠「我可以幫你」。Offers 要寫成別人搜得到、讀得懂的句子（§9.2），建議最多先提示 3–5 條，使用者改寫後才存。PRD §9.2 沒有獨立 Skills 區塊，是否新增，列入 Owner 決定 |
| Languages、Certifications | Timeline 或 Rich text | 低優先 |
| LinkedIn 網址 | Links | 若來源沒有，請使用者自己貼（L1） |
| Asks（我正在找） | **不從履歷推導** | 這是當下需求，履歷沒有 |
| 電話、住址、生日、身分證字號、email（本人的也一樣） | **不擷取** | 沿用 §15.5 第 3 步；聯絡方式由使用者在 Contact 區塊自己設，各自可見度 |

**④ 技術做法與評估**
- **解析**：PDF 用文字層抽取（Edge Function，沿用 §15.5）；CSV 用瀏覽器端解析函式庫；ZIP 用瀏覽器端解壓。
- **LLM 結構化輸出**：把各區塊的 Zod schema 轉成 JSON schema 要求模型回傳；伺服器端再用同一份 Zod 驗證，失敗最多重試一次，仍失敗就退回「只顯示抽出的純文字，讓使用者手動複製」。PRD §14.3 已列 Zod 前後端共用，不必另起爐灶。
- **提示注入**：履歷文字是不可信輸入（可能含「忽略以上指令」）。模型**不給任何工具、不能發出網路請求**，輸出只能是符合 schema 的 JSON，且寫入前一定經過使用者逐項確認；這是主要防線。需要一組注入測試（Vitest）。
- **測試**：用 10 份經本人同意的真實履歷或自己製造的假履歷建立評測集，量「欄位正確率」與「誤抓他人姓名次數」。
- **成本**：每份履歷數千 token，PRD §20.1 的 LLM 預算（< NT$ 300）應足夠，**但沒有實測**。
- **供應商**：§14.3 寫 Claude 或 OpenAI 擇一，未決；採購時確認不用於訓練與留存期限（零留存選項若有）。

**⑤ 使用者逐項確認（沿用 §15.5 第 4 步，補強）**
- 每一項前面有勾選框，預設只勾選「來自本人自己欄位」的項目；摘要與工作描述可編輯。
- 含他人姓名或疑似他人聯絡方式的段落，用顯眼標示請使用者確認要不要保留。
- **寫入的區塊預設可見度為「我的圈子」**，不是公開（對應 MAJOR-4）。使用者要公開，要逐區塊手動改。
- 寫入前可用「以訪客身分預覽」（M3-6）看結果。

**⑥ 個資面（本人資料與第三人資料）**

| 情境 | 規則（建議） |
|---|---|
| 檔案裡的本人資料 | 目的僅限「產生草稿」；告知寫進隱私權政策與上傳畫面（一句話）；LLM 在境外，沿用 §17.3 跨境揭露。 |
| 推薦人（Recommendations Received）與推薦文 | **預設不匯入、不送 LLM**。理由：那是推薦人寫給 LinkedIn 的文字，著作與個資都屬於他；使用者協議 §8.2 另有「未經內容擁有者同意，不得複製、使用、顯示或散布」的規定。若日後要做，只能走 §M8-2「朋友說」現有流程（對方同意才顯示）。 |
| 履歷或工作描述裡出現的同事、主管、客戶姓名 | LLM 提示請它標記「疑似他人姓名」；UI 預設**不勾選**含他人姓名的句子，使用者自己改寫後才寫入。 |
| 履歷上的推薦人聯絡資料（人資常見的「Reference」欄） | 不擷取，直接丟棄。 |
| 他人的 LinkedIn PDF（Save to PDF 官方頁說可存**他人**檔案） | 上傳畫面強制勾選「這是我自己的檔案」；志工代建時**不得**上傳當事人以外的來源，只能使用當事人親自提供的素材（對應 MAJOR-5）。 |
| 人脈與訊息檔 | 前置過濾直接拒收（見②）。 |
| 資料保存期限 | **原檔**：處理完成立即刪；任何失敗也刪；另有排程每小時清掃 `uploads` bucket 中超過 1 小時的檔案（在 §16.5 新增 `purge_uploads`）。**抽出的純文字**：只留在記憶體，不落地、不寫入日誌。**草稿 JSON**：使用者未確認，最多保留 24 小時後自動刪（建議加密欄位）。**確認寫入後的區塊**：視為使用者自己填寫的資料，依 §17.5 的一般刪除流程。**events**：只記次數、來源類型、是否成功，不記內容與檔名。 |
| LinkedIn 條款 | API 使用條款的儲存限制（§4.1）明文**不適用於「不是透過 API 取得的資料」**（§4.4 末句），所以使用者自己上傳自己的檔案，不落在 API 條款的儲存限制內；但使用者協議本身沒有明講第三方可否接收，**我查不到**，信心為中。 |

**⑦ 工時與 Sprint（粗估，全部：未拍板（candidate））**

| 項目 | 工時 | 建議放哪 |
|---|---|---|
| Spike ⑤：拿 Kirby 自己的 LinkedIn 資料副本與 Save to PDF，實測欄位名稱、中文編碼、PDF 文字層抽取、LLM 結構化輸出 | 4 | **S1**（與現有四個 spike 並行，11/16–11/29） |
| 共用核心：上傳／白名單與黑名單過濾／確認畫面／Zod／對應／預設可見度／原檔即刪＋清掃排程／告知文案／events | 16–20 | S6（輕量 Sprint，01/25–02/07）起頭，延伸到 S9 前完成 |
| 來源 A、B：抽文字＋LLM 結構化＋提示注入測試＋評測集 | 12–16 | 與核心同步（S6），讓**填資料派對（S9）能用** |
| 來源 C：資料副本 ZIP／CSV 確定性解析 | 6–10 | 核心完成後（S9 之前或之後，視 P0 訪談結果；見下） |
| 先決區塊：Timeline、Projects 區塊（§9.2 列為 MVP，**§18.3 的 Sprint 表沒排**，見 MAJOR-6） | 6–10 | S4（與星夜主題同期） |
| **合計** | **約 44–60 小時（含先決區塊）；管線本身約 38–50 小時** | 約占 300 小時的 13–17% |

**要砍什麼來換（擇一或組合，Owner 決定）**
1. **M5-8 AI 搜尋（P3，S12）**：PRD §18.5 本來就排在「依序砍」第 4 位；它與管線共用 LLM 呼叫、Zod、隱私文案，砍掉後可把 LLM 基礎建設的成本移到管線。PRD 沒給 AI 搜尋的工時，我不敢報節省多少，估計 12–20 小時。
2. **M5-10 外圈可搜尋書櫃（S13）**：§18.5 第 5 位，延到 P4。
3. **星圖路徑高亮與我的星座**：§18.5 第 1 位。
4. 輕量點（3B）的砍項：M8-4、M3-3 底部導覽。
- 若什麼都不砍，管線只做來源 A、B（最普適），來源 C 延到 P4。**這是建議的保底方案。**

**⑧ P0 訪談補兩題（0 工時，11/02 起的訪談就能問）**：「你有 LinkedIn 帳號嗎？檔案語言是中文還是英文？」「你手邊有現成的履歷 PDF 嗎？」用來決定來源 C 值不值得做、優先順序誰先誰後。

### 3B．輕量整合點（不需 API）

### L1．LinkedIn 網址一等公民欄位（Links 區塊預設類型＋外圈卡片選填欄）

- **做什麼**：Links 區塊（§9.2）新增 LinkedIn 預設類型，驗證網址格式為 `linkedin.com/in/…`，用官方素材當圖示；外圈同意頁（§10.2）加一個選填欄「LinkedIn 網址（自己填）」，讓請求方知道 Matt 是誰。
- **機制**：不需要 API。純使用者自行輸入的連結。圖示的使用條件見表中「品牌」列，未確認完整條款。
- **跟 §2 原則衝突嗎**：不衝突。「目錄，不是動態牆」不受影響，因為只是一條外連。預設可見度跟 Links 區塊一致（公開），**建議這個欄位預設改為「我的圈子」**，原因見 §5 的 MAJOR-4。
- **個資法**：連結由本人自己填，無第三人資料；邀請人不得代填 Matt 的 LinkedIn 網址（會變成第三人資料的間接蒐集）。
- **放哪**：S3（12/14–12/27，做 Links 區塊的同一個 Sprint）。
- **工時**：3 小時。
- **要砍什麼來換**：M8-4 圈子里程碑（Could，卻被排在 MVP，M8 表第 392 行）。

### L2．LinkedIn 當作引薦連上後的「可選聯絡方式」

- **做什麼**：`contact_methods`（§16.1）新增 `linkedin` 類型；引薦連上時，雙方可選擇交換 LinkedIn 連結，而不一定要交換 email 或 LINE。
- **機制**：同 L1，無 API。
- **衝突**：不衝突，反而跟既有設計吻合：聯絡方式「每種一列、各自設定可見度」（§16.1），由 `intro_contact_grants` 授權（§17.1 末段）。
- **個資法**：本人選擇揭露，且經過雙方同意才交換，符合 §6 M6-2 的狀態機。
- **放哪**：S10（引薦流程，03/22–04/04）。
- **工時**：2 小時（在既有流程上多一個選項）。
- **要砍什麼來換**：不需要砍，併入既有 `contact_methods` 工作。

### L3．「把我的頁面分享到 LinkedIn」按鈕（複製連結＋開 LinkedIn 分享視窗）

- **做什麼**：個人網頁發布成功後，提供「複製連結」與「到 LinkedIn 分享」；分享的是**本人公開頁的網址**，OG 分享圖（M3-7）已經有。
- **機制**：兩個選項，擇一，**未拍板（candidate）**：(a) Share 外掛（官方頁有，但最後更新 2022-03）；(b) `share-offsite` 純網址（查不到官方文件，只在第三方看到）。**不用 `w_member_social`**，原因見 §4。若兩者都不穩，退回只提供複製連結。
- **衝突**：不衝突。分享的是本人自己的公開頁，由本人按下。
- **個資法**：只含本人公開資料。**不要**預填任何引薦、星光、圈內內容。
- **放哪**：S4（公開頁靜態生成，12/28–01/10）。
- **工時**：2–3 小時。
- **要砍什麼來換**：M3-3 的「手機底部導覽」先延到 P4（版型 tabs 保留）。

### L4．「LinkedIn 放公開履歷，浮游星放我能幫什麼」的 onboarding 話術

- **做什麼**：3 步驟上手與外圈邀請信各加一段不超過兩句的說明，講清楚兩者分工；§1 比較表的 LinkedIn 一列改成互補語氣。
- **機制**：純文案。
- **衝突**：不衝突，且消除 §1 把 LinkedIn 當對照組、§12.12「變成 LinkedIn」風險、以及 Owner 想要的「互補」三者之間的語氣落差。
- **放哪**：S4（文案）、S8（邀請信樣板）。
- **工時**：1–2 小時。
- **要砍什麼來換**：不需要。

### L5（已併入 3A，下列為原先較小的構想，僅供對照）．履歷初稿加上「怎麼從 LinkedIn 取自己的 PDF」引導

- **做什麼**：§9.5 履歷初稿維持「上傳自己的 PDF，逐項確認才寫入，解析後即刪」，新增：(1) 步驟引導（桌機版 Save to PDF；注意手機沒有、僅限英文檔案語言）；(2) 勾選聲明「這是我自己的履歷」；(3) **不接受 Connections.csv 等人脈檔案**；(4) 中文文字層解析在 S1 spike 加一題實測。
- **機制**：使用者自行取得、自行上傳自己的檔案。官方頁沒有說可否上傳第三方，**查不到**，所以只靠「使用者對自己資料的處分」與「解析即刪、不保存」兩道防線，建議律師看一眼。
- **衝突**：與「資料可以帶走」不衝突；與 §3.2「不爬 LinkedIn」不衝突（沒有任何自動存取）。
- **個資法**：本人資料無第三人問題；**但「代建」（§9.5 末段）會碰到他人的檔案**，見 §5 MAJOR-5。LLM 在境外，§17.3 已列跨境，維持。
- **放哪**：P4（M3-5 原本就在 P4）。
- **工時**：4–6 小時（引導畫面、聲明、spike 實測）。
- **要砍什麼來換**：P4 的 NFC 星卡（M12-2，Could）延到 P6。

### L6（P4，可選）．OIDC 只用來預填姓名（與照片，法律未明），不當登入

**Owner 收斂後的評估**：OIDC 只拿來在管線的 Hero 步驟提供「從 LinkedIn 帶入姓名」按鈕。**我的建議是 MVP 不做**：它只省使用者打一個名字的時間；要付 8–12 小時、設定 LinkedIn 開發者應用程式（可能需要公司頁，未查證）、處理帳號連結與 LINE 內建瀏覽器轉跳。照片更麻煩：照片網址在 LinkedIn 的 CDN，API 使用條款 §4.1 不允許擷取、快取或儲存內容，除非另有會員同意與法律依據（§4.3），**「使用者按了確認就可以存」是否成立我不確定**，建議先不抓照片，讓使用者自己上傳。若要做：只當「預填」按鈕，不當登入、不存 access token（我們不需要），email 因為可能缺，不可依賴。以下是原先「當登入」的構想，保留對照。

- **原構想**：Supabase `linkedin_oidc` 當第二種登入方式；首次登入可預填姓名、email，**頭像要使用者按一下確認才存**（見下）。
- **機制**：Sign In with LinkedIn（OIDC）＋Supabase `linkedin_oidc`。
- **衝突**：不衝突，但**價值有限**：首圈 15 人用 email 驗證碼就夠；LINE 內建瀏覽器的 OAuth 轉跳是否順暢未知；LinkedIn 會員在台灣滲透率只有 16–17%（PRD 自己的數字，且標示來源不一致），做了只服務少數人。官方註明 OIDC 不驗證身分，不得拿來當「已驗證」宣傳。
- **個資法／條款**：照片網址是 LinkedIn 的 CDN 網址，儲存與否牽涉 API 條款 §4.1；建議不自動抓頭像，由使用者主動上傳或確認。email 可能缺，要有後備；同 email 是否自動連結帳號沒查到，**有帳號接管風險，要先實測再決定**。
- **放哪**：P4，與 M0-5 二選一；若 Owner 要先試，把「LINE 內建瀏覽器＋LinkedIn OAuth」加進 S1 的 spike ②（多 2–3 小時）。
- **工時**：8–12 小時。
- **要砍什麼來換**：M0-5 的 Google 登入（二選一，不是兩個都做）。

### L7．LinkedIn 開發者應用程式與公司頁（先決條件，只在 L6 或日後 L3 改用 API 才需要）

- **做什麼**：在 §22 加一題：誰擁有開發者帳號與公司頁、用什麼名稱。
- **放哪**：待 §22 #2（12/13）與 #12 定案後。
- **工時**：1 小時。

**合計**：3B 的 L1–L4 約 8–11 小時；L6 在 P4 另計 8–12 小時；3A 管線約 38–50 小時（含先決區塊約 44–60 小時）。全部加總若都放進 P0–P3，會超出 300 小時的緩衝，所以 3A 一定要搭配「要砍什麼」。

---

## 4. 不建議做的

| 做法 | 為什麼不 |
|---|---|
| 匯入 LinkedIn 的 Connections.csv、Contacts、Messages 等人脈與訊息檔（Owner 收斂後降為不建議；管線要主動拒收） | 檔案內容是別人的個資；與 §2 原則 2「同意才出現」、§3.2「不匯入通訊錄」、§10 整套同意流程正面衝突；個資法第 9 條間接蒐集告知無法逐一履行；官方頁說明封存檔本來就以他人連結為主（見查證表）。 |
| 把 Recommendations Received（推薦信）匯入網頁或「朋友說」 | 推薦人的文字與姓名是第三人資料；使用者協議 §8.2 要求內容擁有者同意；PRD 的「朋友說」（M8-2）本來就要求被介紹者同意，別繞過。 |
| 讓整包資料副本 ZIP 上傳到伺服器再過濾 | 其他檔案（人脈、訊息）已經離開使用者電腦，違反資料最小化；改在瀏覽器端解壓與過濾。 |
| 爬取、機器人、第三方「LinkedIn 資料 API」代爬服務 | 使用者協議 §8.2 與 API 條款 §3.1(24) 明文禁止；而且資料是別人的，我們沒有取得同意。 |
| 用 `w_member_social` 在使用者名下自動發文（例如「我找到幫手了」「Matt 幫了我」） | 會把第三人名字推到公開動態；違反「目錄，不是動態牆」；API 條款對自動化發文有禁止語句，界線不明。 |
| 把 LinkedIn 的職稱、公司同步進星圖或書櫃當資料新鮮度 | 自助管道拿不到經歷資料；半年更新（§5 情境 E）用三題問卷更貼切；而且 API 條款 §3.1(9) 限制內容只能用來讓使用者使用該內容。 |
| 用 Verified on LinkedIn 標章當「可信度」、放進搜尋排序、開圈審核或星橋條件 | 目前新開發者申請不到 Lite（見查證表）；官方禁止用於平台風險評分與資格判定；台灣是否支援查不到；§11.6 已決定星光不影響排序，同理。 |
| 在個人頁顯示「LinkedIn 認證」類字樣 | 官方：OIDC 登入不得宣傳為身分驗證；使用者協議禁止暗示與 LinkedIn 有關聯或獲其背書。 |
| Add to Profile 發「比賽圈成員證書」 | 該機制給的是證書或學位發證單位；成員資格不是學歷或證照，也會變成 §13.3 拒絕的徽章機制。若日後真有課程結業證書再議。 |
| Member Data Portability API | 只開給歐洲經濟區與瑞士會員。 |
| 以 LinkedIn 登入取代 email 驗證碼 | 有帳號沒有 email、沒有 LinkedIn 帳號的外圈（Matt 類型）會被擋在門外，違反 US-12「不用註冊就能同意」。 |

---

## 5. PRD 一般審查發現

行號為 `docs/PRD.md` 的行號。

### BLOCKER（2）

**BLOCKER-1｜外部資安檢查晚於外圈功能上線約 10 週**
- 證據：§17.6 第 1591 行「第一次開放外圈功能前，請一位懂資安的工程師做獨立檢查」；§18.3 的 S8（03/08 前後，第 1652 行）外圈預先邀請與同意頁上線，外部資安檢查卻排在 S13（05/03–05/16，第 1657 行）；第 1671 行又把它列為不能砍。
- 為什麼擋：不需登入的 token 端點使用 service role（§14.1 第 3 點），正好是最容易出事的地方；護欄 G4 是「零筆未經同意」。
- 最小修正：把檢查拆成兩段。**S8 結束前**做一次範圍小的檢查（RLS、`/invite/[token]`、`/a/[token]`、外圈資料），S13 再做完整版。或把 S8 的「上線」改成只對 Kirby 自己的測試帳號開放，S13 後才對首圈外圈開放。未拍板（candidate）。

**BLOCKER-2｜人工外圈同意信 S3 就寄，但告知文字的法律檢視排到 S8，且 Airtable 階段沒有保存與刪除規則**
- 證據：第 1631 行 P1 營運軌「人工寄外圈同意信」，第 1647 行 S3「第一批外圈同意信」；第 1652 行 S8「外圈告知文字（請法律意見看過）」；§10.3（第 727–735 行）的 14 天刪除與雜湊規則是為產品寫的，P1 的 Airtable 與信箱沒有等價規則；§22 #4 同意紀錄期限要到 2027-03-07 才決定。
- 為什麼擋：這是產品第一次蒐集第三人 email，而且不在 RLS 與排程保護之內。
- 最小修正：P1 開跑前（S2 結束前）補一頁「人工階段個資規則」：用 §10.2 的告知內容當信件模板；Airtable 只存必要欄位、14 天後手動刪、設存取名單、記錄告知版本；P1 外圈邀請總量設上限（例如 ≤ 10 封）。律師看過的時點提前到 S3 前或明寫「S3 先以自負風險小量試跑」。未拍板（candidate）。

### MAJOR（6）

**MAJOR-1｜email 一鍵動作會被信件掃描器預取，可能在本人不知情時完成「同意」**
- 證據：第 1111 行與第 1459 行「不用登入就能同意、婉拒或轉達」的簽章 token 連結。
- 風險：企業信箱的安全連結掃描與部分信箱的預覽，常會自動請求信中連結。若 GET 就執行動作，外圈可能在沒看過的情況下被「同意」，直接破壞 G4。這是常見做法，不是 LinkedIn 查證的結果，屬一般工程判斷。
- 最小修正：連結只開啟一個確認頁（GET 不改狀態），按鈕送出 POST 才執行；同意頁本來就要顯示告知內容（§10.2），改動小。

**MAJOR-2｜`intro_requests.target_id` 為 not null，但「牽線標籤＋需要時才邀」時對象還不存在**
- 證據：第 1291 行 `target_id uuid not null references people`；情境 G（第 222 行）與狀態機（第 1400 行）在朋友同意前，系統裡沒有他的任何資料。
- 最小修正：`target_id` 改可為空，另加 `jit_invite_id uuid references external_invites`；同意時回填 `target_id`；加 check 約束：兩者至少一個不為空。S10 開工前要改，否則牽線標籤流程做不出來。

**MAJOR-3｜北極星與「90 天」的量測窗口對不上**
- 證據：G2 與 §3.3「上線 90 天內」（第 115、150 行）；正式開圈在 S7（02/08–02/21），書櫃搜尋 S9（03/21 前後）才有、引薦 S10（04/04）才有，P3 Gate 在 S14（05/30）。實際能量到搜尋行為的窗口約 8 週（04/04–05/30），而且「怎麼找人」問卷第一次在 S11（04/05–04/18）。
- 最小修正：把「上線」定義成「書櫃搜尋可用日」，並寫明 P3 Gate 當天只有約 8 週資料；成立標準改為「80% 以上的找人事件有被記錄、搜尋覆蓋 ≥ 10/15」或把檢視日延到 06/15。同時 PRD 第 4 行「首圈上線：2027 年 2 月底」建議註明「2 月底＝帳號與個人網頁，搜尋與引薦在 4 月初」。

**MAJOR-4｜預設可見度互相矛盾，匯入履歷後會把經歷預設公開**
- 證據：§9.2（第 634–642 行）Hero、About、Timeline、Projects、Links、Rich text 預設「公開」；§7.4 步驟 4（第 513 行）寫「預設保守：我的圈子」；`circles.default_visibility` 預設 `circles`（第 1220 行）；公開頁預設可被搜尋引擎索引（第 687 行），但 §22 #3 還沒決定。
- 為什麼重要：產品定位是高信任小圈子，使用者填完履歷初稿（M3-5、L5）按發布，學經歷就對全網公開並可被索引。
- 最小修正：新增一條規則：**自動匯入（履歷初稿）寫入的區塊一律預設「我的圈子」**；Timeline 預設改「我的圈子」；§22 #3 預設改為不索引、使用者主動開啟。

**MAJOR-5｜「代建」加上「LinkedIn 匯出 PDF」可能變成處理他人個資**
- 證據：第 680 行「代建：給素材，由圈內志工或我們代建」；第 676 行允許上傳 LinkedIn 匯出的 PDF；LinkedIn Save to PDF 官方頁說明可存他人檔案。
- 最小修正：代建一律要當事人書面（訊息）同意並可在發布前預覽；PDF 上傳畫面加「這是我自己的履歷」勾選；志工代建時不上傳他人 LinkedIn PDF，只能用當事人親自提供的素材。

**MAJOR-6｜MVP 的區塊清單與 Sprint 表對不上，管線的對應目標區塊沒排**
- 證據：§9.2 的 MVP 區塊有 11 種（Hero、About、Timeline、Projects、Offers、Asks、Testimonials、Mini constellation、Links、Contact、Rich text，第 632–642 行），M3-1 卻寫 10 種（第 318 行）；§18.3 只在 S3 排 Hero、About、Links、Offers（第 1647 行），Timeline、Projects、Asks、Testimonials、Contact、Rich text、Mini constellation 沒有任何 Sprint。
- 為什麼重要：擷取管線的主要落點是 Timeline 與 Projects；沒有排，管線無處可寫，填資料派對（S9）也沒有完整頁面。
- 最小修正：在 S4 或 S5 補一行區塊交付清單與工時；M3-1 改為 11 種或明確砍掉一種。

### MINOR

- **MINOR-1｜§6 內部不一致**：M11-1「開圈申請審核」標 Must／MVP（第 421 行），M1-1、M1-2 標 P5（第 286–287 行），首圈由平台直接建立。M11-1 改 P5。
- **MINOR-2｜User Story B 依賴 P4 功能**：情境 B（第 212 行）與 US-05（第 234 行）讓小安「上傳履歷 PDF」，但 M3-5 在 P4（第 322 行），S9 填資料派對是手動填。情境 B 加註「P4 起」。
- **MINOR-3｜token 效期不一致**：第 1111 行 `/invite/[token]` 與外圈 14 天（第 705 行）；第 1459 行寫引薦人與外圈的一鍵 token「72 小時有效」。外圈邀請應明寫 14 天，72 小時只適用引薦。
- **MINOR-4｜service role「只出現三個地方」與實際不符**：第 1031 行說三處；`/api/webhooks/resend`（第 1491 行）要寫 `events`，也需要高權限。改成「四處」並說明，或改用專屬低權限角色。
- **MINOR-5｜星橋投票「不記名」在技術上並非匿名**：`bridge_votes` 以 `person_id` 為主鍵並存 `vote`（第 1359–1366 行），擁有資料庫權限的人（Kirby）可回溯。改成「圈內看不到誰投了什麼」，或把「是否投過」與「票」分表。P5 才做，趁早改文字即可。
- **MINOR-6｜外圈與其他成員的連線是否需要本人確認**：第 1262 行「外圈在同意時即成立」，但星圖設計（第 1120 行）期待外圈被多位成員認識。外圈當初只同意了邀請人與 15 位成員看到卡片（第 719 行）。其他成員新增連到外圈的 edge，應通知並由外圈確認，否則是新的揭露範圍。
- **MINOR-7｜個資申訴期限**：PRD 多處寫「法定 30 日」（第 158、595 行）。依我的記憶，個資法第 13 條對「查閱、複製」是 15 日、「更正、刪除等」是 30 日，且可延長。**本次沒有查證，請律師確認**，並把「平台目標 7 日」套用到全部。
- **MINOR-8｜email 雜湊仍可能是個資**：§10.3（第 732 行）保存 HMAC 6 個月。持有金鑰者可比對特定 email，法律上不一定算去識別化。請在告知與隱私權政策中說明。
- **MINOR-9｜LLM 供應商的留存**：履歷與搜尋查詢會送到境外 LLM（§16.4 第 9 點、§15.5）。除了隱私權政策揭露，也應在採購時確認不用於訓練與留存期限（零留存選項若有）。
- **MINOR-10｜台灣 LinkedIn 滲透率 16–17%（第 83 行）**：PRD 自己標「多來源數字不一致」，且我沒有查證。要拿來支持定位時，請附單一來源或刪除數字。
- **MINOR-11｜附錄 F 沒有 LinkedIn 條款來源**：整合點上線前要加。

### NIT

- **NIT-1**：標題與狀態列（第 1、8 行）寫 v0.3，版本紀錄（第 20 行）已有 v0.3.1。
- **NIT-2**：M14 編號順序為 M14-1、2、3、4、5、9、10、6、7、8（第 455–464 行）。
- **NIT-3**：§18.1 寫可用 26 週（第 1621 行），§18.3 的 S0–S14 橫跨約 30 週；請註明差額是寒假、期末考與春節。
- **NIT-4**：關於 MoSCoW：M8-4 是 Could 卻標在 MVP 階段（第 392 行）。

---

## 6. 需要 Owner 決定（全部：未拍板（candidate））

1. **互補定位這句話要不要採用**？是否同意把 §1 的 LinkedIn 一列、§3.2 非目標改寫成互補語氣（見 patch 檔）？
2. **MVP 要做幾個 LinkedIn 整合點**？建議只做 L1–L4（約 8–11 小時），L5、L6 看 P3 Gate 結果再決定。
3. **L6 LinkedIn 登入要不要做、要不要取代 Google 登入**？（建議：首圈不做，P4 再評估。）
4. **L3 分享按鈕用 Share 外掛、還是 `share-offsite` 網址、還是只給複製連結**？
5. **BLOCKER-1 的資安檢查拆兩段，還是 S8 只對測試帳號開放**？是否能在 S8 前找到人？
6. **BLOCKER-2 的 P1 人工階段個資規則**：外圈邀請信量上限、律師看稿時點。
7. **MAJOR-4 的預設可見度**：自動匯入區塊預設「我的圈子」？SEO 預設不索引？（對應 §22 #3）
8. **MAJOR-3 的成立標準檢視日**：維持 05/30，還是延到 06/15，或把窗口寫明為約 8 週？
9. **LinkedIn 開發者帳號與公司頁由誰持有、用什麼名稱**（連動 §22 #2、#12）；只有做 L6 或日後改用 API 才需要。
10. **是否向 LinkedIn 詢問兩件官方沒寫明的事**：(a) 使用者自行上傳自己的匯出 PDF 或資料副本給第三方 App 是否被允許（管線的前提）；(b) 使用者主動按下的分享，與 API 條款對「自動化發文」禁止的界線。
11. **擷取管線進不進 MVP**？進的話用哪個「砍」：AI 搜尋（建議）、外圈搜尋書櫃，還是全部不砍、管線只做來源 A、B（保底方案）。
12. **來源 C（資料副本 ZIP／CSV）要不要做**？建議由 P0 訪談的兩個新問題決定。
13. **Skills 要不要新增獨立區塊**，還是只當 Offers 的候選草稿（建議後者）。
14. **推薦信（Recommendations Received）一律不匯入**，同意嗎？
15. **草稿 JSON 保留 24 小時、原檔 1 小時清掃**這組保存期限，是否採用？是否需要律師確認？
16. **OIDC 預填姓名**：MVP 不做（建議），或 P4 再議？照片是否一律由使用者自己上傳？

---

## 7. 不確定的事

- Supabase `linkedin_oidc` 登入後 `user_metadata` 的欄位、是否自動連結同 email 帳號：**查不到**，需在 staging 實測。
- OIDC 是否回傳 headline：LinkedIn 兩份官方頁面不一致。
- Verified on LinkedIn：Lite 頁（2026-10-14）說不再開放新申請，FAQ（2026-08）說可用，**以哪個為準尚未向 LinkedIn 確認**；台灣是否支援驗證，官方頁沒寫。
- `share-offsite` 網址：沒有官方文件；Share 外掛頁最後更新 2022-03，是否仍受支援未確認。
- LinkedIn 品牌標章在一般網站上作為「連到個人檔案」按鈕的完整條款：只讀到片段。
- 使用者上傳自己的 LinkedIn 匯出檔給第三方的條款：**查不到**。
- 一般登入與分享產品是否需要 LinkedIn 公司頁：本次沒查證。
- 個資法各項期限（MINOR-7）與電子支付相關推論（§11.5，PRD 已自註）：未查證。
- 我沒有查證 LinkedIn 在台灣的實際會員數；PRD 的 16–17% 原樣引用。
- 資料副本各檔案的欄位名稱與實際檔名（尤其 Recommendations）：官方頁只給類別；Positions 的欄位說明來自搜尋摘要，我沒有直接讀到 answer/50191 全文。
- 官方 a1339364 頁的時限自相矛盾（48 小時／24 小時）；「Profile Summary」在較慢那組，自我介紹文字能否在快速組取得不確定。
- LinkedIn Save to PDF 的實際版面與中文呈現：沒有拿到檔案，未實測。
- 使用者自己上傳匯出檔給第三方：官方沒寫，**查不到**；§4.4 末句只說明 API 條款的儲存限制不適用於非 API 取得的資料，不等於允許。
- LLM 對中文履歷的結構化準確度、成本、提示注入防護效果：全都沒實測。
- 所有工時為粗估，沒有做過任何 spike。
- 本審查的 BLOCKER／MAJOR 分級是我的判斷，不是 PRD 或 Owner 的決議。

---

## 附：官方來源清單（本次實際讀到的頁面）

- Sign In with LinkedIn using OpenID Connect：https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
- Share on LinkedIn：https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
- Share Plugin：https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/plugins/share-plugin
- Consumer Solutions Platform 總覽：https://learn.microsoft.com/en-us/linkedin/consumer/
- Getting Access to LinkedIn APIs：https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access
- Member Data Portability（Member）：https://learn.microsoft.com/en-us/linkedin/dma/member-data-portability/member-data-portability-member
- Verified on LinkedIn 概覽、FAQ、Lite 層：https://learn.microsoft.com/en-us/linkedin/consumer/integrations/verified-on-linkedin/overview ；.../faq ；.../guides/upgrade-to-lite-tier
- LinkedIn Help：資料副本 https://www.linkedin.com/help/linkedin/answer/a566336 ；Save to PDF https://www.linkedin.com/help/linkedin/answer/a541960 ；驗證 https://www.linkedin.com/help/linkedin/answer/a1359065 ；Add to Profile https://www.linkedin.com/help/linkedin/answer/a528030
- LinkedIn API Terms of Use：https://www.linkedin.com/legal/l/api-terms-of-use
- LinkedIn User Agreement：https://www.linkedin.com/legal/user-agreement
- Supabase Auth LinkedIn：https://supabase.com/docs/guides/auth/social-login/auth-linkedin
