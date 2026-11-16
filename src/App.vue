<script setup lang="ts">
import { computed, nextTick, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import AddToPlaylistSheet from '@/components/AddToPlaylistSheet.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import HiddenFieldsSwitch from '@/components/HiddenFieldsSwitch.vue'
import LessonRow from '@/components/LessonRow.vue'
import LibraryTabs from '@/components/LibraryTabs.vue'
import PlaybackModeSwitch from '@/components/PlaybackModeSwitch.vue'
import PlayerBar from '@/components/PlayerBar.vue'
import PlaylistToolbar from '@/components/PlaylistToolbar.vue'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import { appConfig } from '@/config/appConfig'
import { useHiddenFields } from '@/composables/useHiddenFields'
import { useLessons } from '@/composables/useLessons'
import { useMediaSession, type MediaInfo } from '@/composables/useMediaSession'
import { usePlaylists } from '@/composables/usePlaylists'
import { useToast } from '@/composables/useToast'
import { HideableField, maskIfHidden } from '@/domain/hideableField'
import type { Lesson } from '@/domain/lesson'

const { lessons, isLoading, errorMessage, load } = useLessons()
const { hiddenFields, isHidden, toggleField } = useHiddenFields()
const library = usePlaylists()
const { playlists, activeId, activePlaylist } = library
const toast = useToast()

const lessonById = computed(() => new Map(lessons.value.map((lesson) => [lesson.id, lesson])))

/** 目前檢視的列表：「全部」或某個播放清單（依加入順序） */
const visibleLessons = computed<Lesson[]>(() => {
  if (!activePlaylist.value) return lessons.value
  return activePlaylist.value.lessonIds.flatMap((id) => lessonById.value.get(id) ?? [])
})

const player = useAudioPlayer(visibleLessons)
const { mode, currentLesson, isPlaying, isBuffering, progress } = player

watch(player.errorMessage, (message) => message && toast.show(message))

/** 鎖定畫面也要套用隱藏設定，避免聽力練習時直接看到答案 */
function describeForMediaSession(lesson: Lesson): MediaInfo {
  return {
    title: maskIfHidden(lesson.sentence, isHidden(HideableField.Sentence)),
    artist: `第 ${lesson.id} 句 · ${maskIfHidden(lesson.meaning, isHidden(HideableField.Meaning))}`,
  }
}

useMediaSession(currentLesson, player, describeForMediaSession)

// ── 播放清單操作 ──────────────────────────────
const sheetLesson = shallowRef<Lesson | null>(null)
const toolbar = useTemplateRef<InstanceType<typeof PlaylistToolbar>>('toolbar')

/** 先以自動名稱建立，並立即進入命名狀態，讓使用者可直接輸入自訂名稱 */
async function createPlaylist(): Promise<void> {
  const playlist = library.create()
  activeId.value = playlist.id
  await nextTick()
  toolbar.value?.startRename()
}

function createPlaylistWithLesson(lesson: Lesson, name: string): void {
  try {
    const playlist = library.create({ name, lessonIds: [lesson.id] })
    toast.show(`已建立「${playlist.name}」並加入第 ${lesson.id} 句`)
  } catch (error) {
    toast.show(error instanceof Error ? error.message : '建立清單失敗')
  }
}

function renameActive(name: string): void {
  if (!activeId.value) return
  try {
    library.rename(activeId.value, name)
  } catch (error) {
    toast.show(error instanceof Error ? error.message : '重新命名失敗')
  }
}

function removeActive(): void {
  if (activeId.value) library.remove(activeId.value)
}

function exportActive(): void {
  if (activeId.value) library.exportOne(activeId.value)
}

async function importPlaylists(file: File): Promise<void> {
  try {
    const { createdCount, mergedCount, addedLessonCount } = await library.importFile(file)
    toast.show(
      `匯入完成：新增 ${createdCount} 個、合併 ${mergedCount} 個清單，加入 ${addedLessonCount} 句`,
    )
  } catch (error) {
    toast.show(error instanceof Error ? error.message : '匯入失敗')
  }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <main class="feed">
      <header class="feed__header">
        <div class="feed__title-row">
          <h1 class="feed__title">
            <img class="feed__logo" :src="`${appConfig.baseUrl}favicon.svg`" alt="" />
            {{ appConfig.appName }}
          </h1>
          <span v-if="lessons.length" class="feed__count">{{ visibleLessons.length }} 句</span>
        </div>
        <LibraryTabs
          :playlists="playlists"
          :active-id="activeId"
          @select="activeId = $event"
          @create="createPlaylist"
        />
      </header>

      <section class="feed__settings" aria-label="設定">
        <div class="feed__control">
          <span class="feed__control-label">播放</span>
          <PlaybackModeSwitch v-model="mode" />
        </div>
        <div class="feed__control">
          <span class="feed__control-label">隱藏</span>
          <HiddenFieldsSwitch :hidden-fields="hiddenFields" @toggle="toggleField" />
        </div>
        <PlaylistToolbar
          ref="toolbar"
          :active-playlist="activePlaylist"
          :has-playlists="playlists.length > 0"
          @import="importPlaylists"
          @export-all="library.exportAll"
          @export-active="exportActive"
          @rename="renameActive"
          @remove="removeActive"
        />
      </section>

      <p v-if="isLoading" class="feed__status">載入中…</p>

      <div v-else-if="errorMessage" class="feed__status">
        <p>{{ errorMessage }}</p>
        <button type="button" class="text-button" @click="load">
          <BaseIcon name="refresh" :size="15" /> 重新載入
        </button>
      </div>

      <p v-else-if="activePlaylist && visibleLessons.length === 0" class="feed__status">
        這個清單還沒有句子<br />到「全部」點每句右側的按鈕即可加入
      </p>

      <p v-else-if="visibleLessons.length === 0" class="feed__status">目前沒有句子</p>

      <ul v-else class="feed__list">
        <LessonRow
          v-for="lesson in visibleLessons"
          :key="lesson.id"
          :lesson="lesson"
          :is-current="currentLesson?.id === lesson.id"
          :is-playing="isPlaying"
          :hidden-fields="hiddenFields"
          :is-in-playlist="library.isInAnyPlaylist(lesson.id)"
          @toggle="player.toggle($event, visibleLessons)"
          @add-to-playlist="sheetLesson = $event"
        />
      </ul>

      <p v-if="toast.message.value" class="feed__toast" role="status">
        {{ toast.message.value }}
      </p>

      <PlayerBar
        v-if="player.hasPlayableLessons.value"
        :lesson="currentLesson"
        :is-playing="isPlaying"
        :is-buffering="isBuffering"
        :progress="progress"
        :hidden-fields="hiddenFields"
        @toggle-play-pause="player.togglePlayPause"
        @next="player.next"
        @previous="player.previous"
        @seek="player.seek"
      />
    </main>

    <AddToPlaylistSheet
      v-if="sheetLesson"
      :lesson="sheetLesson"
      :playlists="playlists"
      :suggested-name="library.suggestName()"
      @toggle="library.toggleLesson($event, sheetLesson.id)"
      @create-with-lesson="createPlaylistWithLesson(sheetLesson, $event)"
      @close="sheetLesson = null"
    />
  </div>
</template>

<style scoped>
.page {
  min-height: 100dvh;
  display: flex;
  justify-content: center;
}

.feed {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 640px;
  /* flex 子項預設 min-width: auto，會被不換行的膠囊列撐寬而超出螢幕 */
  min-width: 0;
  min-height: 100dvh;
  background: var(--color-surface);
}

.feed__header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  padding: 20px 20px 12px;
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  border-bottom: 1px solid var(--color-border);
}

.feed__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.feed__title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.feed__logo {
  width: 28px;
  height: 28px;
}

.feed__count {
  font-size: 14px;
  color: var(--color-text-muted);
}

.feed__settings {
  display: grid;
  /* minmax(0, 1fr)：避免可橫向捲動的膠囊列撐寬整頁 */
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border);
}

.feed__control {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.feed__control-label {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

.feed__list {
  flex: 1;
  margin: 0;
  padding: 0;
  list-style: none;
}

.feed__status {
  flex: 1;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 12px;
  margin: 0;
  padding: 64px 20px;
  color: var(--color-text-muted);
  text-align: center;
  line-height: 1.8;
}

.feed__status p {
  margin: 0;
}

.feed__toast {
  position: sticky;
  bottom: 96px;
  z-index: 2;
  align-self: center;
  max-width: calc(100% - 32px);
  margin: 0;
  padding: 10px 16px;
  border-radius: 16px;
  background: var(--color-text);
  color: var(--color-surface);
  font-size: 14px;
  text-align: center;
}

@media (min-width: 700px) {
  .page {
    padding: 0 16px;
  }

  .feed {
    border-left: 1px solid var(--color-border);
    border-right: 1px solid var(--color-border);
  }
}
</style>
