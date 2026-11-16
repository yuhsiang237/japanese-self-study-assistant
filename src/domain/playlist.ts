/** 播放清單（CR 202611160957） */
export interface Playlist {
  readonly id: string
  readonly name: string
  /** 依加入順序排列的句子編號 */
  readonly lessonIds: readonly string[]
}

/** 匯出／匯入檔中的清單內容（不含本機 id） */
export interface PlaylistData {
  readonly name: string
  readonly lessonIds: readonly string[]
}

export interface PlaylistExportFile {
  readonly app: typeof EXPORT_APP_ID
  readonly version: typeof EXPORT_VERSION
  readonly exportedAt: string
  readonly playlists: readonly PlaylistData[]
}

export interface MergeResult {
  readonly playlists: Playlist[]
  readonly createdCount: number
  readonly mergedCount: number
  readonly addedLessonCount: number
}

const AUTO_NAME_PREFIX = '播放清單'
const EXPORT_APP_ID = 'jp-review-playlists'
const EXPORT_VERSION = 1

export class PlaylistError extends Error {}

export function createPlaylistId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** 自動命名：播放清單 1、播放清單 2…，取第一個未被使用的編號 */
export function createAutoName(existingNames: readonly string[]): string {
  const taken = new Set(existingNames)
  let number = 1
  while (taken.has(`${AUTO_NAME_PREFIX} ${number}`)) number++
  return `${AUTO_NAME_PREFIX} ${number}`
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

/** 名稱為匯入合併的依據，因此不可空白也不可重複 */
export function validateName(name: string, otherNames: readonly string[]): string {
  const normalized = normalizeName(name)
  if (!normalized) throw new PlaylistError('清單名稱不可空白')
  if (otherNames.includes(normalized)) throw new PlaylistError(`已有名為「${normalized}」的清單`)
  return normalized
}

export function toggleLessonId(lessonIds: readonly string[], lessonId: string): string[] {
  return lessonIds.includes(lessonId)
    ? lessonIds.filter((id) => id !== lessonId)
    : [...lessonIds, lessonId]
}

export function toExportFile(playlists: readonly Playlist[]): PlaylistExportFile {
  return {
    app: EXPORT_APP_ID,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    playlists: playlists.map(({ name, lessonIds }) => ({ name, lessonIds: [...lessonIds] })),
  }
}

function isPlaylistData(value: unknown): value is PlaylistData {
  if (typeof value !== 'object' || value === null) return false
  const { name, lessonIds } = value as Record<string, unknown>
  return (
    typeof name === 'string' &&
    normalizeName(name) !== '' &&
    Array.isArray(lessonIds) &&
    lessonIds.every((id) => typeof id === 'string')
  )
}

export function isPlaylist(value: unknown): value is Playlist {
  return isPlaylistData(value) && typeof (value as { id?: unknown }).id === 'string'
}

export function parseExportFile(raw: unknown): PlaylistData[] {
  const file = raw as Partial<PlaylistExportFile> | null
  if (file?.app !== EXPORT_APP_ID || !Array.isArray(file.playlists)) {
    throw new PlaylistError('檔案格式不正確，請選擇由本網站匯出的清單檔')
  }
  if (!file.playlists.every(isPlaylistData)) {
    throw new PlaylistError('清單檔內容有誤，無法匯入')
  }
  return file.playlists.map(({ name, lessonIds }) => ({
    name: normalizeName(name),
    lessonIds: [...new Set(lessonIds)],
  }))
}

/**
 * 合併匯入的清單：
 * - 同名清單：只新增尚未存在的句子，既有句子與順序不變、不會刪除
 * - 新名稱：建立新清單
 */
export function mergePlaylists(
  existing: readonly Playlist[],
  incoming: readonly PlaylistData[],
): MergeResult {
  const result = [...existing]
  let createdCount = 0
  let mergedCount = 0
  let addedLessonCount = 0

  for (const data of incoming) {
    const index = result.findIndex((playlist) => playlist.name === data.name)
    const target = result[index]

    if (!target) {
      result.push({ id: createPlaylistId(), name: data.name, lessonIds: [...data.lessonIds] })
      createdCount++
      addedLessonCount += data.lessonIds.length
      continue
    }

    const newIds = data.lessonIds.filter((id) => !target.lessonIds.includes(id))
    result[index] = { ...target, lessonIds: [...target.lessonIds, ...newIds] }
    mergedCount++
    addedLessonCount += newIds.length
  }

  return { playlists: result, createdCount, mergedCount, addedLessonCount }
}
