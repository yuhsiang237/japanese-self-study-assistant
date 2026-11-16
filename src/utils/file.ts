export function downloadJson(fileName: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export async function readJsonFile(file: File): Promise<unknown> {
  try {
    return JSON.parse(await file.text())
  } catch {
    throw new Error('無法讀取檔案，請確認是 JSON 格式')
  }
}

/** 移除檔名不允許的字元 */
export function toSafeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_')
}

export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10)
}
