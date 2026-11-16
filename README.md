# 日文自習小幫手

以 Vue 官方腳手架 [create-vue](https://github.com/vuejs/create-vue)（`npm create vue@latest`，勾選 TypeScript、ESLint、Prettier）建立。
讀取 Google Sheet 的句子，並依編號對應 Google Drive 資料夾內的音檔（`1.mp3`）與圖像（`1.jpg` 等）。

## 開發環境

- Node.js `^22.18.0` 或 `>=24.12.0`
- 建議 IDE：[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## 指令

```sh
npm install        # 安裝套件
npm run sync:media # 從 Drive 一次下載全部音檔與圖像（首次與 Drive 有異動時執行）
npm run dev        # 開發
npm run build      # 型別檢查 + 建置到 dist/
npm run lint       # oxlint + ESLint
npm run format     # Prettier 格式化 src/
```

## 資料來源

| 來源 | 讀取方式 |
| --- | --- |
| Google Sheet | 瀏覽器直接讀 CSV（`gviz/tq?tqx=out:csv`），**改試算表後重新整理頁面即可** |
| Drive 音檔 / 圖像 | 手動執行 `npm run sync:media` 一次把檔案下載到 `public/audio/`、`public/images/`，並產生 `public/media-manifest.json` |

**為什麼要先下載？** Google Drive 會以 403 拒絕瀏覽器從其他網站嵌入的請求（`Sec-Fetch-Site: cross-site`），所以 `<audio>` / `<img>` 直接用 Drive 連結會失敗。下載成同網站的靜態檔後即可正常顯示與播放。

**新增或替換音檔、圖像後**需重新執行 `npm run sync:media`（`dev` / `build` 不會自動下載）。已下載且未變更的檔案會略過，Drive 上刪除的檔案也會一併移除。尚未執行過時，頁面仍會顯示句子，只是沒有音檔與圖像。

- 試算表欄位：編號、日文句子、假名、中文意思、備註（圖像欄已移除，改由 Drive 依編號取得，CR 20261116）
- 圖像支援 jpg / jpeg / jfif / png / gif / webp / avif，JPEG 類一律存成 `.jpg`

> Sheet 與 Drive 資料夾都必須維持「知道連結的任何人可檢視」。
> Sheet ID 設定在 `src/config/appConfig.ts`，音檔與圖像資料夾 ID 設定在 `scripts/sync-media.mjs`。
> 網站名稱（CR 202611161010）設定在 `.env` 的 `VITE_APP_NAME`，頁籤標題、頁首、鎖定畫面與匯出檔名都會套用。

## 播放模式

- **輪播**：依序播放，播到最後一句停止
- **循環**：全部播完後從第一句重新開始
- **單曲循環**：重複目前這一句

沒有音檔的句子播放鈕會停用，連續播放時會自動略過。

## 列表顯示

- 圖像預設直接顯示在每句下方（CR 202611160951）；備註預設收合，點「備註」展開

## 播放清單（CR 202611160957）

- 每句右側按鈕 → 勾選要加入的清單，或「新增清單並加入」
- 頁首分頁切換「全部」與各清單；播放時以「開始播放時所在的列表」為佇列，切換分頁不會打斷
- 自訂命名（CR 202611161006）：建立清單時立即出現名稱輸入框，預填自動名稱「播放清單 1」「播放清單 2」…（取第一個未使用的編號），直接輸入即為自訂名稱、按 Enter 則沿用自動名稱；之後點清單名稱即可修改。名稱不可空白或重複（匯入合併以名稱比對）
- 匯出：「全部」分頁可匯出全部清單；清單分頁可匯出單一清單（JSON）
- 匯入：同名清單只**新增**尚未存在的句子，不會刪除既有內容；不同名稱則建立新清單
- 清單存在瀏覽器（localStorage），換裝置請用匯出／匯入搬移

## 隱藏功能（CR 2026110941）

頁首「隱藏」列可個別隱藏 **日文句子／假名／中文意思／圖像**，被隱藏的內容顯示為 `*****`，供聽力辨識練習。

- 點擊單一句的 `*****` 可揭曉該句（再點一次隱藏），方便對答案
- 底部播放列與手機鎖定畫面（Media Session）同樣套用隱藏設定
- 播放模式與隱藏設定都會記在瀏覽器，下次開啟沿用

## 品牌圖示「自習之星」

採 Apple App 圖示設計語言（僅參考風格，未使用 Apple 商標元素），並依紅點設計獎評審面向檢視：創新與象徵、功能與自明性、形式品質、耐久性。

- **概念**：四芒星＝學習時的靈光一閃；星心負空間三角＝播放（聽力）；右上小星＝持續累積的進步
- **外型**：Apple 式連續曲率圓角——圓角 22.37%、轉角平滑 60%（與 Figma corner smoothing 相同演算法計算）
- **材質**：Apple 系統灰石墨漸層底 `#48484A → #1C1C1E`、頂緣細高光；白色符號帶極淡漸層（`#FFF → #E5E5EA`）與柔和投影
- **幾何**：四芒星四邊皆為四分之一圓弧；主星半徑 21、小星半徑 6，主星略偏左下、小星位於右上形成對角平衡
- **色彩**：黑白單色調；石墨底在淺色與深色頁籤上皆有足夠對比，不需反轉
- **小尺寸**：≤ 32px（瀏覽器頁籤）自動切換為置中單星、無投影的精簡版，16px 仍可辨識
- **原創性**：採用通用的四芒星語彙自行構成，黑白配色＋星心播放三角＋雙星構圖，與其他品牌的星形標誌明確區隔

| 檔案 | 用途 |
| --- | --- |
| `public/favicon.svg` | 瀏覽器頁籤、頁首 Logo（含深色模式與小尺寸響應） |
| `public/apple-touch-icon.png` | iOS／Android 加入主畫面（180 × 180，滿版、圖案置於 80% 安全區） |
| `design/icon-touch.svg` | 上列 PNG 的向量原稿；修改後以瀏覽器輸出 180 × 180 PNG 覆蓋 |

## 專案結構

```
src/
├─ assets/main.css  全域樣式與顏色變數（含深色模式）
├─ config/          設定（Sheet / 資料夾 ID）
├─ domain/          Lesson、PlaybackMode、HideableField、Playlist（命名／合併規則）
├─ services/        資料存取（試算表、媒體清單）
├─ composables/     useLessons、useAudioPlayer、useHiddenFields、usePlaylists、useMediaSession、useToast
├─ components/      UI 元件
└─ utils/           CSV、備註表格、檔案下載／讀取、storage
scripts/sync-media.mjs   npm run sync:media：從 Drive 下載音檔與圖像到 public/
```
