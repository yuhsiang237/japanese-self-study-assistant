<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue'
import type { Playlist } from '@/domain/playlist'
import BaseIcon from './BaseIcon.vue'

const props = defineProps<{
  activePlaylist: Playlist | null
  hasPlaylists: boolean
}>()

const emit = defineEmits<{
  import: [file: File]
  exportAll: []
  exportActive: []
  rename: [name: string]
  remove: []
}>()

const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const nameInput = useTemplateRef<HTMLInputElement>('nameInput')
const isRenaming = ref(false)
const draftName = ref('')

function pickFile(): void {
  fileInput.value?.click()
}

function onFileChosen(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('import', file)
  input.value = ''
}

async function startRename(): Promise<void> {
  draftName.value = props.activePlaylist?.name ?? ''
  isRenaming.value = true
  await nextTick()
  nameInput.value?.select()
}

function commitRename(): void {
  if (!isRenaming.value) return
  isRenaming.value = false
  if (draftName.value !== props.activePlaylist?.name) emit('rename', draftName.value)
}

/** 供父元件在建立新清單後，直接進入命名狀態 */
defineExpose({ startRename })

function confirmRemove(): void {
  if (window.confirm(`確定刪除「${props.activePlaylist?.name}」？句子本身不會被刪除。`)) {
    emit('remove')
  }
}
</script>

<template>
  <div class="toolbar">
    <template v-if="activePlaylist">
      <input
        v-if="isRenaming"
        ref="nameInput"
        v-model="draftName"
        class="toolbar__name-input"
        aria-label="清單名稱"
        maxlength="40"
        @keydown.enter="commitRename"
        @keydown.esc="isRenaming = false"
        @blur="commitRename"
      />
      <h2 v-else class="toolbar__name">
        <button
          type="button"
          class="toolbar__name-button"
          title="點擊修改名稱"
          @click="startRename"
        >
          {{ activePlaylist.name }}
          <BaseIcon name="pencil" :size="14" class="toolbar__name-icon" />
        </button>
      </h2>

      <div class="toolbar__actions">
        <button type="button" class="text-button" @click="emit('exportActive')">
          <BaseIcon name="download" :size="15" /> 匯出
        </button>
        <button type="button" class="text-button" @click="confirmRemove">
          <BaseIcon name="trash" :size="15" /> 刪除
        </button>
      </div>
    </template>

    <div v-else class="toolbar__actions">
      <button type="button" class="text-button" @click="pickFile">
        <BaseIcon name="upload" :size="15" /> 匯入清單
      </button>
      <button
        type="button"
        class="text-button"
        :disabled="!hasPlaylists"
        @click="emit('exportAll')"
      >
        <BaseIcon name="download" :size="15" /> 匯出全部清單
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="application/json,.json"
      hidden
      @change="onFileChosen"
    />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
}

.toolbar__name,
.toolbar__name-input {
  margin: 0;
  min-width: 0;
  font-size: 17px;
  font-weight: 700;
}

.toolbar__name-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
}

.toolbar__name-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.toolbar__name-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: inherit;
}

.toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-left: auto;
}
</style>
