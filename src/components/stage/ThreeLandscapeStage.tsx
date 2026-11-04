'use client'

import { useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

import {
  BACKDROP_TEXTURE_ASPECT,
  BACKDROP_WATERLINE_RATIO,
  createBackdropCanvas,
  paintBackdrop
} from '@libs/scene/paint-3d-backdrop'
import { loadThreeRuntime } from '@libs/three/load-three'
import type { LightingTheme, StageOrbitState } from '@/types/companion'

interface ThreeLandscapeStageProps {
  activeTheme: LightingTheme
  visible: boolean
  orbitRef: MutableRefObject<StageOrbitState>
  onReadyChange?: (ready: boolean) => void
}

const CAMERA_FOV = 38
const CAMERA_Y = 1.55
const CAMERA_RADIUS = 7.5
const CAMERA_LOOK_Y = 1.7
const WATER_Y = -0.04
const TERRACE_FAR_Z = -5.05
const THEME_TRANSITION_SEC = 0.9
/** 近景构图按此宽高比设计；其他窗口比例下横向等比缩放，保持与 2D 画卷一致的取景 */
const FRAME_REFERENCE_ASPECT = 1.95

const COLOR_KEYS = [
  'stoneFar',
  'stoneNear',
  'wood',
  'pillar',
  'glow',
  'bamboo',
  'line',
  'waterFar',
  'waterNear',
  'mist',
  'bird',
  'boat',
  'lotus',
  'lantern'
] as const

type ColorKey = (typeof COLOR_KEYS)[number]
type ThemeColorState = Record<ColorKey, any>

function toThreeColor(THREE: any, css: string) {
  const rgba = css.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgba) {
    return new THREE.Color(+rgba[1] / 255, +rgba[2] / 255, +rgba[3] / 255)
  }
  return new THREE.Color(css)
}

function buildColorState(THREE: any, theme: LightingTheme): ThemeColorState {
  return {
    stoneFar: toThreeColor(THREE, theme.stoneFloorTop),
    stoneNear: toThreeColor(THREE, theme.stoneFloorDark).multiplyScalar(0.62),
    wood: toThreeColor(THREE, theme.pavilionWood),
    pillar: toThreeColor(THREE, theme.pavilionPillar),
    glow: toThreeColor(THREE, theme.windowGlow),
    bamboo: toThreeColor(THREE, theme.bambooColor),
    line: toThreeColor(THREE, theme.stoneFloorDark).multiplyScalar(0.35),
    waterFar: toThreeColor(THREE, theme.waterTop),
    waterNear: toThreeColor(THREE, theme.waterBottom),
    mist: toThreeColor(THREE, theme.skyBottom),
    bird: toThreeColor(THREE, theme.isNight ? '#e2e8f0' : '#384248'),
    boat: toThreeColor(THREE, theme.isNight ? '#0a121a' : '#2b3336'),
    lotus: toThreeColor(THREE, theme.isNight ? '#16282a' : '#3a5748'),
    lantern: toThreeColor(THREE, '#fde047')
  }
}

function cloneColorState(colors: ThemeColorState): ThemeColorState {
  const next: ThemeColorState = {} as ThemeColorState
  COLOR_KEYS.forEach((key) => {
    next[key] = colors[key].clone()
  })
  return next
}

function getBackdropCover(width: number, height: number) {
  const screenAspect = width / height

  if (screenAspect >= BACKDROP_TEXTURE_ASPECT) {
    const repeatY = BACKDROP_TEXTURE_ASPECT / screenAspect
    const offsetY = (1 - repeatY) * 0.5
    const topTextureY = 1 - repeatY - offsetY
    return {
      repeatX: 1,
      repeatY,
      offsetX: 0,
      offsetY,
      waterline: (BACKDROP_WATERLINE_RATIO - topTextureY) / repeatY
    }
  }

  const repeatX = screenAspect / BACKDROP_TEXTURE_ASPECT
  return {
    repeatX,
    repeatY: 1,
    offsetX: (1 - repeatX) * 0.5,
    offsetY: 0,
    waterline: BACKDROP_WATERLINE_RATIO
  }
}

function createLeafTexture(THREE: any) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.clearRect(0, 0, 128, 64)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(4, 32)
  ctx.quadraticCurveTo(58, 2, 124, 32)
  ctx.quadraticCurveTo(58, 62, 4, 32)
  ctx.closePath()
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.encoding = THREE.LinearEncoding
  return texture
}

function createMistTexture(THREE: any) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.clearRect(0, 0, 512, 128)
  for (let i = 0; i < 8; i += 1) {
    const cx = 48 + i * 62
    const cy = 64 + Math.sin(i * 1.7) * 14
    const radius = 70 + (i % 3) * 16
    const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius)
    grad.addColorStop(0, 'rgba(255,255,255,0.46)')
    grad.addColorStop(0.55, 'rgba(255,255,255,0.18)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 128)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.encoding = THREE.LinearEncoding
  return texture
}

/**
 * 立体视图的全屏背景：远景沿用宋韵画卷（烘焙为贴图），
 * 近景以 three.js 几何体重建水面、青石台基、水榭廊柱、墨竹与氛围元素。
 * 拖拽角色时相机轻环绕，远山几乎不动、近景明显位移，形成真实视差。
 */
export function ThreeLandscapeStage({
  activeTheme,
  visible,
  orbitRef,
  onReadyChange
}: ThreeLandscapeStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const themeRef = useRef(activeTheme)
  const visibleRef = useRef(visible)
  const orbitStateRef = useRef(orbitRef)
  const readyCallbackRef = useRef(onReadyChange)
  const pendingThemeRef = useRef<LightingTheme | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    themeRef.current = activeTheme
    pendingThemeRef.current = activeTheme
  }, [activeTheme])

  useEffect(() => {
    visibleRef.current = visible
  }, [visible])

  useEffect(() => {
    readyCallbackRef.current = onReadyChange
  }, [onReadyChange])

  useEffect(() => {
    orbitStateRef.current = orbitRef
  }, [orbitRef])

  useEffect(() => {
    let isMounted = true
    let animationFrameId: number | null = null
    let handleResize: (() => void) | null = null

    async function initLandscape() {
      try {
        const THREE = await loadThreeRuntime()
        if (!isMounted || !mountRef.current) return

        const container = mountRef.current
        const width = container.clientWidth || window.innerWidth
        const height = container.clientHeight || window.innerHeight

        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
        renderer.setSize(width, height)
        renderer.autoClear = false
        container.innerHTML = ''
        container.appendChild(renderer.domElement)

        const vFov = THREE.MathUtils.degToRad(CAMERA_FOV)
        const cameraPitch = Math.atan((CAMERA_LOOK_Y - CAMERA_Y) / CAMERA_RADIUS)
        const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 0.1, 500)

        // 远景画卷：正交相机铺满屏幕，UV 以 cover 方式裁切，保持与 2D 画卷一致的构图
        const backdropScene = new THREE.Scene()
        const backdropCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
        backdropCamera.position.z = 1

        const backdropCanvasList = [createBackdropCanvas(), createBackdropCanvas()]
        const backdropTextures = backdropCanvasList.map((canvas) => {
          const texture = new THREE.CanvasTexture(canvas)
          texture.encoding = THREE.LinearEncoding
          texture.minFilter = THREE.LinearFilter
          texture.magFilter = THREE.LinearFilter
          texture.generateMipmaps = false
          return texture
        })
        const backdropMaterials = backdropTextures.map(
          (texture, index) =>
            new THREE.MeshBasicMaterial({
              map: texture,
              transparent: true,
              depthTest: false,
              depthWrite: false,
              opacity: index === 0 ? 1 : 0
            })
        )
        const backdropGeometry = new THREE.PlaneGeometry(2, 2)
        const backdropMeshes = backdropMaterials.map((material, index) => {
          const mesh = new THREE.Mesh(backdropGeometry, material)
          mesh.frustumCulled = false
          mesh.visible = index === 0
          mesh.renderOrder = index
          backdropScene.add(mesh)
          return mesh
        })

        let frontBackdrop = 0
        let backBackdrop = 1
        let backdropFadeProgress = 1

        paintBackdrop(backdropCanvasList[frontBackdrop], themeRef.current)
        backdropTextures[frontBackdrop].needsUpdate = true

        const mainScene = new THREE.Scene()

        // ------------------------------------------------------------
        // 水面：近岸浅、远水淡，远端随水线淡出以衔接画卷
        // ------------------------------------------------------------
        const waterGeometry = new THREE.PlaneGeometry(400, 400, 72, 36)
        waterGeometry.rotateX(-Math.PI / 2)
        waterGeometry.translate(0, WATER_Y, -160)

        const initialColors = buildColorState(THREE, themeRef.current)

        const waterMaterial = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: {
            uTime: { value: 0 },
            uFar: { value: initialColors.waterFar.clone() },
            uNear: { value: initialColors.waterNear.clone() },
            uMist: { value: initialColors.mist.clone() },
            uFadeNear: { value: 40 },
            uFadeFar: { value: 80 }
          },
          vertexShader: `
            uniform float uTime;
            varying vec3 vWorld;
            void main() {
              vec3 p = position;
              p.y += sin(p.x * 0.35 + uTime * 0.8) * 0.02
                   + cos(p.z * 0.5 + uTime * 0.55) * 0.014;
              vec4 worldPosition = modelMatrix * vec4(p, 1.0);
              vWorld = worldPosition.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            uniform vec3 uFar;
            uniform vec3 uNear;
            uniform vec3 uMist;
            uniform float uFadeNear;
            uniform float uFadeFar;
            varying vec3 vWorld;
            void main() {
              float dist = length(vWorld.xz);
              float depthMix = smoothstep(9.0, uFadeFar * 0.8, dist);
              vec3 color = mix(uNear, uFar, depthMix);
              color = mix(color, uMist, smoothstep(uFadeFar * 0.55, uFadeFar, dist) * 0.65);

              float ripple = sin(vWorld.z * 1.4 + uTime * 0.5 + sin(vWorld.x * 0.32) * 1.6);
              color += smoothstep(0.88, 1.0, ripple) * 0.09;
              float crossRipple = sin(vWorld.z * 0.35 + uTime * 0.22 + vWorld.x * 0.06);
              color += smoothstep(0.975, 1.0, crossRipple) * 0.06;

              float alpha = 1.0 - smoothstep(uFadeNear, uFadeFar, dist);
              gl_FragColor = vec4(color, alpha * 0.97);
            }
          `
        })
        const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial)
        waterMesh.renderOrder = 0
        mainScene.add(waterMesh)

        // ------------------------------------------------------------
        // 青石台基与前景石板
        // ------------------------------------------------------------
        const floorGeometry = new THREE.PlaneGeometry(80, 12.5, 1, 1)
        floorGeometry.rotateX(-Math.PI / 2)
        floorGeometry.translate(0, 0, 1.2)

        const floorMaterial = new THREE.ShaderMaterial({
          uniforms: {
            uFar: { value: initialColors.stoneFar.clone() },
            uNear: { value: initialColors.stoneNear.clone() }
          },
          vertexShader: `
            varying vec3 vWorld;
            void main() {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorld = worldPosition.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
          `,
          fragmentShader: `
            uniform vec3 uFar;
            uniform vec3 uNear;
            varying vec3 vWorld;
            void main() {
              float mixFactor = smoothstep(-5.0, 5.0, vWorld.z);
              gl_FragColor = vec4(mix(uFar, uNear, mixFactor), 1.0);
            }
          `
        })
        const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial)
        mainScene.add(floorMesh)

        const slabLinePositions: number[] = []
        const floorFarZ = -5.0
        const floorNearZ = 7.2
        for (let x = -30; x <= 30; x += 0.9) {
          slabLinePositions.push(x, 0.014, floorFarZ, x, 0.014, floorNearZ)
        }
        ;[-4.95, -4.2, -3.35, -2.25, -0.05, 1.45, 2.6, 4.0, 5.6].forEach((z) => {
          slabLinePositions.push(-30, 0.014, z, 30, 0.014, z)
        })
        const slabLineGeometry = new THREE.BufferGeometry()
        slabLineGeometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(slabLinePositions, 3)
        )
        const slabLineMaterial = new THREE.LineBasicMaterial({
          color: initialColors.line.clone(),
          transparent: true,
          opacity: 0.32
        })
        mainScene.add(new THREE.LineSegments(slabLineGeometry, slabLineMaterial))

        const stoneEdgeMaterial = new THREE.MeshBasicMaterial({ color: initialColors.stoneFar.clone() })
        const stoneEdgeMesh = new THREE.Mesh(
          new THREE.BoxGeometry(80, 0.16, 0.42),
          stoneEdgeMaterial
        )
        stoneEdgeMesh.position.set(0, 0.01, TERRACE_FAR_Z)
        mainScene.add(stoneEdgeMesh)

        const edgeHighlightMaterial = new THREE.MeshBasicMaterial({
          color: 0xfff6e0,
          transparent: true,
          opacity: 0.32
        })
        const edgeHighlight = new THREE.Mesh(
          new THREE.BoxGeometry(80, 0.02, 0.05),
          edgeHighlightMaterial
        )
        edgeHighlight.position.set(0, 0.095, TERRACE_FAR_Z)
        mainScene.add(edgeHighlight)

        // ------------------------------------------------------------
        // 水榭左侧廊柱、冰裂纹窗与檐下挂落
        // ------------------------------------------------------------
        const unitBox = new THREE.BoxGeometry(1, 1, 1)
        const woodMaterial = new THREE.MeshBasicMaterial({ color: initialColors.wood.clone() })
        const pillarMaterial = new THREE.MeshBasicMaterial({ color: initialColors.pillar.clone() })
        const glowMaterial = new THREE.MeshBasicMaterial({ color: initialColors.glow.clone() })

        const windowWall = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 5.4), glowMaterial)
        windowWall.position.set(-7.0, 2.7, -2.35)
        mainScene.add(windowWall)

        const addBox = (
          parent: any,
          material: any,
          x: number,
          y: number,
          z: number,
          sx: number,
          sy: number,
          sz: number
        ) => {
          const mesh = new THREE.Mesh(unitBox, material)
          mesh.position.set(x, y, z)
          mesh.scale.set(sx, sy, sz)
          parent.add(mesh)
          return mesh
        }

        const latticeGroup = new THREE.Group()
        latticeGroup.position.z = -2.3
        ;[0.95, 1.7, 2.45, 3.2, 3.95, 4.7].forEach((y) => {
          addBox(latticeGroup, woodMaterial, -7.0, y, 0, 2.6, 0.055, 0.06)
        })
        addBox(latticeGroup, woodMaterial, -7.0, 2.7, 0, 0.06, 5.4, 0.06)
        addBox(latticeGroup, woodMaterial, -6.35, 2.7, 0, 0.06, 5.4, 0.06)
        addBox(latticeGroup, woodMaterial, -8.28, 2.7, 0, 0.1, 5.45, 0.08)
        addBox(latticeGroup, woodMaterial, -5.72, 2.7, 0, 0.1, 5.45, 0.08)
        addBox(latticeGroup, woodMaterial, -7.0, 0.48, 0.02, 2.66, 0.96, 0.1)
        mainScene.add(latticeGroup)

        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.19, 5.8, 14),
          pillarMaterial
        )
        pillar.position.set(-5.52, 2.9, -2.2)
        mainScene.add(pillar)

        const pillarBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.28, 0.26, 16),
          pillarMaterial
        )
        pillarBase.position.set(-5.52, 0.13, -2.2)
        mainScene.add(pillarBase)

        const pillarHighlight = new THREE.Mesh(
          new THREE.PlaneGeometry(0.05, 5.4),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 })
        )
        pillarHighlight.position.set(-5.42, 2.9, -2.03)
        mainScene.add(pillarHighlight)

        const topBeam = addBox(mainScene, woodMaterial, 0, 5.2, -2.5, 24, 0.34, 0.44)
        topBeam.renderOrder = 1

        const createGualuo = (sign: number) => {
          const group = new THREE.Group()
          group.position.set(sign * 4.6, 4.9, -2.45)
          addBox(group, woodMaterial, 0, 0.24, 0, 2.0, 0.055, 0.08)
          addBox(group, woodMaterial, 0, -0.24, 0, 2.0, 0.055, 0.08)
          addBox(group, woodMaterial, -1.0, 0, 0, 0.055, 0.5, 0.08)
          addBox(group, woodMaterial, 1.0, 0, 0, 0.055, 0.5, 0.08)
          ;[-0.5, 0, 0.5].forEach((x) => {
            addBox(group, woodMaterial, x, 0, 0, 0.045, 0.46, 0.08)
          })
          addBox(group, woodMaterial, 0, 0, 0, 2.0, 0.045, 0.08)
          mainScene.add(group)
        }
        createGualuo(-1)
        createGualuo(1)

        // ------------------------------------------------------------
        // 右侧墨竹：柱状竹竿 + 叶纹理片，近景视差最明显
        // ------------------------------------------------------------
        const leafTexture = createLeafTexture(THREE)
        const bambooMaterial = new THREE.MeshBasicMaterial({ color: initialColors.bamboo.clone() })
        const bambooLeafMaterial = new THREE.MeshBasicMaterial({
          color: initialColors.bamboo.clone(),
          map: leafTexture,
          transparent: true,
          alphaTest: 0.3,
          side: THREE.DoubleSide,
          opacity: 0.92
        })

        const bambooGroup = new THREE.Group()
        bambooGroup.position.set(3.78, 0, 1.3)
        mainScene.add(bambooGroup)

        const bambooStemGeometry = new THREE.CylinderGeometry(0.032, 0.062, 1, 7)
        ;[
          { x: -0.36, height: 5.6, tilt: 0.035 },
          { x: 0.04, height: 6.4, tilt: -0.018 },
          { x: 0.38, height: 5.95, tilt: 0.05 }
        ].forEach((stem) => {
          const stemMesh = new THREE.Mesh(bambooStemGeometry, bambooMaterial)
          stemMesh.scale.set(1, stem.height, 1)
          stemMesh.position.set(stem.x, stem.height / 2, 0)
          stemMesh.rotation.z = stem.tilt
          bambooGroup.add(stemMesh)
        })

        const leafGeometry = new THREE.PlaneGeometry(0.3, 0.13)
        let leafSeed = 20261104
        const nextLeafRandom = () => {
          leafSeed = (leafSeed * 1664525 + 1013904223) % 4294967296
          return leafSeed / 4294967296
        }
        for (let i = 0; i < 34; i += 1) {
          const leaf = new THREE.Mesh(leafGeometry, bambooLeafMaterial)
          const y = 2.3 + nextLeafRandom() * 3.6
          const x = -0.65 + nextLeafRandom() * 1.5
          const z = -0.28 + nextLeafRandom() * 0.56
          leaf.position.set(x, y, z)
          leaf.rotation.z = 0.35 + nextLeafRandom() * 1.5
          leaf.rotation.y = -0.5 + nextLeafRandom() * 1.0
          const scale = 0.75 + nextLeafRandom() * 0.65
          leaf.scale.setScalar(scale)
          bambooGroup.add(leaf)
        }

        // ------------------------------------------------------------
        // 湖面青莲、乌篷孤舟
        // ------------------------------------------------------------
        const lotusMaterial = new THREE.MeshBasicMaterial({
          color: initialColors.lotus.clone(),
          side: THREE.DoubleSide
        })
        const lotusPetalMaterial = new THREE.MeshBasicMaterial({
          color: themeRef.current.isNight ? 0xe2e8f0 : 0xfce7f3
        })
        const lotusGroup = new THREE.Group()
        mainScene.add(lotusGroup)

        const lotusPadGeometry = new THREE.CircleGeometry(0.9, 20)
        lotusPadGeometry.rotateX(-Math.PI / 2)

        const lotusPads = [
          { x: -9.4, z: -12.5, flower: true },
          { x: -8.45, z: -14.2, flower: false },
          { x: 8.2, z: -13.2, flower: true },
          { x: 9.15, z: -15.8, flower: false }
        ]
        lotusPads.forEach((pad) => {
          const padMesh = new THREE.Mesh(lotusPadGeometry, lotusMaterial)
          padMesh.position.set(pad.x, 0.005, pad.z)
          padMesh.scale.set(1, 1, 0.55)
          lotusGroup.add(padMesh)

          if (pad.flower) {
            const stem = new THREE.Mesh(
              new THREE.CylinderGeometry(0.018, 0.022, 0.52, 6),
              lotusMaterial
            )
            stem.position.set(pad.x + 0.12, 0.26, pad.z + 0.05)
            lotusGroup.add(stem)

            const petal = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), lotusPetalMaterial)
            petal.scale.set(1, 1.35, 0.72)
            petal.position.set(pad.x + 0.12, 0.56, pad.z + 0.05)
            lotusGroup.add(petal)
          }
        })

        const boatGroup = new THREE.Group()
        boatGroup.position.set(7.4, 0, -35)
        mainScene.add(boatGroup)

        const boatMaterial = new THREE.MeshBasicMaterial({
          color: initialColors.boat.clone(),
          side: THREE.DoubleSide
        })
        const boatHull = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), boatMaterial)
        boatHull.scale.set(1.15, 0.16, 0.34)
        boatHull.position.y = 0.02
        boatGroup.add(boatHull)

        const boatCanopy = new THREE.Mesh(
          new THREE.CylinderGeometry(0.34, 0.34, 1.1, 12, 1, true, 0, Math.PI),
          boatMaterial
        )
        boatCanopy.rotation.z = Math.PI / 2
        boatCanopy.position.y = 0.16
        boatGroup.add(boatCanopy)

        const lanternMaterial = new THREE.MeshBasicMaterial({ color: initialColors.lantern.clone() })
        const boatLantern = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), lanternMaterial)
        boatLantern.position.set(0.85, 0.2, 0)
        boatGroup.add(boatLantern)
        boatLantern.visible =
          themeRef.current.isNight || themeRef.current.id === 'DUSK_PAVILION'

        // ------------------------------------------------------------
        // 远空飞雁：细线段振翅，增加远景生气
        // ------------------------------------------------------------
        const birdMaterial = new THREE.LineBasicMaterial({
          color: initialColors.bird.clone(),
          transparent: true,
          opacity: 0.5
        })
        const flockGroup = new THREE.Group()
        flockGroup.position.set(-17, 14.5, -45)
        mainScene.add(flockGroup)

        const birdOffsets = [
          { x: 0, y: 0, phase: 0 },
          { x: -1.6, y: 0.7, phase: 0.9 },
          { x: 1.5, y: 0.6, phase: 1.6 },
          { x: -3.1, y: 1.35, phase: 2.4 },
          { x: 3.0, y: 1.25, phase: 3.1 }
        ]
        const birds = birdOffsets.map((offset) => {
          const positions = new Float32Array(9)
          const geometry = new THREE.BufferGeometry()
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
          const line = new THREE.Line(geometry, birdMaterial)
          line.position.set(offset.x, offset.y, 0)
          flockGroup.add(line)
          return { line, geometry, positions, phase: offset.phase }
        })

        // ------------------------------------------------------------
        // 云气：贴近水线的柔雾面片，柔化几何水面与画卷的交界
        // ------------------------------------------------------------
        const mistTexture = createMistTexture(THREE)
        const mistMaterial = new THREE.MeshBasicMaterial({
          map: mistTexture,
          color: initialColors.mist.clone(),
          transparent: true,
          opacity: 0.26,
          depthWrite: false
        })
        const farMist = new THREE.Mesh(new THREE.PlaneGeometry(90, 12), mistMaterial)
        farMist.position.set(0, 2.0, -55)
        farMist.renderOrder = 2
        mainScene.add(farMist)

        const nearMistMaterial = mistMaterial.clone()
        nearMistMaterial.opacity = 0.18
        const nearMist = new THREE.Mesh(new THREE.PlaneGeometry(40, 5), nearMistMaterial)
        nearMist.position.set(1, 0.8, -16)
        nearMist.renderOrder = 2
        mainScene.add(nearMist)

        // ------------------------------------------------------------
        // 主题色：所有材质与 uniforms 统一插值
        // ------------------------------------------------------------
        let appliedColors = initialColors

        const applyColors = (colors: ThemeColorState) => {
          floorMaterial.uniforms.uFar.value.copy(colors.stoneFar)
          floorMaterial.uniforms.uNear.value.copy(colors.stoneNear)
          stoneEdgeMaterial.color.copy(colors.stoneFar)
          slabLineMaterial.color.copy(colors.line)
          woodMaterial.color.copy(colors.wood)
          pillarMaterial.color.copy(colors.pillar)
          glowMaterial.color.copy(colors.glow)
          waterMaterial.uniforms.uFar.value.copy(colors.waterFar)
          waterMaterial.uniforms.uNear.value.copy(colors.waterNear)
          waterMaterial.uniforms.uMist.value.copy(colors.mist)
          bambooMaterial.color.copy(colors.bamboo)
          bambooLeafMaterial.color.copy(colors.bamboo)
          lotusMaterial.color.copy(colors.lotus)
          boatMaterial.color.copy(colors.boat)
          lanternMaterial.color.copy(colors.lantern)
          birdMaterial.color.copy(colors.bird)
          mistMaterial.color.copy(colors.mist)
          nearMistMaterial.color.copy(colors.mist)
        }
        applyColors(appliedColors)

        let colorFrom = cloneColorState(appliedColors)
        let colorTo = appliedColors
        let colorProgress = 1

        const updateBackdropOpacities = () => {
          const frontMaterial = backdropMaterials[frontBackdrop]
          const backMaterial = backdropMaterials[backBackdrop]
          frontMaterial.opacity = 1 - backdropFadeProgress
          backMaterial.opacity = backdropFadeProgress
          backdropMeshes[frontBackdrop].visible = frontMaterial.opacity > 0.001
          backdropMeshes[backBackdrop].visible = backMaterial.opacity > 0.001
        }

        const settleBackdrop = () => {
          backdropMaterials[frontBackdrop].opacity = 1
          backdropMaterials[backBackdrop].opacity = 0
          backdropMeshes[frontBackdrop].visible = true
          backdropMeshes[backBackdrop].visible = false
        }

        const startBackdropCrossfade = (theme: LightingTheme) => {
          if (backdropFadeProgress < 1) {
            frontBackdrop = backBackdrop
            backBackdrop = 1 - frontBackdrop
            backdropFadeProgress = 1
            settleBackdrop()
          }

          paintBackdrop(backdropCanvasList[backBackdrop], theme)
          backdropTextures[backBackdrop].needsUpdate = true
          backdropFadeProgress = 0
          updateBackdropOpacities()
        }

        const startThemeTransition = (theme: LightingTheme) => {
          colorFrom = cloneColorState(appliedColors)
          colorTo = buildColorState(THREE, theme)
          colorProgress = 0
          boatLantern.visible = theme.isNight || theme.id === 'DUSK_PAVILION'
          lotusPetalMaterial.color.set(theme.isNight ? 0xe2e8f0 : 0xfce7f3)
          startBackdropCrossfade(theme)
        }

        const updateBackdropMapping = (w: number, h: number) => {
          const cover = getBackdropCover(w, h)
          backdropTextures.forEach((texture) => {
            texture.repeat.set(cover.repeatX, cover.repeatY)
            texture.offset.set(cover.offsetX, cover.offsetY)
            texture.needsUpdate = true
          })

          const waterlineAngle = (cover.waterline - 0.5) * vFov - cameraPitch
          const fadeFar = Math.max(
            20,
            (CAMERA_Y - WATER_Y) / Math.tan(Math.max(0.0035, waterlineAngle))
          )
          waterMaterial.uniforms.uFadeFar.value = fadeFar
          waterMaterial.uniforms.uFadeNear.value = fadeFar * 0.52
        }
        updateBackdropMapping(width, height)

        handleResize = () => {
          const w = container.clientWidth || window.innerWidth
          const h = container.clientHeight || window.innerHeight
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
          renderer.setSize(w, h)
          updateBackdropMapping(w, h)
        }
        window.addEventListener('resize', handleResize)

        const clock = new THREE.Clock()
        let hasRenderedOnce = false
        let pendingTheme = pendingThemeRef.current || themeRef.current
        let currentThemeId = pendingTheme.id

        const animate = () => {
          if (!isMounted) return
          animationFrameId = requestAnimationFrame(animate)

          const delta = Math.min(clock.getDelta(), 0.05)
          const elapsed = clock.elapsedTime

          const pending = pendingThemeRef.current
          if (pending && pending.id !== currentThemeId) {
            currentThemeId = pending.id
            pendingThemeRef.current = null
            startThemeTransition(pending)
          }

          if (colorProgress < 1) {
            colorProgress = Math.min(1, colorProgress + delta / THEME_TRANSITION_SEC)
            const eased = colorProgress * colorProgress * (3 - 2 * colorProgress)
            const mixed: ThemeColorState = {} as ThemeColorState
            COLOR_KEYS.forEach((key) => {
              mixed[key] = colorFrom[key].clone().lerp(colorTo[key], eased)
            })
            appliedColors = mixed
            applyColors(mixed)
          }

          if (backdropFadeProgress < 1) {
            backdropFadeProgress = Math.min(1, backdropFadeProgress + delta / THEME_TRANSITION_SEC)
            updateBackdropOpacities()
            if (backdropFadeProgress >= 1) {
              frontBackdrop = backBackdrop
              backBackdrop = 1 - frontBackdrop
              settleBackdrop()
            }
          }

          const sharedOrbit = orbitStateRef.current
          const targetYaw = Math.max(-0.14, Math.min(0.14, sharedOrbit.current.targetYaw))
          sharedOrbit.current.currentYaw +=
            (targetYaw - sharedOrbit.current.currentYaw) * 0.08
          const yaw = sharedOrbit.current.currentYaw + Math.sin(elapsed * 0.18) * 0.002
          camera.position.set(
            Math.sin(yaw) * CAMERA_RADIUS,
            CAMERA_Y,
            Math.cos(yaw) * CAMERA_RADIUS
          )
          camera.lookAt(0, CAMERA_LOOK_Y, 0)

          waterMaterial.uniforms.uTime.value = elapsed

          bambooGroup.rotation.z = Math.sin(elapsed * 0.6) * 0.006
          bambooGroup.rotation.x = Math.sin(elapsed * 0.45 + 0.8) * 0.003

          lotusGroup.position.y = Math.sin(elapsed * 0.8) * 0.008

          boatGroup.position.x = 7.4 + Math.sin(elapsed * 0.12) * 1.6
          boatGroup.position.z = -35 + Math.cos(elapsed * 0.09) * 0.4
          boatGroup.rotation.z = Math.sin(elapsed * 0.5) * 0.008

          flockGroup.position.x += delta * 0.22
          if (flockGroup.position.x > 6) {
            flockGroup.position.x = -24
          }
          birds.forEach((bird, index) => {
            const flap = Math.sin(elapsed * 4.6 + bird.phase) * 0.12
            const positions = bird.positions
            positions[0] = -0.45
            positions[1] = 0.14 + flap
            positions[2] = 0
            positions[3] = 0
            positions[4] = 0
            positions[5] = 0
            positions[6] = 0.45
            positions[7] = 0.14 + flap
            positions[8] = 0
            bird.geometry.attributes.position.needsUpdate = true
            bird.line.visible = index < 5
          })

          farMist.position.x = Math.sin(elapsed * 0.05) * 3
          nearMist.position.x = 1 + Math.sin(elapsed * 0.08 + 1.2) * 1.8

          if (!hasRenderedOnce || visibleRef.current) {
            renderer.clear(true, true, true)
            renderer.render(backdropScene, backdropCamera)
            renderer.clearDepth()
            renderer.render(mainScene, camera)

            if (!hasRenderedOnce) {
              hasRenderedOnce = true
              setReady(true)
              readyCallbackRef.current?.(true)
            }
          }
        }

        animate()
      } catch (error) {
        setReady(false)
        readyCallbackRef.current?.(false)
      }
    }

    initLandscape()

    return () => {
      isMounted = false
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      if (handleResize) window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div
      aria-hidden
      className='pointer-events-none absolute inset-0 z-0'
      style={{
        opacity: ready && visible ? 1 : 0,
        transition: 'opacity 700ms ease'
      }}
    >
      <div ref={mountRef} className='absolute inset-0' />
    </div>
  )
}
