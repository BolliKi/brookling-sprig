'use client'

import type { CSSProperties } from 'react'

import type {
  MoodAtmosphere,
  MoodMoteAnimation,
  MoodMoteShape
} from '@configs/mood-atmospheres'

interface MoodAmbientLayerProps {
  atmosphere: MoodAtmosphere
  isNight: boolean
}

const MOTE_ANIMATION_NAMES: Record<MoodMoteAnimation, string> = {
  float: 'moodMoteFloat',
  rise: 'moodMoteRise',
  drift: 'moodMoteDrift',
  pulse: 'moodMotePulse'
}

function getMoteShapeStyle(shape: MoodMoteShape): CSSProperties {
  if (shape === 'spark') {
    return {
      clipPath:
        'polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)'
    }
  }
  if (shape === 'petal') {
    return { borderRadius: '60% 40% 60% 40%' }
  }
  if (shape === 'orb') {
    return { borderRadius: '9999px', filter: 'blur(0.4px)' }
  }
  return { borderRadius: '9999px', filter: 'blur(2.5px)' }
}

function getMoteOpacity(shape: MoodMoteShape): number {
  if (shape === 'spark') return 0.85
  if (shape === 'petal') return 0.72
  if (shape === 'orb') return 0.6
  return 0.4
}

/**
 * 心情光影氛围层：整体色光、边缘氛围、角色背后柔光与漂浮物。
 * 只作用于氛围，不改变由本地时间决定的晨昏背景。
 */
export function MoodAmbientLayer({ atmosphere, isNight }: MoodAmbientLayerProps) {
  const colorTransition = `background-color ${atmosphere.transitionMs}ms ease, box-shadow ${atmosphere.transitionMs}ms ease, opacity ${atmosphere.transitionMs}ms ease`
  const nightFactor = isNight ? 1.15 : 1
  const maxMotes = 24
  const shapeStyle = getMoteShapeStyle(atmosphere.moteShape)
  const moteOpacity = getMoteOpacity(atmosphere.moteShape)

  return (
    <div
      data-mood-ambient
      className='pointer-events-none absolute inset-0 z-[1] overflow-hidden'
      aria-hidden
    >
      {/* 整体色光：让整幅画卷染上情绪色彩 */}
      <div
        className='absolute inset-0 mix-blend-soft-light'
        style={{
          backgroundColor: atmosphere.tintColor,
          opacity: atmosphere.tintOpacity * nightFactor,
          transition: colorTransition
        }}
      />

      {/* 边缘氛围：心情越强烈，画面四周的光晕越明显 */}
      <div
        className='absolute inset-0'
        style={{
          boxShadow: `inset 0 0 150px 46px ${atmosphere.vignetteColor}`,
          opacity: atmosphere.vignetteOpacity,
          transition: colorTransition
        }}
      />

      {/* 左上情绪主光：只做柔和色雾，避免像一盏打光 */}
      <div
        className='absolute -left-[14%] top-[8%] h-[58vh] w-[58vh] rounded-full blur-[110px] mix-blend-soft-light'
        style={{
          backgroundColor: atmosphere.glowColor,
          opacity: atmosphere.glowOpacity * 0.9 * nightFactor,
          transition: colorTransition,
          animation: `moodGlowDrift ${atmosphere.driftSeconds}s ease-in-out infinite alternate`
        }}
      />

      {/* 右上情绪辅光 */}
      <div
        className='absolute right-[-4%] top-[12%] h-[52vh] w-[52vh] rounded-full blur-[110px] mix-blend-soft-light'
        style={{
          backgroundColor: atmosphere.haloColor,
          opacity: atmosphere.haloOpacity,
          transition: colorTransition,
          animation: `moodGlowDrift ${atmosphere.driftSeconds + 6}s ease-in-out infinite alternate-reverse`
        }}
      />

      {/* 漂浮物：数量、形状、颜色、轨迹均随心情改变 */}
      <div className='absolute inset-0'>
        {Array.from({ length: maxMotes }).map((_, index) => {
          const isVisible = index < atmosphere.moteCount
          const moteColor = atmosphere.moteColors[index % atmosphere.moteColors.length]
          const size = atmosphere.moteSize + (index % 3)
          const isPetal = atmosphere.moteShape === 'petal'

          return (
            <span
              key={index}
              className='absolute'
              style={{
                left: `${6 + ((index * 17) % 88)}%`,
                top: `${12 + ((index * 23) % 72)}%`,
                width: size,
                height: isPetal ? Math.round(size * 1.4) : size,
                backgroundColor: moteColor,
                filter: `drop-shadow(0 0 ${Math.round(size * 1.6)}px ${moteColor})`,
                opacity: isVisible ? moteOpacity : 0,
                transition: colorTransition,
                animation: `${MOTE_ANIMATION_NAMES[atmosphere.moteAnimation]} ${
                  atmosphere.driftSeconds + 3 + (index % 5)
                }s ease-in-out ${-index * 1.4}s infinite`,
                ...shapeStyle
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
