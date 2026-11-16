const SPREADSHEET_ID = '1mNsRwLL-Dj04W43qnjgn6oVoShj7HukgCCt0JDepf40'
const BASE_URL = import.meta.env.BASE_URL

export const appConfig = {
  /** 網站名稱，定義於 .env 的 VITE_APP_NAME */
  appName: import.meta.env.VITE_APP_NAME,
  sheetCsvUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`,
  baseUrl: BASE_URL,
  /** 音檔與圖像由 scripts/sync-media.mjs 從 Drive 下載到 public/ */
  mediaManifestUrl: `${BASE_URL}media-manifest.json`,
} as const
