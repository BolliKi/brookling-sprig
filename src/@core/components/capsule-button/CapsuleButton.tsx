'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@core/utils/cn'

type CapsuleButtonVariant = 'paper' | 'ghost' | 'solid'

interface CapsuleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: CapsuleButtonVariant
  icon?: ReactNode
}

const BASE_CLASSES =
  'group relative inline-flex min-h-[34px] select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-[13px] px-3 py-1.5 font-kai text-[13.5px] leading-none tracking-[0.03em] transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-sprout-deep/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f0df] active:translate-y-0 active:shadow-none motion-reduce:transform-none motion-reduce:transition-none'

const VARIANT_CLASSES: Record<CapsuleButtonVariant, string> = {
  paper:
    'border border-field-straw-deep/40 bg-field-rice text-field-soil-deep shadow-[inset_0_0_0_1px_rgba(238,220,180,0.75),0_1px_0_rgba(255,251,240,0.9),0_5px_12px_-9px_rgba(74,52,35,0.6)] hover:-translate-y-px hover:border-field-straw-deep/65 hover:bg-field-dew hover:shadow-[inset_0_0_0_1px_rgba(238,220,180,0.9),0_2px_0_rgba(255,251,240,0.9),0_8px_16px_-10px_rgba(74,52,35,0.55)]',
  ghost:
    'border border-dashed border-field-straw-deep/45 bg-field-rice/45 text-field-soil hover:-translate-y-px hover:border-field-sprout-deep/50 hover:bg-field-rice',
  solid:
    'border border-field-hearth-deep bg-field-hearth-deep text-field-dew shadow-[inset_0_0_0_1px_rgba(255,251,240,0.22),0_5px_12px_-8px_rgba(74,52,35,0.7)] hover:-translate-y-px hover:bg-field-hearth'
}

/**
 * @core 通用禾签按钮：米浆纸面、稻草双缘与手作按压感。
 */
export function CapsuleButton({
  children,
  variant = 'paper',
  icon,
  className,
  type = 'button',
  ...rest
}: CapsuleButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)}
      {...rest}
    >
      {icon ? (
        <span className='shrink-0 transition-transform duration-200 group-hover:-rotate-6 motion-reduce:transform-none [&>svg]:h-3.5 [&>svg]:w-3.5'>
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  )
}
