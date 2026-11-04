'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

import type { CompanionSession } from '@hooks/companion/use-companion-session'

import { DebugSection } from './DebugSection'
import { DebugActionSection } from './sections/DebugActionSection'
import { DebugLogSection } from './sections/DebugLogSection'
import { DebugStatusSection } from './sections/DebugStatusSection'
import { DebugThemeSection } from './sections/DebugThemeSection'
import { DebugToastSection } from './sections/DebugToastSection'

interface DevDebugDrawerProps {
  session: CompanionSession
  open: boolean
  onClose: () => void
}

/**
 * 开发者调试抽屉：从右侧滑出，专注于「实时状态 / 动作强制切换 / 场景灯光 / 系统提示 / 互动日志」。
 * 视觉与主界面共用田野色板，但排版保持工具面板的紧凑克制。
 */
export function DevDebugDrawer({ session, open, onClose }: DevDebugDrawerProps) {
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[#2b2118]/25 backdrop-blur-[1px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role='dialog'
        aria-modal='true'
        aria-label='状态监控与远程调试台'
        className={`rice-paper absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col border-l border-field-straw-deep/30 text-field-soil-deep shadow-[-24px_0_60px_-32px_rgba(50,35,22,0.55)] transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className='flex items-start justify-between border-b border-field-straw-deep/25 px-5 py-4'>
          <div>
            <div className='flex items-center gap-2'>
              <span className='h-1.5 w-1.5 rounded-full bg-field-sprout' />
              <h2 className='font-song text-sm font-semibold tracking-[0.04em] text-field-soil-deep'>
                状态监控与远程调试台
              </h2>
            </div>
            <p className='mt-1 font-kai text-[11px] text-field-soil/60'>
              实时同步 · 操作会立即作用到主画面
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='关闭调试台'
            className='rounded-full p-1.5 text-field-soil/50 transition-colors hover:bg-field-rice-deep hover:text-field-soil-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice'
          >
            <X className='h-4 w-4' />
          </button>
        </header>

        <div className='thin-scrollbar flex-1 overflow-y-auto'>
          <DebugSection title='实时状态'>
            <DebugStatusSection session={session} />
          </DebugSection>

          <DebugSection title='动作状态' hint='点击强制切换'>
            <DebugActionSection session={session} />
          </DebugSection>

          <DebugSection title='场景灯光' hint='立即切换'>
            <DebugThemeSection session={session} />
          </DebugSection>

          <DebugSection title='系统提示气泡' hint='发送到主画面'>
            <DebugToastSection session={session} />
          </DebugSection>

          <DebugSection title='互动历史日志' hint={`${session.logs.length} 条`}>
            <DebugLogSection session={session} />
          </DebugSection>
        </div>

        <footer className='border-t border-field-straw-deep/20 px-5 py-2.5 text-[9px] uppercase tracking-[0.18em] text-field-soil/45'>
          Debug Console · 仅用于开发调试
        </footer>
      </aside>
    </div>
  )
}
