'use client'

import { EMOTION_STATES } from '@configs/emotions'
import type { DialogueMessage } from '@/types/companion'

interface CompanionSpeechBubbleProps {
  message: DialogueMessage
}

/**
 * 禾禾头顶的随身气泡：只显示当前最新一句宠物话语，位置随舞台一起移动。
 */
export function CompanionSpeechBubble({ message }: CompanionSpeechBubbleProps) {
  const emotionLabel = message.emotion
    ? EMOTION_STATES[message.emotion]?.label
    : undefined

  return (
    <div className='speech-bubble-life rice-paper stitched relative rounded-[20px_20px_20px_7px] border border-field-straw-deep/45 bg-field-rice/95 px-3.5 py-2.5 text-left shadow-[0_14px_34px_-20px_rgba(50,35,22,0.75),inset_0_0_0_1px_rgba(255,251,240,0.55)] backdrop-blur-[2px]'>
      <div className='mb-1 flex items-center gap-1.5'>
        <span
          aria-hidden='true'
          className='grid h-[18px] w-[18px] -rotate-3 place-items-center rounded-[4px] border border-field-hearth/55 bg-field-hearth/10 font-kai text-[10px] leading-none text-field-hearth-deep'
        >
          禾
        </span>
        <span className='font-kai text-[11px] tracking-[0.1em] text-field-soil-deep'>禾禾</span>
        {emotionLabel && (
          <span className='rounded-full border border-field-straw-deep/25 bg-field-straw-soft/55 px-1.5 py-0.5 font-kai text-[9.5px] leading-tight text-field-soil-deep'>
            {emotionLabel}
          </span>
        )}
      </div>

      <p className='font-kai text-[13px] leading-relaxed text-field-soil-deep'>
        {message.text}
      </p>

      <span
        aria-hidden='true'
        className='absolute -bottom-[5px] left-5 h-2.5 w-2.5 rotate-45 border-b border-r border-field-straw-deep/45 bg-field-rice'
      />
    </div>
  )
}
