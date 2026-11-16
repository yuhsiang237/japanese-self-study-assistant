import { onScopeDispose, ref } from 'vue'

const DISPLAY_MS = 3000

/** 簡短提示訊息，數秒後自動消失 */
export function useToast() {
  const message = ref<string | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined

  function show(text: string): void {
    message.value = text
    clearTimeout(timer)
    timer = setTimeout(() => (message.value = null), DISPLAY_MS)
  }

  onScopeDispose(() => clearTimeout(timer))

  return { message, show }
}
