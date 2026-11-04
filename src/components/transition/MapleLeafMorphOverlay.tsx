'use client'

import { useEffect, useRef } from 'react'

import type { ReconState } from '@/types/companion'

import { drawJapaneseMapleLeaf } from './draw-maple-leaf'

interface MapleLeafMorphOverlayProps {
  reconState: ReconState
}

/**
 * 2D / 3D 双向切换：「秋日红枫旋风 · 灵叶化形」动画叠加层。
 */
export function MapleLeafMorphOverlay({ reconState }: MapleLeafMorphOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leavesRef = useRef<any[]>([]);
  const motesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!reconState.active) {
      leavesRef.current = [];
      motesRef.current = [];
      return;
    }

    const bodyPartAnchors = [
      { cx: 0.5, cy: 0.14, rx: 0.06, ry: 0.05 },
      { cx: 0.34, cy: 0.22, rx: 0.05, ry: 0.09 },
      { cx: 0.66, cy: 0.22, rx: 0.05, ry: 0.09 },
      { cx: 0.5, cy: 0.4, rx: 0.17, ry: 0.13 },
      { cx: 0.5, cy: 0.56, rx: 0.13, ry: 0.06 },
      { cx: 0.34, cy: 0.61, rx: 0.05, ry: 0.06 },
      { cx: 0.66, cy: 0.61, rx: 0.05, ry: 0.06 },
      { cx: 0.5, cy: 0.66, rx: 0.12, ry: 0.09 },
      { cx: 0.67, cy: 0.62, rx: 0.09, ry: 0.11 },
      { cx: 0.41, cy: 0.81, rx: 0.05, ry: 0.09 },
      { cx: 0.59, cy: 0.81, rx: 0.05, ry: 0.09 }
    ];

    const mapleColors = [
      { fill: '#D94E34', vein: '#7C2314' },
      { fill: '#E87A3E', vein: '#8C3B14' },
      { fill: '#F3A833', vein: '#94580E' },
      { fill: '#F7C852', vein: '#9E6E12' }
    ];

    const leaves = [];
    for (let i = 0; i < 65; i++) {
      const zone = bodyPartAnchors[i % bodyPartAnchors.length];
      const randAngle = Math.random() * Math.PI * 2;
      const randDist = Math.sqrt(Math.random());
      const homeX = zone.cx + Math.cos(randAngle) * zone.rx * randDist;
      const homeY = zone.cy + Math.sin(randAngle) * zone.ry * randDist;

      const dx = homeX - 0.5;
      const dy = homeY - 0.52;
      const baseAngle = Math.atan2(dy, dx);
      const swirlRadius = 0.14 + Math.random() * 0.24;
      const swirlHeight = 0.18 + Math.random() * 0.68;
      const colorObj = mapleColors[i % mapleColors.length];

      leaves.push({
        homeX,
        homeY,
        baseAngle,
        swirlRadius,
        swirlHeight,
        swirlTurns: (1.35 + Math.random() * 0.9) * Math.PI * 2,
        size: 11 + Math.random() * 8.5,
        fill: colorObj.fill,
        vein: colorObj.vein,
        spinSpeed: (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 5),
        flutterPhase: Math.random() * Math.PI * 2,
        isLingering: i < 6
      });
    }
    leavesRef.current = leaves;

    const motes = [];
    for (let i = 0; i < 28; i++) {
      motes.push({
        angle: (i / 28) * Math.PI * 2,
        radius: 0.08 + Math.random() * 0.26,
        yBase: 0.2 + Math.random() * 0.66,
        size: 2.2 + Math.random() * 3.2,
        color: i % 2 === 0 ? '#FEF08A' : '#FDBA74'
      });
    }
    motesRef.current = motes;
  }, [reconState.active, reconState.runId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !reconState.active) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const p = reconState.progress;
    const envelope = Math.sin(p * Math.PI);

    ctx.save();
    const auraGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.52,
      12,
      width * 0.5,
      height * 0.52,
      width * 0.42
    );
    auraGrad.addColorStop(0, `rgba(254, 243, 199, ${(envelope * 0.38).toFixed(3)})`);
    auraGrad.addColorStop(0.55, `rgba(251, 191, 36, ${(envelope * 0.16).toFixed(3)})`);
    auraGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(0, 0, width, height);

    for (let rIdx = 0; rIdx < 3; rIdx++) {
      const ribbonProgress = (p * 1.6 + rIdx * 0.32) % 1;
      const ribbonAlpha = Math.sin(ribbonProgress * Math.PI) * envelope * 0.52;
      if (ribbonAlpha > 0.03) {
        const yCenter = height * (0.78 - ribbonProgress * 0.58);
        const dir = rIdx % 2 === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(width * (0.5 - dir * 0.32), yCenter + 28);
        ctx.bezierCurveTo(
          width * (0.5 - dir * 0.12),
          yCenter - 26,
          width * (0.5 + dir * 0.14),
          yCenter + 24,
          width * (0.5 + dir * 0.34),
          yCenter - 22
        );
        ctx.strokeStyle =
          rIdx === 1
            ? `rgba(232, 122, 62, ${ribbonAlpha.toFixed(3)})`
            : `rgba(253, 224, 71, ${ribbonAlpha.toFixed(3)})`;
        ctx.lineWidth = 2.4 - rIdx * 0.4;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    motesRef.current.forEach((mote, idx) => {
      const curAngle = mote.angle + p * Math.PI * 3.2;
      const r = mote.radius * (0.65 + envelope * 0.55);
      const mx = (0.5 + Math.cos(curAngle) * r) * width;
      const my = (mote.yBase - Math.sin(p * Math.PI) * 0.08 + Math.sin(curAngle) * 0.04) * height;
      ctx.beginPath();
      ctx.arc(mx, my, mote.size, 0, Math.PI * 2);
      ctx.fillStyle = mote.color;
      ctx.globalAlpha = Math.min(1, envelope * (0.55 + (idx % 3) * 0.15));
      ctx.fill();
    });

    leavesRef.current.forEach((leaf) => {
      let lx = leaf.homeX;
      let ly = leaf.homeY;
      let alpha = 0;
      let scale = 1;

      const currentSwirlAngle = leaf.baseAngle + p * leaf.swirlTurns;
      const vortexX = 0.5 + Math.cos(currentSwirlAngle) * leaf.swirlRadius;
      const vortexY =
        leaf.swirlHeight + Math.sin(currentSwirlAngle * 1.5) * 0.06 - Math.sin(p * Math.PI) * 0.05;

      if (p < 0.48) {
        const t = Math.max(0, Math.min(1, (p - leaf.homeY * 0.18) / 0.36));
        const ease = t * t * (3 - 2 * t);
        lx = leaf.homeX + (vortexX - leaf.homeX) * ease;
        ly = leaf.homeY + (vortexY - leaf.homeY) * ease;
        alpha = Math.min(1, t * 1.65);
        scale = 0.55 + ease * 0.55;
      } else if (p <= 0.54) {
        lx = vortexX;
        ly = vortexY;
        alpha = 0.96;
        scale = 1.1;
      } else {
        if (leaf.isLingering) {
          const tFall = (p - 0.54) / 0.46;
          lx = vortexX + Math.sin(tFall * Math.PI * 2 + leaf.flutterPhase) * 0.07;
          ly = vortexY + (0.88 - vortexY) * tFall;
          alpha = (1 - tFall) * 0.92;
          scale = 1 - tFall * 0.25;
        } else {
          const partOrderOffset = (1 - leaf.homeY) * 0.14;
          const tGather = Math.max(0, Math.min(1, (p - 0.52 - partOrderOffset) / 0.34));
          const ease = tGather * tGather * (3 - 2 * tGather);
          lx = vortexX + (leaf.homeX - vortexX) * ease;
          ly = vortexY + (leaf.homeY - vortexY) * ease;
          alpha = (1 - ease * 0.88) * 1.05;
          scale = 1.08 - ease * 0.45;
        }
      }

      if (alpha > 0.04) {
        ctx.save();
        ctx.translate(lx * width, ly * height);
        ctx.rotate(leaf.flutterPhase + p * leaf.spinSpeed);
        const flipScaleX = 0.45 + 0.55 * Math.abs(Math.cos(p * 8 + leaf.flutterPhase));
        ctx.scale(scale * flipScaleX, scale);
        ctx.globalAlpha = Math.min(1, alpha);
        drawJapaneseMapleLeaf(ctx, leaf.size, leaf.fill, leaf.vein);
        ctx.restore();
      }
    });

    ctx.restore();
  }, [reconState]);

  if (!reconState.active) return null;

  const pct = Math.min(100, Math.round(reconState.progress * 100));
  const stageText =
    reconState.progress < 0.46
      ? '秋风拂林 · 灵叶散躯'
      : reconState.progress < 0.56
      ? '红枫旋舞 · 维度交叠'
      : '万叶归宗 · 灵躯凝成';

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={520}
        height={480}
        className="w-[380px] h-[360px] sm:w-[480px] sm:h-[450px]"
      />
      <div className="-mt-6 px-4 py-1 rounded-full bg-[#fdfaf3]/95 border border-amber-800/30 text-xs text-amber-950 shadow-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        <span>{stageText} · 百分之{pct}</span>
      </div>
    </div>
  );
}
