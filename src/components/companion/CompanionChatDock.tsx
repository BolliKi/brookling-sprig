'use client'

import type { CSSProperties } from 'react'
import { ChevronLeft, MessagesSquare } from 'lucide-react'

import type { CompanionSession } from '@hooks/companion/use-companion-session'
import { GrainSprig } from '@core/components/grain-sprig/GrainSprig'

import { ChatComposer } from './ChatComposer'
import { DialoguePanel } from './DialoguePanel'
import { QuickActionBar } from './QuickActionBar'

interface CompanionChatDockProps {
  session: CompanionSession
  collapsed: boolean
  onToggle: () => void
}

/**
 * 手记式对话卡：米浆纸面、手缝边与禾穗印记。
 * 收起时向左/向下滑出并淡出，左下角小签淡入；展开时反向播放。
 */
export function CompanionChatDock({
  session,
  collapsed,
  onToggle
}: CompanionChatDockProps) {
  return (
    <>
      <aside
        aria-label='与禾禾的对话'
        aria-hidden={collapsed}
        className={`rice-paper stitched absolute inset-x-3 bottom-3 z-20 flex h-[46vh] max-h-[420px] min-h-[320px] origin-bottom-left flex-col gap-2.5 overflow-hidden rounded-[26px] border border-field-straw-deep/45 bg-field-rice/95 p-3 shadow-[0_24px_60px_-28px_rgba(50,35,22,0.7),inset_0_0_0_1px_rgba(255,251,240,0.55)] backdrop-blur-[3px] transition-[transform,opacity] duration-500 will-change-transform sm:inset-x-6 sm:bottom-6 lg:inset-x-auto lg:bottom-6 lg:left-6 lg:top-[12%] lg:h-auto lg:w-[380px] lg:min-h-0 lg:max-h-none xl:w-[410px] ${
          collapsed
            ? 'pointer-events-none -translate-x-[18%] translate-y-[118%] rotate-[-7deg] scale-[0.86] opacity-0 ease-[cubic-bezier(0.55,0,0.55,0.2)] lg:-translate-x-[115%] lg:translate-y-[8%] lg:rotate-[-5deg] lg:scale-[0.9]'
            : 'translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
        }`}
      >
        <span
          aria-hidden='true'
          className={`pointer-events-none absolute inset-0 z-30 rounded-[26px] border-2 border-transparent ${
            collapsed ? 'chat-rim-flash' : ''
          }`}
        />
        <span
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[26px]'
        >
          <span
            className={`absolute -inset-y-1/2 left-[-40%] w-1/3 rotate-[18deg] bg-gradient-to-r from-transparent via-white/75 to-transparent ${
              collapsed ? 'chat-sheen' : 'opacity-0'
            }`}
          />
        </span>

        <div className='flex shrink-0 items-center justify-between gap-2 border-b border-dashed border-field-straw-deep/20 px-1 pb-2'>
          <div className='flex items-center gap-1.5'>
            <GrainSprig className='h-4 w-4 shrink-0 text-field-sprout-deep' />
            <span className='font-song text-[13.5px] font-semibold tracking-[0.08em] text-field-soil-deep'>
              与禾禾的对话
            </span>
          </div>

          <div className='flex items-center gap-1.5'>
            <span className='inline-flex items-center gap-1 rounded-full border border-field-straw-deep/25 bg-field-dew/70 px-2 py-0.5 font-kai text-[10.5px] leading-tight text-field-soil-deep'>
              <span className='h-1.5 w-1.5 rounded-full bg-field-hearth' aria-hidden='true' />
              亲密度
              <b className='font-sans text-[10.5px] font-semibold tabular-nums'>
                {session.affection}
              </b>
            </span>
            <span className='inline-flex items-center gap-1 rounded-full border border-field-straw-deep/25 bg-field-dew/70 px-2 py-0.5 font-kai text-[10.5px] leading-tight text-field-soil-deep'>
              <span className='h-1.5 w-1.5 rounded-full bg-field-sprout' aria-hidden='true' />
              元气
              <b className='font-sans text-[10.5px] font-semibold tabular-nums'>
                {session.energy}
              </b>
            </span>
            <button
              type='button'
              onClick={onToggle}
              aria-label='收起对话，改为弹幕'
              title='收起对话，改为弹幕'
              className='grid h-6 w-6 shrink-0 place-items-center rounded-full border border-field-straw-deep/25 bg-field-dew/60 text-field-soil/55 transition-colors hover:border-field-straw-deep/45 hover:text-field-soil-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice'
            >
              <ChevronLeft className='h-4 w-4' />
            </button>
          </div>
        </div>

        <div className='min-h-0 flex-1'>
          <DialoguePanel
            messages={session.dialogueMessages}
            isSpeaking={session.speech.isSpeaking}
            fallbackEmotionLabel={session.currentEmotion.label}
            onReplay={session.handleReplayMessage}
          />
        </div>

        <QuickActionBar onAction={session.handleQuickAction} />

        <ChatComposer onSend={session.sendChat} />
      </aside>

      <button
        type='button'
        onClick={onToggle}
        aria-label='展开与禾禾的对话'
        aria-hidden={!collapsed}
        tabIndex={collapsed ? 0 : -1}
        className={`rice-paper stitched absolute bottom-3 left-3 z-30 flex items-center gap-2 rounded-full border border-field-straw-deep/45 bg-field-rice/95 px-4 py-2 font-kai text-[12px] text-field-soil-deep shadow-[0_12px_30px_-18px_rgba(50,35,22,0.7)] backdrop-blur-[3px] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice sm:bottom-6 sm:left-6 ${
          collapsed
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100 delay-300'
            : 'pointer-events-none translate-y-3 scale-75 opacity-0'
        }`}
      >
        {collapsed && (
          <>
            <span
              aria-hidden='true'
              className='launcher-halo pointer-events-none absolute inset-0 rounded-full'
            />
            <span aria-hidden='true' className='pointer-events-none absolute inset-0'>
              {Array.from({ length: 6 }).map((_, index) => (
                <span
                  key={index}
                  className='launcher-spark absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-field-straw'
                  style={
                    {
                      '--spark-angle': `${index * 60}deg`,
                      animationDelay: `${index * 30}ms`
                    } as CSSProperties
                  }
                />
              ))}
            </span>
          </>
        )}
        <MessagesSquare className='relative h-4 w-4 text-field-sprout-deep' />
        <span className='relative'>与禾禾的对话</span>
      </button>
    </>
  )
}
