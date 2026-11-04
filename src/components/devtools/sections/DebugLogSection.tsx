'use client'

import { useEffect, useRef } from 'react'
import { RotateCcw } from 'lucide-react'

import type { CompanionSession } from '@hooks/companion/use-companion-session'

interface DebugLogSectionProps {
  session: CompanionSession
}

/**
 * 互动历史日志：实时追加，最多保留 40 条，可一键清空。
 */
export function DebugLogSection({ session }: DebugLogSectionProps) {
  const { logs, clearLogs } = session
  const logContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div>
      <div
        ref={logContainerRef}
        className='thin-scrollbar max-h-64 overflow-y-auto rounded-[10px] border border-field-straw-deep/25 bg-field-dew/50'
      >
        {logs.length === 0 ? (
          <div className='px-3 py-4 text-center font-kai text-[11px] text-field-soil/45'>
            暂无互动记录
          </div>
        ) : (
          <ul className='divide-y divide-field-straw-deep/15'>
            {logs.map((log) => (
              <li key={log.id} className='px-3 py-2'>
                <div className='flex items-center justify-between font-mono text-[9px] uppercase tracking-wide text-field-soil/45'>
                  <span>{log.time}</span>
                  <span>{log.source}</span>
                </div>
                <div className='mt-0.5 font-kai text-[11px] font-medium text-field-soil-deep'>
                  {log.transition}
                </div>
                <div className='mt-0.5 font-kai text-[10px] leading-relaxed text-field-soil/65'>
                  {log.detail}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type='button'
        onClick={clearLogs}
        className='mt-2 flex items-center gap-1 rounded-sm font-kai text-[10px] text-field-soil/50 transition-colors hover:text-field-soil-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice'
      >
        <RotateCcw className='h-3 w-3' />
        <span>清空记录</span>
      </button>
    </div>
  )
}
