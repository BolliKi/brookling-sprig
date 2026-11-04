'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { playClassicalChime } from '@libs/audio/chime'
import type { ReconState, RenderMode } from '@/types/companion'

interface UseMapleMorphOptions {
  soundEnabled: boolean
  appendLog: (source: string, transition: string, detail: string) => void
  onMorphComplete?: () => void
}

/**
 * 2D / 3D 红枫化形职责：驱动 1050ms 的「灵叶散躯 → 红枫旋风 → 万叶归宗」过渡，
 * 在进度过半时切换实际渲染模式。
 */
export function useMapleMorph({
  soundEnabled,
  appendLog,
  onMorphComplete
}: UseMapleMorphOptions) {
  const [renderMode, setRenderMode] = useState<RenderMode>('STEREO')
  const [reconState, setReconState] = useState<ReconState>({
    active: false,
    progress: 0,
    fromMode: 'STEREO',
    toMode: 'STEREO',
    runId: 0
  })
  const reconRafRef = useRef<number | null>(null)

  const triggerMapleLeafMorph = useCallback(
    (targetMode: RenderMode, sourceLabel = '视图切换') => {
      if (reconRafRef.current) {
        cancelAnimationFrame(reconRafRef.current)
      }
      const startMode = renderMode
      const finalMode = targetMode || renderMode
      const duration = 1500
      const startTime = performance.now()
      const nextRunId = Date.now()
      let modeSwitched = false

      playClassicalChime('MAPLE_MORPH', soundEnabled)

      const fromName = startMode === 'STEREO' ? '立体视图' : '平面视图'
      const toName = finalMode === 'STEREO' ? '立体视图' : '平面视图'
      appendLog(
        sourceLabel,
        `红枫化形 · ${fromName} -> ${toName}`,
        '执行秋风灵叶散躯、红枫旋风交叠与万叶归宗凝形序列'
      )

      setReconState({
        active: true,
        progress: 0,
        fromMode: startMode,
        toMode: finalMode,
        runId: nextRunId
      })

      const step = (now: number) => {
        const elapsed = now - startTime
        const p = Math.min(1, elapsed / duration)

        if (p >= 0.5 && !modeSwitched) {
          modeSwitched = true
          setRenderMode(finalMode)
        }

        setReconState({
          active: p < 1,
          progress: p,
          fromMode: startMode,
          toMode: finalMode,
          runId: nextRunId
        })

        if (p < 1) {
          reconRafRef.current = requestAnimationFrame(step)
        } else {
          reconRafRef.current = null
          onMorphComplete?.()
        }
      }

      reconRafRef.current = requestAnimationFrame(step)
    },
    [renderMode, soundEnabled, appendLog, onMorphComplete]
  )

  useEffect(() => {
    return () => {
      if (reconRafRef.current) cancelAnimationFrame(reconRafRef.current)
    }
  }, [])

  return { renderMode, reconState, triggerMapleLeafMorph }
}
