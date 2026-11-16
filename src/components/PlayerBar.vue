<script setup lang="ts">
import { computed } from 'vue'
import { HideableField, maskIfHidden } from '@/domain/hideableField'
import type { Lesson } from '@/domain/lesson'
import BaseIcon from './BaseIcon.vue'
import PlayButton from './PlayButton.vue'

const props = defineProps<{
  lesson: Lesson | null
  isPlaying: boolean
  isBuffering: boolean
  progress: number
  hiddenFields: ReadonlySet<HideableField>
}>()

const title = computed(() =>
  props.lesson
    ? maskIfHidden(props.lesson.sentence, props.hiddenFields.has(HideableField.Sentence))
    : '',
)
const subtitle = computed(() => {
  if (!props.lesson) return '點任一句的播放鈕開始'
  if (props.isBuffering) return '載入中…'
  const meaning = maskIfHidden(props.lesson.meaning, props.hiddenFields.has(HideableField.Meaning))
  return `第 ${props.lesson.id} 句 · ${meaning}`
})

const emit = defineEmits<{
  togglePlayPause: []
  next: []
  previous: []
  seek: [ratio: number]
}>()

const SEEK_STEP = 0.05

function seekFromPointer(event: PointerEvent): void {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  emit('seek', (event.clientX - rect.left) / rect.width)
}

function seekFromKeyboard(direction: 1 | -1): void {
  emit('seek', props.progress + direction * SEEK_STEP)
}
</script>

<template>
  <footer class="player" aria-label="播放器">
    <div
      class="player__progress"
      role="slider"
      tabindex="0"
      aria-label="播放進度"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(progress * 100)"
      @pointerdown="seekFromPointer"
      @keydown.right.prevent="seekFromKeyboard(1)"
      @keydown.left.prevent="seekFromKeyboard(-1)"
    >
      <div class="player__progress-fill" :style="{ transform: `scaleX(${progress})` }" />
    </div>

    <div class="player__content">
      <div class="player__info">
        <p v-if="lesson" class="player__title" lang="ja">{{ title }}</p>
        <p class="player__subtitle">{{ subtitle }}</p>
      </div>

      <div class="player__controls">
        <button type="button" class="player__skip" aria-label="上一句" @click="emit('previous')">
          <BaseIcon name="previous" :size="18" />
        </button>
        <PlayButton
          size="lg"
          :playing="isPlaying"
          :label="isPlaying ? '暫停' : '播放'"
          @click="emit('togglePlayPause')"
        />
        <button type="button" class="player__skip" aria-label="下一句" @click="emit('next')">
          <BaseIcon name="next" :size="18" />
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.player {
  position: sticky;
  bottom: 0;
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom);
}

.player__progress {
  position: relative;
  height: 14px;
  margin-top: -7px;
  cursor: pointer;
  touch-action: none;
}

.player__progress::before,
.player__progress-fill {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 6px;
  height: 2px;
}

.player__progress::before {
  background: var(--color-border);
}

.player__progress-fill {
  background: var(--color-text);
  transform-origin: left center;
}

.player__content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px 12px 20px;
}

.player__info {
  flex: 1;
  min-width: 0;
}

.player__title,
.player__subtitle {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player__title {
  font-size: 15px;
  font-weight: 600;
}

.player__subtitle {
  margin-top: 2px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.player__controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.player__skip {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: none;
  color: var(--color-text);
}

.player__skip:active {
  background: var(--color-subtle);
}
</style>
