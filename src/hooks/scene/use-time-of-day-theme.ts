'use client'

import { useEffect, useState } from 'react'

import {
  getDayPeriod,
  getTimeOfDayTheme,
  type DayPeriod
} from '@libs/scene/time-of-day'
import type { LightingTheme } from '@/types/companion'

/**
 * 背景画卷的晨昏职责：按本地时间挑选宋韵设色，并每分钟校准一次。
 * 初始值固定为白昼，避免 SSR 与客户端时间造成水合差异。
 */
export function useTimeOfDayTheme() {
  const [timeTheme, setTimeTheme] = useState<LightingTheme>(() => getTimeOfDayTheme(12))
  const [dayPeriod, setDayPeriod] = useState<DayPeriod>('DAY')

  useEffect(() => {
    const updateFromClock = () => {
      const hour = new Date().getHours()
      setTimeTheme(getTimeOfDayTheme(hour))
      setDayPeriod(getDayPeriod(hour))
    }

    updateFromClock()
    const timer = setInterval(updateFromClock, 60_000)
    return () => clearInterval(timer)
  }, [])

  return { timeTheme, dayPeriod }
}
