<script setup lang="ts">
import { computed, ref } from 'vue'
import { HideableField } from '@/domain/hideableField'
import { hasAudio, type Lesson } from '@/domain/lesson'
import BaseIcon from './BaseIcon.vue'
import LessonImage from './LessonImage.vue'
import LessonNote from './LessonNote.vue'
import MaskedText from './MaskedText.vue'
import PlayButton from './PlayButton.vue'

const props = defineProps<{
  lesson: Lesson
  isCurrent: boolean
  isPlaying: boolean
  hiddenFields: ReadonlySet<HideableField>
  isInPlaylist: boolean
}>()

defineEmits<{
  toggle: [lesson: Lesson]
  addToPlaylist: [lesson: Lesson]
}>()

const isNoteExpanded = ref(false)
const canPlay = computed(() => hasAudio(props.lesson))
const playLabel = computed(() => {
  if (!canPlay.value) return '尚無音檔'
  return props.isCurrent && props.isPlaying ? '暫停' : `播放第 ${props.lesson.id} 句`
})
</script>

<template>
  <li class="row" :class="{ 'row--current': isCurrent }">
    <div class="row__leading">
      <PlayButton
        :playing="isCurrent && isPlaying"
        :disabled="!canPlay"
        :label="playLabel"
        @click="$emit('toggle', lesson)"
      />
      <span class="row__number">{{ lesson.id }}</span>
    </div>

    <div class="row__body">
      <p class="row__sentence">
        <MaskedText
          :text="lesson.sentence"
          :hidden="hiddenFields.has(HideableField.Sentence)"
          lang="ja"
        />
      </p>
      <p v-if="lesson.kana" class="row__kana">
        <MaskedText :text="lesson.kana" :hidden="hiddenFields.has(HideableField.Kana)" lang="ja" />
      </p>
      <p class="row__meaning">
        <MaskedText :text="lesson.meaning" :hidden="hiddenFields.has(HideableField.Meaning)" />
      </p>

      <LessonImage
        v-if="lesson.imageUrl"
        :src="lesson.imageUrl"
        :alt="`第 ${lesson.id} 句圖像`"
        :hidden="hiddenFields.has(HideableField.Image)"
      />

      <template v-if="lesson.note">
        <button
          type="button"
          class="row__expand"
          :aria-expanded="isNoteExpanded"
          @click="isNoteExpanded = !isNoteExpanded"
        >
          {{ isNoteExpanded ? '收合備註' : '備註' }}
          <BaseIcon
            name="chevron"
            :size="14"
            class="row__chevron"
            :class="{ 'row__chevron--open': isNoteExpanded }"
          />
        </button>
        <LessonNote v-if="isNoteExpanded" :note="lesson.note" />
      </template>
    </div>

    <button
      type="button"
      class="row__playlist"
      :class="{ 'row__playlist--added': isInPlaylist }"
      :aria-label="`將第 ${lesson.id} 句加入播放清單`"
      :title="isInPlaylist ? '已在播放清單中' : '加入播放清單'"
      @click="$emit('addToPlaylist', lesson)"
    >
      <BaseIcon :name="isInPlaylist ? 'list-check' : 'list-add'" :size="20" />
    </button>
  </li>
</template>

<style scoped>
.row {
  display: flex;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s ease;
}

.row--current {
  background: var(--color-subtle);
}

.row__leading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.row__number {
  font-size: 12px;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.row__body {
  flex: 1;
  min-width: 0;
}

.row__sentence {
  margin: 6px 0 0;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.55;
}

.row__kana {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.row__meaning {
  margin: 8px 0 0;
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.55;
}

.row__expand {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 500;
}

.row__playlist {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  margin-right: -8px;
  border: none;
  border-radius: 50%;
  background: none;
  color: var(--color-text-muted);
}

.row__playlist--added {
  color: var(--color-text);
}

.row__playlist:active {
  background: var(--color-subtle);
}

.row__chevron {
  transition: transform 0.2s ease;
}

.row__chevron--open {
  transform: rotate(180deg);
}
</style>
