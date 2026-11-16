<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import type { Lesson } from '@/domain/lesson'
import { validateName, type Playlist } from '@/domain/playlist'
import BaseIcon from './BaseIcon.vue'

/** 從底部滑出的面板：勾選要把句子加入哪些清單，或自訂名稱建立新清單 */
const props = defineProps<{
  lesson: Lesson
  playlists: readonly Playlist[]
  /** 新清單的預設名稱（自動命名） */
  suggestedName: string
}>()

const emit = defineEmits<{
  toggle: [playlistId: string]
  createWithLesson: [name: string]
  close: []
}>()

const sheet = useTemplateRef<HTMLElement>('sheet')
const nameInput = useTemplateRef<HTMLInputElement>('nameInput')
const isCreating = ref(false)
const draftName = ref('')
const nameError = ref<string | null>(null)

async function startCreate(): Promise<void> {
  draftName.value = props.suggestedName
  nameError.value = null
  isCreating.value = true
  await nextTick()
  nameInput.value?.select()
}

function cancelCreate(): void {
  isCreating.value = false
  sheet.value?.focus()
}

function submitCreate(): void {
  try {
    const name = validateName(
      draftName.value,
      props.playlists.map((playlist) => playlist.name),
    )
    emit('createWithLesson', name)
    isCreating.value = false
  } catch (error) {
    nameError.value = error instanceof Error ? error.message : '名稱無效'
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  if (isCreating.value) cancelCreate()
  else emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  sheet.value?.focus()
})
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="backdrop" @click.self="emit('close')">
    <section
      ref="sheet"
      class="sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      tabindex="-1"
    >
      <header class="sheet__header">
        <h2 id="sheet-title" class="sheet__title">加入播放清單</h2>
        <span class="sheet__subtitle">第 {{ lesson.id }} 句</span>
      </header>

      <ul class="sheet__list">
        <li v-for="playlist in playlists" :key="playlist.id">
          <button
            type="button"
            class="sheet__item"
            :aria-pressed="playlist.lessonIds.includes(lesson.id)"
            @click="emit('toggle', playlist.id)"
          >
            <span class="sheet__item-name">{{ playlist.name }}</span>
            <span class="sheet__item-count">{{ playlist.lessonIds.length }} 句</span>
            <span
              class="sheet__check"
              :class="{ 'sheet__check--on': playlist.lessonIds.includes(lesson.id) }"
            >
              <BaseIcon name="check" :size="14" />
            </span>
          </button>
        </li>
        <li v-if="isCreating">
          <form class="sheet__create" @submit.prevent="submitCreate">
            <input
              ref="nameInput"
              v-model="draftName"
              class="sheet__create-input"
              aria-label="新清單名稱"
              :aria-invalid="nameError !== null"
              aria-describedby="sheet-name-error"
              maxlength="40"
              @input="nameError = null"
            />
            <button type="submit" class="sheet__create-submit">建立</button>
            <button type="button" class="text-button" @click="cancelCreate">取消</button>
          </form>
          <p v-if="nameError" id="sheet-name-error" class="sheet__error" role="alert">
            {{ nameError }}
          </p>
        </li>
        <li v-else>
          <button type="button" class="sheet__item" @click="startCreate">
            <span class="sheet__item-name sheet__item-name--create">
              <BaseIcon name="plus" :size="16" /> 新增清單並加入
            </span>
          </button>
        </li>
      </ul>

      <button type="button" class="sheet__done" @click="emit('close')">完成</button>
    </section>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgb(0 0 0 / 0.35);
}

.sheet {
  width: 100%;
  max-width: 640px;
  max-height: 70dvh;
  overflow-y: auto;
  padding: 20px 20px calc(16px + env(safe-area-inset-bottom));
  border-radius: 20px 20px 0 0;
  background: var(--color-surface);
  outline: none;
}

.sheet__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.sheet__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.sheet__subtitle,
.sheet__item-count {
  font-size: 13px;
  color: var(--color-text-muted);
}

.sheet__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sheet__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 0;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: none;
  color: var(--color-text);
  text-align: left;
}

.sheet__item-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 500;
}

.sheet__item-name--create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
}

.sheet__create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
}

.sheet__create-input {
  flex: 1;
  min-width: 0;
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-size: 15px;
}

.sheet__create-input[aria-invalid='true'] {
  border-color: var(--color-danger);
}

.sheet__create-submit {
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  background: var(--color-text);
  color: var(--color-surface);
  font-weight: 600;
}

.sheet__error {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--color-danger);
}

.sheet__check {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 1.5px solid var(--color-border);
  border-radius: 50%;
  color: transparent;
}

.sheet__check--on {
  border-color: var(--color-text);
  background: var(--color-text);
  color: var(--color-surface);
}

.sheet__done {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  border: none;
  border-radius: 999px;
  background: var(--color-text);
  color: var(--color-surface);
  font-weight: 600;
}
</style>
