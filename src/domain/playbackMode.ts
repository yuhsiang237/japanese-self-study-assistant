export const PlaybackMode = {
  /** 輪播：依序播放到最後一句後停止 */
  Sequential: 'sequential',
  /** 循環播放：全部播完後從第一句重新開始 */
  RepeatAll: 'repeat-all',
  /** 單曲循環：重複播放目前這一句 */
  RepeatOne: 'repeat-one',
} as const

export type PlaybackMode = (typeof PlaybackMode)[keyof typeof PlaybackMode]

export const PLAYBACK_MODE_LABELS: Record<PlaybackMode, string> = {
  [PlaybackMode.Sequential]: '輪播',
  [PlaybackMode.RepeatAll]: '循環',
  [PlaybackMode.RepeatOne]: '單曲循環',
}

export const PLAYBACK_MODES: readonly PlaybackMode[] = Object.values(PlaybackMode)

export function isPlaybackMode(value: unknown): value is PlaybackMode {
  return PLAYBACK_MODES.includes(value as PlaybackMode)
}
