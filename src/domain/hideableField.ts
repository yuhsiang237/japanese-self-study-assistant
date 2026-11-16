/** 可隱藏的欄位，供聽力練習時遮住答案（CR 2026110941） */
export const HideableField = {
  Sentence: 'sentence',
  Kana: 'kana',
  Meaning: 'meaning',
  Image: 'image',
} as const

export type HideableField = (typeof HideableField)[keyof typeof HideableField]

export const HIDEABLE_FIELDS: readonly HideableField[] = Object.values(HideableField)

export const HIDEABLE_FIELD_LABELS: Record<HideableField, string> = {
  [HideableField.Sentence]: '日文句子',
  [HideableField.Kana]: '假名',
  [HideableField.Meaning]: '中文意思',
  [HideableField.Image]: '圖像',
}

export const MASK = '*****'

export function isHideableField(value: unknown): value is HideableField {
  return HIDEABLE_FIELDS.includes(value as HideableField)
}

export function maskIfHidden(text: string, hidden: boolean): string {
  return hidden ? MASK : text
}
