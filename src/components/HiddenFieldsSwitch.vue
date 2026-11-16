<script setup lang="ts">
import { HIDEABLE_FIELD_LABELS, HIDEABLE_FIELDS, type HideableField } from '@/domain/hideableField'
import BaseIcon from './BaseIcon.vue'

defineProps<{ hiddenFields: ReadonlySet<HideableField> }>()
defineEmits<{ toggle: [field: HideableField] }>()
</script>

<template>
  <div class="chip-group" role="group" aria-label="隱藏欄位">
    <button
      v-for="field in HIDEABLE_FIELDS"
      :key="field"
      type="button"
      class="chip"
      :class="{ 'chip--active': hiddenFields.has(field) }"
      :aria-pressed="hiddenFields.has(field)"
      @click="$emit('toggle', field)"
    >
      <BaseIcon :name="hiddenFields.has(field) ? 'eye-off' : 'eye'" :size="15" />
      <span>{{ HIDEABLE_FIELD_LABELS[field] }}</span>
    </button>
  </div>
</template>
