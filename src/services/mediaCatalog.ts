import { appConfig } from '@/config/appConfig'

/** 編號 → 網站內的媒體網址 */
type MediaUrls = ReadonlyMap<string, string>

export interface MediaCatalog {
  readonly audio: MediaUrls
  readonly images: MediaUrls
}

/** 由 scripts/sync-media.mjs 產生；file 為相對於網站根目錄的路徑 */
type ManifestSection = Record<string, { file: string }>

interface MediaManifest {
  audio?: ManifestSection
  images?: ManifestSection
}

function toUrls(section: ManifestSection = {}): MediaUrls {
  return new Map(
    Object.entries(section).map(([number, { file }]) => [number, `${appConfig.baseUrl}${file}`]),
  )
}

async function fetchManifest(): Promise<MediaManifest> {
  try {
    const response = await fetch(appConfig.mediaManifestUrl)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return (await response.json()) as MediaManifest
  } catch (error) {
    // 尚未執行 npm run sync:media 時，句子照常顯示，只是沒有音檔與圖像
    console.warn('找不到媒體清單，請先執行 npm run sync:media', error)
    return {}
  }
}

export async function loadMediaCatalog(): Promise<MediaCatalog> {
  const manifest = await fetchManifest()
  return { audio: toUrls(manifest.audio), images: toUrls(manifest.images) }
}
