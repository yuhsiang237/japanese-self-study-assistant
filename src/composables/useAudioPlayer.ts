import { computed, onScopeDispose, ref, shallowRef, watch, type Ref } from 'vue'
import { hasAudio, type Lesson } from '@/domain/lesson'
import { isPlaybackMode, PlaybackMode } from '@/domain/playbackMode'
import { readStorage, writeStorage } from '@/utils/storage'

const MODE_STORAGE_KEY = 'jp-review:playback-mode'
/** 播放超過此秒數時按「上一句」會先回到本句開頭 */
const RESTART_THRESHOLD_SECONDS = 3

function loadSavedMode(): PlaybackMode {
  const saved = readStorage(MODE_STORAGE_KEY)
  return isPlaybackMode(saved) ? saved : PlaybackMode.Sequential
}

/**
 * @param defaultQueue 尚未指定播放佇列時（例如直接按播放列的播放鈕）使用的列表
 */
export function useAudioPlayer(defaultQueue: Ref<readonly Lesson[]>) {
  const audio = new Audio()
  audio.preload = 'auto'

  const currentId = ref<string | null>(null)
  const isPlaying = ref(false)
  const isBuffering = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const errorMessage = ref<string | null>(null)
  const mode = ref<PlaybackMode>(loadSavedMode())

  /** 開始播放時所在的列表快照，切換檢視不會打斷正在播放的順序 */
  const queue = shallowRef<readonly Lesson[]>([])
  const playableQueue = computed(() => queue.value.filter(hasAudio))
  const currentIndex = computed(() =>
    playableQueue.value.findIndex((lesson) => lesson.id === currentId.value),
  )
  const currentLesson = computed(() => playableQueue.value[currentIndex.value] ?? null)
  const progress = computed(() => (duration.value > 0 ? currentTime.value / duration.value : 0))

  watch(mode, (value) => writeStorage(MODE_STORAGE_KEY, value))

  async function startPlayback(): Promise<void> {
    try {
      errorMessage.value = null
      await audio.play()
    } catch (error) {
      // 使用者快速切換曲目時，前一個 play() 會被中斷，屬正常情況
      if (error instanceof DOMException && error.name === 'AbortError') return
      isPlaying.value = false
      errorMessage.value = '音檔無法播放，請稍後再試'
    }
  }

  function play(lesson: Lesson, newQueue?: readonly Lesson[]): void {
    if (!lesson.audioUrl) return
    if (newQueue) queue.value = newQueue
    if (currentId.value !== lesson.id) {
      currentId.value = lesson.id
      currentTime.value = 0
      duration.value = 0
      audio.src = lesson.audioUrl
    } else {
      audio.currentTime = 0
    }
    void startPlayback()
  }

  function pause(): void {
    audio.pause()
  }

  function togglePlayPause(): void {
    if (!currentLesson.value) {
      const first = defaultQueue.value.find(hasAudio)
      if (first) play(first, defaultQueue.value)
      return
    }
    if (audio.paused) void startPlayback()
    else pause()
  }

  /** 列表上的播放鈕：點同一句切換暫停，點別句以該列表為佇列開始播放 */
  function toggle(lesson: Lesson, fromQueue: readonly Lesson[]): void {
    if (lesson.id === currentId.value && currentLesson.value) togglePlayPause()
    else play(lesson, fromQueue)
  }

  function lessonAt(offset: number, wrap: boolean): Lesson | null {
    const total = playableQueue.value.length
    if (total === 0) return null
    const target = currentIndex.value + offset
    if (wrap) return playableQueue.value[(target + total) % total] ?? null
    return playableQueue.value[target] ?? null
  }

  function next(): void {
    const lesson = lessonAt(1, true)
    if (lesson) play(lesson)
  }

  function previous(): void {
    if (currentTime.value > RESTART_THRESHOLD_SECONDS) {
      audio.currentTime = 0
      return
    }
    const lesson = lessonAt(-1, true)
    if (lesson) play(lesson)
  }

  function seek(ratio: number): void {
    if (duration.value <= 0) return
    audio.currentTime = Math.min(Math.max(ratio, 0), 1) * duration.value
  }

  function handleEnded(): void {
    const current = currentLesson.value
    switch (mode.value) {
      case PlaybackMode.RepeatOne:
        if (current) play(current)
        break
      case PlaybackMode.RepeatAll:
        next()
        break
      case PlaybackMode.Sequential: {
        const upcoming = lessonAt(1, false)
        if (upcoming) play(upcoming)
        break
      }
    }
  }

  const audioListeners: Record<string, () => void> = {
    play: () => (isPlaying.value = true),
    pause: () => (isPlaying.value = false),
    waiting: () => (isBuffering.value = true),
    playing: () => (isBuffering.value = false),
    canplay: () => (isBuffering.value = false),
    timeupdate: () => (currentTime.value = audio.currentTime),
    loadedmetadata: () => (duration.value = audio.duration),
    ended: handleEnded,
  }
  Object.entries(audioListeners).forEach(([event, handler]) =>
    audio.addEventListener(event, handler),
  )

  onScopeDispose(() => {
    audio.pause()
    Object.entries(audioListeners).forEach(([event, handler]) =>
      audio.removeEventListener(event, handler),
    )
  })

  return {
    mode,
    currentLesson,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    progress,
    errorMessage,
    hasPlayableLessons: computed(
      () => defaultQueue.value.some(hasAudio) || currentLesson.value !== null,
    ),
    toggle,
    togglePlayPause,
    next,
    previous,
    seek,
  }
}
