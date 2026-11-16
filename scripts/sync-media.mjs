/**
 * 同步公開 Google Drive 資料夾內的音檔與圖像到 public/，並產生 public/media-manifest.json。
 *
 * 為什麼要下載而不是直接用 Drive 連結：
 * Google Drive 會以 403 拒絕瀏覽器從其他網站嵌入的請求（Sec-Fetch-Site: cross-site），
 * 因此 <audio> / <img> 直接使用 Drive 連結會失敗。改為建置前下載成同網站的靜態檔。
 *
 * 檔名規則：Drive 上的「編號.副檔名」，例如編號 1 → 1.mp3、1.jpg
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url))
const MANIFEST_PATH = path.join(PUBLIC_DIR, 'media-manifest.json')
const ENTRY_PATTERN = /id="entry-([\w-]+)"[\s\S]*?flip-entry-title">([^<]+)</g

/** JPEG 有多種副檔名（.jfif 等），統一存成 .jpg 以確保瀏覽器與靜態主機正確辨識 */
const JPEG_EXTENSIONS = new Set(['jpg', 'jpeg', 'jfif', 'jpe'])

const MEDIA_SOURCES = [
  {
    key: 'audio',
    folderId: '1YToQsypWmZfuGK89-M52acSG__wuWJtm',
    directory: 'audio',
    extensions: new Set(['mp3']),
    contentTypePrefix: 'audio/',
  },
  {
    key: 'images',
    folderId: '1gqmIIcITRLUyiJlgfa4pm4ygk7JeTS17',
    directory: 'images',
    extensions: new Set([...JPEG_EXTENSIONS, 'png', 'gif', 'webp', 'avif']),
    contentTypePrefix: 'image/',
  },
]

const toFolderViewUrl = (folderId) => `https://drive.google.com/embeddedfolderview?id=${folderId}`
const toDownloadUrl = (fileId) =>
  `https://drive.usercontent.google.com/download?id=${fileId}&export=download`

function parseFileName(fileName) {
  const match = fileName.trim().match(/^(.+)\.([a-z0-9]+)$/i)
  if (!match) return null
  const extension = match[2].toLowerCase()
  return { number: match[1], extension, savedExtension: JPEG_EXTENSIONS.has(extension) ? 'jpg' : extension }
}

/** @returns {Promise<Array<{ number: string, driveId: string, file: string }>>} */
async function fetchFolderEntries(source) {
  const response = await fetch(toFolderViewUrl(source.folderId))
  if (!response.ok) throw new Error(`讀取 ${source.key} 資料夾失敗（HTTP ${response.status}）`)

  const entries = []
  for (const [, driveId, fileName] of (await response.text()).matchAll(ENTRY_PATTERN)) {
    const parsed = parseFileName(fileName)
    if (!parsed || !source.extensions.has(parsed.extension)) continue
    entries.push({ number: parsed.number, driveId, file: `${parsed.number}.${parsed.savedExtension}` })
  }
  return entries
}

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  } catch {
    return {}
  }
}

async function download(entry, source, targetPath) {
  const response = await fetch(toDownloadUrl(entry.driveId))
  const contentType = response.headers.get('content-type') ?? ''
  if (!response.ok || !contentType.startsWith(source.contentTypePrefix)) {
    throw new Error(`${entry.file} 下載失敗（HTTP ${response.status}, ${contentType}）`)
  }
  await writeFile(targetPath, Buffer.from(await response.arrayBuffer()))
}

/** 刪除 Drive 上已不存在的檔案 */
async function removeStaleFiles(directory, keptFiles) {
  for (const fileName of await readdir(directory)) {
    if (!keptFiles.has(fileName)) await rm(path.join(directory, fileName))
  }
}

async function syncSource(source, previous) {
  const directory = path.join(PUBLIC_DIR, source.directory)
  await mkdir(directory, { recursive: true })

  const synced = {}
  let downloaded = 0
  for (const entry of await fetchFolderEntries(source)) {
    const targetPath = path.join(directory, entry.file)
    const isUpToDate = previous[entry.number]?.driveId === entry.driveId && existsSync(targetPath)
    try {
      if (!isUpToDate) {
        await download(entry, source, targetPath)
        downloaded++
      }
      synced[entry.number] = { file: `${source.directory}/${entry.file}`, driveId: entry.driveId }
    } catch (error) {
      console.warn(`[sync:media] ${error.message}`)
    }
  }

  await removeStaleFiles(directory, new Set(Object.values(synced).map(({ file }) => path.basename(file))))
  console.log(`[sync:media] ${source.key}：共 ${Object.keys(synced).length} 個（本次下載 ${downloaded} 個）`)
  return synced
}

async function main() {
  const previous = await readManifest()
  const manifest = {}

  for (const source of MEDIA_SOURCES) {
    try {
      manifest[source.key] = await syncSource(source, previous[source.key] ?? {})
    } catch (error) {
      manifest[source.key] = previous[source.key] ?? {}
      console.warn(`[sync:media] ${source.key} 同步失敗，沿用既有檔案：${error.message}`)
    }
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n')
}

main()
