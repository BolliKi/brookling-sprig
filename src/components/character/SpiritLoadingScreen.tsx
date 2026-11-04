'use client'

import { useEffect, useState } from 'react'

interface SpiritLoadingScreenProps {
  ready: boolean
  exiting: boolean
}

const MOTES = Array.from({ length: 18 }, (_, index) => ({
  left: 8 + ((index * 37) % 84),
  top: 14 + ((index * 29) % 70),
  size: 2 + (index % 3),
  duration: 5 + (index % 5),
  delay: -(index * 0.9)
}))

/**
 * 立体灵宠的出场序幕：米浆画卷合拢、金环与禾穗印记旋转、浮金微粒飘动。
 * 加载完成后两幅画卷向左右展开，露出水榭主场景。
 */
export function SpiritLoadingScreen({ ready, exiting }: SpiritLoadingScreenProps) {
  const [progress, setProgress] = useState(6)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev
        const step = prev < 45 ? 7 : prev < 76 ? 4 : 1.4
        return Math.min(92, prev + step)
      })
    }, 170)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (ready) setProgress(100)
  }, [ready])

  const phase =
    progress < 28
      ? '净心'
      : progress < 52
      ? '焚香'
      : progress < 76
      ? '请神'
      : progress < 96
      ? '敕令'
      : '显化'

  const panelBackground =
    'radial-gradient(ellipse at 50% 42%, #FFFAED 0%, #F8ECCF 42%, #EAD6B1 74%, #E3CBA0 100%)'

  return (
    <div
      role='status'
      aria-live='polite'
      aria-label={`正在唤醒灵宠，${Math.round(progress)}%`}
      className={`fixed inset-0 z-[80] overflow-hidden ${
        exiting ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
    >
      {/* 左幅米浆画卷 */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 will-change-transform transition-transform duration-[1100ms] ease-[cubic-bezier(0.64,0,0.2,1)] ${
          exiting ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className='absolute inset-0' style={{ background: panelBackground }} />
        <div
          className='absolute inset-0 opacity-60'
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(123,91,65,0.055) 0px, rgba(123,91,65,0.055) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(176,124,49,0.045) 0px, rgba(176,124,49,0.045) 1px, transparent 1px, transparent 36px)'
          }}
        />
        <svg
          aria-hidden='true'
          className='absolute inset-x-0 bottom-0 h-[34%] w-full text-field-sprout/15'
          viewBox='0 0 100 34'
          preserveAspectRatio='none'
        >
          <path d='M0 34 V20 L16 11 L28 22 L42 4 L58 20 L72 10 L86 21 L100 13 V34 Z' fill='currentColor' />
          <path d='M0 34 V26 L22 20 L38 28 L55 17 L70 27 L88 20 L100 25 V34 Z' fill='currentColor' opacity='0.58' />
        </svg>
        <div className='absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-field-straw-deep/55 to-transparent' />
        <div className='absolute inset-y-20 right-8 w-px bg-field-straw-deep/20' />
        <div className='absolute bottom-16 left-10 font-talisman text-[clamp(42px,8vw,90px)] leading-none text-field-soil/10'>
          山
        </div>
        <span className='talisman-vertical absolute left-10 top-1/2 -translate-y-1/2 font-talisman text-[17px] tracking-[0.4em] text-field-hearth/40'>
          太上敕令
        </span>
      </div>

      {/* 右幅米浆画卷 */}
      <div
        className={`absolute inset-y-0 right-0 w-1/2 will-change-transform transition-transform duration-[1100ms] ease-[cubic-bezier(0.64,0,0.2,1)] ${
          exiting ? 'translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className='absolute inset-0' style={{ background: panelBackground }} />
        <div
          className='absolute inset-0 opacity-60'
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(123,91,65,0.055) 0px, rgba(123,91,65,0.055) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(176,124,49,0.045) 0px, rgba(176,124,49,0.045) 1px, transparent 1px, transparent 36px)'
          }}
        />
        <svg
          aria-hidden='true'
          className='absolute inset-x-0 bottom-0 h-[34%] w-full text-field-sprout/15'
          viewBox='0 0 100 34'
          preserveAspectRatio='none'
        >
          <path d='M0 13 L14 21 L28 10 L42 20 L58 4 L72 22 L84 11 L100 20 V34 H0 Z' fill='currentColor' />
          <path d='M0 25 L12 20 L30 27 L45 17 L62 28 L78 20 L100 26 V34 H0 Z' fill='currentColor' opacity='0.58' />
        </svg>
        <div className='absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-field-straw-deep/55 to-transparent' />
        <div className='absolute inset-y-20 left-8 w-px bg-field-straw-deep/20' />
        <div className='absolute bottom-16 right-10 font-talisman text-[clamp(42px,8vw,90px)] leading-none text-field-soil/10'>
          水
        </div>
        <span className='talisman-vertical absolute right-10 top-1/2 -translate-y-1/2 font-talisman text-[17px] tracking-[0.4em] text-field-hearth/40'>
          禾灵显化
        </span>
      </div>

      {/* 上下卷轴木杆 */}
      <div className='pointer-events-none absolute inset-x-6 top-5 z-10 h-1.5 rounded-full bg-field-straw-deep/35 shadow-[0_2px_10px_rgba(74,52,35,0.2)]' />
      <div className='pointer-events-none absolute inset-x-6 bottom-5 z-10 h-1.5 rounded-full bg-field-straw-deep/35 shadow-[0_2px_10px_rgba(74,52,35,0.2)]' />

      {/* 中缝金光 */}
      <div
        className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-field-straw-deep to-transparent transition-opacity duration-500 ${
          exiting ? 'opacity-0' : 'loader-seam opacity-100'
        }`}
        style={{ boxShadow: '0 0 36px rgba(176,124,49,0.55)' }}
      />

      {/* 浮金微粒 */}
      {MOTES.map((mote, index) => (
        <span
          key={index}
          aria-hidden='true'
          className='loader-mote pointer-events-none absolute rounded-full bg-field-straw-deep'
          style={{
            left: `${mote.left}%`,
            top: `${mote.top}%`,
            width: mote.size,
            height: mote.size,
            animationDuration: `${mote.duration}s`,
            animationDelay: `${mote.delay}s`,
            boxShadow: '0 0 10px rgba(176,124,49,0.55)'
          }}
        />
      ))}

      {/* 中央唤灵内容 */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center px-6 transition-[opacity,transform] duration-700 ease-out ${
          exiting ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className='loader-content-in flex flex-col items-center'>
          <div className='relative mb-8 flex h-80 w-80 items-center justify-center'>
            <div className='absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(196,101,58,0.16),transparent_66%)] blur-2xl' />

            {/* 环行符文：字符本身缓慢绕行，而不是卦象图案 */}
            <div className='loader-ring-spin absolute inset-0'>
              {['乾', '坤', '震', '巽', '坎', '离', '艮', '兑'].map((rune, index) => (
                <span
                  key={rune}
                  aria-hidden='true'
                  className='absolute left-1/2 top-1/2 font-talisman text-[17px] leading-none text-field-hearth/80'
                  style={{
                    transform: `rotate(${index * 45}deg) translateY(-150px) rotate(${-index * 45}deg)`
                  }}
                >
                  {rune}
                </span>
              ))}
            </div>

            {/* 竖式符箓：字符由墨迹逐字显现 */}
            <div className='rune-strip-float relative z-10 h-[224px] w-[104px]'>
              <div className='relative flex h-full w-full flex-col items-center justify-between overflow-hidden rounded-[8px] border border-field-hearth/45 bg-[#FFF9EC]/95 px-2 py-3 shadow-[0_14px_40px_-18px_rgba(74,52,35,0.55),inset_0_0_0_1px_rgba(255,255,255,0.75)]'>
                <span className='absolute inset-x-2 top-2 h-px bg-field-hearth/30' />
                <span className='absolute inset-x-2 bottom-2 h-px bg-field-hearth/30' />

                <span
                  className='rune-write font-talisman text-[30px] leading-none text-field-hearth-deep'
                  style={{ animationDelay: '0ms' }}
                >
                  敕
                </span>

                <div className='flex flex-col items-center gap-0.5'>
                  {'太上老君'.split('').map((char, index) => (
                    <span
                      key={`${char}-${index}`}
                      className='rune-write font-talisman text-[16px] leading-none text-field-hearth-deep'
                      style={{ animationDelay: `${180 + index * 100}ms` }}
                    >
                      {char}
                    </span>
                  ))}
                </div>

                <span className='h-px w-7 bg-field-hearth/30' />

                <div className='flex flex-col items-center gap-0.5'>
                  {'急急如律令'.split('').map((char, index) => (
                    <span
                      key={`${char}-${index}`}
                      className='rune-write font-talisman text-[14px] leading-none text-field-hearth-deep/90'
                      style={{ animationDelay: `${650 + index * 90}ms` }}
                    >
                      {char}
                    </span>
                  ))}
                </div>

                <span className='rune-sweep pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-field-straw/50 to-transparent' />
              </div>
            </div>
          </div>

          <p className='font-talisman text-[10px] tracking-[0.52em] text-field-hearth/70'>
            太上敕令
          </p>
          <p className='mt-2 font-talisman text-[26px] tracking-[0.34em] text-field-soil-deep'>
            禾灵将现
          </p>
          <p className='mt-3 font-kai text-[12px] tracking-[0.32em] text-field-soil/65'>
            {phase} · {Math.round(progress)}%
          </p>

          <div className='mt-6 h-[2px] w-60 overflow-hidden rounded-full bg-field-soil/12'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-field-straw-deep/45 via-field-straw-deep to-field-hearth transition-[width] duration-300 ease-out'
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className='mt-7 font-talisman text-[12px] tracking-[0.3em] text-field-soil/55'>
            三清护佑 · 静候灵归
          </p>
          <p className='mt-2 font-kai text-[10px] tracking-[0.25em] text-field-soil/35'>
            Brookling · 灵宠禾禾
          </p>
        </div>
      </div>

      {/* 内框与卷角 */}
      <div
        aria-hidden='true'
        className={`pointer-events-none absolute inset-5 rounded-[26px] border border-field-straw-deep/20 transition-opacity duration-500 ${
          exiting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className='absolute left-3 top-3 h-5 w-5 border-l border-t border-field-straw-deep/45' />
        <span className='absolute right-3 top-3 h-5 w-5 border-r border-t border-field-straw-deep/45' />
        <span className='absolute bottom-3 left-3 h-5 w-5 border-b border-l border-field-straw-deep/45' />
        <span className='absolute bottom-3 right-3 h-5 w-5 border-b border-r border-field-straw-deep/45' />
      </div>

      {/* 展开前的暖金闪光 */}
      <div
        aria-hidden='true'
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,248,228,0.95),rgba(212,163,89,0.28)_42%,transparent_70%)] transition-opacity duration-500 ${
          exiting ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}
