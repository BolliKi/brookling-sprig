import type { ReactNode } from 'react'

import { cn } from '@core/utils/cn'

interface SectionHeadingProps {
  title: string
  hint?: string
  action?: ReactNode
  className?: string
  titleClassName?: string
  hintClassName?: string
}

/**
 * @core 分组标题：统一使用「标题 + 提示 + 右侧动作」结构。
 */
export function SectionHeading({
  title,
  hint,
  action,
  className,
  titleClassName,
  hintClassName
}: SectionHeadingProps) {
  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      <h3 className={cn('font-semibold text-stone-900', titleClassName)}>{title}</h3>
      <div className='flex items-center gap-2'>
        {hint && <span className={cn('text-[11px] text-stone-500', hintClassName)}>{hint}</span>}
        {action}
      </div>
    </div>
  )
}
