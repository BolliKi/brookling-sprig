'use client'

import type { ReactNode } from 'react'
import { HandHeart, MoonStar, Sparkles, Trees } from 'lucide-react'

import { CapsuleButton } from '@core/components/capsule-button/CapsuleButton'
import { QUICK_ACTIONS } from '@configs/quick-actions'
import type { QuickActionType } from '@/types/companion'

interface QuickActionBarProps {
  onAction: (action: QuickActionType) => void
}

const ACTION_ICONS: Record<QuickActionType, ReactNode> = {
  PAT_HEAD: <HandHeart className='text-field-sprout-deep' />,
  PRAISE: <Sparkles className='text-field-sprout-deep' />,
  SLEEP: <MoonStar className='text-field-sprout-deep' />,
  IDLE_PLAY: <Trees className='text-field-sprout-deep' />
}

/**
 * 四张并排的禾签：把陪伴手势做成从田埂边拾回的小木牌。
 */
export function QuickActionBar({ onAction }: QuickActionBarProps) {
  return (
    <div className='grid shrink-0 grid-cols-2 gap-2 border-t border-dashed border-field-straw-deep/15 px-0.5 pt-2'>
      {QUICK_ACTIONS.map((action) => (
        <CapsuleButton
          key={action.type}
          icon={ACTION_ICONS[action.type]}
          onClick={() => onAction(action.type)}
          className='w-full px-3 text-[13.5px]'
        >
          {action.label}
        </CapsuleButton>
      ))}
    </div>
  )
}
