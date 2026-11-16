<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { MASK } from '@/domain/hideableField'

/** 句子圖像：預設直接顯示（CR 202611160951），被隱藏時顯示遮罩、點擊可揭曉 */
const props = defineProps<{
  src: string
  alt: string
  hidden: boolean
}>()

const isRevealed = ref(false)
const isVisible = computed(() => !props.hidden || isRevealed.value)

watch(
  () => props.hidden,
  () => (isRevealed.value = false),
)
</script>

<template>
  <img
    v-if="isVisible"
    class="lesson-image"
    :src="src"
    :alt="alt"
    loading="lazy"
    @click="hidden && (isRevealed = false)"
  />
  <button
    v-else
    type="button"
    class="lesson-image lesson-image--masked"
    aria-label="圖像已隱藏，點擊顯示"
    @click="isRevealed = true"
  >
    {{ MASK }}
  </button>
</template>

<style scoped>
.lesson-image {
  display: block;
  width: 100%;
  height: auto;
  max-height: 420px;
  margin-top: 12px;
  object-fit: contain;
  background: var(--color-subtle);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.lesson-image--masked {
  height: 120px;
  color: var(--color-text-muted);
  font-size: 18px;
  letter-spacing: 0.2em;
}
</style>
