'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { INITIAL_SYSTEM_TOAST } from '@configs/companion-seeds'
import { playClassicalChime } from '@libs/audio/chime'
import type { SystemToast } from '@/types/companion'

interface UseSystemToastOptions {
  soundEnabled: boolean
  appendLog: (source: string, transition: string, detail: string) => void
}

interface ToastTimerEntry {
  timeout: ReturnType<typeof setTimeout> | null
  /** 剩余存活时长（悬浮暂停期间保持不变） */
  remainingMs: number
  startedAt: number
  paused: boolean
}

/** 单条系统通知的完整生命周期：与 animations.css 关键帧时长对齐 */
const SYSTEM_TOAST_LIFETIME_MS = 6200
/** 主画面居中堆栈的通知上限，超出后最早的一条先退场 */
const MAX_STACKED_TOASTS = 5

/**
 * 水榭系统通知职责：多条通知居中堆叠、悬浮暂停、自动淡出与远程广播。
 */
export function useSystemToast({ soundEnabled, appendLog }: UseSystemToastOptions) {
  const [systemToasts, setSystemToasts] = useState<SystemToast[]>([INITIAL_SYSTEM_TOAST])
  const nextToastIdRef = useRef(INITIAL_SYSTEM_TOAST.id + 1)
  const timersRef = useRef<Map<number, ToastTimerEntry>>(new Map())

  // 按剩余时长启动退场计时；悬浮恢复时沿用暂停前的余量
  const scheduleRemoval = useCallback((id: number, delayMs: number) => {
    const timers = timersRef.current
    const entry = timers.get(id)
    if (!entry) return

    if (entry.timeout) clearTimeout(entry.timeout)
    entry.timeout = setTimeout(() => {
      timers.delete(id)
      setSystemToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, delayMs)
    entry.remainingMs = delayMs
    entry.startedAt = performance.now()
    entry.paused = false
  }, [])

  // 为每条新气泡安排独立退场；气泡被移除或组件卸载时清理对应计时器
  useEffect(() => {
    const timers = timersRef.current
    const activeIds = new Set(systemToasts.map((toast) => toast.id))

    timers.forEach((entry, id) => {
      if (activeIds.has(id)) return
      if (entry.timeout) clearTimeout(entry.timeout)
      timers.delete(id)
    })

    systemToasts.forEach((toast) => {
      if (timers.has(toast.id)) return
      timers.set(toast.id, {
        timeout: null,
        remainingMs: SYSTEM_TOAST_LIFETIME_MS,
        startedAt: performance.now(),
        paused: false
      })
      scheduleRemoval(toast.id, SYSTEM_TOAST_LIFETIME_MS)
    })
  }, [systemToasts, scheduleRemoval])

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((entry) => {
        if (entry.timeout) clearTimeout(entry.timeout)
      })
      timers.clear()
    }
  }, [])

  // 悬浮：暂停退场计时并保留剩余时长；移开后从剩余时长继续
  const setSystemToastHovered = useCallback(
    (id: number, hovering: boolean) => {
      const timers = timersRef.current
      const entry = timers.get(id)
      if (!entry) return

      if (hovering) {
        if (entry.paused) return
        if (entry.timeout) {
          clearTimeout(entry.timeout)
          entry.timeout = null
        }
        entry.remainingMs = Math.max(0, entry.remainingMs - (performance.now() - entry.startedAt))
        entry.paused = true
        return
      }

      if (!entry.paused) return
      scheduleRemoval(id, entry.remainingMs)
    },
    [scheduleRemoval]
  )

  const dismissSystemToast = useCallback((id: number) => {
    setSystemToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const triggerSystemToast = useCallback(
    (text: string, source = '远程调试') => {
      const id = nextToastIdRef.current++
      setSystemToasts((prev) => {
        const next = [...prev, { id, text }]
        return next.length > MAX_STACKED_TOASTS ? next.slice(-MAX_STACKED_TOASTS) : next
      })
      playClassicalChime('IDLE', soundEnabled)
      appendLog(source, '气泡广播', `向水榭主画面发送提示气泡：「${text}」`)
    },
    [appendLog, soundEnabled]
  )

  return { systemToasts, dismissSystemToast, triggerSystemToast, setSystemToastHovered }
}
