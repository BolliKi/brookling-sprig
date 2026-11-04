'use client'

import { ReadoutField } from '@core/components/readout-field/ReadoutField'
import { DAY_PERIOD_LABELS } from '@libs/scene/time-of-day'
import type { CompanionSession } from '@hooks/companion/use-companion-session'

interface DebugStatusSectionProps {
  session: CompanionSession
}

/**
 * 实时状态：当前情绪状态码、动作变体、场景主题与陪伴数值。
 */
export function DebugStatusSection({ session }: DebugStatusSectionProps) {
  const {
    emotionState,
    currentEmotion,
    currentVariant,
    activeTheme,
    themeOverride,
    dayPeriod,
    atmosphere,
    affection,
    energy,
    lockState,
    revertCountdown,
    toggleLockState
  } = session

  return (
    <div className='rounded-[12px] border border-field-straw-deep/25 bg-field-dew/60 p-3'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <div className='text-[9px] font-medium uppercase tracking-[0.18em] text-field-soil/45'>
            Emotion State
          </div>
          <div className='mt-0.5 font-mono text-sm font-semibold text-field-soil-deep'>
            {emotionState}
          </div>
          <div className='mt-0.5 font-kai text-[11px] text-field-soil/60'>
            {currentEmotion.code}
          </div>
        </div>
        <span
          className={`rounded-full border px-2.5 py-0.5 font-kai text-[10px] font-medium ${currentEmotion.badgeClass}`}
        >
          {currentEmotion.label}
        </span>
      </div>

      <div className='mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]'>
        <ReadoutField
          label='当前动作'
          labelClassName='text-field-soil/45'
          valueClassName='text-field-soil-deep'
        >
          {currentVariant.name}
        </ReadoutField>
        <ReadoutField
          label='背景画卷'
          labelClassName='text-field-soil/45'
          valueClassName='text-field-soil-deep'
        >
          <span className='flex items-center gap-1.5'>
            <span className={`h-1.5 w-1.5 rounded-full ${activeTheme.swatchClass}`} />
            {themeOverride === 'AUTO' ? activeTheme.name : `手动 · ${activeTheme.name}`}
          </span>
        </ReadoutField>
        <ReadoutField
          label='背景时段'
          labelClassName='text-field-soil/45'
          valueClassName='text-field-soil-deep'
        >
          {themeOverride === 'AUTO' ? DAY_PERIOD_LABELS[dayPeriod] : '已锁定'}
        </ReadoutField>
        <ReadoutField
          label='心情氛围'
          labelClassName='text-field-soil/45'
          valueClassName='text-field-soil-deep'
        >
          {atmosphere.label}
        </ReadoutField>
        <ReadoutField
          label='亲密度'
          labelClassName='text-field-soil/45'
          valueClassName='font-mono text-field-soil-deep'
        >
          {affection}
        </ReadoutField>
        <ReadoutField
          label='元气值'
          labelClassName='text-field-soil/45'
          valueClassName='font-mono text-field-soil-deep'
        >
          {energy}
        </ReadoutField>
      </div>

      <div className='mt-3 flex items-center justify-between border-t border-field-straw-deep/20 pt-2'>
        <span className='font-kai text-[10px] text-field-soil/50'>
          自动回落
          {!lockState && revertCountdown > 0 ? ` · ${revertCountdown}s` : ''}
        </span>
        <button
          type='button'
          onClick={toggleLockState}
          className={`rounded-[8px] border px-2 py-0.5 font-kai text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice ${
            lockState
              ? 'border-field-straw-deep/40 bg-field-straw-soft/70 text-field-soil-deep'
              : 'border-field-straw-deep/25 bg-field-dew/70 text-field-soil hover:border-field-straw-deep/45 hover:text-field-soil-deep'
          }`}
        >
          {lockState ? '已锁定 · 点击解除' : '点击锁定'}
        </button>
      </div>
    </div>
  )
}
