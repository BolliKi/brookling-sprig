'use client'

import { useEffect, useMemo, useRef } from 'react'

interface RiftBurstOverlayProps {
  progress: number
}

interface PaperShard {
  angle: number
  distance: number
  size: number
  spin: number
  phase: number
  color: string
}

interface RiftSpark {
  x: number
  baseY: number
  size: number
  phase: number
}

const SHARD_COLORS = ['#FFF8E8', '#F3E3C4', '#E6C894', '#D4A359', '#FBF0D6']

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * 2D → 3D：画卷从中心崩解成纸片，金色冲击环与光柱爆发，
 * 立体灵宠带着景深从纸境后面浮现。
 */
export function RiftBurstOverlay({ progress }: RiftBurstOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const shards = useMemo<PaperShard[]>(
    () =>
      Array.from({ length: 56 }, (_, index) => ({
        angle: (index / 56) * Math.PI * 2 + Math.random() * 0.4,
        distance: 0.28 + Math.random() * 0.62,
        size: 7 + Math.random() * 18,
        spin: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 5),
        phase: Math.random() * Math.PI * 2,
        color: SHARD_COLORS[index % SHARD_COLORS.length]
      })),
    []
  )

  const sparks = useMemo<RiftSpark[]>(
    () =>
      Array.from({ length: 44 }, () => ({
        x: 0.26 + Math.random() * 0.48,
        baseY: 0.42 + Math.random() * 0.5,
        size: 1.5 + Math.random() * 3.4,
        phase: Math.random() * Math.PI * 2
      })),
    []
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const p = Math.max(0, Math.min(1, progress))
    const envelope = Math.sin(p * Math.PI)
    const cx = W * 0.5
    const cy = H * 0.53
    const minDim = Math.min(W, H)

    ctx.clearRect(0, 0, W, H)

    // 光柱：从纸境中心向上撑开
    const pillarWidth = (0.05 + envelope * 0.16) * W
    const pillarGrad = ctx.createLinearGradient(cx - pillarWidth / 2, 0, cx + pillarWidth / 2, 0)
    pillarGrad.addColorStop(0, 'rgba(255, 240, 200, 0)')
    pillarGrad.addColorStop(0.5, `rgba(255, 244, 210, ${(envelope * 0.45).toFixed(3)})`)
    pillarGrad.addColorStop(1, 'rgba(255, 240, 200, 0)')
    ctx.fillStyle = pillarGrad
    ctx.fillRect(cx - pillarWidth / 2, 0, pillarWidth, H)

    // 放射光
    ctx.save()
    ctx.translate(cx, cy)
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + p * 0.8
      const length = minDim * (0.36 + (i % 4) * 0.05)
      ctx.save()
      ctx.rotate(angle)
      const rayGrad = ctx.createLinearGradient(0, 0, length, 0)
      rayGrad.addColorStop(0, `rgba(255, 236, 180, ${(envelope * 0.32).toFixed(3)})`)
      rayGrad.addColorStop(1, 'rgba(255, 236, 180, 0)')
      ctx.fillStyle = rayGrad
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(length, -7 - (i % 3) * 4)
      ctx.lineTo(length, 7 + (i % 3) * 4)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
    ctx.restore()

    // 金色冲击环
    for (let ring = 0; ring < 4; ring++) {
      const radius = (0.08 + easeOutCubic(p) * 0.46 + ring * 0.055) * minDim
      const alpha = envelope * (1 - ring * 0.16) * 0.6
      if (alpha <= 0.01) continue
      ctx.save()
      ctx.strokeStyle = `rgba(243, 199, 104, ${alpha.toFixed(3)})`
      ctx.lineWidth = 2.4 - ring * 0.35
      ctx.beginPath()
      ctx.ellipse(cx, cy + minDim * 0.12, radius, radius * 0.38, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    // 纸片崩解
    const burst = easeOutCubic(Math.min(1, p / 0.62))
    shards.forEach((shard) => {
      const alpha = envelope * (0.35 + (shard.size % 10) / 18)
      if (alpha <= 0.02) return
      const radius = (0.06 + burst * shard.distance) * minDim * 1.15
      const x = cx + Math.cos(shard.angle) * radius
      const y = cy + Math.sin(shard.angle) * radius * 0.68
      const size = shard.size * (0.55 + burst * 0.65)

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(shard.phase + p * shard.spin)
      ctx.globalAlpha = Math.min(1, alpha)
      ctx.fillStyle = shard.color
      ctx.strokeStyle = 'rgba(255, 252, 242, 0.75)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(-size * 0.6, -size * 0.22)
      ctx.lineTo(size * 0.68, -size * 0.42)
      ctx.lineTo(size * 0.34, size * 0.46)
      ctx.lineTo(-size * 0.42, size * 0.24)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    })

    // 上浮金色微粒
    sparks.forEach((spark) => {
      const alpha = envelope * 0.55
      if (alpha <= 0.02) return
      const x = spark.x * W + Math.sin(p * 7 + spark.phase) * 18
      const y = (spark.baseY - p * 0.38 + Math.sin(p * 4 + spark.phase) * 0.02) * H
      ctx.beginPath()
      ctx.arc(x, y, spark.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 226, 142, ${alpha.toFixed(3)})`
      ctx.fill()
    })
  }, [progress, shards, sparks])

  const stageText =
    progress < 0.35
      ? '纸境震动 · 灵息苏醒'
      : progress < 0.62
      ? '破卷而出 · 维度交叠'
      : '立体降临 · 森野归位'
  const percent = Math.min(100, Math.round(progress * 100))

  return (
    <div className='absolute inset-0 z-20 overflow-hidden'>
      <canvas ref={canvasRef} width={1440} height={900} className='h-full w-full' />
      <div className='absolute bottom-[12%] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-field-straw-deep/35 bg-field-rice/90 px-4 py-1.5 font-kai text-[11px] text-field-soil-deep shadow-[0_10px_28px_-18px_rgba(50,35,22,0.8)] backdrop-blur-[2px]'>
        <span className='h-1.5 w-1.5 rounded-full bg-field-hearth animate-pulse' aria-hidden='true' />
        <span>{stageText}</span>
        <span className='tabular-nums text-field-soil/60'>{percent}%</span>
      </div>
    </div>
  )
}
