export function drawJapaneseMapleLeaf(
  ctx: CanvasRenderingContext2D,
  size: number,
  fillColor: string,
  veinColor: string
) {
  const s = size / 14;
  ctx.save();
  ctx.scale(s, s);

  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.lineTo(0, 7);
  ctx.bezierCurveTo(3, 7, 8, 9, 10, 6);
  ctx.bezierCurveTo(8, 4, 6, 3, 5, 2);
  ctx.bezierCurveTo(9, 1, 13, -1, 14, -4);
  ctx.bezierCurveTo(10, -5, 7, -4, 5, -3);
  ctx.bezierCurveTo(6, -7, 4, -12, 0, -15);
  ctx.bezierCurveTo(-4, -12, -6, -7, -5, -3);
  ctx.bezierCurveTo(-7, -4, -10, -5, -14, -4);
  ctx.bezierCurveTo(-13, -1, -9, 1, -5, 2);
  ctx.bezierCurveTo(-6, 3, -8, 4, -10, 6);
  ctx.bezierCurveTo(-8, 9, -3, 7, 0, 7);
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = 0.85;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 11);
  ctx.lineTo(0, -11);
  ctx.moveTo(0, 1);
  ctx.lineTo(9, -3);
  ctx.moveTo(0, 1);
  ctx.lineTo(-9, -3);
  ctx.moveTo(0, 4);
  ctx.lineTo(6, 5);
  ctx.moveTo(0, 4);
  ctx.lineTo(-6, 5);
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = 0.65;
  ctx.stroke();

  ctx.restore();
}
