<script setup lang="ts">
export type IconName =
  | 'play'
  | 'pause'
  | 'next'
  | 'previous'
  | 'chevron'
  | 'sequential'
  | 'repeat-all'
  | 'repeat-one'
  | 'refresh'
  | 'eye'
  | 'eye-off'
  | 'plus'
  | 'check'
  | 'list-add'
  | 'list-check'
  | 'download'
  | 'upload'
  | 'pencil'
  | 'trash'

defineProps<{ name: IconName; size?: number }>()

const PATHS: Record<IconName, string> = {
  play: 'M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z',
  pause: 'M7 4h3.5v16H7zM13.5 4H17v16h-3.5z',
  next: 'M5 5.5v13a.8.8 0 0 0 1.2.7L16 13v5.5h2.5v-13H16V11L6.2 4.8A.8.8 0 0 0 5 5.5Z',
  previous: 'M19 5.5v13a.8.8 0 0 1-1.2.7L8 13v5.5H5.5v-13H8V11l9.8-6.2a.8.8 0 0 1 1.2.7Z',
  chevron: 'm6 9 6 6 6-6',
  sequential: 'M4 7h12M4 12h12M4 17h7m6-2 3 3-3 3m3-3h-6',
  'repeat-all': 'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3m13-3v2a4 4 0 0 1-4 4H4',
  'repeat-one':
    'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3m13-3v2a4 4 0 0 1-4 4H4M11 10h1v4',
  refresh: 'M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  'eye-off':
    'M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.5M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12 5 5L20 7',
  'list-add': 'M3 6h12M3 12h12M3 18h7m8-4v8m-4-4h8',
  'list-check': 'M3 6h12M3 12h12M3 18h7m4 0 2.5 2.5L21 16',
  download: 'M12 3v12m-5-5 5 5 5-5M4 21h16',
  upload: 'M12 15V3M7 8l5-5 5 5M4 21h16',
  pencil: 'M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4',
  trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3',
}

const FILLED: ReadonlySet<IconName> = new Set(['play', 'pause', 'next', 'previous'])
</script>

<template>
  <svg
    :width="size ?? 20"
    :height="size ?? 20"
    viewBox="0 0 24 24"
    aria-hidden="true"
    :fill="FILLED.has(name) ? 'currentColor' : 'none'"
    :stroke="FILLED.has(name) ? 'none' : 'currentColor'"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path :d="PATHS[name]" />
  </svg>
</template>
