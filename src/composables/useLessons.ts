import { ref, shallowRef } from 'vue'
import type { Lesson } from '@/domain/lesson'
import { fetchLessons } from '@/services/lessonRepository'

export function useLessons() {
  const lessons = shallowRef<Lesson[]>([])
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  async function load(): Promise<void> {
    isLoading.value = true
    errorMessage.value = null
    try {
      lessons.value = await fetchLessons()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '資料載入失敗'
    } finally {
      isLoading.value = false
    }
  }

  return { lessons, isLoading, errorMessage, load }
}
