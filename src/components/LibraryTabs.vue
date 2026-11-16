<script setup lang="ts">
import type { Playlist } from '@/domain/playlist'
import BaseIcon from './BaseIcon.vue'

defineProps<{
  playlists: readonly Playlist[]
  /** null 代表「全部」 */
  activeId: string | null
}>()

defineEmits<{
  select: [id: string | null]
  create: []
}>()
</script>

<template>
  <nav class="chip-group" aria-label="播放清單">
    <button
      type="button"
      class="chip"
      :class="{ 'chip--active': activeId === null }"
      :aria-current="activeId === null ? 'page' : undefined"
      @click="$emit('select', null)"
    >
      全部
    </button>
    <button
      v-for="playlist in playlists"
      :key="playlist.id"
      type="button"
      class="chip"
      :class="{ 'chip--active': activeId === playlist.id }"
      :aria-current="activeId === playlist.id ? 'page' : undefined"
      @click="$emit('select', playlist.id)"
    >
      {{ playlist.name }}
      <span class="tab__count">{{ playlist.lessonIds.length }}</span>
    </button>
    <button type="button" class="chip" aria-label="新增播放清單" @click="$emit('create')">
      <BaseIcon name="plus" :size="15" />
      新清單
    </button>
  </nav>
</template>

<style scoped>
.tab__count {
  font-size: 12px;
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
}
</style>
