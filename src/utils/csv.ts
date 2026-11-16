const QUOTE = '"'
const DELIMITER = ','

/**
 * 依 RFC 4180 解析 CSV，支援以雙引號包住、含換行或逗號的欄位。
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char !== QUOTE) {
        field += char
      } else if (text[i + 1] === QUOTE) {
        field += QUOTE
        i++
      } else {
        inQuotes = false
      }
      continue
    }

    if (char === QUOTE) {
      inQuotes = true
    } else if (char === DELIMITER) {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

/** 以第一列為標題，將資料列轉成 { 標題: 值 } 物件 */
export function toRecords(rows: string[][]): Record<string, string>[] {
  const [header, ...body] = rows
  if (!header) return []
  const keys = header.map((key) => key.trim())

  return body.map((cells) =>
    Object.fromEntries(keys.map((key, index) => [key, (cells[index] ?? '').trim()])),
  )
}
