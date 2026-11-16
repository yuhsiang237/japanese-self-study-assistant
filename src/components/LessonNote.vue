<script setup lang="ts">
import { computed } from 'vue'
import { parseNote } from '@/utils/note'

const props = defineProps<{ note: string }>()

const content = computed(() => parseNote(props.note))
</script>

<template>
  <div v-if="content.kind === 'table'" class="note__table-wrap">
    <table class="note__table">
      <thead>
        <tr>
          <th v-for="(cell, index) in content.header" :key="index">{{ cell }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in content.rows" :key="rowIndex">
          <td
            v-for="(cell, cellIndex) in row"
            :key="cellIndex"
            :lang="cellIndex < 2 ? 'ja' : undefined"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <p v-else class="note__text">{{ content.text }}</p>
</template>

<style scoped>
.note__table-wrap {
  margin-top: 12px;
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.note__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.note__table th,
.note__table td {
  padding: 8px 12px;
  text-align: left;
  white-space: nowrap;
}

.note__table th {
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 13px;
  background: var(--color-subtle);
}

.note__table tbody td {
  border-top: 1px solid var(--color-border);
}

.note__text {
  margin: 12px 0 0;
  font-size: 14px;
  white-space: pre-wrap;
  color: var(--color-text-secondary);
}
</style>
