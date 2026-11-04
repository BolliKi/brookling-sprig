import type { ReactNode } from 'react'

import { SectionHeading } from '@core/components/section-heading/SectionHeading'
import { cn } from '@core/utils/cn'

interface DebugSectionProps {
  title: string
  hint?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * 调试抽屉内的统一分区：小号大写标题、可选提示与右侧动作。
 */
export function DebugSection({
  title,
  hint,
  action,
  children,
  className
}: DebugSectionProps) {
  return (
    <section className={cn('border-t border-field-straw-deep/20 px-5 py-4 first:border-t-0', className)}>
      <SectionHeading
        title={title}
        hint={hint}
        action={action}
        titleClassName='font-kai text-[10px] uppercase tracking-[0.16em] text-field-soil/55'
        hintClassName='font-kai text-[10px] text-field-soil/45'
      />
      <div className='mt-2.5'>{children}</div>
    </section>
  )
}
