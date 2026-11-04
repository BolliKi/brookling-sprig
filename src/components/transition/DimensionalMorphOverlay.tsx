'use client'

import type { ReconState } from '@/types/companion'

import { MapleLeafMorphOverlay } from './MapleLeafMorphOverlay'
import { RiftBurstOverlay } from './RiftBurstOverlay'
import { ScrollMorphPanels } from './ScrollMorphPanels'

interface DimensionalMorphOverlayProps {
  reconState: ReconState
}

/**
 * 双向维度转场：
 * - 3D → 2D「归卷」：红枫灵叶散躯 + 宋韵画卷合拢，再展开为平面。
 * - 2D → 3D「破卷」：纸片崩解、金色冲击环与光柱爆发，立体灵宠破卷而出。
 */
export function DimensionalMorphOverlay({ reconState }: DimensionalMorphOverlayProps) {
  if (!reconState.active) return null

  const toFlat = reconState.toMode === 'FLAT'
  const flash = Math.pow(
    Math.max(0, 1 - Math.abs(reconState.progress - 0.5) / 0.11),
    2
  )

  return (
    <div className='pointer-events-none absolute inset-0 z-30 overflow-hidden'>
      {toFlat ? (
        <>
          <div className='absolute inset-0 z-10'>
            <MapleLeafMorphOverlay reconState={reconState} />
          </div>
          <ScrollMorphPanels progress={reconState.progress} />
        </>
      ) : (
        <RiftBurstOverlay progress={reconState.progress} />
      )}

      <div
        className='absolute inset-0 z-40'
        style={{
          opacity: flash * (toFlat ? 0.75 : 0.95),
          background: toFlat
            ? 'radial-gradient(circle at 50% 50%, rgba(255,251,240,0.96), rgba(212,163,89,0.4) 45%, transparent 72%)'
            : 'radial-gradient(circle at 50% 50%, rgba(255,248,230,1), rgba(234,122,46,0.55) 38%, transparent 74%)'
        }}
      />
    </div>
  )
}
