'use client'

import { useCallback, useEffect, useState } from 'react'

import { createInitialEventLogs } from '@configs/companion-seeds'
import type { EventLog } from '@/types/companion'

/**
 * 调试台事件日志职责：追加（最多保留 40 条）、清空与初始化。
 */
export function useEventLog() {
  const [logs, setLogs] = useState<EventLog[]>([])

  useEffect(() => {
    setLogs(createInitialEventLogs())
  }, [])

  const appendLog = useCallback((source: string, transition: string, detail: string) => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false })
    setLogs((prev) => [
      ...prev.slice(-39),
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: timeStr,
        source,
        transition,
        detail
      }
    ])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([
      {
        id: `clear-${Date.now()}`,
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        source: '水榭日志',
        transition: '记录已清空',
        detail: '互动历史记录已重置。'
      }
    ])
  }, [])

  return { logs, appendLog, clearLogs }
}
