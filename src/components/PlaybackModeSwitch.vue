<script setup lang="ts">
import { PLAYBACK_MODE_LABELS, PLAYBACK_MODES, PlaybackMode } from '@/domain/playbackMode'
import BaseIcon, { type IconName } from './BaseIcon.vue'

const mode = defineModel<PlaybackMode>({ required: true })

const MODE_ICONS: Record<PlaybackMode, IconName> = {
  [PlaybackMode.Sequential]: 'sequential',
  [PlaybackMode.RepeatAll]: 'repeat-all',
  [PlaybackMode.RepeatOne]: 'repeat-one',
}
</script>

<template>
  <div class="chip-group" role="radiogroup" aria-label="播放模式">
    <button
      v-for="option in PLAYBACK_MODES"
      :key="option"
      type="button"
      role="radio"
      class="chip"
      :class="{ 'chip--active': mode === option }"
      :aria-checked="mode === option"
      @click="mode = option"
    >
      <BaseIcon :name="MODE_ICONS[option]" :size="15" />
      <span>{{ PLAYBACK_MODE_LABELS[option] }}</span>
    </button>
  </div>
</template>
