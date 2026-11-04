'use client'

import type { DialogueMessage } from '@/types/companion'

interface CompanionDanmakuOverlayProps {
  messages: DialogueMessage[]
  active: boolean
}

/** 依据消息 id 生成稳定的轨道与节奏，列表增删时同一条弹幕不会重播 */
function getDanmakuConfig(id: string) {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 997
  }
  return {
    top: 20 + (hash % 4) * 11,
    duration: 16 + (hash % 4) * 2,
    delay: (hash % 3) * 0.9
  }
}

/**
 * 聊天卡收起时的弹幕层：最近几条宠物话语从右向左飘过一次，
 * 最新一句仍由角色身旁的随身气泡展示。
 */
export function CompanionDanmakuOverlay({
  messages,
  active
}: CompanionDanmakuOverlayProps) {
  if (!active) return null

  const companionMessages = messages.filter((message) => message.role === 'companion')
  // 末尾一条固定由角色气泡展示，其余作为弹幕
  const danmakuMessages = companionMessages.slice(-5, -1)

  if (danmakuMessages.length === 0) return null

  return (
    <div className='pointer-events-none absolute inset-0 z-[15] overflow-hidden' aria-hidden>
      {danmakuMessages.map((message) => {
        const config = getDanmakuConfig(message.id)
        return (
          <div
            key={message.id}
            className='absolute left-0 top-0 will-change-transform'
            style={{
              top: `${config.top}%`,
              animation: `companionDanmaku ${config.duration}s linear ${config.delay}s 1 both`
            }}
          >
            <span className='rice-paper stitched inline-flex max-w-[62vw] items-center gap-1.5 overflow-hidden rounded-full border border-field-straw-deep/35 bg-field-rice/90 px-3 py-1.5 font-kai text-[12px] text-field-soil-deep shadow-[0_8px_20px_-14px_rgba(50,35,22,0.7)]'>
              <span className='h-1 w-1 shrink-0 rounded-full bg-field-hearth' aria-hidden='true' />
              <span className='truncate whitespace-nowrap'>禾禾：{message.text}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
