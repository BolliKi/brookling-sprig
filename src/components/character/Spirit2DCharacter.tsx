'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

import { EMOTION_STATES } from '@configs/emotions'
import type { EmotionKey, ReconState } from '@/types/companion'

interface Spirit2DCharacterProps {
  emotionState: EmotionKey
  actionVariantId: string
  mouseOffset: { x: number; y: number }
  isBlinking: boolean
  onPetCompanion: () => void
  petBurst: number
  reconState: ReconState
  isSpeaking: boolean
  mouthOpenRef: MutableRefObject<number>
}

/**
 * 平面森野小灵：12 种动作变体 + 一笔画短萌小猫腿与三瓣山竹猫爪 + 实时童声口型同步。
 */
export function Spirit2DCharacter({
  emotionState,
  actionVariantId,
  mouseOffset,
  isBlinking,
  onPetCompanion,
  petBurst,
  reconState,
  isSpeaking,
  mouthOpenRef
}: Spirit2DCharacterProps) {
  const [earTwitch, setEarTwitch] = useState(false);
  const [squashStyle, setSquashStyle] = useState({ scaleX: 1, scaleY: 1 });
  const [smoothGaze, setSmoothGaze] = useState({ x: 0, y: 0 });
  const outerMouthRef = useRef<SVGEllipseElement | null>(null);
  const innerTongueRef = useRef<SVGEllipseElement | null>(null);

  const targetMouseRef = useRef(mouseOffset);
  useEffect(() => {
    targetMouseRef.current = mouseOffset;
  }, [mouseOffset]);

  useEffect(() => {
    let rafId;
    const updateSpring = () => {
      setSmoothGaze((prev) => ({
        x: prev.x + (targetMouseRef.current.x - prev.x) * 0.14,
        y: prev.y + (targetMouseRef.current.y - prev.y) * 0.14
      }));
      // 直接通过 DOM 属性更新 2D 嘴巴开合，避免触发 React 全组件重渲染导致语音卡顿
      if (outerMouthRef.current && innerTongueRef.current) {
        const m = mouthOpenRef ? mouthOpenRef.current : 0;
        outerMouthRef.current.setAttribute('rx', (6.5 + m * 4.5).toFixed(2));
        outerMouthRef.current.setAttribute('ry', (3.2 + m * 6.8).toFixed(2));
        innerTongueRef.current.setAttribute('cy', (1.8 + m * 2.2).toFixed(2));
        innerTongueRef.current.setAttribute('rx', (4.2 + m * 2.5).toFixed(2));
        innerTongueRef.current.setAttribute('ry', (2.0 + m * 3.2).toFixed(2));
      }
      rafId = requestAnimationFrame(updateSpring);
    };
    rafId = requestAnimationFrame(updateSpring);
    return () => cancelAnimationFrame(rafId);
  }, [mouthOpenRef]);

  useEffect(() => {
    const twitchInterval = setInterval(() => {
      if (Math.random() < 0.6) {
        setEarTwitch(true);
        setTimeout(() => setEarTwitch(false), 260);
      }
    }, 3000);
    return () => clearInterval(twitchInterval);
  }, []);

  useEffect(() => {
    setSquashStyle({ scaleX: 1.08, scaleY: 0.92 });
    const t1 = setTimeout(() => setSquashStyle({ scaleX: 0.95, scaleY: 1.05 }), 120);
    const t2 = setTimeout(() => setSquashStyle({ scaleX: 1.02, scaleY: 0.98 }), 240);
    const t3 = setTimeout(() => setSquashStyle({ scaleX: 1, scaleY: 1 }), 360);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [emotionState, actionVariantId, petBurst]);

  const gx =
    actionVariantId === 'SHY_HIDE_TAIL'
      ? -0.55
      : emotionState === 'SHY'
      ? -0.3 + smoothGaze.x * 0.35
      : smoothGaze.x;
  const gy =
    actionVariantId === 'SHY_FIDGET_PAWS'
      ? 0.45
      : emotionState === 'SHY'
      ? 0.22 + smoothGaze.y * 0.25
      : smoothGaze.y;

  const tailParallax = { x: -gx * 8, y: -gy * 4 };
  const legParallax = { x: gx * 2, y: gy * 1.5 };
  const torsoParallax = { x: gx * 4.5, y: gy * 3 };
  const headParallax = { x: gx * 10, y: gy * 6.5, rot: gx * 4.2 };
  const faceParallax = { x: gx * 17, y: gy * 10 };
  const earParallax = { x: gx * 6, y: gy * 4 };
  const sproutParallax = { x: gx * 12, rot: -gx * 8 };

  const twitchDelta = earTwitch ? -9 : 0;
  const leftEarAngle =
    (emotionState === 'HAPPY'
      ? -10
      : emotionState === 'SHY'
      ? -46
      : emotionState === 'SLEEPY'
      ? -36
      : -16) + twitchDelta;
  const rightEarAngle =
    (emotionState === 'HAPPY'
      ? 10
      : emotionState === 'SHY'
      ? 46
      : emotionState === 'SLEEPY'
      ? 36
      : 16) -
    twitchDelta * 0.6;

  // 根据 12 种动作变体计算左右连肩前爪的姿态角与关键帧
  const getForelimbPose = () => {
    switch (actionVariantId) {
      case 'IDLE_LOOK_AROUND':
        return { leftRot: 16, rightRot: -58, animClass: '' };
      case 'IDLE_GROOM_PAW':
        return { leftRot: 102, rightRot: -14, animClass: 'groomLeftPaw' };
      case 'HAPPY_RAISE_PAWS':
        return { leftRot: 126, rightRot: -126, animClass: 'waveBothPaws' };
      case 'HAPPY_DANCE_SPIN':
        return { leftRot: 96, rightRot: -96, animClass: 'danceAlternatePaws' };
      case 'HAPPY_STAR_JUMP':
        return { leftRot: 138, rightRot: -138, animClass: '' };
      case 'SHY_COVER_CHEEK':
        return { leftRot: -42, rightRot: 42, animClass: '' };
      case 'SHY_HIDE_TAIL':
        return { leftRot: -26, rightRot: 48, animClass: '' };
      case 'SHY_FIDGET_PAWS':
        return { leftRot: -36, rightRot: 36, animClass: 'fidgetPaws' };
      case 'SLEEPY_BUBBLE':
        return { leftRot: -16, rightRot: 16, animClass: '' };
      case 'SLEEPY_HEAD_NOD':
        return { leftRot: -12, rightRot: 12, animClass: '' };
      case 'SLEEPY_STRETCH_YAWN':
        return { leftRot: 118, rightRot: -118, animClass: 'stretchPaws' };
      default:
        return { leftRot: 14, rightRot: -14, animClass: '' };
    }
  };

  const forelimbPose = getForelimbPose();

  // 根据 12 种动作变体选择主身体动画与头部专属动画
  const bodyAnimStyle = useMemo(() => {
    switch (actionVariantId) {
      case 'HAPPY_RAISE_PAWS':
        return 'spiritHappyJump 0.85s ease-in-out infinite';
      case 'HAPPY_DANCE_SPIN':
        return 'spiritDanceSway 0.72s ease-in-out infinite';
      case 'HAPPY_STAR_JUMP':
        return 'spiritStarHighJump 0.78s ease-in-out infinite';
      case 'SHY_COVER_CHEEK':
        return 'spiritShyWiggle 2.2s ease-in-out infinite';
      case 'SHY_HIDE_TAIL':
        return 'spiritShyPeek 2.6s ease-in-out infinite';
      case 'SHY_FIDGET_PAWS':
        return 'spiritShyWiggle 1.8s ease-in-out infinite';
      case 'SLEEPY_HEAD_NOD':
        return 'spiritFloat 4.8s ease-in-out infinite';
      case 'SLEEPY_STRETCH_YAWN':
        return 'spiritStretchBody 3.2s ease-in-out infinite';
      default:
        return `spiritFloat ${EMOTION_STATES[emotionState].breathDuration} ease-in-out infinite`;
    }
  }, [actionVariantId, emotionState]);

  const headExtraAnim =
    actionVariantId === 'IDLE_LOOK_AROUND'
      ? 'headLookAround 2.8s ease-in-out infinite'
      : actionVariantId === 'SLEEPY_HEAD_NOD'
      ? 'headSleepyNod 2.4s ease-in-out infinite'
      : 'none';

  return (
    <div
      onClick={onPetCompanion}
      className="relative w-full h-full flex items-center justify-center cursor-pointer select-none"
      title="点击禾禾体验不同动作变体与清脆童声回应"
    >
      {petBurst > 0 && !reconState.active && (
        <div
          key={petBurst}
          className="absolute inset-0 pointer-events-none flex items-center justify-center z-20"
        >
          <svg className="w-64 h-64 overflow-visible" viewBox="0 0 200 200">
            {[
              [-45, -52],
              [48, -48],
              [-58, -18],
              [60, -15]
            ].map(([dx, dy], idx) => (
              <g key={idx} transform="translate(100, 95)">
                <circle cx="0" cy="0" r="3.8" fill="#fde68a">
                  <animate attributeName="cx" from="0" to={dx} dur="0.65s" fill="freeze" />
                  <animate attributeName="cy" from="0" to={dy} dur="0.65s" fill="freeze" />
                  <animate attributeName="opacity" from="1" to="0" dur="0.65s" fill="freeze" />
                </circle>
              </g>
            ))}
          </svg>
        </div>
      )}
      {/* 平面视图 SVG 容器严格设为适中的 310px × 325px，完整呈现头顶小雏菊与三瓣山竹猫爪 */}
      <div
        className="transition-transform duration-150 ease-out"
        style={{
          width: '310px',
          height: '325px',
          transform: `scale(${squashStyle.scaleX}, ${squashStyle.scaleY})`
        }}
      >
        <svg viewBox="0 0 320 320" className="w-full h-full overflow-visible">
          <defs>
            <radialGradient id="mochiCreamGrad" cx="38%" cy="28%" r="72%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="65%" stopColor="#fffdf8" />
              <stop offset="100%" stopColor="#f2e2c6" />
            </radialGradient>

            <linearGradient id="catLegAnkleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffdf9" />
              <stop offset="46%" stopColor="#faecd6" />
              <stop offset="100%" stopColor="#f4b886" />
            </linearGradient>

            <linearGradient id="catForelimbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffdf8" />
              <stop offset="68%" stopColor="#faecd4" />
              <stop offset="100%" stopColor="#f3c798" />
            </linearGradient>

            <radialGradient id="peachBlushGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f47282" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#f47282" stopOpacity="0" />
            </radialGradient>

            <clipPath id="tailTipClip">
              <ellipse cx="42" cy="-24" rx="26" ry="52" transform="rotate(34 42 -24)" />
            </clipPath>
          </defs>

          {/* 1. 水榭青石板地面柔和接触阴影 */}
          <g transform="translate(160, 282)">
            <ellipse cx="0" cy="0" rx="64" ry="9.5" fill="#1c1917" opacity="0.24" />
            <ellipse cx="-26" cy="-1" rx="19" ry="5" fill="#1c1917" opacity="0.2" />
            <ellipse cx="26" cy="-1" rx="19" ry="5" fill="#1c1917" opacity="0.2" />
          </g>

          {/* 角色动态呼吸与 12 种动作变体主骨骼 */}
          <g style={{ transformOrigin: '160px 240px', animation: bodyAnimStyle }}>
            {/* 2. 背部蓬松琥珀尾尖大尾巴 */}
            <g transform={`translate(${192 + tailParallax.x}, ${222 + tailParallax.y})`}>
              <g
                style={{
                  transformOrigin: '0px 0px',
                  animation:
                    emotionState === 'HAPPY'
                      ? 'tailWagFast 0.42s ease-in-out infinite'
                      : emotionState === 'SLEEPY'
                      ? 'tailWagSlow 3.8s ease-in-out infinite'
                      : 'tailWagNormal 1.8s ease-in-out infinite'
                }}
              >
                <g clipPath="url(#tailTipClip)">
                  <ellipse
                    cx="42"
                    cy="-24"
                    rx="26"
                    ry="52"
                    transform="rotate(34 42 -24)"
                    fill="url(#mochiCreamGrad)"
                  />
                  <circle cx="64" cy="-54" r="32" fill="#d97736" />
                </g>
                <ellipse
                  cx="42"
                  cy="-24"
                  rx="26"
                  ry="52"
                  transform="rotate(34 42 -24)"
                  fill="none"
                  stroke="#4a3328"
                  strokeWidth="2.2"
                />
              </g>
            </g>

            {/* 3. 下半身与梨形身躯无缝连体结构（一笔画连体短萌小猫腿与三瓣山竹猫爪） */}
            <g transform={`translate(${torsoParallax.x}, ${torsoParallax.y})`}>
              <ellipse cx="160" cy="212" rx="54" ry="45" fill="url(#mochiCreamGrad)" />

              <g transform={`translate(${legParallax.x * 0.45}, ${legParallax.y * 0.45})`}>
                {/* 左短萌小猫后腿 */}
                <g transform="translate(134, 248)">
                  <g
                    style={{
                      transformOrigin: '0px 0px',
                      animation:
                        emotionState === 'HAPPY'
                          ? 'catLegLeftHappy 0.42s ease-in-out infinite'
                          : emotionState === 'SHY'
                          ? 'catLegLeftShy 2.2s ease-in-out infinite'
                          : emotionState === 'SLEEPY'
                          ? 'catLegLeftSleepy 5.4s ease-in-out infinite'
                          : 'catLegLeftIdle 3.8s ease-in-out infinite'
                    }}
                  >
                    <path
                      d="M -15,-8 C -19,4 -19,16 -16,24 C -20,27 -18,33 -10,34 C -4,35 5,35 11,34 C 18,33 19,27 14,24 C 15,15 15,4 13,-8 Z"
                      fill="url(#catLegAnkleGrad)"
                      stroke="#4a3328"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <ellipse cx="0" cy="28" rx="10" ry="3.2" fill="#fffdf9" opacity="0.65" />
                    <path
                      d="M -4.8,26.5 C -5.2,30 -4.8,32.8 -4.2,34 M 4.8,26.5 C 5.2,30 4.8,32.8 4.2,34"
                      stroke="#4a3328"
                      strokeWidth="1.65"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                </g>

                {/* 右短萌小猫后腿 */}
                <g transform="translate(186, 248)">
                  <g
                    style={{
                      transformOrigin: '0px 0px',
                      animation:
                        emotionState === 'HAPPY'
                          ? 'catLegRightHappy 0.42s ease-in-out infinite'
                          : emotionState === 'SHY'
                          ? 'catLegRightShy 2.2s ease-in-out infinite'
                          : emotionState === 'SLEEPY'
                          ? 'catLegRightSleepy 5.4s ease-in-out infinite'
                          : 'catLegRightIdle 3.8s ease-in-out infinite'
                    }}
                  >
                    <path
                      d="M -13,-8 C -15,4 -15,15 -14,24 C -19,27 -18,33 -11,34 C -5,35 4,35 10,34 C 18,33 20,27 16,24 C 19,16 19,4 15,-8 Z"
                      fill="url(#catLegAnkleGrad)"
                      stroke="#4a3328"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <ellipse cx="0" cy="28" rx="10" ry="3.2" fill="#fffdf9" opacity="0.65" />
                    <path
                      d="M -4.8,26.5 C -5.2,30 -4.8,32.8 -4.2,34 M 4.8,26.5 C 5.2,30 4.8,32.8 4.2,34"
                      stroke="#4a3328"
                      strokeWidth="1.65"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                </g>
              </g>

              <ellipse cx="160" cy="211" rx="52.8" ry="43.8" fill="url(#mochiCreamGrad)" />
              <ellipse cx="160" cy="216" rx="35" ry="27.5" fill="#fff3d6" />

              <path
                d="M 126,195 C 106,208 99,230 114,248"
                fill="none"
                stroke="#4a3328"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 194,195 C 214,208 221,230 206,248"
                fill="none"
                stroke="#4a3328"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 145,253 Q 160,256 175,253"
                fill="none"
                stroke="#4a3328"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>

            {/* 4. 连肩小猫前爪手臂（支持高举亮肉垫、抬爪理毛、欢欣挥爪、对指扭捏、伸懒腰等变体） */}
            <g transform={`translate(${torsoParallax.x * 1.05}, ${torsoParallax.y * 1.05})`}>
              {/* 左连肩前爪 */}
              <g transform="translate(108, 208)">
                <g
                  style={{
                    transformOrigin: '0px 0px',
                    transform: `rotate(${forelimbPose.leftRot}deg)`,
                    transition: 'transform 0.34s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    animation:
                      forelimbPose.animClass === 'groomLeftPaw'
                        ? 'pawGroomRub 0.75s ease-in-out infinite'
                        : forelimbPose.animClass === 'waveBothPaws'
                        ? 'pawCheerLeft 0.55s ease-in-out infinite'
                        : forelimbPose.animClass === 'danceAlternatePaws'
                        ? 'pawDanceLeft 0.68s ease-in-out infinite'
                        : forelimbPose.animClass === 'fidgetPaws'
                        ? 'pawFidgetLeft 0.65s ease-in-out infinite'
                        : 'none'
                  }}
                >
                  <path
                    d="M 0,-5 C -11,-5 -22,7 -21,22 C -20,33 -11,38 -3,35 C 5,32 10,20 8,7 C 7,-1 4,-5 0,-5 Z"
                    fill="url(#catForelimbGrad)"
                    stroke="#4a3328"
                    strokeWidth="2.1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M -12,31 C -11,34 -9.5,35.5 -8.5,36 M -5.5,32.5 C -4.5,35 -3.5,36 -2.5,36"
                    stroke="#4a3328"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <ellipse
                    cx="-6.5"
                    cy="21"
                    rx="4.8"
                    ry="6"
                    transform="rotate(16 -6.5 21)"
                    fill="#f4a2a8"
                  />
                </g>
              </g>

              {/* 右连肩前爪 */}
              <g transform="translate(212, 208)">
                <g
                  style={{
                    transformOrigin: '0px 0px',
                    transform: `rotate(${forelimbPose.rightRot}deg)`,
                    transition: 'transform 0.34s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    animation:
                      forelimbPose.animClass === 'waveBothPaws'
                        ? 'pawCheerRight 0.55s ease-in-out infinite'
                        : forelimbPose.animClass === 'danceAlternatePaws'
                        ? 'pawDanceRight 0.68s ease-in-out infinite'
                        : forelimbPose.animClass === 'fidgetPaws'
                        ? 'pawFidgetRight 0.65s ease-in-out infinite'
                        : 'none'
                  }}
                >
                  <path
                    d="M 0,-5 C 11,-5 22,7 21,22 C 20,33 11,38 3,35 C -5,32 -10,20 -8,7 C -7,-1 -4,-5 0,-5 Z"
                    fill="url(#catForelimbGrad)"
                    stroke="#4a3328"
                    strokeWidth="2.1"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 12,31 C 11,34 9.5,35.5 8.5,36 M 5.5,32.5 C 4.5,35 3.5,36 2.5,36"
                    stroke="#4a3328"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <ellipse
                    cx="6.5"
                    cy="21"
                    rx="4.8"
                    ry="6"
                    transform="rotate(-16 6.5 21)"
                    fill="#f4a2a8"
                  />
                </g>
              </g>
            </g>

            {/* 5. 柿染赤陶色围巾与米白织纹条带 */}
            <g transform={`translate(${160 + torsoParallax.x}, ${212 + torsoParallax.y})`}>
              <path
                d="M -48 -30 Q 0 -14 48 -30 Q 54 -18 44 -10 Q 0 6 -44 -10 Q -54 -18 -48 -30 Z"
                fill="#d15b3e"
                stroke="#4a3328"
                strokeWidth="2"
              />
              <path
                d="M -43 -21 Q 0 -6 43 -21"
                stroke="#fef3c7"
                strokeWidth="2.2"
                strokeDasharray="6 4"
                fill="none"
                opacity="0.88"
              />
              <path
                d="M 10 -12 Q 6 12 16 19 Q 26 19 24 -10 Z"
                fill="#bd4c30"
                stroke="#4a3328"
                strokeWidth="1.8"
              />
              <path
                d="M 22 -12 Q 26 8 34 13 Q 42 11 36 -12 Z"
                fill="#d15b3e"
                stroke="#4a3328"
                strokeWidth="1.8"
              />
              <circle cx="19" cy="-12" r="6.5" fill="#e06d50" stroke="#4a3328" strokeWidth="1.8" />
            </g>

            {/* 6. 头部、长耳与五官组合（支持侧首眺望与小鸡啄米点头打盹变体） */}
            <g style={{ transformOrigin: '160px 140px', animation: headExtraAnim }}>
              {/* 灵动狐猫长耳 */}
              <g transform={`translate(${160 + earParallax.x}, ${82 + earParallax.y})`}>
                <defs>
                  <clipPath id="leftFoxEarClip">
                    <rect x="-17" y="-56" width="34" height="66" rx="17" />
                  </clipPath>
                  <clipPath id="rightFoxEarClip">
                    <rect x="-17" y="-56" width="34" height="66" rx="17" />
                  </clipPath>
                </defs>

                <g transform="translate(-52, 0)">
                  <g
                    style={{
                      transformOrigin: '0px 0px',
                      transform: `rotate(${leftEarAngle}deg)`,
                      transition: 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <g clipPath="url(#leftFoxEarClip)">
                      <rect x="-17" y="-56" width="34" height="66" rx="17" fill="url(#mochiCreamGrad)" />
                      <ellipse cx="0" cy="-46" rx="20" ry="16" fill="#d97736" />
                    </g>
                    <rect
                      x="-17"
                      y="-56"
                      width="34"
                      height="66"
                      rx="17"
                      fill="none"
                      stroke="#4a3328"
                      strokeWidth="2.2"
                    />
                    <rect x="-8.5" y="-40" width="17" height="36" rx="8.5" fill="#f4a2a8" opacity="0.9" />
                  </g>
                </g>

                <g transform="translate(52, 0)">
                  <g
                    style={{
                      transformOrigin: '0px 0px',
                      transform: `rotate(${rightEarAngle}deg)`,
                      transition: 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <g clipPath="url(#rightFoxEarClip)">
                      <rect x="-17" y="-56" width="34" height="66" rx="17" fill="url(#mochiCreamGrad)" />
                      <ellipse cx="0" cy="-46" rx="20" ry="16" fill="#d97736" />
                    </g>
                    <rect
                      x="-17"
                      y="-56"
                      width="34"
                      height="66"
                      rx="17"
                      fill="none"
                      stroke="#4a3328"
                      strokeWidth="2.2"
                    />
                    <rect x="-8.5" y="-40" width="17" height="36" rx="8.5" fill="#f4a2a8" opacity="0.9" />
                  </g>
                </g>
              </g>

              {/* 饱满团子头 + 头顶森野双叶嫩芽与小雏菊 */}
              <g
                transform={`translate(${160 + headParallax.x}, ${132 + headParallax.y}) rotate(${headParallax.rot})`}
              >
                <g
                  transform={`translate(${sproutParallax.x * 0.25}, -60) rotate(${sproutParallax.rot})`}
                >
                  <path d="M 0 4 Q 0 -12 0 -20" stroke="#4a3328" strokeWidth="3.5" strokeLinecap="round" />
                  <ellipse
                    cx="-11"
                    cy="-15"
                    rx="12"
                    ry="5.5"
                    fill="#65a34e"
                    stroke="#4a3328"
                    strokeWidth="1.6"
                    transform="rotate(-22 -11 -15)"
                  />
                  <ellipse
                    cx="11"
                    cy="-15"
                    rx="12"
                    ry="5.5"
                    fill="#65a34e"
                    stroke="#4a3328"
                    strokeWidth="1.6"
                    transform="rotate(22 11 -15)"
                  />
                  <g transform="translate(0, -25)">
                    {[0, 60, 120, 180, 240, 300].map((deg) => (
                      <ellipse
                        key={deg}
                        cx="0"
                        cy="-6.5"
                        rx="3.6"
                        ry="5.5"
                        fill="#ffffff"
                        stroke="#4a3328"
                        strokeWidth="1.1"
                        transform={`rotate(${deg})`}
                      />
                    ))}
                    <circle cx="0" cy="0" r="4.2" fill="#facc15" stroke="#4a3328" strokeWidth="1" />
                  </g>
                </g>

                <rect
                  x="-84"
                  y="-58"
                  width="168"
                  height="120"
                  rx="58"
                  fill="url(#mochiCreamGrad)"
                  stroke="#4a3328"
                  strokeWidth="2.3"
                />
                <ellipse cx="-22" cy="-39" rx="38" ry="9" fill="#ffffff" opacity="0.72" />
              </g>

              {/* 面部五官层 */}
              <g
                transform={`translate(${160 + faceParallax.x}, ${136 + faceParallax.y}) rotate(${headParallax.rot * 0.8})`}
              >
                <g
                  opacity={
                    emotionState === 'SHY'
                      ? '0.96'
                      : emotionState === 'HAPPY'
                      ? '0.82'
                      : '0.58'
                  }
                >
                  <ellipse cx="-46" cy="13" rx="19" ry="11" fill="url(#peachBlushGrad)" />
                  <ellipse cx="46" cy="13" rx="19" ry="11" fill="url(#peachBlushGrad)" />
                  {emotionState === 'SHY' && (
                    <g stroke="#e15a6e" strokeWidth="1.8" strokeLinecap="round" opacity="0.75">
                      <line x1="-50" y1="15" x2="-46" y2="10" />
                      <line x1="-44" y1="16" x2="-40" y2="11" />
                      <line x1="40" y1="15" x2="44" y2="10" />
                      <line x1="46" y1="16" x2="50" y2="11" />
                    </g>
                  )}
                </g>

                {emotionState === 'SLEEPY' || isBlinking ? (
                  <g stroke="#2a1b15" strokeWidth="4.6" strokeLinecap="round" fill="none">
                    <path d="M -45 -2 Q -31 10 -17 -2" />
                    <path d="M 17 -2 Q 31 10 45 -2" />
                  </g>
                ) : emotionState === 'HAPPY' ? (
                  <g stroke="#2a1b15" strokeWidth="5.2" strokeLinecap="round" fill="none">
                    <path d="M -45 4 Q -31 -16 -17 4" />
                    <path d="M 17 4 Q 31 -16 45 4" />
                  </g>
                ) : (
                  <g>
                    {emotionState === 'SHY' ? (
                      <g stroke="#4a3024" strokeWidth="3" strokeLinecap="round" fill="none">
                        <path d="M -45 -18 Q -31 -22 -19 -26" />
                        <path d="M 19 -26 Q 31 -22 45 -18" />
                      </g>
                    ) : (
                      <g stroke="#4a3024" strokeWidth="2.8" strokeLinecap="round" fill="none">
                        <path d="M -42 -22 Q -31 -26 -20 -22" />
                        <path d="M 20 -22 Q 31 -26 42 -22" />
                      </g>
                    )}

                    <g transform="translate(-31, -2)">
                      <ellipse
                        cx="0"
                        cy="0"
                        rx="13.5"
                        ry={emotionState === 'SHY' ? '14.5' : '16.5'}
                        fill="#2a1b15"
                      />
                      <ellipse cx="0" cy="5" rx="9" ry="7.5" fill="#d97736" />
                      <ellipse cx="0" cy="-1" rx="6.2" ry="7.2" fill="#1c110d" />
                      <circle cx="-4.6" cy="-5.2" r="4.4" fill="#ffffff" />
                      <circle cx="4.8" cy="4.2" r="2.1" fill="#ffffff" />
                    </g>

                    <g transform="translate(31, -2)">
                      <ellipse
                        cx="0"
                        cy="0"
                        rx="13.5"
                        ry={emotionState === 'SHY' ? '14.5' : '16.5'}
                        fill="#2a1b15"
                      />
                      <ellipse cx="0" cy="5" rx="9" ry="7.5" fill="#d97736" />
                      <ellipse cx="0" cy="-1" rx="6.2" ry="7.2" fill="#1c110d" />
                      <circle cx="-4.6" cy="-5.2" r="4.4" fill="#ffffff" />
                      <circle cx="4.8" cy="4.2" r="2.1" fill="#ffffff" />
                    </g>
                  </g>
                )}

                {/* 嘴巴与清脆童声 TTS 实时口型同步层（直接由 ref 驱动，零卡顿） */}
                {isSpeaking ? (
                  <g transform="translate(0, 20)">
                    <ellipse
                      ref={outerMouthRef}
                      cx="0"
                      cy="0"
                      rx="8.2"
                      ry="5.8"
                      fill="#9e3f38"
                      stroke="#2a1b15"
                      strokeWidth="2"
                    />
                    <ellipse
                      ref={innerTongueRef}
                      cx="0"
                      cy="2.6"
                      rx="5.2"
                      ry="3.2"
                      fill="#f48c98"
                    />
                  </g>
                ) : emotionState === 'HAPPY' ? (
                  <g>
                    <path
                      d="M -11 15 Q 0 17 11 15 Q 9 29 0 29 Q -9 29 -11 15 Z"
                      fill="#9e3f38"
                      stroke="#2a1b15"
                      strokeWidth="1.6"
                    />
                    <ellipse cx="0" cy="23" rx="6" ry="4" fill="#f48c98" />
                  </g>
                ) : emotionState === 'SLEEPY' ? (
                  <g>
                    <ellipse
                      cx="0"
                      cy="20"
                      rx={actionVariantId === 'SLEEPY_STRETCH_YAWN' ? '7.5' : '4.5'}
                      ry={actionVariantId === 'SLEEPY_STRETCH_YAWN' ? '8.5' : '4.5'}
                      fill="#d9535f"
                      stroke="#2a1b15"
                      strokeWidth="2.2"
                    >
                      <animate
                        attributeName="ry"
                        values={
                          actionVariantId === 'SLEEPY_STRETCH_YAWN'
                            ? '4.5;9.5;4.5'
                            : '3.5;5.8;3.5'
                        }
                        dur="3.2s"
                        repeatCount="indefinite"
                      />
                    </ellipse>
                    {actionVariantId === 'SLEEPY_BUBBLE' && (
                      <g transform="translate(22, 15)">
                        <circle
                          cx="0"
                          cy="0"
                          r="11"
                          fill="#e0f2fe"
                          fillOpacity="0.68"
                          stroke="#7dd3fc"
                          strokeWidth="1.5"
                        >
                          <animate
                            attributeName="r"
                            values="7;14;7"
                            dur="3.6s"
                            repeatCount="indefinite"
                          />
                        </circle>
                        <circle cx="-3.5" cy="-3.5" r="2.5" fill="#ffffff" opacity="0.9" />
                      </g>
                    )}
                  </g>
                ) : (
                  <path
                    d="M -10 18 Q -5 24 0 18 Q 5 24 10 18"
                    stroke="#2a1b15"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
