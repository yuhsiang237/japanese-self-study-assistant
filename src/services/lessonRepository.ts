import { appConfig } from '@/config/appConfig'
import { LESSON_COLUMNS, type Lesson } from '@/domain/lesson'
import { parseCsv, toRecords } from '@/utils/csv'
import { loadMediaCatalog, type MediaCatalog } from './mediaCatalog'

async function fetchSheetRecords(): Promise<Record<string, string>[]> {
  const response = await fetch(appConfig.sheetCsvUrl)
  if (!response.ok) throw new Error(`無法讀取試算表（HTTP ${response.status}）`)
  return toRecords(parseCsv(await response.text()))
}

function toLesson(record: Record<string, string>, media: MediaCatalog): Lesson {
  const id = record[LESSON_COLUMNS.id] ?? ''

  return {
    id,
    sentence: record[LESSON_COLUMNS.sentence] ?? '',
    kana: record[LESSON_COLUMNS.kana] ?? '',
    meaning: record[LESSON_COLUMNS.meaning] ?? '',
    note: record[LESSON_COLUMNS.note] ?? '',
    audioUrl: media.audio.get(id) ?? null,
    imageUrl: media.images.get(id) ?? null,
  }
}

export async function fetchLessons(): Promise<Lesson[]> {
  const [records, media] = await Promise.all([fetchSheetRecords(), loadMediaCatalog()])

  return records
    .map((record) => toLesson(record, media))
    .filter((lesson) => lesson.id !== '' && lesson.sentence !== '')
}
