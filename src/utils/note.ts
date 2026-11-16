export type NoteContent =
  | { readonly kind: 'table'; readonly header: string[]; readonly rows: string[][] }
  | { readonly kind: 'text'; readonly text: string }

const CELL_SEPARATOR = '\t'

/**
 * 備註若是從試算表貼上的表格（每列以 Tab 分隔），轉為表格顯示；否則保留為純文字。
 */
export function parseNote(note: string): NoteContent {
  const lines = note
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const isTable = lines.length >= 2 && lines.every((line) => line.includes(CELL_SEPARATOR))
  if (!isTable) return { kind: 'text', text: note }

  const [header = [], ...rows] = lines.map((line) =>
    line.split(CELL_SEPARATOR).map((cell) => cell.trim()),
  )
  return { kind: 'table', header, rows }
}
