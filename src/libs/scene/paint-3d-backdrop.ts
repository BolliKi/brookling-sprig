import type { LightingTheme } from '@/types/companion'

/**
 * 立体视图的远景画卷烘焙。
 * 只绘制「天穹 + 三叠崇山 + 云气 + 日月」这一层，水面、台基、水榭与墨竹交给 three.js 几何体，
 * 让拖拽视角时近景产生真实视差，而远山仍保留宋韵水墨的原始质感。
 */

const BACKDROP_WIDTH = 1440;
const BACKDROP_HEIGHT = 900;

export const BACKDROP_TEXTURE_ASPECT = BACKDROP_WIDTH / BACKDROP_HEIGHT;
export const BACKDROP_WATERLINE_RATIO = 0.56;

const MOUNTAIN_CUN_LINES = Array.from({ length: 58 }, (_, i) => ({
  xRatio: ((i * 19.3) % 100) / 100,
  yOffset: (i * 13.7) % 75,
  len: 18 + (i % 5) * 12,
  alpha: 0.08 + (i % 4) * 0.035
}));

const WATER_RIPPLES = Array.from({ length: 12 }, (_, i) => ({
  x: 0.08 + i * 0.076,
  y: 0.575 + (i % 4) * 0.018,
  width: 26 + (i % 3) * 10
}));

export function createBackdropCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = BACKDROP_WIDTH;
  canvas.height = BACKDROP_HEIGHT;
  return canvas;
}

export function paintBackdrop(canvas: HTMLCanvasElement, theme: LightingTheme): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // 第一层：天穹设色 + 宣纸经纬暗纹
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.66);
  skyGrad.addColorStop(0, theme.skyTop);
  skyGrad.addColorStop(0.54, theme.skyMid);
  skyGrad.addColorStop(1, theme.skyBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H * 0.68);

  ctx.save();
  ctx.strokeStyle = theme.isNight ? 'rgba(255,255,255,0.018)' : 'rgba(60,45,30,0.028)';
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
  const sunY = theme.isNight
    ? H * 0.18
    : theme.id === 'DUSK_PAVILION'
    ? H * 0.31
    : H * 0.21;
  const sunHalo = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, theme.isNight ? 120 : 190);
  sunHalo.addColorStop(
    0,
    theme.isNight ? 'rgba(254, 249, 215, 0.92)' : 'rgba(255, 246, 218, 0.88)'
  );
  sunHalo.addColorStop(
    0.32,
    theme.isNight ? 'rgba(218, 232, 248, 0.25)' : 'rgba(245, 208, 156, 0.32)'
  );
  sunHalo.addColorStop(1, 'rgba(255, 245, 220, 0)');
  ctx.fillStyle = sunHalo;
  ctx.fillRect(0, 0, W, H * 0.64);

  ctx.beginPath();
  ctx.arc(sunX, sunY, theme.isNight ? 24 : 32, 0, Math.PI * 2);
  ctx.fillStyle = theme.isNight
    ? 'rgba(254, 250, 224, 0.88)'
    : theme.id === 'DUSK_PAVILION'
    ? 'rgba(224, 102, 72, 0.72)'
    : 'rgba(255, 248, 228, 0.78)';
  ctx.fill();

  // 第二层：三叠崇山与竖皴肌理
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
  ctx.fillStyle = theme.farMountain;
  ctx.fill();

  const cloudBand1 = ctx.createLinearGradient(0, H * 0.34, 0, H * 0.49);
  cloudBand1.addColorStop(0, 'rgba(255,255,255,0)');
  cloudBand1.addColorStop(0.5, theme.mistColor);
  cloudBand1.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = cloudBand1;
  ctx.fillRect(0, H * 0.33, W, H * 0.17);

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
  ctx.fillStyle = theme.midMountain;
  ctx.fill();
  ctx.clip();

  MOUNTAIN_CUN_LINES.forEach((cun) => {
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

  // 半山腰传统飞檐古亭剪影
  const pavX = W * 0.29;
  const pavY = H * 0.33;
  ctx.save();
  ctx.fillStyle = theme.nearMountain;
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

  // 近景峭壁、古松与山脚烟岚
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
  ctx.fillStyle = theme.nearMountain;
  ctx.fill();

  const pineX = W * 0.17;
  const pineY = H * 0.445;
  ctx.save();
  ctx.strokeStyle = theme.nearMountain;
  ctx.fillStyle = theme.nearMountain;
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

  const mistBand = ctx.createLinearGradient(0, H * 0.51, 0, H * 0.61);
  mistBand.addColorStop(0, 'rgba(255,255,255,0)');
  mistBand.addColorStop(0.5, theme.mistColor);
  mistBand.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = mistBand;
  ctx.fillRect(0, H * 0.5, W, H * 0.12);

  // 第三层：水线以下的过渡水色。
  // 3D 水面远端会淡出，这一层用来衔接画卷与几何水面，避免出现硬边。
  const waterGrad = ctx.createLinearGradient(0, H * BACKDROP_WATERLINE_RATIO, 0, H);
  waterGrad.addColorStop(0, theme.waterTop);
  waterGrad.addColorStop(0.55, theme.waterBottom);
  waterGrad.addColorStop(1, theme.waterBottom);
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, H * BACKDROP_WATERLINE_RATIO, W, H * (1 - BACKDROP_WATERLINE_RATIO));

  ctx.save();
  ctx.strokeStyle = theme.isNight ? 'rgba(254, 240, 178, 0.14)' : 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1.2;
  WATER_RIPPLES.forEach((ripple) => {
    const rx = ripple.x * W;
    const ry = ripple.y * H;
    ctx.beginPath();
    ctx.moveTo(rx - ripple.width, ry);
    ctx.lineTo(rx + ripple.width, ry);
    ctx.stroke();
  });
  ctx.restore();
}
