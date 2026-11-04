'use client'

import { LIGHTING_THEMES } from '@configs/lighting-themes'
import type { CompanionSession } from '@hooks/companion/use-companion-session'

interface DebugThemeSectionProps {
  session: CompanionSession
}

/**
 * 场景灯光主题：AUTO 跟随本地时间的晨昏，或强制指定四时设色。
 */
export function DebugThemeSection({ session }: DebugThemeSectionProps) {
  const { themeOverride, setThemeOverride } = session

  return (
    <div className='grid grid-cols-2 gap-1.5'>
      <button
        type='button'
        onClick={() => setThemeOverride('AUTO')}
        className={`col-span-2 rounded-[8px] border px-2.5 py-1.5 text-left font-kai text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice ${
          themeOverride === 'AUTO'
            ? 'border-field-sprout-deep bg-field-sprout-deep text-field-dew shadow-[inset_0_0_0_1px_rgba(255,251,240,0.16)]'
            : 'border-field-straw-deep/25 bg-field-rice text-field-soil hover:border-field-straw-deep/45 hover:text-field-soil-deep'
        }`}
      >
        AUTO · 跟随时间
      </button>

      {Object.values(LIGHTING_THEMES).map((theme) => {
        const isActive = themeOverride === theme.id

        return (
          <button
            key={theme.id}
            type='button'
            onClick={() => setThemeOverride(theme.id)}
            className={`flex w-full items-center gap-1.5 rounded-[8px] border px-2.5 py-1.5 text-left font-kai text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/55 focus-visible:ring-offset-2 focus-visible:ring-offset-field-rice ${
              isActive
                ? 'border-field-sprout-deep bg-field-sprout-deep text-field-dew shadow-[inset_0_0_0_1px_rgba(255,251,240,0.16)]'
                : 'border-field-straw-deep/25 bg-field-rice text-field-soil hover:border-field-straw-deep/45 hover:text-field-soil-deep'
            }`}
          >
            <span
              className='h-2 w-2 shrink-0 rounded-full ring-1 ring-black/10'
              style={{ backgroundColor: theme.accentColor }}
            />
            {theme.name}
          </button>
        )
      })}
    </div>
  )
}
