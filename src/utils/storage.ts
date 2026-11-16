/** localStorage 在私密模式等情境可能拋錯，統一包起來 */
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 無法儲存時僅失去偏好設定，不影響功能
  }
}
