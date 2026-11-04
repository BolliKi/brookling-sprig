'use client'

import { GrainSprig } from '@core/components/grain-sprig/GrainSprig'
import type { SystemToast } from '@/types/companion'

interface SystemToastLayerProps {
  toasts: SystemToast[]
  onDismiss: (id: number) => void
  onHoverChange: (id: number, hovering: boolean) => void
}

/**
 * 主画面系统通知层：通知在画面上方居中、自上而下堆叠显示，
 * 新通知排在最上方，可同时展示多条；悬浮时暂停淡出并轻轻上浮。
 */
export function SystemToastLayer({ toasts, onDismiss, onHoverChange }: SystemToastLayerProps) {
  // 最新一条排在最上方，旧通知顺势下沉
  const stackedToasts = [...toasts].reverse()

  return (
    <div className='pointer-events-none absolute inset-x-0 top-[4.5rem] z-30 flex flex-col items-center gap-2 px-4'>
      {stackedToasts.map((toast) => (
        <div
          key={toast.id}
          className='system-toast-notice pointer-events-auto w-fit max-w-[min(88vw,32rem)]'
          onMouseEnter={() => onHoverChange(toast.id, true)}
          onMouseLeave={() => onHoverChange(toast.id, false)}
        >
          <div className='system-toast-bubble rice-paper stitched relative flex w-full items-center gap-2.5 rounded-[16px] border border-field-straw-deep/40 px-3.5 py-2 font-kai text-[12.5px] text-field-soil-deep shadow-[inset_0_0_0_1px_rgba(255,251,240,0.55),0_10px_28px_-14px_rgba(50,35,22,0.6)]'>
            <GrainSprig className='h-4 w-4 shrink-0 text-field-sprout' />
            <span className='min-w-0' title={toast.text}>
              {toast.text}
            </span>
            <button
              type='button'
              onClick={() => onDismiss(toast.id)}
              title='收起这条提示'
              aria-label={`收起提示：${toast.text}`}
              className='grid h-6 w-6 shrink-0 place-items-center rounded-full border border-transparent text-base leading-none text-field-soil/60 transition-colors hover:border-field-straw-deep/30 hover:bg-field-dew hover:text-field-soil-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice'
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
