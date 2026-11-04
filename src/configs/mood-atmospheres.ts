import type { EmotionKey } from '@/types/companion'

export type MoodParticleType = 'MIST_PETAL' | 'GOLD_POLLEN' | 'PINK_PETAL' | 'MOON_MOTE'

export type MoodMoteShape = 'mist' | 'spark' | 'petal' | 'orb'

export type MoodMoteAnimation = 'float' | 'rise' | 'drift' | 'pulse'

/**
 * 心情氛围：只描述光影、漂浮物与微动效，不包含背景晨昏设色。
 * 背景由本地时间决定，氛围跟随角色心情平滑变化。
 */
export interface MoodAtmosphere {
  id: EmotionKey
  label: string
  particleType: MoodParticleType
  particleColor: string
  particleScale: number
  particleCount: number
  particleGlow: boolean
  driftFactor: number
  glowColor: string
  haloColor: string
  tintColor: string
  tintOpacity: number
  vignetteColor: string
  vignetteOpacity: number
  moteColors: string[]
  moteCount: number
  moteSize: number
  moteShape: MoodMoteShape
  moteAnimation: MoodMoteAnimation
  transitionMs: number
  driftSeconds: number
  glowOpacity: number
  haloOpacity: number
}

export const MOOD_ATMOSPHERES: Record<EmotionKey, MoodAtmosphere> = {
  IDLE: {
    id: 'IDLE',
    label: '清润微光',
    particleType: 'MIST_PETAL',
    particleColor: 'rgba(255, 255, 255, 0.62)',
    particleScale: 1,
    particleCount: 20,
    particleGlow: false,
    driftFactor: 0.9,
    glowColor: '#A9C6C8',
    haloColor: 'rgba(238, 236, 226, 0.55)',
    tintColor: '#C6DEDA',
    tintOpacity: 0.05,
    vignetteColor: 'rgba(176, 205, 201, 0.5)',
    vignetteOpacity: 0.4,
    moteColors: ['#FFFFFF', '#D8E6E4', '#B9D2D4'],
    moteCount: 10,
    moteSize: 7,
    moteShape: 'mist',
    moteAnimation: 'float',
    transitionMs: 1200,
    driftSeconds: 16,
    glowOpacity: 0.18,
    haloOpacity: 0.14
  },
  HAPPY: {
    id: 'HAPPY',
    label: '晴光跃动',
    particleType: 'GOLD_POLLEN',
    particleColor: 'rgba(255, 224, 120, 0.9)',
    particleScale: 1.45,
    particleCount: 32,
    particleGlow: true,
    driftFactor: 1.9,
    glowColor: '#F5B942',
    haloColor: 'rgba(255, 221, 128, 0.75)',
    tintColor: '#FFD27A',
    tintOpacity: 0.1,
    vignetteColor: 'rgba(255, 196, 92, 0.55)',
    vignetteOpacity: 0.55,
    moteColors: ['#FDE68A', '#FCD34D', '#FFF7D6'],
    moteCount: 22,
    moteSize: 5,
    moteShape: 'spark',
    moteAnimation: 'rise',
    transitionMs: 900,
    driftSeconds: 9,
    glowOpacity: 0.32,
    haloOpacity: 0.22
  },
  SHY: {
    id: 'SHY',
    label: '晚霞微醺',
    particleType: 'PINK_PETAL',
    particleColor: 'rgba(255, 168, 184, 0.82)',
    particleScale: 1.3,
    particleCount: 26,
    particleGlow: true,
    driftFactor: 0.8,
    glowColor: '#F09BAD',
    haloColor: 'rgba(255, 196, 210, 0.7)',
    tintColor: '#FFB4C3',
    tintOpacity: 0.1,
    vignetteColor: 'rgba(255, 154, 176, 0.55)',
    vignetteOpacity: 0.5,
    moteColors: ['#F9A8D4', '#FDA4AF', '#FFE4E6'],
    moteCount: 18,
    moteSize: 8,
    moteShape: 'petal',
    moteAnimation: 'drift',
    transitionMs: 1400,
    driftSeconds: 19,
    glowOpacity: 0.26,
    haloOpacity: 0.18
  },
  SLEEPY: {
    id: 'SLEEPY',
    label: '月息静谧',
    particleType: 'MOON_MOTE',
    particleColor: 'rgba(191, 219, 254, 0.8)',
    particleScale: 1.6,
    particleCount: 16,
    particleGlow: false,
    driftFactor: 0.4,
    glowColor: '#7E9CC8',
    haloColor: 'rgba(190, 214, 250, 0.55)',
    tintColor: '#8FA9D6',
    tintOpacity: 0.12,
    vignetteColor: 'rgba(40, 65, 110, 0.65)',
    vignetteOpacity: 0.55,
    moteColors: ['#DBEAFE', '#BFDBFE', '#E0F2FE'],
    moteCount: 10,
    moteSize: 9,
    moteShape: 'orb',
    moteAnimation: 'pulse',
    transitionMs: 1800,
    driftSeconds: 26,
    glowOpacity: 0.18,
    haloOpacity: 0.14
  }
}
