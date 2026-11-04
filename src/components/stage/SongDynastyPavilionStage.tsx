'use client'

import { useEffect, useRef, useState } from 'react'

import type { MoodAtmosphere } from '@configs/mood-atmospheres'
import { lerpHexColor } from '@core/utils/color'
import type { LightingTheme } from '@/types/companion'

interface SongDynastyPavilionStageProps {
  activeTheme: LightingTheme
  atmosphere: MoodAtmosphere
  onRingBronzeBell?: () => void
  /** 立体背景就绪后淡出画布；檐下风铎仍保留，不被一起淡出 */
  canvasVisible?: boolean
}

/**
 * 非卡通化中国风「宋韵山水与江南水榭」写意画卷。
 * Canvas 负责天穹、三叠崇山、平湖烟水、水榭回廊与四时微粒；
 * DOM/SVG 负责檐下可互动的青铜风铎。
 */
export function SongDynastyPavilionStage({
  activeTheme,
  atmosphere,
  onRingBronzeBell,
  canvasVisible = true
}: SongDynastyPavilionStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasVisibleRef = useRef(canvasVisible);
  const [bellSwingBoost, setBellSwingBoost] = useState(0);

  useEffect(() => {
    canvasVisibleRef.current = canvasVisible;
  }, [canvasVisible]);

  const themeTransitionRef = useRef({
    fromTheme: activeTheme,
    toTheme: activeTheme,
    progress: 1,
    startedAt: 0
  });

  useEffect(() => {
    if (themeTransitionRef.current.toTheme.id !== activeTheme.id) {
      themeTransitionRef.current = {
        fromTheme: themeTransitionRef.current.toTheme,
        toTheme: activeTheme,
        progress: 0,
        startedAt: performance.now()
      };
    }
  }, [activeTheme]);

  // 心情氛围（光影 / 漂浮物）独立于时间背景，单独做淡入淡出
  const atmosphereTransitionRef = useRef({
    from: atmosphere,
    to: atmosphere,
    progress: 1,
    startedAt: 0
  });

  useEffect(() => {
    if (atmosphereTransitionRef.current.to.id !== atmosphere.id) {
      atmosphereTransitionRef.current = {
        from: atmosphereTransitionRef.current.to,
        to: atmosphere,
        progress: 0,
        startedAt: performance.now()
      };
    }
  }, [atmosphere]);

  // 预生成宋韵山水画卷元素：竖皴山脉肌理、流云留白、远空飞雁、水墨青莲、前景墨竹与悬浮微粒
  const inkAssetsRef = useRef<any>(null);
  if (!inkAssetsRef.current) {
    // 宋画斧劈皴/雨点竖皴山体纹理线
    const mountainCunLines = Array.from({ length: 58 }, (_, i) => ({
      xRatio: (i * 19.3 % 100) / 100,
      yOffset: (i * 13.7 % 75),
      len: 18 + (i % 5) * 12,
      alpha: 0.08 + (i % 4) * 0.035,
      layer: i % 2
    }));

    // 远空人字形飞雁
    const geeseFlock = [
      { dx: 0, dy: 0 },
      { dx: -16, dy: 7 },
      { dx: 15, dy: 6 },
      { dx: -32, dy: 14 },
      { dx: 31, dy: 13 }
    ];

    // 右侧与左上前景书法墨竹枝叶
    const bambooStems = [
      { baseX: 1365, baseY: 660, topX: 1295, topY: 32, knots: 6, width: 5.2 },
      { baseX: 1408, baseY: 660, topX: 1358, topY: 75, knots: 5, width: 3.8 }
    ];

    const bambooLeaves = Array.from({ length: 36 }, (_, i) => ({
      x: 1275 + ((i * 23) % 135),
      y: 65 + ((i * 31) % 340),
      len: 26 + (i % 4) * 8,
      angle: 2.35 + (i % 5) * 0.14,
      phase: i * 0.4
    }));

    // 湖面水墨青莲荷叶
    const lotusPads = [
      { x: 0.14, y: 0.655, rx: 28, ry: 7.5, hasFlower: true },
      { x: 0.21, y: 0.668, rx: 22, ry: 6, hasFlower: false },
      { x: 0.78, y: 0.658, rx: 32, ry: 8, hasFlower: true },
      { x: 0.85, y: 0.672, rx: 24, ry: 6.5, hasFlower: false }
    ];

    // 四时意境微粒
    const particles = Array.from({ length: 32 }, (_, i) => ({
      x: Math.random(),
      y: 0.18 + Math.random() * 0.56,
      vx: (Math.random() - 0.35) * 0.00028,
      vy: (Math.random() - 0.5) * 0.00022,
      size: 2.0 + (i % 4) * 1.1,
      phase: Math.random() * Math.PI * 2
    }));

    inkAssetsRef.current = {
      mountainCunLines,
      geeseFlock,
      bambooStems,
      bambooLeaves,
      lotusPads,
      particles
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId = null;
    const startTime = performance.now();

    const renderInkLandscape = (now) => {
      rafId = requestAnimationFrame(renderInkLandscape);
      // 立体背景接管画面时暂停绘制，切回平面视图后自动恢复
      if (!canvasVisibleRef.current) return;

      const t = (now - startTime) * 0.001;

      const tr = themeTransitionRef.current;
      if (tr.progress < 1) {
        // 基于真实时间推进，确保不同帧率下背景设色都保持 ~900ms 的平滑过渡
        tr.progress = Math.min(1, (now - tr.startedAt) / 900);
      }
      const p = tr.progress;

      const ar = atmosphereTransitionRef.current;
      if (ar.progress < 1) {
        ar.progress = Math.min(1, (now - ar.startedAt) / 1100);
      }
      const moodP = ar.progress;
      const fromAtmosphere = ar.from;
      const toAtmosphere = ar.to;
      const ft = tr.fromTheme;
      const tt = tr.toTheme;

      const curSkyTop = lerpHexColor(ft.skyTop, tt.skyTop, p);
      const curSkyMid = lerpHexColor(ft.skyMid, tt.skyMid, p);
      const curSkyBottom = lerpHexColor(ft.skyBottom, tt.skyBottom, p);
      const curFarMtn = lerpHexColor(ft.farMountain, tt.farMountain, p);
      const curMidMtn = lerpHexColor(ft.midMountain, tt.midMountain, p);
      const curNearMtn = lerpHexColor(ft.nearMountain, tt.nearMountain, p);
      const curWaterTop = lerpHexColor(ft.waterTop, tt.waterTop, p);
      const curWaterBottom = lerpHexColor(ft.waterBottom, tt.waterBottom, p);
      const curPillar = lerpHexColor(ft.pavilionPillar, tt.pavilionPillar, p);
      const curWood = lerpHexColor(ft.pavilionWood, tt.pavilionWood, p);
      const curStoneTop = lerpHexColor(ft.stoneFloorTop, tt.stoneFloorTop, p);
      const curStoneDark = lerpHexColor(ft.stoneFloorDark, tt.stoneFloorDark, p);
      const curBamboo = lerpHexColor(ft.bambooColor, tt.bambooColor, p);

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ==========================================================
      // 第一层：宋代古绢宣纸天穹设色 + 宣纸经纬暗纹 + 日月清辉
      // ==========================================================
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.66);
      skyGrad.addColorStop(0, curSkyTop);
      skyGrad.addColorStop(0.54, curSkyMid);
      skyGrad.addColorStop(1, curSkyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.66);

      // 古绢经纬细纹（赋予传统绢本设色画质感）
      ctx.save();
      ctx.strokeStyle = tt.isNight ? 'rgba(255,255,255,0.018)' : 'rgba(60,45,30,0.028)';
      ctx.lineWidth = 1;
      for (let y = 0; y < H * 0.68; y += 6) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();

      // 远天落日朱砂圆晖或寒潭皓月
      const sunX = W * 0.72;
      const sunY = tt.isNight ? H * 0.18 : tt.id === 'DUSK_PAVILION' ? H * 0.31 : H * 0.21;
      const sunHalo = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, tt.isNight ? 120 : 190);
      sunHalo.addColorStop(0, tt.isNight ? 'rgba(254, 249, 215, 0.92)' : 'rgba(255, 246, 218, 0.88)');
      sunHalo.addColorStop(0.32, tt.isNight ? 'rgba(218, 232, 248, 0.25)' : 'rgba(245, 208, 156, 0.32)');
      sunHalo.addColorStop(1, 'rgba(255, 245, 220, 0)');
      ctx.fillStyle = sunHalo;
      ctx.fillRect(0, 0, W, H * 0.64);

      ctx.beginPath();
      ctx.arc(sunX, sunY, tt.isNight ? 24 : 32, 0, Math.PI * 2);
      ctx.fillStyle = tt.isNight
        ? 'rgba(254, 250, 224, 0.88)'
        : tt.id === 'DUSK_PAVILION'
        ? 'rgba(224, 102, 72, 0.72)'
        : 'rgba(255, 248, 228, 0.78)';
      ctx.fill();

      // 远空飞雁队列（写意水墨飞鸟）
      const flockX = ((0.22 + t * 0.008) % 0.85) * W;
      const flockY = H * 0.17 + Math.sin(t * 0.7) * 8;
      ctx.save();
      ctx.strokeStyle = tt.isNight ? 'rgba(226, 232, 240, 0.45)' : 'rgba(56, 66, 72, 0.55)';
      ctx.lineWidth = 1.6;
      inkAssetsRef.current.geeseFlock.forEach((g, idx) => {
        const wingFlap = Math.sin(t * 5.2 + idx * 0.8) * 3.5;
        const gx = flockX + g.dx;
        const gy = flockY + g.dy;
        ctx.beginPath();
        ctx.moveTo(gx - 6, gy + wingFlap);
        ctx.quadraticCurveTo(gx - 2, gy - 3, gx, gy);
        ctx.quadraticCurveTo(gx + 2, gy - 3, gx + 6, gy + wingFlap);
        ctx.stroke();
      });
      ctx.restore();

      // ==========================================================
      // 第二层：宋画三叠崇山峻岭、竖皴肌理、山间留白云气与半山重檐古亭
      // ==========================================================
      // 1. 远景高远主峰（峻拔山势）
      ctx.beginPath();
      ctx.moveTo(0, H * 0.54);
      ctx.lineTo(W * 0.12, H * 0.36);
      ctx.lineTo(W * 0.23, H * 0.24);
      ctx.lineTo(W * 0.35, H * 0.39);
      ctx.lineTo(W * 0.48, H * 0.31);
      ctx.lineTo(W * 0.61, H * 0.19);
      ctx.lineTo(W * 0.74, H * 0.35);
      ctx.lineTo(W * 0.88, H * 0.28);
      ctx.lineTo(W, H * 0.41);
      ctx.lineTo(W, H * 0.62);
      ctx.lineTo(0, H * 0.62);
      ctx.closePath();
      ctx.fillStyle = curFarMtn;
      ctx.fill();

      // 远山与中山之间的宋画留白流云气韵
      const cloudBand1 = ctx.createLinearGradient(0, H * 0.34, 0, H * 0.49);
      cloudBand1.addColorStop(0, 'rgba(255,255,255,0)');
      cloudBand1.addColorStop(0.5, tt.mistColor);
      cloudBand1.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = cloudBand1;
      ctx.fillRect(0, H * 0.33, W, H * 0.17);

      // 2. 中景深远层峦与竖皴水墨肌理
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, H * 0.56);
      ctx.lineTo(W * 0.16, H * 0.41);
      ctx.lineTo(W * 0.29, H * 0.33);
      ctx.lineTo(W * 0.44, H * 0.46);
      ctx.lineTo(W * 0.56, H * 0.42);
      ctx.lineTo(W * 0.69, H * 0.32);
      ctx.lineTo(W * 0.83, H * 0.44);
      ctx.lineTo(W, H * 0.38);
      ctx.lineTo(W, H * 0.62);
      ctx.lineTo(0, H * 0.62);
      ctx.closePath();
      ctx.fillStyle = curMidMtn;
      ctx.fill();
      ctx.clip();

      // 宋画竖皴法线条（表现山石嶙峋质感）
      inkAssetsRef.current.mountainCunLines.forEach((cun) => {
        ctx.strokeStyle = `rgba(15, 23, 28, ${cun.alpha})`;
        ctx.lineWidth = 2.2;
        const cx = cun.xRatio * W;
        const cy = H * 0.32 + cun.yOffset * 2.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 2, cy + cun.len);
        ctx.stroke();
      });
      ctx.restore();

      // 半山腰传统飞檐古亭剪影 (x = 0.29W, y = 0.33H)
      const pavX = W * 0.29;
      const pavY = H * 0.33;
      ctx.save();
      ctx.fillStyle = curNearMtn;
      ctx.fillRect(pavX - 14, pavY - 12, 3, 14);
      ctx.fillRect(pavX + 11, pavY - 12, 3, 14);
      ctx.beginPath();
      ctx.moveTo(pavX - 24, pavY - 11);
      ctx.quadraticCurveTo(pavX, pavY - 24, pavX + 24, pavY - 11);
      ctx.lineTo(pavX + 18, pavY - 9);
      ctx.quadraticCurveTo(pavX, pavY - 17, pavX - 18, pavY - 9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. 近景平远峭壁、古松剪影与山脚烟岚
      ctx.beginPath();
      ctx.moveTo(0, H * 0.46);
      ctx.lineTo(W * 0.19, H * 0.44);
      ctx.lineTo(W * 0.34, H * 0.55);
      ctx.lineTo(W * 0.72, H * 0.56);
      ctx.lineTo(W * 0.86, H * 0.45);
      ctx.lineTo(W, H * 0.47);
      ctx.lineTo(W, H * 0.62);
      ctx.lineTo(0, H * 0.62);
      ctx.closePath();
      ctx.fillStyle = curNearMtn;
      ctx.fill();

      // 左岸峭壁迎客古松剪影
      const pineX = W * 0.17;
      const pineY = H * 0.445;
      ctx.save();
      ctx.strokeStyle = curNearMtn;
      ctx.fillStyle = curNearMtn;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(pineX, pineY + 12);
      ctx.quadraticCurveTo(pineX + 8, pineY - 15, pineX + 28, pineY - 18);
      ctx.stroke();
      [
        [pineX + 14, pineY - 16, 18, 5],
        [pineX + 28, pineY - 20, 22, 6],
        [pineX + 4, pineY - 10, 14, 4.5]
      ].forEach(([px, py, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 山脚与湖面交界处的横幅烟水云雾
      const mistBand2 = ctx.createLinearGradient(0, H * 0.51, 0, H * 0.61);
      mistBand2.addColorStop(0, 'rgba(255,255,255,0)');
      mistBand2.addColorStop(0.5, tt.mistColor);
      mistBand2.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = mistBand2;
      ctx.fillRect(0, H * 0.5, W, H * 0.12);

      // ==========================================================
      // 第三层：平湖烟水、倒影涟漪、乌篷孤舟与水墨青莲
      // ==========================================================
      const waterGrad = ctx.createLinearGradient(0, H * 0.56, 0, H * 0.715);
      waterGrad.addColorStop(0, curWaterTop);
      waterGrad.addColorStop(1, curWaterBottom);
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, H * 0.56, W, H * 0.16);

      // 湖面水平水波纹
      ctx.save();
      ctx.strokeStyle = tt.isNight ? 'rgba(254, 240, 178, 0.18)' : 'rgba(255, 255, 255, 0.38)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 12; i++) {
        const wx = ((0.1 + i * 0.08 + Math.sin(t * 0.4 + i) * 0.015) % 0.88) * W;
        const wy = H * (0.585 + (i % 4) * 0.024);
        ctx.beginPath();
        ctx.moveTo(wx - 28, wy);
        ctx.lineTo(wx + 28, wy);
        ctx.stroke();
      }
      ctx.restore();

      // 缓行于平湖之上的水墨乌篷扁舟
      const boatX = (0.64 + Math.sin(t * 0.18) * 0.05) * W;
      const boatY = H * 0.608 + Math.sin(t * 1.4) * 1.5;
      ctx.save();
      ctx.fillStyle = tt.isNight ? '#0a121a' : '#2b3336';
      ctx.beginPath();
      ctx.moveTo(boatX - 34, boatY);
      ctx.quadraticCurveTo(boatX, boatY + 9, boatX + 36, boatY - 1);
      ctx.lineTo(boatX + 26, boatY + 5);
      ctx.quadraticCurveTo(boatX, boatY + 11, boatX - 26, boatY + 5);
      ctx.closePath();
      ctx.fill();
      // 乌篷竹拱棚
      ctx.beginPath();
      ctx.arc(boatX - 2, boatY + 1, 13, Math.PI, 0);
      ctx.fill();
      // 船头温润风灯（夜晚与暮色亮起）
      if (tt.isNight || tt.id === 'DUSK_PAVILION') {
        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(boatX + 22, boatY - 3, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 近岸水墨青莲荷叶与素雅莲花
      inkAssetsRef.current.lotusPads.forEach((pad, idx) => {
        const lx = pad.x * W + Math.sin(t * 1.1 + idx) * 3;
        const ly = pad.y * H;
        ctx.save();
        ctx.fillStyle = tt.isNight ? '#16282a' : '#3a5748';
        ctx.beginPath();
        ctx.ellipse(lx, ly, pad.rx, pad.ry, 0, 0, Math.PI * 2);
        ctx.fill();

        if (pad.hasFlower) {
          ctx.strokeStyle = tt.isNight ? '#1e3330' : '#3a5748';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(lx + 4, ly);
          ctx.lineTo(lx + 6, ly - 18);
          ctx.stroke();

          ctx.fillStyle = tt.isNight ? '#e2e8f0' : '#fce7f3';
          ctx.beginPath();
          ctx.ellipse(lx + 6, ly - 21, 5, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // ==========================================================
      // 第四层：江南古典园林水榭回廊建筑框景（青石台基、朱漆廊柱、冰裂纹花窗、雕花挂落与墨竹）
      // ==========================================================
      const floorTopY = H * 0.715;

      // 1. 临水汉白玉/青石束腰栏杆基座与青石板回廊地面
      ctx.fillStyle = tt.isNight ? '#242930' : '#6e6a61';
      ctx.fillRect(0, floorTopY - 12, W, 14);

      const stoneGrad = ctx.createLinearGradient(0, floorTopY, 0, H);
      stoneGrad.addColorStop(0, curStoneTop);
      stoneGrad.addColorStop(0.18, curStoneDark);
      stoneGrad.addColorStop(1, '#2d2a26');
      ctx.fillStyle = stoneGrad;
      ctx.fillRect(0, floorTopY, W, H - floorTopY);

      // 青石台基前缘高光棱线与透视石板砖缝
      ctx.fillStyle = tt.isNight ? 'rgba(148, 163, 184, 0.2)' : 'rgba(255, 252, 240, 0.42)';
      ctx.fillRect(0, floorTopY, W, 3);

      ctx.strokeStyle = 'rgba(20, 18, 15, 0.24)';
      ctx.lineWidth = 1.5;
      const vanishX = W * 0.5;
      const vanishY = H * 0.4;
      for (let i = -6; i <= 6; i++) {
        const bottomX = vanishX + i * 170;
        const dx = bottomX - vanishX;
        const dy = H - vanishY;
        const tEdge = (floorTopY - vanishY) / dy;
        const topX = vanishX + dx * tEdge;
        ctx.beginPath();
        ctx.moveTo(topX, floorTopY);
        ctx.lineTo(bottomX, H);
        ctx.stroke();
      }
      [0.775, 0.845, 0.92].forEach((ry) => {
        ctx.beginPath();
        ctx.moveTo(0, H * ry);
        ctx.lineTo(W, H * ry);
        ctx.stroke();
      });

      // 2. 左侧江南水榭冰裂纹格扇花窗与朱漆廊柱（内透宣纸宫灯暖光）
      const windowWidth = 92;
      ctx.save();
      const winGrad = ctx.createLinearGradient(0, 36, windowWidth, floorTopY);
      winGrad.addColorStop(0, tt.windowGlow);
      winGrad.addColorStop(1, 'rgba(235, 210, 168, 0.45)');
      ctx.fillStyle = winGrad;
      ctx.fillRect(0, 34, windowWidth - 20, floorTopY - 22);

      // 古典步步锦/冰裂纹窗格棂条
      ctx.strokeStyle = curWood;
      ctx.lineWidth = 2.6;
      ctx.strokeRect(2, 34, windowWidth - 22, floorTopY - 22);
      ctx.lineWidth = 1.5;
      for (let wy = 80; wy < floorTopY - 70; wy += 52) {
        ctx.beginPath();
        ctx.moveTo(2, wy);
        ctx.lineTo(windowWidth - 20, wy);
        ctx.stroke();
        ctx.strokeRect(18, wy - 36, windowWidth - 54, 24);
      }

      // 格扇底部雕花裙板
      ctx.fillStyle = curWood;
      ctx.fillRect(2, floorTopY - 78, windowWidth - 22, 66);

      // 水榭左侧大漆廊柱
      ctx.fillStyle = curPillar;
      ctx.fillRect(windowWidth - 20, 26, 24, floorTopY - 12);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(windowWidth - 5, 26, 4, floorTopY - 12);
      ctx.restore();

      // 3. 右侧写意书法墨竹（随清风微拂）
      ctx.save();
      const bambooSway = Math.sin(t * 1.3) * 6;
      ctx.strokeStyle = curBamboo;
      ctx.lineCap = 'round';
      inkAssetsRef.current.bambooStems.forEach((stem) => {
        ctx.lineWidth = stem.width;
        ctx.beginPath();
        ctx.moveTo(stem.baseX, stem.baseY);
        ctx.quadraticCurveTo(
          (stem.baseX + stem.topX) * 0.5 + bambooSway * 0.5,
          (stem.baseY + stem.topY) * 0.5,
          stem.topX + bambooSway,
          stem.topY
        );
        ctx.stroke();
      });

      ctx.fillStyle = curBamboo;
      inkAssetsRef.current.bambooLeaves.forEach((lf) => {
        const lSway = Math.sin(t * 2.0 + lf.phase) * 0.08;
        ctx.save();
        ctx.translate(lf.x + bambooSway * 0.7, lf.y);
        ctx.rotate(lf.angle + lSway);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(lf.len * 0.5, -3.5, lf.len, 0);
        ctx.quadraticCurveTo(lf.len * 0.5, 3.5, 0, 0);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();

      // 4. 顶部水榭额枋与中式回纹雕花挂落（Gualuo）
      ctx.fillStyle = curWood;
      ctx.fillRect(0, 0, W, 32);
      ctx.strokeStyle = curWood;
      ctx.lineWidth = 2.2;
      // 两侧挂落几何棂格装饰
      ctx.strokeRect(96, 32, 140, 22);
      ctx.strokeRect(114, 38, 104, 10);
      ctx.strokeRect(W - 236, 32, 140, 22);
      ctx.strokeRect(W - 218, 38, 104, 10);

      // 5. 心情氛围微粒（烟雾花瓣 / 金色松花粉 / 粉色花瓣 / 冷蓝月辉）
      const driftFactor =
        fromAtmosphere.driftFactor +
        (toAtmosphere.driftFactor - fromAtmosphere.driftFactor) * moodP;

      inkAssetsRef.current.particles.forEach((pt, idx) => {
        pt.x = (pt.x + pt.vx * driftFactor + 1) % 1;
        pt.y = pt.y + pt.vy * driftFactor + Math.sin(t * 1.3 + pt.phase) * 0.00035;
        if (pt.y < 0.14) pt.y = 0.7;
        if (pt.y > 0.72) pt.y = 0.16;

        const px = pt.x * W;
        const py = pt.y * H;

        const drawParticle = (moodStyle: MoodAtmosphere, alpha: number) => {
          if (alpha <= 0.01 || idx >= moodStyle.particleCount) return;
          ctx.save();
          ctx.globalAlpha = alpha;

          if (moodStyle.particleType === 'MOON_MOTE') {
            const glow = 0.35 + 0.65 * Math.sin(t * 2.4 + pt.phase);
            const moteRadius = 14 * moodStyle.particleScale;
            const moteGrad = ctx.createRadialGradient(px, py, 1, px, py, moteRadius);
            moteGrad.addColorStop(0, `rgba(239, 246, 255, ${glow.toFixed(3)})`);
            moteGrad.addColorStop(0.45, `rgba(147, 197, 253, ${(glow * 0.45).toFixed(3)})`);
            moteGrad.addColorStop(1, 'rgba(147, 197, 253, 0)');
            ctx.fillStyle = moteGrad;
            ctx.beginPath();
            ctx.arc(px, py, moteRadius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.translate(px, py);
            ctx.rotate(t * 0.8 + idx);
            ctx.fillStyle = moodStyle.particleColor;
            if (moodStyle.particleGlow) {
              ctx.shadowColor = moodStyle.particleColor;
              ctx.shadowBlur = 10;
            }
            const particleScale = moodStyle.particleScale;
            ctx.beginPath();
            ctx.ellipse(
              0,
              0,
              pt.size * 1.2 * particleScale,
              pt.size * 0.7 * particleScale,
              0,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }

          ctx.restore();
        };

        // 心情切换时，旧氛围淡出、新氛围淡入，避免粒子颜色与形态瞬间跳变
        if (
          moodP < 1 &&
          (fromAtmosphere.particleType !== toAtmosphere.particleType ||
            fromAtmosphere.particleColor !== toAtmosphere.particleColor)
        ) {
          drawParticle(fromAtmosphere, 1 - moodP);
          drawParticle(toAtmosphere, moodP);
        } else {
          drawParticle(toAtmosphere, 1);
        }
      });
    };

    rafId = requestAnimationFrame(renderInkLandscape);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleBellClick = (e) => {
    e.stopPropagation();
    setBellSwingBoost(Date.now());
    if (onRingBronzeBell) onRingBronzeBell();
  };

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      <canvas
        ref={canvasRef}
        width={1440}
        height={900}
        className="w-full h-full object-cover"
        style={{
          opacity: canvasVisible ? 1 : 0,
          transition: 'opacity 700ms ease'
        }}
      />

      {/* 水榭檐下悬挂的可互动「古法青铜风铎与双鱼玉佩朱红流苏」 */}
      <div
        onClick={handleBellClick}
        title="点击轻触檐下青铜风铎，奏响古琴泛音"
        className="absolute top-6 right-8 sm:right-20 z-20 pointer-events-auto cursor-pointer group"
      >
        <svg
          width="68"
          height="176"
          viewBox="0 0 68 176"
          className="overflow-visible"
          style={{
            transformOrigin: '34px 0px',
            animation: bellSwingBoost
              ? 'windChimeRing 1.4s ease-in-out infinite'
              : 'windChimeBreeze 4.6s ease-in-out infinite'
          }}
        >
          <defs>
            <linearGradient id="bronzeBellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5c7a72" />
              <stop offset="55%" stopColor="#3c524b" />
              <stop offset="100%" stopColor="#273631" />
            </linearGradient>
          </defs>
          {/* 朱红丝绦挂绳 */}
          <line x1="34" y1="0" x2="34" y2="20" stroke="#991b1b" strokeWidth="2.2" />
          {/* 青铜风铎钟体（带云雷纹饰边与双翼棱角） */}
          <path
            d="M 22 20 L 46 20 L 52 54 Q 34 50 16 54 Z"
            fill="url(#bronzeBellGrad)"
            stroke="#d97706"
            strokeWidth="1.2"
          />
          <line x1="20" y1="44" x2="48" y2="44" stroke="#f59e0b" strokeWidth="1" opacity="0.65" />
          {/* 铃舌与白玉环坠 */}
          <line x1="34" y1="52" x2="34" y2="86" stroke="#991b1b" strokeWidth="1.6" />
          <circle cx="34" cy="74" r="6.5" fill="none" stroke="#e2e8f0" strokeWidth="2.8" />
          {/* 随风轻摆的宋锦书签与朱红丝绦流苏 */}
          <g
            style={{
              transformOrigin: '34px 86px',
              animation: 'tanzakuFlutter 3.2s ease-in-out infinite'
            }}
          >
            <rect
              x="25"
              y="86"
              width="18"
              height="58"
              rx="2"
              fill="#f5ebe0"
              stroke="#991b1b"
              strokeWidth="1.2"
            />
            <line x1="34" y1="96" x2="34" y2="134" stroke="#7c2d12" strokeWidth="1.2" strokeDasharray="4 3" />
            <path d="M 31 144 L 28 166 M 34 144 L 34 168 M 37 144 L 40 166" stroke="#b91c1c" strokeWidth="1.6" />
          </g>
        </svg>
      </div>
    </div>
  );
}
