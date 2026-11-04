import type { CSSProperties } from 'react'

import type { ReconState, RenderMode } from '@/types/companion'

/**
 * 舞台图层显隐与维度转场样式。
 * 3D → 2D：立体层向前消融，平面层像画卷一样横向展开。
 * 2D → 3D：平面层像纸张一样折起，立体层从纸后带着景深浮现。
 */
export function getStageLayerStyle(
  reconState: ReconState,
  renderMode: RenderMode,
  layerMode: RenderMode
): CSSProperties {
  if (!reconState.active) {
    const isVisible = renderMode === layerMode
    return {
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? 'auto' : 'none',
      filter: 'none',
      transform: 'scale(1)'
    }
  }

  const p = reconState.progress
  const toFlat = reconState.toMode === 'FLAT'

  if (p < 0.5) {
    if (layerMode !== reconState.fromMode) {
      return { opacity: 0, pointerEvents: 'none' }
    }

    const t = p * 2

    if (toFlat) {
      // 立体层：向前贴近并融进墨色
      return {
        opacity: Math.max(0, 1 - t * 0.96),
        pointerEvents: 'none',
        filter: `blur(${(t * 8).toFixed(2)}px) saturate(${(1 + t * 0.2).toFixed(2)}) drop-shadow(0 0 22px rgba(212, 163, 89, 0.55))`,
        transform: `scale(${(1 + t * 0.1).toFixed(3)})`,
        transformOrigin: 'center 62%',
        willChange: 'transform, opacity, filter'
      }
    }

    // 平面层：像纸页一样向上折起
    return {
      opacity: Math.max(0, 1 - t * 0.96),
      pointerEvents: 'none',
      filter: `blur(${(t * 3).toFixed(2)}px) brightness(${(1 + t * 0.35).toFixed(2)})`,
      transform: `perspective(900px) rotateX(${(t * 22).toFixed(2)}deg) scale(${(1 - t * 0.06).toFixed(3)})`,
      transformOrigin: 'center 68%',
      willChange: 'transform, opacity, filter'
    }
  }

  if (layerMode !== reconState.toMode) {
    return { opacity: 0, pointerEvents: 'none' }
  }

  const t = (p - 0.5) * 2

  if (toFlat) {
    // 平面层：画卷横向展开
    return {
      opacity: Math.min(1, 0.1 + t * 1.05),
      pointerEvents: 'none',
      filter: `blur(${((1 - t) * 6).toFixed(2)}px)`,
      transform: `perspective(900px) rotateY(${((1 - t) * -28).toFixed(2)}deg) scale(${(0.92 + t * 0.08).toFixed(3)})`,
      transformOrigin: 'center 60%',
      willChange: 'transform, opacity, filter'
    }
  }

  // 立体层：从纸后带着景深浮现
  return {
    opacity: Math.min(1, 0.15 + t * 1.05),
    pointerEvents: 'none',
    filter: `blur(${((1 - t) * 9).toFixed(2)}px) brightness(${(1 + (1 - t) * 0.3).toFixed(2)})`,
    transform: `perspective(900px) translateZ(${((1 - t) * -70).toFixed(2)}px) scale(${(0.84 + t * 0.16).toFixed(3)})`,
    transformOrigin: 'center 62%',
    willChange: 'transform, opacity, filter'
  }
}
