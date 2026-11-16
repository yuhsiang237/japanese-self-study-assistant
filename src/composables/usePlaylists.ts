import { computed, ref, watch } from 'vue'
import { appConfig } from '@/config/appConfig'
import {
  createAutoName,
  createPlaylistId,
  isPlaylist,
  mergePlaylists,
  parseExportFile,
  toExportFile,
  toggleLessonId,
  validateName,
  type MergeResult,
  type Playlist,
} from '@/domain/playlist'
import { downloadJson, readJsonFile, todayStamp, toSafeFileName } from '@/utils/file'
import { readStorage, writeStorage } from '@/utils/storage'

const PLAYLISTS_KEY = 'jp-review:playlists'
const ACTIVE_KEY = 'jp-review:active-playlist'

function loadPlaylists(): Playlist[] {
  try {
    const saved: unknown = JSON.parse(readStorage(PLAYLISTS_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter(isPlaylist) : []
  } catch {
    return []
  }
}

export function usePlaylists() {
  const playlists = ref<Playlist[]>(loadPlaylists())
  const savedActiveId = readStorage(ACTIVE_KEY)
  /** null 代表「全部」 */
  const activeId = ref<string | null>(
    playlists.value.some((playlist) => playlist.id === savedActiveId) ? savedActiveId : null,
  )

  const activePlaylist = computed(
    () => playlists.value.find((playlist) => playlist.id === activeId.value) ?? null,
  )

  watch(playlists, (value) => writeStorage(PLAYLISTS_KEY, JSON.stringify(value)), { deep: true })
  watch(activeId, (value) => writeStorage(ACTIVE_KEY, value ?? ''))

  function namesExcept(id?: string): string[] {
    return playlists.value.filter((playlist) => playlist.id !== id).map(({ name }) => name)
  }

  function update(id: string, change: (playlist: Playlist) => Playlist): void {
    playlists.value = playlists.value.map((playlist) =>
      playlist.id === id ? change(playlist) : playlist,
    )
  }

  /** 下一個自動名稱，作為自訂命名時的預設值 */
  function suggestName(): string {
    return createAutoName(namesExcept())
  }

  /**
   * 建立清單；未指定名稱時自動命名（CR 202611161006：可自訂名稱）
   * @throws PlaylistError 自訂名稱空白或重複
   */
  function create(options: { name?: string; lessonIds?: string[] } = {}): Playlist {
    const playlist: Playlist = {
      id: createPlaylistId(),
      name: options.name === undefined ? suggestName() : validateName(options.name, namesExcept()),
      lessonIds: options.lessonIds ?? [],
    }
    playlists.value = [...playlists.value, playlist]
    return playlist
  }

  /** @throws PlaylistError 名稱空白或重複 */
  function rename(id: string, name: string): void {
    const validName = validateName(name, namesExcept(id))
    update(id, (playlist) => ({ ...playlist, name: validName }))
  }

  function remove(id: string): void {
    playlists.value = playlists.value.filter((playlist) => playlist.id !== id)
    if (activeId.value === id) activeId.value = null
  }

  function toggleLesson(id: string, lessonId: string): void {
    update(id, (playlist) => ({
      ...playlist,
      lessonIds: toggleLessonId(playlist.lessonIds, lessonId),
    }))
  }

  function isInAnyPlaylist(lessonId: string): boolean {
    return playlists.value.some((playlist) => playlist.lessonIds.includes(lessonId))
  }

  function exportAll(): void {
    downloadJson(
      `${appConfig.appName}-播放清單-${todayStamp()}.json`,
      toExportFile(playlists.value),
    )
  }

  function exportOne(id: string): void {
    const playlist = playlists.value.find((item) => item.id === id)
    if (playlist) downloadJson(`${toSafeFileName(playlist.name)}.json`, toExportFile([playlist]))
  }

  /** @throws PlaylistError / Error 檔案格式錯誤 */
  async function importFile(file: File): Promise<MergeResult> {
    const incoming = parseExportFile(await readJsonFile(file))
    const result = mergePlaylists(playlists.value, incoming)
    playlists.value = result.playlists
    return result
  }

  return {
    playlists,
    activeId,
    activePlaylist,
    suggestName,
    create,
    rename,
    remove,
    toggleLesson,
    isInAnyPlaylist,
    exportAll,
    exportOne,
    importFile,
  }
}
