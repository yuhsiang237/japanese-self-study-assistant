export interface Lesson {
  readonly id: string
  readonly sentence: string
  readonly kana: string
  readonly meaning: string
  readonly imageUrl: string | null
  readonly note: string
  readonly audioUrl: string | null
}

/** Spreadsheet 欄位標題，與 Google Sheet 第一列一致（圖像改由 Drive 依編號取得，見 CR 20261116） */
export const LESSON_COLUMNS = {
  id: '編號',
  sentence: '日文句子',
  kana: '假名',
  meaning: '中文意思',
  note: '備註',
} as const

export function hasAudio(lesson: Lesson): boolean {
  return lesson.audioUrl !== null
}
