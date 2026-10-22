# 我的鳥圖鑑 PWA v0.9

可直接部署到 GitHub Pages 的靜態 PWA。觀察作品、鳥種封面與 Google 相簿網址只保存在目前瀏覽器的本機儲存空間，沒有帳號系統或付費後端。

## 功能

- 依中文名、學名搜尋，依科別及名錄狀態篩選。
- 生命清單分開顯示「我記錄過的台灣鳥種」與「生涯記錄過的其他鳥種（含國外）」；總生涯數包含台灣與海外鳥種。
- 上方生命清單統計顯示生涯鳥種總數及台灣名錄記錄進度；主要導覽順序為清單、圖鑑、封面、地圖。
- 封面搜尋只列出目前圖鑑中已記錄的鳥種，可設定一張本機封面並連結 Google 相簿。
- 每種鳥若沒有手動封面，會自動以該鳥種第一件有照片的作品作封面。
- 圖鑑與生命清單都有刪除模式及確認視窗；圖鑑刪除只隱藏名錄項目並保留作品，生命清單刪除會清除此鳥種的生涯項目、作品、手動封面與 Google 相簿連結，並解除圖鑑隱藏；重新加入後可從乾淨狀態重新設定。
- 不再有獨立作品頁；從圖鑑鳥種卡片可開啟新增觀察紀錄視窗，供地圖位置及觀察資訊使用。照片欄位可留空，因主要照片可留在 Google 相簿。
- 地圖以 OpenStreetMap 顯示含座標的作品標記。地圖底圖需連線。
- 圖鑑只顯示已觀察或加入生涯清單的鳥種；點擊鳥種卡片會開啟 Google 相簿，尚未連結時會顯示提示。圖鑑不限制國內外鳥種。
- 生命清單可自行把每個鳥種分類為台灣鳥種或其他地區鳥種；eBird 新增鳥種預設為其他地區，但可手動修改。
- 每種鳥可設定本機封面與 Google 相簿連結。作品照片可作為預設封面，手動封面優先。
- 完整 JSON 備份 / 還原，包含鳥種資料與生涯清單、國內外分類、作品紀錄與照片、封面、Google 相簿網址、eBird Worker 網址。CSV / TSV 及 Excel 名錄匯入。
- 清單頁可選擇使用 eBird 全球物種搜尋（中文名、英文名、學名）；搜尋結果能直接加入生涯鳥種。
- PWA 靜態頁面可離線開啟；不含線上地圖底圖的離線快取。

## 搜尋 eBird 物種

eBird 有提供公開 API（[API v2 文件](https://documenter.getpostman.com/view/664302/S1ENwy59?version=latest)）；taxonomy endpoint 支援 JSON、類別及名稱語系。API key 是綁定帳戶的個人 key，請勿把它寫進 GitHub Pages 的公開前端。ZIP 內附 `ebird-worker.js` 作為 Cloudflare Worker 代理，會合併 eBird 的中文及英文 taxonomy 名稱：

1. 到 eBird 的 [API key 頁面](https://ebird.org/api/keygen)申請個人 key。
2. 在 Cloudflare 建立一個 Worker（啟用 `workers.dev` 網址），貼上 `ebird-worker.js` 並部署。
3. 在 Worker 的 Settings → Variables and Secrets 新增 **Secret** `EBIRD_API_KEY`，貼上 key 後儲存並重新部署。key 只存在 Worker，不會進入 PWA 或 JSON 備份。
4. App「封面設定」貼上 Worker 的 HTTPS 根網址，例如 `https://your-worker.workers.dev`，儲存後到「生命清單」搜尋。

Worker 只允許 `https://chacotw.github.io` 呼叫，並只請求 eBird 的物種分類資料。App 在本機快取分類資料 7 天，搜尋字串由本機過濾，不會傳給 eBird。Cloudflare Workers Free 目前每日有 100,000 次請求上限；一般個人搜尋量通常遠低於此限制。[Cloudflare 官方限制](https://developers.cloudflare.com/workers/platform/limits/)

如果不想設定 Worker，仍可直接使用下面的 Excel / CSV 名錄匯入搜尋鳥種。

## 匯入 2026 台灣鳥類名錄

從[中華民國野鳥學會 2026 年臺灣鳥類名錄頁面](https://www.bird.org.tw/download/5698)下載 Excel，回到 App「鳥類圖鑑」底部選擇檔案。Excel 首次解析時會從 SheetJS 官方 CDN 下載解析器；名錄在瀏覽器中處理，不會上傳。也可使用 CSV 或 TSV。名錄匯入會以該名錄取代目前鳥種清單，同名鳥種原有封面及紀錄會保留。

## Google Photos Picker

此版本**沒有串接 Google Photos Picker API**。Google 官方 Picker 要求開發者建立 Cloud 專案、啟用 API、設定 OAuth 用戶端及同意畫面；GitHub Pages 的純靜態檔案不能安全保存用戶端密鑰，也不應假裝已完成 OAuth。現有可靠流程是把相片下載到手機 / 電腦後，從「封面設定」選取本機相片，再貼上 Google 相簿分享網址。Picker 若要正式整合，需先建立 Google Cloud OAuth 設定、限制授權網域為 GitHub Pages 網域並完成 Google 要求的驗證流程，再實作短效授權與 Picker session。

## 部署到既有 GitHub Pages

1. 解壓 ZIP。
2. 到 `https://github.com/chacotw/my-birding-app`，選 `Add file` → `Upload files`。
3. 上傳並覆蓋 `index.html`、`manifest.json`、`sw.js`，新增 `ebird.js`、`icon.svg` 及本說明檔。`ebird-worker.js` 是部署到 Cloudflare Worker 的程式，不要當成 Pages 前端檔案部署。
4. 提交到 `main`。GitHub Pages 會自動重新部署；稍候重新整理 `https://chacotw.github.io/my-birding-app/`。
5. 手機可在網站選單使用「加入主畫面」。更新後若看到舊版，完全關閉 App / 瀏覽器再開，或清除此網站的快取。

原型的 `icon-192.png` 與 `icon-512.png` 可繼續保留；此版本使用附帶的 SVG 圖示。

## 本機儲存提醒

資料存在每台裝置、每個瀏覽器各自的儲存區。清除網站資料、換瀏覽器或換手機不會自動同步；請定期用「下載完整備份」保存 JSON。匯入備份會取代目前的名錄、作品與設定。照片先縮小為 JPEG 後放入備份，請妥善保管備份檔。

## 名錄資料來源

中華民國野鳥學會，2026 年臺灣鳥類名錄（2026-08 修正）。本 App 不重新散布名錄檔，提供使用者從官方頁面取得並在本機匯入。

