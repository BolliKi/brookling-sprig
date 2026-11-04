'use client'

import { useEffect, useState } from 'react'

import { SpiritLoadingScreen } from './SpiritLoadingScreen'

interface CompanionBootScreenProps {
  engineReady: boolean
}

/**
 * 出场序幕控制：至少展示 1.8s，等 3D 引擎就绪后再用 1.1s 展开画卷；
 * 若引擎加载超时，也会结束序幕，避免永久遮挡页面。
 */
export function CompanionBootScreen({ engineReady }: CompanionBootScreenProps) {
  const [minElapsed, setMinElapsed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const minTimer = setTimeout(() => setMinElapsed(true), 1800)
    const timeoutTimer = setTimeout(() => setTimedOut(true), 9000)
    return () => {
      clearTimeout(minTimer)
      clearTimeout(timeoutTimer)
    }
  }, [])

  // 进入退场：只切换一次，避免把隐藏计时器在 exiting 变化时误清理
  useEffect(() => {
    if (!visible || exiting || !minElapsed) return
    if (!engineReady && !timedOut) return

    setExiting(true)
  }, [engineReady, timedOut, minElapsed, visible, exiting])

  // 退场动画结束后再卸载 loading，避免残留的全屏暖光覆盖主画面
  useEffect(() => {
    if (!exiting) return
    const hideTimer = setTimeout(() => setVisible(false), 1150)
    return () => clearTimeout(hideTimer)
  }, [exiting])

  if (!visible) return null

  return <SpiritLoadingScreen ready={engineReady} exiting={exiting} />
}
