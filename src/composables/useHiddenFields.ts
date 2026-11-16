import { computed, ref, watch } from 'vue'
import { isHideableField, type HideableField } from '@/domain/hideableField'
import { readStorage, writeStorage } from '@/utils/storage'

const STORAGE_KEY = 'jp-review:hidden-fields'

function loadSavedFields(): HideableField[] {
  try {
    const saved: unknown = JSON.parse(readStorage(STORAGE_KEY) ?? '[]')
    return Array.isArray(saved) ? saved.filter(isHideableField) : []
  } catch {
    return []
  }
}

export function useHiddenFields() {
  const hiddenList = ref<HideableField[]>(loadSavedFields())
  const hiddenFields = computed<ReadonlySet<HideableField>>(() => new Set(hiddenList.value))

  watch(hiddenList, (fields) => writeStorage(STORAGE_KEY, JSON.stringify(fields)), { deep: true })

  function isHidden(field: HideableField): boolean {
    return hiddenFields.value.has(field)
  }

  function toggleField(field: HideableField): void {
    hiddenList.value = isHidden(field)
      ? hiddenList.value.filter((item) => item !== field)
      : [...hiddenList.value, field]
  }

  return { hiddenFields, isHidden, toggleField }
}
