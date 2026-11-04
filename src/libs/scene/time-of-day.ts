import { LIGHTING_THEMES } from '@configs/lighting-themes'
import type { LightingTheme, LightingThemeKey } from '@/types/companion'

export type DayPeriod = 'MORNING' | 'DAY' | 'DUSK' | 'NIGHT'

export const DAY_PERIOD_LABELS: Record<DayPeriod, string> = {
  MORNING: '清晨',
  DAY: '白昼',
  DUSK: '暮色',
  NIGHT: '夜色'
}

/** 背景画卷由本地时间决定：清晨 → 白昼 → 暮色 → 夜色。 */
const PERIOD_THEME_KEY: Record<DayPeriod, LightingThemeKey> = {
  MORNING: 'CELADON_MIST',
  DAY: 'JADE_LANDSCAPE',
  DUSK: 'DUSK_PAVILION',
  NIGHT: 'PINE_MOONLIGHT'
}

export function getDayPeriod(hour: number): DayPeriod {
  if (hour >= 5 && hour < 10) return 'MORNING'
  if (hour >= 10 && hour < 16) return 'DAY'
  if (hour >= 16 && hour < 19) return 'DUSK'
  return 'NIGHT'
}

export function getTimeOfDayTheme(hour: number): LightingTheme {
  return LIGHTING_THEMES[PERIOD_THEME_KEY[getDayPeriod(hour)]]
}

export function getTimeOfDayThemeKey(hour: number): LightingThemeKey {
  return PERIOD_THEME_KEY[getDayPeriod(hour)]
}
