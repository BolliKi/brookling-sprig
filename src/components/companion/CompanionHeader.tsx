'use client'

import { Volume2, VolumeX, Wrench } from 'lucide-react'

import type { RenderMode } from '@/types/companion'

interface CompanionHeaderProps {
  emotionLabel: string
  emotionBadgeClass: string
  variantName: string
  accentColor: string
  isNight: boolean
  renderMode: RenderMode
  soundEnabled: boolean
  onTriggerMorph: (mode: RenderMode) => void
  onToggleSound: () => void
  onOpenDebug: () => void
}

const CONTROL_FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice/80 motion-reduce:transition-none'

/**
 * 主画面顶部导航：心情、当前动作、平面 / 立体切换与声音开关。
 * 控件统一为米浆木牌：稻草描边、禾苗选中态与手写楷体。
 */
export function CompanionHeader({
  emotionLabel,
  emotionBadgeClass,
  variantName,
  accentColor,
  isNight,
  renderMode,
  soundEnabled,
  onTriggerMorph,
  onToggleSound,
  onOpenDebug
}: CompanionHeaderProps) {
  return (
    <header
      className={`relative isolate z-30 flex flex-wrap items-center justify-between gap-3 border-b pb-2.5 transition-colors before:pointer-events-none before:absolute before:-inset-x-4 before:-top-3.5 before:h-[calc(100%+1.25rem)] before:-z-10 before:bg-gradient-to-b before:to-transparent ${
        isNight
          ? 'border-field-straw/20 text-field-dew before:from-stone-950/80 before:via-stone-900/35'
          : 'border-field-straw-deep/25 text-field-soil-deep before:from-field-rice/95 before:via-field-rice/65'
      }`}
    >
      <div className='flex flex-wrap items-center gap-2.5'>
        <span
          aria-hidden='true'
          className='h-2.5 w-2.5 rounded-full ring-2 ring-field-rice/50'
          style={{ backgroundColor: accentColor }}
        />
        <h1 className='font-song text-sm font-bold tracking-[0.04em] sm:text-base'>
          Brookling · 灵宠禾禾
        </h1>
        <span
          className={`rounded-full border px-2.5 py-0.5 font-kai text-xs leading-tight ${emotionBadgeClass}`}
        >
          {emotionLabel}
        </span>
        <span className='hidden rounded-full border border-field-straw-deep/25 bg-field-rice/80 px-2.5 py-0.5 font-kai text-[11.5px] leading-tight text-field-soil-deep backdrop-blur-[2px] sm:inline'>
          此刻：{variantName}
        </span>
      </div>

      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-0.5 rounded-[13px] border border-field-straw-deep/45 bg-field-rice/95 p-0.5 shadow-[inset_0_0_0_1px_rgba(255,251,240,0.55)] backdrop-blur-[2px]'>
          <button
            type='button'
            onClick={() => onTriggerMorph('STEREO')}
            aria-pressed={renderMode === 'STEREO'}
            className={`rounded-[10px] px-3 py-1.5 font-kai text-[12.5px] leading-none transition-colors duration-200 ${
              renderMode === 'STEREO'
                ? 'bg-field-sprout-deep text-field-dew shadow-[inset_0_0_0_1px_rgba(255,251,240,0.18)]'
                : 'text-field-soil hover:bg-field-dew/70 hover:text-field-soil-deep'
            } ${CONTROL_FOCUS}`}
          >
            立体视图
          </button>
          <button
            type='button'
            onClick={() => onTriggerMorph('FLAT')}
            aria-pressed={renderMode === 'FLAT'}
            className={`rounded-[10px] px-3 py-1.5 font-kai text-[12.5px] leading-none transition-colors duration-200 ${
              renderMode === 'FLAT'
                ? 'bg-field-sprout-deep text-field-dew shadow-[inset_0_0_0_1px_rgba(255,251,240,0.18)]'
                : 'text-field-soil hover:bg-field-dew/70 hover:text-field-soil-deep'
            } ${CONTROL_FOCUS}`}
          >
            平面视图
          </button>
        </div>

        <button
          type='button'
          onClick={onToggleSound}
          title={soundEnabled ? '关闭清脆童声与古琴泛音' : '开启清脆童声与古琴泛音'}
          aria-pressed={soundEnabled}
          className={`flex min-h-[30px] items-center gap-1.5 rounded-[13px] border border-field-straw-deep/35 bg-field-rice/90 px-2.5 py-1.5 font-kai text-[12.5px] leading-none text-field-soil-deep backdrop-blur-[2px] transition-colors duration-200 hover:bg-field-dew ${CONTROL_FOCUS}`}
        >
          {soundEnabled ? (
            <Volume2 className='h-4 w-4 text-field-sprout-deep' />
          ) : (
            <VolumeX className='h-4 w-4 text-field-soil/45' />
          )}
          <span className='hidden sm:inline'>
            {soundEnabled ? '声音已开' : '已静音'}
          </span>
        </button>

        <button
          type='button'
          onClick={onOpenDebug}
          title='打开状态监控与远程调试台'
          className={`flex min-h-[30px] items-center gap-1.5 rounded-[13px] border border-dashed border-field-straw-deep/45 bg-field-rice/55 px-2.5 py-1.5 font-kai text-[12px] leading-none text-field-soil transition-colors duration-200 hover:bg-field-rice hover:text-field-soil-deep ${CONTROL_FOCUS}`}
        >
          <Wrench className='h-3.5 w-3.5' />
          <span className='hidden md:inline'>调试</span>
        </button>
      </div>
    </header>
  )
}
