/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 網站名稱，定義於 .env */
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
