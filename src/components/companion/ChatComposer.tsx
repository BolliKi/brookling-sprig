'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

import { GrainSprig } from '@core/components/grain-sprig/GrainSprig'

interface ChatComposerProps {
  onSend: (text: string) => void
}

/**
 * 簸箕形米浆输入栏：禾穗作引，灶火印章「寄」把话递进对话。
 */
export function ChatComposer({ onSend }: ChatComposerProps) {
  const [chatInput, setChatInput] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = chatInput.trim()
    if (!text) return
    setChatInput('')
    onSend(text)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='rice-paper stitched relative flex w-full shrink-0 items-center gap-2 rounded-[22px] border border-field-straw-deep/45 py-1.5 pl-2 pr-2 shadow-[inset_0_0_0_1px_rgba(255,251,240,0.6),0_6px_16px_-12px_rgba(74,52,35,0.7)] transition-[border-color,box-shadow] duration-300 focus-within:border-field-sprout-deep/55 focus-within:shadow-[inset_0_0_0_1px_rgba(255,251,240,0.6),0_0_0_3px_rgba(120,145,80,0.12),0_6px_16px_-12px_rgba(74,52,35,0.7)]'
    >
      <span
        aria-hidden='true'
        className='grid h-9 w-9 shrink-0 place-items-center rounded-full bg-field-sprout-mist/85 text-field-sprout-deep ring-1 ring-field-sprout/15'
      >
        <GrainSprig className='h-5 w-5' />
      </span>

      <input
        type='text'
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        placeholder='和禾禾说句话，或写个动作…'
        aria-label='对禾禾说的话'
        autoComplete='off'
        enterKeyHint='send'
        className='min-w-0 flex-1 bg-transparent font-kai text-[14.5px] tracking-[0.02em] text-field-soil-deep placeholder:text-field-soil/65 focus:outline-none'
      />

      <button
        type='submit'
        title='把话寄给禾禾'
        aria-label='发送给禾禾'
        className='group/seal relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-field-hearth-deep text-field-dew shadow-[inset_0_0_0_1px_rgba(255,251,240,0.28),inset_0_2px_4px_rgba(255,251,240,0.16),0_6px_14px_-8px_rgba(74,52,35,0.85)] transition-[transform,background-color] duration-200 after:pointer-events-none after:absolute after:inset-1 after:rounded-full after:border after:border-field-dew/25 hover:-translate-y-0.5 hover:bg-field-hearth active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-hearth/50 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice motion-reduce:transform-none motion-reduce:transition-none'
      >
        <span className='translate-x-[0.5px] font-kai text-[19px] leading-none tracking-[0.05em]'>
          寄
        </span>
      </button>
    </form>
  )
}
