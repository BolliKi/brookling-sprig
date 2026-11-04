'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import { SYSTEM_TOAST_PRESETS } from '@configs/companion-seeds'
import type { CompanionSession } from '@hooks/companion/use-companion-session'

interface DebugToastSectionProps {
  session: CompanionSession
}

/**
 * 向主画面发送系统提示气泡：快捷文案或自定义文本。
 */
export function DebugToastSection({ session }: DebugToastSectionProps) {
  const { triggerSystemToast } = session
  const [customToastInput, setCustomToastInput] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!customToastInput.trim()) return
    triggerSystemToast(customToastInput.trim(), '远程调试')
    setCustomToastInput('')
  }

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap gap-1.5'>
        {SYSTEM_TOAST_PRESETS.map((preset) => (
          <button
            key={preset}
            type='button'
            onClick={() => triggerSystemToast(preset, '远程调试')}
            className='rounded-[8px] border border-field-straw-deep/25 bg-field-rice px-2.5 py-1.5 font-kai text-[10px] text-field-soil transition-colors hover:border-field-straw-deep/45 hover:text-field-soil-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice'
          >
            {preset}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className='flex gap-1.5'>
        <input
          type='text'
          value={customToastInput}
          onChange={(e) => setCustomToastInput(e.target.value)}
          placeholder='自定义提示气泡……'
          className='min-w-0 flex-1 rounded-[8px] border border-field-straw-deep/30 bg-field-dew/80 px-2.5 py-1.5 font-kai text-[11px] text-field-soil-deep placeholder:text-field-soil/50 focus:border-field-sprout-deep/60 focus:outline-none focus:ring-2 focus:ring-field-sprout/20'
        />
        <button
          type='submit'
          className='shrink-0 rounded-[8px] border border-field-hearth-deep bg-field-hearth-deep px-3 py-1.5 font-kai text-[10px] font-medium text-field-dew shadow-[inset_0_0_0_1px_rgba(255,251,240,0.18)] transition-colors hover:bg-field-hearth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-hearth/50 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice'
        >
          发送
        </button>
      </form>
    </div>
  )
}
