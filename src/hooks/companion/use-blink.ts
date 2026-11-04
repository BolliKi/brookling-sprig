'use client'

import { useEffect, useState } from 'react'

/**
 * 随机自然眨眼：每 2.2s ~ 4.7s 眨眼一次，并有 28% 概率追加一次连眨。
 */
export function useBlink() {
  const [isBlinking, setIsBlinking] = useState(false)

  useEffect(() => {
    let blinkTimer: ReturnType<typeof setTimeout> | undefined
    let closeTimer: ReturnType<typeof setTimeout> | undefined
    let doubleTimer: ReturnType<typeof setTimeout> | undefined
    let doubleCloseTimer: ReturnType<typeof setTimeout> | undefined

    const scheduleBlink = () => {
      const delay = 2200 + Math.random() * 2500
      blinkTimer = setTimeout(() => {
        setIsBlinking(true)
        closeTimer = setTimeout(() => {
          setIsBlinking(false)
          if (Math.random() < 0.28) {
            doubleTimer = setTimeout(() => {
              setIsBlinking(true)
              doubleCloseTimer = setTimeout(() => setIsBlinking(false), 110)
            }, 120)
          }
          scheduleBlink()
        }, 140)
      }, delay)
    }

    scheduleBlink()

    return () => {
      clearTimeout(blinkTimer)
      clearTimeout(closeTimer)
      clearTimeout(doubleTimer)
      clearTimeout(doubleCloseTimer)
    }
  }, [])

  return isBlinking
}
