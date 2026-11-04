'use client'

import { useCallback, useState } from 'react'

import { INITIAL_DIALOGUE } from '@configs/companion-seeds'
import type { DialogueMessage, EmotionKey } from '@/types/companion'

/**
 * 对话流职责：维护最近 40 条互动记录，面板内可滚动回看历史。
 */
export function useDialogue() {
  const [messages, setMessages] = useState<DialogueMessage[]>(INITIAL_DIALOGUE)

  const pushTurn = useCallback(
    (
      userText: string | null,
      companionReply: string,
      emotionKey: EmotionKey,
      actionName: string,
      intentTag = '互动感知 · 灵犀回应'
    ) => {
      setMessages((prev) => {
        const next = [...prev]
        if (userText) {
          next.push({
            id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            role: 'user',
            text: userText
          })
        }
        if (companionReply) {
          next.push({
            id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            role: 'companion',
            text: companionReply,
            emotion: emotionKey,
            intentTag,
            actionName
          })
        }
        return next.slice(-40)
      })
    },
    []
  )

  return { messages, pushTurn }
}
