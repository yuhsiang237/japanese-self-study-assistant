<script setup lang="ts">
import { ref, watch } from 'vue'
import { MASK } from '@/domain/hideableField'

/** 被隱藏時顯示遮罩，點擊可單獨揭曉／再次隱藏 */
const props = defineProps<{
  text: string
  hidden: boolean
  lang?: string
}>()

const isRevealed = ref(false)

watch(
  () => props.hidden,
  () => (isRevealed.value = false),
)
</script>

<template>
  <span v-if="!hidden" :lang="lang">{{ text }}</span>
  <button
    v-else
    type="button"
    class="masked"
    :class="{ 'masked--revealed': isRevealed }"
    :lang="isRevealed ? lang : undefined"
    :aria-label="isRevealed ? undefined : '已隱藏，點擊顯示'"
    :aria-pressed="isRevealed"
    @click="isRevealed = !isRevealed"
  >
    {{ isRevealed ? text : MASK }}
  </button>
</template>

<style scoped>
.masked {
  display: inline;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  letter-spacing: 0.15em;
  color: var(--color-text-muted);
}

.masked--revealed {
  letter-spacing: normal;
  color: inherit;
  text-decoration: underline dotted var(--color-text-muted);
  text-underline-offset: 4px;
}
</style>
