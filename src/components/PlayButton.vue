<script setup lang="ts">
import BaseIcon from './BaseIcon.vue'

withDefaults(
  defineProps<{
    playing: boolean
    disabled?: boolean
    size?: 'sm' | 'lg'
    label: string
  }>(),
  { disabled: false, size: 'sm' },
)

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="play-button"
    :class="[`play-button--${size}`, { 'play-button--active': playing }]"
    :disabled="disabled"
    :aria-label="label"
    :title="label"
    @click.stop="$emit('click')"
  >
    <BaseIcon :name="playing ? 'pause' : 'play'" :size="size === 'lg' ? 22 : 16" />
  </button>
</template>

<style scoped>
.play-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  transition:
    transform 0.15s ease,
    background-color 0.15s ease;
}

.play-button--sm {
  width: 36px;
  height: 36px;
}

.play-button--lg {
  width: 48px;
  height: 48px;
  border: none;
  background: var(--color-text);
  color: var(--color-surface);
}

.play-button--sm.play-button--active {
  background: var(--color-text);
  border-color: var(--color-text);
  color: var(--color-surface);
}

.play-button:not(:disabled):active {
  transform: scale(0.92);
}

.play-button:disabled {
  color: var(--color-text-muted);
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
