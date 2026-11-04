'use client'

import { useEffect, useRef } from 'react'

import { EMOTION_STATES } from '@configs/emotions'
import type { DialogueMessage } from '@/types/companion'

interface DialoguePanelProps {
  messages: DialogueMessage[]
  isSpeaking: boolean
  fallbackEmotionLabel: string
  onReplay: (message: DialogueMessage) => void
}

/**
 * 可滚动的对话历史：用户的话折成小笺，禾禾的话写成手记，
 * 点击禾禾手记可重播童声。
 */
export function DialoguePanel({
  messages,
  isSpeaking,
  fallbackEmotionLabel,
  onReplay
}: DialoguePanelProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // 移动端卡片高度变化时保持在最新消息处，避免旧消息停在可视区造成“被按钮截断”的错觉
  useEffect(() => {
    const node = scrollRef.current
    if (!node || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => {
      node.scrollTop = node.scrollHeight
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={scrollRef}
      className='thin-scrollbar flex h-full min-h-0 flex-col gap-2.5 overflow-y-auto overscroll-contain px-0.5 py-0.5 pb-2 pr-1'
    >
      {messages.map((item, idx) => {
        const isLatestCompanion =
          item.role === 'companion' && idx === messages.length - 1

        if (item.role === 'user') {
          return (
            <div key={item.id} className='flex shrink-0 justify-end'>
              <div className='rice-paper stitched relative max-w-[88%] rounded-[18px_18px_7px_18px] border border-field-straw-deep/40 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_rgba(255,251,240,0.6),0_4px_12px_-10px_rgba(74,52,35,0.75)]'>
                <div className='mb-0.5 text-right font-kai text-[11px] tracking-[0.12em] text-field-soil/75'>
                  你
                </div>
                <div className='text-left font-sans text-[14px] font-medium leading-snug text-field-soil-deep'>
                  {item.text}
                </div>
              </div>
            </div>
          )
        }

        const emotionBadgeLabel =
          (item.emotion && EMOTION_STATES[item.emotion]?.label) || fallbackEmotionLabel

        return (
          <button
            key={item.id}
            type='button'
            onClick={() => onReplay(item)}
            title='点击重播禾禾的童声'
            className='rice-paper stitched group relative w-full shrink-0 rounded-[7px_20px_20px_20px] border border-field-straw-deep/40 px-4 py-3 text-left shadow-[inset_0_0_0_1px_rgba(255,251,240,0.6),0_6px_16px_-12px_rgba(74,52,35,0.8)] transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-[inset_0_0_0_1px_rgba(255,251,240,0.7),0_10px_22px_-14px_rgba(74,52,35,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none'
          >
            <div className='mb-1.5 flex flex-wrap items-center justify-between gap-2'>
              <div className='flex flex-wrap items-center gap-1.5'>
                <span
                  aria-hidden='true'
                  className='grid h-5 w-5 -rotate-3 place-items-center rounded-[5px] border border-field-hearth/55 bg-field-hearth/10 font-kai text-[11px] leading-none text-field-hearth-deep shadow-[inset_0_0_0_1px_rgba(255,251,240,0.5)]'
                >
                  禾
                </span>
                <span className='font-kai text-[12.5px] tracking-[0.1em] text-field-soil-deep'>
                  禾禾
                </span>
                <span className='rounded-full border border-field-straw-deep/25 bg-field-straw-soft/55 px-2 py-0.5 font-kai text-[10.5px] leading-tight text-field-soil-deep'>
                  {emotionBadgeLabel}
                </span>
              </div>

              {/* 三粒稻谷：播报语音时轻轻跃动 */}
              <span className='flex items-center gap-1' aria-hidden='true'>
                <span
                  className={`h-[5px] w-[9px] rotate-[24deg] rounded-full bg-field-hearth ${
                    isSpeaking && isLatestCompanion ? 'animate-bounce motion-reduce:animate-none' : ''
                  }`}
                />
                <span
                  className={`h-[5px] w-[9px] rotate-[24deg] rounded-full bg-field-straw ${
                    isSpeaking && isLatestCompanion
                      ? 'animate-bounce motion-reduce:animate-none [animation-delay:120ms]'
                      : ''
                  }`}
                />
                <span
                  className={`h-[5px] w-[9px] rotate-[24deg] rounded-full bg-field-hearth ${
                    isSpeaking && isLatestCompanion
                      ? 'animate-bounce motion-reduce:animate-none [animation-delay:240ms]'
                      : ''
                  }`}
                />
              </span>
            </div>

            <div className='font-kai text-[15px] leading-[1.75] text-field-soil-deep'>
              {item.text}
              <span className='sr-only'>，点击可重播这句童声</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
