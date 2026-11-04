import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@core/utils/cn'

interface ReadoutFieldProps {
  label: string
  children: ReactNode
  labelClassName?: string
  valueClassName?: string
  valueStyle?: CSSProperties
}

/**
 * @core 只读指标字段：遥测面板中「标签 + 值」的统一排版。
 */
export function ReadoutField({
  label,
  children,
  labelClassName,
  valueClassName,
  valueStyle
}: ReadoutFieldProps) {
  return (
    <div>
      <div className={cn('text-stone-500', labelClassName)}>{label}</div>
      <div className={cn('font-medium mt-0.5', valueClassName)} style={valueStyle}>
        {children}
      </div>
    </div>
  )
}
