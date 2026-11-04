interface GrainSprigProps {
  className?: string
}

/**
 * @core 禾穗纹：一茎四穗的手绘麦穗，作为田野控制层的统一印记。
 * 用于输入栏、数据布签与系统提示，替代通用图标。
 */
export function GrainSprig({ className }: GrainSprigProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
      className={className}
    >
      <path
        d='M12 22c-.3-5 .1-9.6.6-13'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M12.3 16.4c-2.9.3-5.3-1.4-5.7-4.2 2.9-.3 5.3 1.4 5.7 4.2Z'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinejoin='round'
      />
      <path
        d='M12.4 13c2.8.3 5.1-1.3 5.5-4-2.8-.3-5.1 1.3-5.5 4Z'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinejoin='round'
      />
      <path
        d='M12.5 9.7c-2.5.2-4.5-1.2-4.9-3.5 2.5-.2 4.5 1.2 4.9 3.5Z'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinejoin='round'
      />
      <path
        d='M12.6 9c2.3.2 4.2-1.1 4.5-3.3-2.3-.2-4.2 1.1-4.5 3.3Z'
        stroke='currentColor'
        strokeWidth='1.25'
        strokeLinejoin='round'
      />
    </svg>
  )
}
