'use client'

import { EMOTION_STATES } from '@configs/emotions'
import type { CompanionSession } from '@hooks/companion/use-companion-session'

interface DebugActionSectionProps {
  session: CompanionSession
}

/**
 * 动作状态强制切换：四种情绪 × 三套动作变体，点击立即生效。
 */
export function DebugActionSection({ session }: DebugActionSectionProps) {
  const { emotionState, variantIndex, transitionEmotion } = session

  return (
    <div className='space-y-2'>
      {Object.values(EMOTION_STATES).map((state) => {
        const isEmotionActive = emotionState === state.id

        return (
          <div
            key={state.id}
            className='rounded-[10px] border border-field-straw-deep/20 bg-field-dew/50 p-2.5'
          >
            <div className='flex items-center justify-between'>
              <span
                className={`font-kai text-[11px] font-semibold ${
                  isEmotionActive ? 'text-field-soil-deep' : 'text-field-soil/60'
                }`}
              >
                {state.code}
              </span>
              <button
                type='button'
                onClick={() =>
                  transitionEmotion(state.id, {
                    source: '远程调试',
                    logDetail: `调试切换：${state.label}（轮换下一动作）`
                  })
                }
                className='rounded-sm font-kai text-[10px] text-field-sprout-deep transition-colors hover:text-field-soil-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice'
              >
                轮换
              </button>
            </div>

            <div className='mt-1.5 grid grid-cols-3 gap-1'>
              {state.variants.map((variant, idx) => {
                const isActive = isEmotionActive && variantIndex === idx

                return (
                  <button
                    key={variant.id}
                    type='button'
                    onClick={() =>
                      transitionEmotion(state.id, {
                        source: '远程调试',
                        preferredVariantIndex: idx,
                        logDetail: `手动指定状态「${state.label}」下的子动作「${variant.name}」`
                      })
                    }
                    className={`rounded-[7px] border px-1 py-1.5 font-kai text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice ${
                      isActive
                        ? 'border-field-sprout-deep bg-field-sprout-deep font-medium text-field-dew shadow-[inset_0_0_0_1px_rgba(255,251,240,0.16)]'
                        : 'border-field-straw-deep/25 bg-field-rice text-field-soil hover:border-field-straw-deep/45 hover:text-field-soil-deep'
                    }`}
                  >
                    {variant.name.split(' · ')[0]}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
