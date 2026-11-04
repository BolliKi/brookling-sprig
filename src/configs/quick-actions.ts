import type { QuickActionType } from '@/types/companion'

export const QUICK_ACTIONS: Array<{ type: QuickActionType; label: string }> = [
  { type: 'PAT_HEAD', label: '摸摸头' },
  { type: 'PRAISE', label: '夸夸它' },
  { type: 'SLEEP', label: '哄它睡觉' },
  { type: 'IDLE_PLAY', label: '水榭赏景' }
]
