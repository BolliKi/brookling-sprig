'use client'

interface ScrollMorphPanelsProps {
  progress: number
}

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/**
 * 3D → 2D：两幅宋韵画卷从两侧合拢，在角色处合成一卷，
 * 再向两侧展开露出已经凝成的平面灵宠。
 */
export function ScrollMorphPanels({ progress }: ScrollMorphPanelsProps) {
  const closeT = progress < 0.5 ? progress * 2 : (1 - progress) * 2
  const cover = easeInOutCubic(Math.max(0, Math.min(1, closeT)))
  const offset = 102 - cover * 102

  return (
    <div className='pointer-events-none absolute inset-0 z-20 overflow-hidden'>
      <div
        className='absolute inset-y-[-6%] left-0 w-[53%] origin-right will-change-transform'
        style={{
          transform: `translateX(-${offset}%)`,
          background:
            'linear-gradient(100deg, #FBF4E4 0%, #F1E2C4 58%, #E8D2A9 100%)',
          borderRight: '1px solid rgba(176,124,49,0.55)',
          boxShadow: 'inset -24px 0 42px -30px rgba(74,52,35,0.6)'
        }}
      >
        <div
          className='absolute inset-0 opacity-60'
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(123,91,65,0.09) 0px, rgba(123,91,65,0.09) 1px, transparent 1px, transparent 26px), repeating-linear-gradient(90deg, rgba(176,124,49,0.07) 0px, rgba(176,124,49,0.07) 1px, transparent 1px, transparent 34px)'
          }}
        />
        <div className='absolute inset-y-12 left-8 w-px bg-field-straw-deep/30' />
        <div className='absolute inset-y-24 left-14 w-px bg-field-straw-deep/20' />
        <span className='absolute right-6 top-1/2 -translate-y-1/2 font-song text-[clamp(24px,4vw,44px)] leading-none text-field-straw-deep/25'>
          山
        </span>
      </div>

      <div
        className='absolute inset-y-[-6%] right-0 w-[53%] origin-left will-change-transform'
        style={{
          transform: `translateX(${offset}%)`,
          background:
            'linear-gradient(260deg, #FBF4E4 0%, #F1E2C4 58%, #E8D2A9 100%)',
          borderLeft: '1px solid rgba(176,124,49,0.55)',
          boxShadow: 'inset 24px 0 42px -30px rgba(74,52,35,0.6)'
        }}
      >
        <div
          className='absolute inset-0 opacity-60'
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(123,91,65,0.09) 0px, rgba(123,91,65,0.09) 1px, transparent 1px, transparent 26px), repeating-linear-gradient(90deg, rgba(176,124,49,0.07) 0px, rgba(176,124,49,0.07) 1px, transparent 1px, transparent 34px)'
          }}
        />
        <div className='absolute inset-y-12 right-8 w-px bg-field-straw-deep/30' />
        <div className='absolute inset-y-24 right-14 w-px bg-field-straw-deep/20' />
        <span className='absolute left-6 top-1/2 -translate-y-1/2 font-song text-[clamp(24px,4vw,44px)] leading-none text-field-straw-deep/25'>
          水
        </span>
      </div>

      {/* 合卷中缝的金色光带 */}
      <div
        className='absolute inset-y-0 left-1/2 z-10 w-[2px] -translate-x-1/2 will-change-[opacity,box-shadow]'
        style={{
          opacity: cover,
          background:
            'linear-gradient(to bottom, transparent, rgba(212,163,89,0.95), rgba(255,247,222,0.95), rgba(212,163,89,0.95), transparent)',
          boxShadow: '0 0 42px rgba(232,183,90,0.75)'
        }}
      />

      {/* 收卷时的朱砂圆形印记 */}
      <div
        className='absolute left-1/2 top-1/2 z-10 h-[132px] w-[132px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-field-hearth/50 will-change-transform'
        style={{
          opacity: cover * 0.8,
          transform: `translate(-50%, -50%) scale(${0.65 + cover * 0.55}) rotate(${cover * 80}deg)`,
          boxShadow: 'inset 0 0 28px rgba(196,101,58,0.22), 0 0 34px rgba(212,163,89,0.22)'
        }}
      >
        <span className='absolute inset-0 grid place-items-center font-song text-2xl text-field-hearth/55'>
          禾
        </span>
      </div>

      {/* 上下卷轴木杆 */}
      <div
        className='absolute inset-x-0 top-2 h-1.5 rounded-full bg-field-straw-deep/40'
        style={{ opacity: cover * 0.7 }}
      />
      <div
        className='absolute inset-x-0 bottom-2 h-1.5 rounded-full bg-field-straw-deep/40'
        style={{ opacity: cover * 0.7 }}
      />
    </div>
  )
}
