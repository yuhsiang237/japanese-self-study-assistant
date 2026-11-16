import { watch, type Ref } from 'vue'
import { appConfig } from '@/config/appConfig'
import type { Lesson } from '@/domain/lesson'

interface MediaControls {
  togglePlayPause: () => void
  next: () => void
  previous: () => void
}

export interface MediaInfo {
  title: string
  artist: string
}

/**
 * 讓鎖定畫面 / 耳機按鍵也能控制播放。
 * describe 由呼叫端決定顯示內容，以便配合隱藏設定遮住答案。
 */
export function useMediaSession(
  currentLesson: Ref<Lesson | null>,
  controls: MediaControls,
  describe: (lesson: Lesson) => MediaInfo,
): void {
  if (!('mediaSession' in navigator)) return
  const session = navigator.mediaSession

  session.setActionHandler('play', controls.togglePlayPause)
  session.setActionHandler('pause', controls.togglePlayPause)
  session.setActionHandler('nexttrack', controls.next)
  session.setActionHandler('previoustrack', controls.previous)

  watch(
    () => (currentLesson.value ? describe(currentLesson.value) : null),
    (info) => {
      session.metadata = info ? new MediaMetadata({ ...info, album: appConfig.appName }) : null
    },
    { deep: true },
  )
}
