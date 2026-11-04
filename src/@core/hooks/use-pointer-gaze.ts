'use client'

import { useCallback, useState } from 'react'
import type { MouseEvent } from 'react'

/**
 * 将视口内的指针位置归一化到 [-1, 1]，供角色视线追踪与视差使用。
 */
export function usePointerGaze() {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })

  const handleViewportMouseMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)))
    const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)))
    setMouseOffset({ x: normX, y: normY })
  }, [])

  return { mouseOffset, handleViewportMouseMove }
}
