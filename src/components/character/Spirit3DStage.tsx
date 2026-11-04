'use client'

import { useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

import { loadThreeRuntime } from '@libs/three/load-three'
import type { EmotionKey, LightingTheme, ReconState } from '@/types/companion'

interface ThreeFieldSpiritStageProps {
  emotionState: EmotionKey
  actionVariantId: string
  activeTheme: LightingTheme
  mouseOffset: { x: number; y: number }
  isBlinking: boolean
  onPetCompanion: () => void
  petBurst: number
  reconState: ReconState
  isSpeaking: boolean
  mouthOpenRef: MutableRefObject<number>
  isWalking?: boolean
  walkDirection?: number
  onOrbitDrag?: (deltaX: number) => void
  onEngineReady?: () => void
}

/**
 * 立体森野小灵：Three.js 12 种动作变体 + 短萌山竹猫爪 + 实时童声口型同步。
 * three.js r128 通过 CDN 动态加载，避免把整包引擎打进首屏。
 */
export function ThreeFieldSpiritStage({
  emotionState,
  actionVariantId,
  activeTheme,
  mouseOffset,
  isBlinking,
  onPetCompanion,
  petBurst,
  reconState,
  isSpeaking,
  mouthOpenRef,
  isWalking = false,
  walkDirection = 0,
  onOrbitDrag,
  onEngineReady
}: ThreeFieldSpiritStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const dragMovedRef = useRef(false);
  const orbitDragRef = useRef(onOrbitDrag);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    orbitDragRef.current = onOrbitDrag;
  }, [onOrbitDrag]);

  const stateRef = useRef({
    emotionState,
    actionVariantId,
    activeTheme,
    mouseOffset,
    isBlinking,
    reconState,
    isSpeaking,
    isWalking,
    walkDirection,
    impulseY: 0,
    impulseSpin: 0,
    walkFacing: 0
  });

  useEffect(() => {
    stateRef.current.emotionState = emotionState;
    stateRef.current.actionVariantId = actionVariantId;
    stateRef.current.activeTheme = activeTheme;
    stateRef.current.mouseOffset = mouseOffset;
    stateRef.current.isBlinking = isBlinking;
    stateRef.current.reconState = reconState;
    stateRef.current.isSpeaking = isSpeaking;
    stateRef.current.isWalking = isWalking;
    stateRef.current.walkDirection = walkDirection;
  }, [
    emotionState,
    actionVariantId,
    activeTheme,
    mouseOffset,
    isBlinking,
    reconState,
    isSpeaking,
    isWalking,
    walkDirection
  ]);

  useEffect(() => {
    if (petBurst > 0) {
      stateRef.current.impulseY = 0.22;
      stateRef.current.impulseSpin =
        stateRef.current.actionVariantId === 'HAPPY_DANCE_SPIN' ? Math.PI * 2 : 0;
    }
  }, [petBurst]);

  const sceneNodesRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    let animationFrameId: number | null = null;

    async function initThreeFieldSpirit() {
      try {
        await loadThreeRuntime();
        if (!isMounted || !mountRef.current) return;

        const THREE = window.THREE;
        const container = mountRef.current;
        const width = container.clientWidth || 640;
        const height = container.clientHeight || 540;

        const scene = new THREE.Scene();
        // 设定适中视野与相机高度（fov = 38, z = 6.45），确保跳跃最高点时头顶雏菊与长耳 100% 在画幅内
        const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        camera.position.set(0, 0.35, 6.45);
        camera.lookAt(0, 0.2, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.96;

        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        const hemiLight = new THREE.HemisphereLight(0xfffaf0, 0xc8ad88, 0.92);
        scene.add(hemiLight);

        const sunKeyLight = new THREE.DirectionalLight(0xfff5e4, 0.78);
        sunKeyLight.position.set(2.8, 4.6, 4.2);
        scene.add(sunKeyLight);

        const warmRimLight = new THREE.DirectionalLight(0xfcd34d, 0.38);
        warmRimLight.position.set(-3.2, 2.0, 2.4);
        scene.add(warmRimLight);

        const creamBodyMat = new THREE.MeshStandardMaterial({
          color: 0xfcf6ea,
          roughness: 0.78,
          metalness: 0.0
        });
        const apricotBellyMat = new THREE.MeshStandardMaterial({
          color: 0xfae5be,
          roughness: 0.82,
          metalness: 0.0
        });
        const caramelAnkleMat = new THREE.MeshStandardMaterial({
          color: 0xe59552,
          roughness: 0.76,
          metalness: 0.0
        });
        const amberTipMat = new THREE.MeshStandardMaterial({
          color: 0xcf6828,
          roughness: 0.76,
          metalness: 0.0
        });
        const pawPinkMat = new THREE.MeshStandardMaterial({
          color: 0xee8b94,
          roughness: 0.72,
          metalness: 0.0
        });
        const persimmonScarfMat = new THREE.MeshStandardMaterial({
          color: 0xc84b31,
          roughness: 0.78,
          metalness: 0.0
        });
        const scarfStripeMat = new THREE.MeshStandardMaterial({
          color: 0xfef3c7,
          roughness: 0.8,
          metalness: 0.0
        });
        const sproutGreenMat = new THREE.MeshStandardMaterial({
          color: 0x55963e,
          roughness: 0.7,
          metalness: 0.0
        });
        const daisyWhiteMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.6,
          metalness: 0.0
        });
        const daisyYellowMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          roughness: 0.65,
          metalness: 0.0
        });
        const groundShadowMat = new THREE.MeshBasicMaterial({
          color: 0x29180b,
          transparent: true,
          opacity: 0.28
        });
        const eyeChestnutMat = new THREE.MeshStandardMaterial({
          color: 0x24150f,
          roughness: 0.14,
          metalness: 0.06
        });
        const eyeAmberIrisMat = new THREE.MeshBasicMaterial({ color: 0xd97736 });
        const pureWhiteHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const blushPinkMat = new THREE.MeshStandardMaterial({
          color: 0xf06277,
          roughness: 0.62,
          transparent: true,
          opacity: 0.74
        });
        const openMouthPinkMat = new THREE.MeshStandardMaterial({
          color: 0xc9424e,
          roughness: 0.58
        });
        const sleepBubbleMat = new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          roughness: 0.12,
          metalness: 0.1,
          transparent: true,
          opacity: 0.68
        });

        // 调整角色整体缩放至适中比例（0.74），在画面中央完整呈现全身与头顶小雏菊
        const dragRoot = new THREE.Group();
        dragRoot.scale.set(0.74, 0.74, 0.74);
        dragRoot.position.set(0, 0.04, 0);
        scene.add(dragRoot);

        const shadowGroup = new THREE.Group();
        shadowGroup.position.set(0, -1.06, 0.04);
        dragRoot.add(shadowGroup);

        const mainShadowGeo = new THREE.CircleGeometry(0.84, 48);
        mainShadowGeo.rotateX(-Math.PI / 2);
        mainShadowGeo.scale(1.12, 1, 0.52);
        const groundShadowMesh = new THREE.Mesh(mainShadowGeo, groundShadowMat);
        shadowGroup.add(groundShadowMesh);

        const mapleSwirl3DGroup = new THREE.Group();
        mapleSwirl3DGroup.visible = false;
        dragRoot.add(mapleSwirl3DGroup);

        const mapleShape = new THREE.Shape();
        mapleShape.moveTo(0, -0.1);
        mapleShape.lineTo(0.08, -0.05);
        mapleShape.lineTo(0.14, 0.02);
        mapleShape.lineTo(0.06, 0.04);
        mapleShape.lineTo(0.11, 0.12);
        mapleShape.lineTo(0.04, 0.09);
        mapleShape.lineTo(0, 0.16);
        mapleShape.lineTo(-0.04, 0.09);
        mapleShape.lineTo(-0.11, 0.12);
        mapleShape.lineTo(-0.06, 0.04);
        mapleShape.lineTo(-0.14, 0.02);
        mapleShape.lineTo(-0.08, -0.05);
        mapleShape.closePath();
        const mapleLeafGeo = new THREE.ShapeGeometry(mapleShape);

        const mapleLeafPalette = [0xd94e34, 0xe87a3e, 0xf3a833, 0xf7c852];
        const maple3DLeaves = [];
        for (let i = 0; i < 28; i++) {
          const mat = new THREE.MeshBasicMaterial({
            color: mapleLeafPalette[i % mapleLeafPalette.length],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
          });
          const mesh = new THREE.Mesh(mapleLeafGeo, mat);
          const angle = (i / 28) * Math.PI * 2;
          const radius = 0.85 + (i % 4) * 0.18;
          const yBase = -1.0 + (i / 28) * 2.6;
          mapleSwirl3DGroup.add(mesh);
          maple3DLeaves.push({ mesh, mat, angle, radius, yBase });
        }

        const spiritRoot = new THREE.Group();
        dragRoot.add(spiritRoot);

        function createOrganicCatLeg(signX) {
          const hipPivot = new THREE.Group();
          hipPivot.position.set(signX * 0.31, -0.74, 0.05);

          const thighGeo = new THREE.SphereGeometry(0.2, 28, 24);
          thighGeo.scale(1.06, 0.96, 1.0);
          const thighMesh = new THREE.Mesh(thighGeo, creamBodyMat);
          thighMesh.position.set(0, -0.05, 0);
          hipPivot.add(thighMesh);

          const ankleGeo = new THREE.CylinderGeometry(0.165, 0.145, 0.18, 24);
          const ankleMesh = new THREE.Mesh(ankleGeo, caramelAnkleMat);
          ankleMesh.position.set(0, -0.15, 0.01);
          hipPivot.add(ankleMesh);

          const pawGroup = new THREE.Group();
          pawGroup.position.set(0, -0.24, 0.04);
          hipPivot.add(pawGroup);

          const mainPawGeo = new THREE.SphereGeometry(0.15, 24, 20);
          mainPawGeo.scale(1.22, 0.68, 1.22);
          pawGroup.add(new THREE.Mesh(mainPawGeo, caramelAnkleMat));

          const toePositions = [
            { x: -0.078, y: -0.01, z: 0.11 },
            { x: 0, y: -0.006, z: 0.132 },
            { x: 0.078, y: -0.01, z: 0.11 }
          ];
          toePositions.forEach((tp) => {
            const toeLobbyGeo = new THREE.SphereGeometry(0.068, 18, 16);
            toeLobbyGeo.scale(1.0, 0.85, 1.08);
            const toeLobbyMesh = new THREE.Mesh(toeLobbyGeo, creamBodyMat);
            toeLobbyMesh.position.set(tp.x, tp.y, tp.z);
            pawGroup.add(toeLobbyMesh);
          });

          [-0.042, 0.042].forEach((cx) => {
            const creaseGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.075, 8);
            const creaseMesh = new THREE.Mesh(creaseGeo, eyeChestnutMat);
            creaseMesh.position.set(cx, -0.01, 0.178);
            creaseMesh.rotation.x = 0.22;
            pawGroup.add(creaseMesh);
          });

          return { hipPivot, pawGroup };
        }

        const leftCatLeg = createOrganicCatLeg(-1);
        const rightCatLeg = createOrganicCatLeg(1);
        spiritRoot.add(leftCatLeg.hipPivot);
        spiritRoot.add(rightCatLeg.hipPivot);

        const torsoGroup = new THREE.Group();
        torsoGroup.position.set(0, -0.42, 0);
        spiritRoot.add(torsoGroup);

        const torsoGeo = new THREE.SphereGeometry(0.72, 48, 48);
        torsoGeo.scale(1.03, 0.94, 0.88);
        torsoGroup.add(new THREE.Mesh(torsoGeo, creamBodyMat));

        const bellyGeo = new THREE.SphereGeometry(0.53, 36, 36);
        bellyGeo.scale(0.95, 0.88, 0.36);
        const bellyMesh = new THREE.Mesh(bellyGeo, apricotBellyMat);
        bellyMesh.position.set(0, -0.03, 0.53);
        torsoGroup.add(bellyMesh);

        const tailPivot = new THREE.Group();
        tailPivot.position.set(0.42, -0.26, -0.34);
        torsoGroup.add(tailPivot);

        const tailMainGeo = new THREE.SphereGeometry(0.35, 32, 32);
        tailMainGeo.scale(0.88, 1.72, 0.82);
        const tailMainMesh = new THREE.Mesh(tailMainGeo, creamBodyMat);
        tailMainMesh.position.set(0.38, 0.38, 0);
        tailMainMesh.rotation.z = -0.58;
        tailPivot.add(tailMainMesh);

        const tailTipGeo = new THREE.SphereGeometry(0.27, 28, 28);
        tailTipGeo.scale(0.84, 1.15, 0.78);
        const tailTipMesh = new THREE.Mesh(tailTipGeo, amberTipMat);
        tailTipMesh.position.set(0.65, 0.67, 0.02);
        tailTipMesh.rotation.z = -0.58;
        tailPivot.add(tailTipMesh);

        const scarfGroup = new THREE.Group();
        scarfGroup.position.set(0, 0.44, 0.04);
        torsoGroup.add(scarfGroup);

        const scarfRingGeo = new THREE.TorusGeometry(0.59, 0.13, 20, 48);
        scarfRingGeo.rotateX(Math.PI / 2 + 0.08);
        scarfRingGeo.scale(1.05, 0.94, 1.0);
        scarfGroup.add(new THREE.Mesh(scarfRingGeo, persimmonScarfMat));

        const scarfStripeGeo = new THREE.TorusGeometry(0.61, 0.032, 12, 48);
        scarfStripeGeo.rotateX(Math.PI / 2 + 0.08);
        scarfStripeGeo.scale(1.05, 0.94, 1.0);
        scarfGroup.add(new THREE.Mesh(scarfStripeGeo, scarfStripeMat));

        const bowCenter = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 20, 20),
          persimmonScarfMat
        );
        bowCenter.position.set(0.16, -0.08, 0.59);
        scarfGroup.add(bowCenter);

        const tailScarfGeo = new THREE.SphereGeometry(0.125, 20, 20);
        tailScarfGeo.scale(0.82, 1.85, 0.45);
        const leftRibbon = new THREE.Mesh(tailScarfGeo, persimmonScarfMat);
        leftRibbon.position.set(0.08, -0.26, 0.59);
        leftRibbon.rotation.z = -0.22;
        scarfGroup.add(leftRibbon);

        const rightRibbon = new THREE.Mesh(tailScarfGeo, persimmonScarfMat);
        rightRibbon.scale.set(0.75, 1.55, 0.42);
        rightRibbon.position.set(0.25, -0.24, 0.57);
        rightRibbon.rotation.z = 0.28;
        scarfGroup.add(rightRibbon);

        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.62, 0);
        spiritRoot.add(headGroup);

        const headGeo = new THREE.SphereGeometry(0.98, 64, 64);
        headGeo.scale(1.08, 0.92, 0.88);
        headGroup.add(new THREE.Mesh(headGeo, creamBodyMat));

        const faceFeaturesGroup = new THREE.Group();
        headGroup.add(faceFeaturesGroup);

        const openEyesGroup = new THREE.Group();
        faceFeaturesGroup.add(openEyesGroup);

        function createSolid3DEye(signX) {
          const eyeAnchor = new THREE.Group();
          eyeAnchor.position.set(signX * 0.32, 0.12, 0.94);

          const eyeballGeo = new THREE.SphereGeometry(0.135, 32, 32);
          eyeballGeo.scale(0.88, 1.18, 0.55);
          eyeAnchor.add(new THREE.Mesh(eyeballGeo, eyeChestnutMat));

          const irisGeo = new THREE.SphereGeometry(0.082, 24, 24);
          irisGeo.scale(0.95, 0.72, 0.38);
          const irisMesh = new THREE.Mesh(irisGeo, eyeAmberIrisMat);
          irisMesh.position.set(0, -0.042, 0.055);
          eyeAnchor.add(irisMesh);

          const bigHighlight = new THREE.Mesh(
            new THREE.SphereGeometry(0.042, 20, 20),
            pureWhiteHighlightMat
          );
          bigHighlight.position.set(-0.036, 0.048, 0.072);
          eyeAnchor.add(bigHighlight);

          const smallHighlight = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 16, 16),
            pureWhiteHighlightMat
          );
          smallHighlight.position.set(0.038, -0.038, 0.072);
          eyeAnchor.add(smallHighlight);

          return eyeAnchor;
        }

        const leftSolidEye = createSolid3DEye(-1);
        const rightSolidEye = createSolid3DEye(1);
        openEyesGroup.add(leftSolidEye);
        openEyesGroup.add(rightSolidEye);

        const happyEyesGroup = new THREE.Group();
        happyEyesGroup.visible = false;
        faceFeaturesGroup.add(happyEyesGroup);

        [-0.32, 0.32].forEach((ex) => {
          const archGeo = new THREE.TorusGeometry(0.11, 0.026, 16, 32, Math.PI);
          const archMesh = new THREE.Mesh(archGeo, eyeChestnutMat);
          archMesh.position.set(ex, 0.09, 0.96);
          happyEyesGroup.add(archMesh);
        });

        const closedEyesGroup = new THREE.Group();
        closedEyesGroup.visible = false;
        faceFeaturesGroup.add(closedEyesGroup);

        [-0.32, 0.32].forEach((ex) => {
          const sleepArchGeo = new THREE.TorusGeometry(0.105, 0.023, 16, 32, Math.PI);
          const sleepArchMesh = new THREE.Mesh(sleepArchGeo, eyeChestnutMat);
          sleepArchMesh.rotation.z = Math.PI;
          sleepArchMesh.position.set(ex, 0.15, 0.96);
          closedEyesGroup.add(sleepArchMesh);
        });

        const browGeo = new THREE.TorusGeometry(0.085, 0.015, 12, 24, Math.PI * 0.75);
        const leftBrow = new THREE.Mesh(browGeo, eyeChestnutMat);
        leftBrow.position.set(-0.32, 0.29, 0.94);
        leftBrow.rotation.z = Math.PI * 0.12;
        faceFeaturesGroup.add(leftBrow);

        const rightBrow = new THREE.Mesh(browGeo, eyeChestnutMat);
        rightBrow.position.set(0.32, 0.29, 0.94);
        rightBrow.rotation.z = Math.PI * 0.12;
        faceFeaturesGroup.add(rightBrow);

        const cheekGeo = new THREE.SphereGeometry(0.13, 24, 24);
        cheekGeo.scale(1.25, 0.72, 0.42);
        const leftBlush = new THREE.Mesh(cheekGeo, blushPinkMat);
        leftBlush.position.set(-0.51, -0.05, 0.94);
        leftBlush.rotation.y = -0.35;
        faceFeaturesGroup.add(leftBlush);

        const rightBlush = new THREE.Mesh(cheekGeo, blushPinkMat);
        rightBlush.position.set(0.51, -0.05, 0.94);
        rightBlush.rotation.y = 0.35;
        faceFeaturesGroup.add(rightBlush);

        const catMouthGroup = new THREE.Group();
        catMouthGroup.position.set(0, -0.06, 0.98);
        faceFeaturesGroup.add(catMouthGroup);

        const omegaHalfGeo = new THREE.TorusGeometry(0.052, 0.016, 14, 24, Math.PI);
        const leftOmega = new THREE.Mesh(omegaHalfGeo, eyeChestnutMat);
        leftOmega.rotation.z = Math.PI;
        leftOmega.position.set(-0.05, 0, 0);
        catMouthGroup.add(leftOmega);

        const rightOmega = new THREE.Mesh(omegaHalfGeo, eyeChestnutMat);
        rightOmega.rotation.z = Math.PI;
        rightOmega.position.set(0.05, 0, 0);
        catMouthGroup.add(rightOmega);

        const openMouthGeo = new THREE.SphereGeometry(0.068, 24, 24);
        openMouthGeo.scale(1.15, 0.95, 0.45);
        const openMouthMesh = new THREE.Mesh(openMouthGeo, openMouthPinkMat);
        openMouthMesh.position.set(0, -0.09, 0.98);
        openMouthMesh.visible = false;
        faceFeaturesGroup.add(openMouthMesh);

        const sleepBubbleGroup = new THREE.Group();
        sleepBubbleGroup.position.set(0.22, -0.03, 1.08);
        sleepBubbleGroup.visible = false;
        faceFeaturesGroup.add(sleepBubbleGroup);

        sleepBubbleGroup.add(
          new THREE.Mesh(new THREE.SphereGeometry(0.11, 28, 28), sleepBubbleMat)
        );
        const bubbleHighlightMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.028, 16, 16),
          pureWhiteHighlightMat
        );
        bubbleHighlightMesh.position.set(-0.04, 0.045, 0.09);
        sleepBubbleGroup.add(bubbleHighlightMesh);

        const sproutGroup = new THREE.Group();
        sproutGroup.position.set(0, 0.88, 0.02);
        headGroup.add(sproutGroup);

        const stemGeo = new THREE.CylinderGeometry(0.026, 0.034, 0.25, 12);
        stemGeo.translate(0, 0.125, 0);
        sproutGroup.add(new THREE.Mesh(stemGeo, sproutGreenMat));

        const leafGeo = new THREE.SphereGeometry(0.15, 24, 24);
        leafGeo.scale(1.38, 0.36, 0.68);
        const leftLeaf = new THREE.Mesh(leafGeo, sproutGreenMat);
        leftLeaf.position.set(-0.15, 0.21, 0);
        leftLeaf.rotation.z = 0.36;
        sproutGroup.add(leftLeaf);

        const rightLeaf = new THREE.Mesh(leafGeo, sproutGreenMat);
        rightLeaf.position.set(0.15, 0.21, 0);
        rightLeaf.rotation.z = -0.36;
        sproutGroup.add(rightLeaf);

        const daisyGroup = new THREE.Group();
        daisyGroup.position.set(0, 0.29, 0.02);
        daisyGroup.rotation.x = 0.35;
        sproutGroup.add(daisyGroup);

        daisyGroup.add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), daisyYellowMat));
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const petalGeo = new THREE.SphereGeometry(0.048, 14, 14);
          petalGeo.scale(0.85, 1.45, 0.45);
          const petal = new THREE.Mesh(petalGeo, daisyWhiteMat);
          petal.position.set(Math.cos(angle) * 0.08, Math.sin(angle) * 0.08, -0.01);
          petal.rotation.z = angle - Math.PI / 2;
          daisyGroup.add(petal);
        }

        function createFoxCatEar() {
          const pivot = new THREE.Group();
          const outerGeo = new THREE.SphereGeometry(0.23, 32, 32);
          outerGeo.scale(0.7, 2.15, 0.46);
          const outerMesh = new THREE.Mesh(outerGeo, creamBodyMat);
          outerMesh.position.y = 0.4;
          pivot.add(outerMesh);

          const tipGeo = new THREE.SphereGeometry(0.17, 24, 24);
          tipGeo.scale(0.68, 1.15, 0.45);
          const tipMesh = new THREE.Mesh(tipGeo, amberTipMat);
          tipMesh.position.set(0, 0.78, 0.01);
          pivot.add(tipMesh);

          const innerGeo = new THREE.SphereGeometry(0.14, 24, 24);
          innerGeo.scale(0.58, 1.7, 0.34);
          const innerMesh = new THREE.Mesh(innerGeo, pawPinkMat);
          innerMesh.position.set(0, 0.38, 0.08);
          pivot.add(innerMesh);

          return pivot;
        }

        const leftEarPivot = createFoxCatEar();
        leftEarPivot.position.set(-0.6, 0.66, -0.02);
        headGroup.add(leftEarPivot);

        const rightEarPivot = createFoxCatEar();
        rightEarPivot.position.set(0.6, 0.66, -0.02);
        headGroup.add(rightEarPivot);

        function createConnectedCatForelimb(signX) {
          const shoulderPivot = new THREE.Group();
          shoulderPivot.position.set(signX * 0.56, -0.08, 0.22);

          const armGeo = new THREE.CylinderGeometry(0.13, 0.165, 0.38, 24);
          armGeo.translate(0, -0.17, 0);
          shoulderPivot.add(new THREE.Mesh(armGeo, creamBodyMat));

          const forePawGroup = new THREE.Group();
          forePawGroup.position.set(0, -0.35, 0.03);
          shoulderPivot.add(forePawGroup);

          const palmGeo = new THREE.SphereGeometry(0.165, 24, 24);
          palmGeo.scale(1.02, 0.92, 0.85);
          forePawGroup.add(new THREE.Mesh(palmGeo, creamBodyMat));

          [-0.065, 0, 0.065].forEach((tx) => {
            const fToeGeo = new THREE.SphereGeometry(0.055, 14, 14);
            const fToeMesh = new THREE.Mesh(fToeGeo, creamBodyMat);
            fToeMesh.position.set(tx, -0.08, 0.05);
            forePawGroup.add(fToeMesh);
          });

          const padGeo = new THREE.SphereGeometry(0.085, 18, 18);
          padGeo.scale(0.95, 1.0, 0.42);
          const padMesh = new THREE.Mesh(padGeo, pawPinkMat);
          padMesh.position.set(0, -0.02, 0.13);
          forePawGroup.add(padMesh);

          return shoulderPivot;
        }

        const leftForelimb = createConnectedCatForelimb(-1);
        const rightForelimb = createConnectedCatForelimb(1);
        spiritRoot.add(leftForelimb);
        spiritRoot.add(rightForelimb);

        sceneNodesRef.current = { hemiLight, sunKeyLight };

        let isDragging = false;
        let prevX = 0;
        let dragDistance = 0;
        let dragTargetRotY = 0;
        let dragCurrentRotY = 0;

        const onPointerDown = (e) => {
          isDragging = true;
          dragDistance = 0;
          dragMovedRef.current = false;
          prevX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
        };
        const onPointerMove = (e) => {
          if (!isDragging) return;
          const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
          const deltaX = x - prevX;
          prevX = x;
          dragDistance += Math.abs(deltaX);
          if (dragDistance > 6) {
            dragMovedRef.current = true;
          }
          dragTargetRotY += deltaX * 0.011;
          orbitDragRef.current?.(deltaX);
        };
        const onPointerUp = () => {
          isDragging = false;
        };

        const domElem = renderer.domElement;
        domElem.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        domElem.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);

        const clock = new THREE.Clock();
        let smoothBlink = 0;

        const animate = () => {
          if (!isMounted) return;
          animationFrameId = requestAnimationFrame(animate);
          const elapsed = clock.getElapsedTime();

          const {
            emotionState: curEmotion,
            actionVariantId: curVariant,
            mouseOffset: curMouse,
            isBlinking: curBlinking,
            reconState: curRecon,
            isSpeaking: curSpeaking,
            isWalking: curWalking,
            walkDirection: curWalkDirection
          } = stateRef.current;
          const curMouthOpen = mouthOpenRef ? mouthOpenRef.current : 0;

          if (curRecon && curRecon.active) {
            const p = curRecon.progress;
            const env = Math.sin(p * Math.PI);
            mapleSwirl3DGroup.visible = true;
            maple3DLeaves.forEach((item, idx) => {
              const curA = item.angle + p * Math.PI * 5;
              const curR = item.radius * (0.45 + env * 0.75);
              item.mesh.position.set(
                Math.cos(curA) * curR,
                item.yBase + Math.sin(p * Math.PI * 2 + idx) * 0.25,
                Math.sin(curA) * curR
              );
              item.mesh.rotation.set(elapsed * 3 + idx, elapsed * 4, curA);
              item.mat.opacity = env * 0.92;
            });
          } else {
            mapleSwirl3DGroup.visible = false;
          }

          const targetBlink = curBlinking ? 1 : 0;
          smoothBlink += (targetBlink - smoothBlink) * 0.38;

          stateRef.current.impulseY *= 0.86;
          stateRef.current.impulseSpin *= 0.88;

          const gazeX = curEmotion === 'SHY' ? -0.3 + curMouse.x * 0.3 : curMouse.x;
          const gazeY = curEmotion === 'SHY' ? -0.18 + curMouse.y * 0.2 : -curMouse.y;

          // 五官与实时童声口型同步
          if (curEmotion === 'HAPPY') {
            openEyesGroup.visible = false;
            happyEyesGroup.visible = true;
            closedEyesGroup.visible = false;

            catMouthGroup.visible = false;
            openMouthMesh.visible = true;
            const talkScaleY = curSpeaking ? 0.65 + curMouthOpen * 0.95 : 1.15;
            openMouthMesh.scale.set(1.35, talkScaleY, 0.45);
            sleepBubbleGroup.visible = false;
          } else if (curEmotion === 'SLEEPY') {
            openEyesGroup.visible = false;
            happyEyesGroup.visible = false;
            closedEyesGroup.visible = true;

            catMouthGroup.visible = false;
            openMouthMesh.visible = true;
            const isYawning = curVariant === 'SLEEPY_STRETCH_YAWN';
            const yawnWave = isYawning ? 0.8 + Math.max(0, Math.sin(elapsed * 2.2)) * 0.85 : 0.65;
            const breathMouth = curSpeaking
              ? 0.55 + curMouthOpen * 0.75
              : yawnWave + Math.sin(elapsed * 1.6) * 0.2;
            openMouthMesh.scale.set(isYawning ? 1.05 : 0.75, breathMouth, 0.45);

            sleepBubbleGroup.visible = !curSpeaking && curVariant === 'SLEEPY_BUBBLE';
            const bubbleScale = 0.72 + Math.sin(elapsed * 1.6) * 0.32;
            sleepBubbleGroup.scale.set(bubbleScale, bubbleScale, bubbleScale);
          } else {
            const isEyeClosed = smoothBlink > 0.78;
            openEyesGroup.visible = !isEyeClosed;
            happyEyesGroup.visible = false;
            closedEyesGroup.visible = isEyeClosed;

            const eyeScaleY = Math.max(0.12, 1 - smoothBlink * 0.9);
            const pupilPulse = 1 + Math.sin(elapsed * 3.0) * 0.03;
            [leftSolidEye, rightSolidEye].forEach((eyeObj, idx) => {
              const baseX = idx === 0 ? -0.32 : 0.32;
              eyeObj.position.x = baseX + gazeX * 0.065;
              eyeObj.position.y = 0.12 + gazeY * 0.045;
              eyeObj.scale.set(pupilPulse, eyeScaleY * pupilPulse, 1);
            });

            if (curSpeaking && curMouthOpen > 0.12) {
              catMouthGroup.visible = false;
              openMouthMesh.visible = true;
              openMouthMesh.scale.set(0.95 + curMouthOpen * 0.35, 0.45 + curMouthOpen * 0.95, 0.45);
            } else {
              catMouthGroup.visible = true;
              openMouthMesh.visible = false;
            }
            sleepBubbleGroup.visible = false;
          }

          if (curEmotion === 'SHY') {
            leftBrow.rotation.z = -0.35;
            rightBrow.rotation.z = 0.35;
            blushPinkMat.opacity = 0.88;
            leftBlush.scale.set(1.4, 0.85, 0.45);
            rightBlush.scale.set(1.4, 0.85, 0.45);
          } else if (curEmotion === 'HAPPY') {
            leftBrow.rotation.z = 0.15;
            rightBrow.rotation.z = -0.15;
            blushPinkMat.opacity = 0.78;
            leftBlush.scale.set(1.3, 0.78, 0.42);
            rightBlush.scale.set(1.3, 0.78, 0.42);
          } else {
            leftBrow.rotation.z = 0.08;
            rightBrow.rotation.z = -0.08;
            blushPinkMat.opacity = 0.55;
            leftBlush.scale.set(1.2, 0.7, 0.4);
            rightBlush.scale.set(1.2, 0.7, 0.4);
          }

          // ==========================================================
          // 12 种专属动作变体骨骼姿态驱动
          // ==========================================================
          let rootTargetY = Math.sin(elapsed * 2.2) * 0.04 + stateRef.current.impulseY;
          let rootTargetRotZ = 0;
          let headTargetRotX = curMouse.y * 0.16;
          let headTargetRotY = curMouse.x * 0.28;
          let headTargetRotZ = -curMouse.x * 0.06;

          const earTwitch = Math.pow(Math.max(0, Math.sin(elapsed * 3.5)), 12) * 0.15;
          let leftEarRotZ = 0.24 + earTwitch;
          let rightEarRotZ = -0.24 - earTwitch * 0.6;
          let leftEarRotX = -0.04;
          let rightEarRotX = -0.04;

          let tailSwingSpeed = 2.6;
          let tailSwingAmp = 0.22;

          let leftArmRotZ = -0.32 + Math.sin(elapsed * 2.2) * 0.06;
          let rightArmRotZ = 0.32 - Math.sin(elapsed * 2.2) * 0.06;
          let leftArmRotX = -0.18;
          let rightArmRotX = -0.18;

          let leftLegRotX = Math.sin(elapsed * 2.2) * 0.05;
          let rightLegRotX = -Math.sin(elapsed * 2.2) * 0.05;
          let leftLegRotZ = -0.07;
          let rightLegRotZ = 0.07;
          let leftPawRotY = -0.08;
          let rightPawRotY = 0.08;

          // --- 状态一（IDLE）的 3 种动作变体 ---
          if (curVariant === 'IDLE_LOOK_AROUND') {
            headTargetRotY = Math.sin(elapsed * 1.8) * 0.36;
            headTargetRotZ = Math.sin(elapsed * 1.8) * 0.14;
            leftEarRotZ = 0.18 + Math.max(0, Math.sin(elapsed * 1.8)) * 0.22;
            rightEarRotZ = -0.18 - Math.max(0, -Math.sin(elapsed * 1.8)) * 0.22;
            rightArmRotZ = 0.95 + Math.sin(elapsed * 2.4) * 0.15;
            rightArmRotX = -0.45;
          } else if (curVariant === 'IDLE_GROOM_PAW') {
            headTargetRotZ = 0.16;
            headTargetRotX = 0.08;
            leftArmRotZ = -1.65 + Math.sin(elapsed * 5.2) * 0.22;
            leftArmRotX = -0.75;
            rightArmRotZ = 0.25;
            tailSwingSpeed = 3.4;
          }

          // --- 状态二（HAPPY）的 3 种动作变体 ---
          if (curEmotion === 'HAPPY') {
            const stepCycle = elapsed * 8.5;
            tailSwingSpeed = 8.8;
            tailSwingAmp = 0.44;

            if (curVariant === 'HAPPY_RAISE_PAWS') {
              // 变体 1：高举双爪 · 亮出肉垫
              const bounce = Math.abs(Math.sin(stepCycle));
              rootTargetY = bounce * 0.16 + stateRef.current.impulseY;
              headTargetRotZ = Math.sin(stepCycle * 0.5) * 0.08;
              leftArmRotZ = -2.35 + Math.sin(stepCycle) * 0.15;
              rightArmRotZ = 2.35 - Math.sin(stepCycle) * 0.15;
              leftArmRotX = -0.28;
              rightArmRotX = -0.28;
              leftLegRotX = Math.sin(stepCycle) * 0.35;
              rightLegRotX = -Math.sin(stepCycle) * 0.35;
            } else if (curVariant === 'HAPPY_DANCE_SPIN') {
              // 变体 2：欢欣踏歌 · 摇尾起舞
              const danceCycle = elapsed * 6.8;
              rootTargetY = Math.abs(Math.sin(danceCycle)) * 0.14 + stateRef.current.impulseY;
              rootTargetRotZ = Math.sin(danceCycle * 0.5) * 0.12;
              headTargetRotZ = -Math.sin(danceCycle * 0.5) * 0.16;
              headTargetRotY = Math.cos(danceCycle * 0.5) * 0.22;
              leftArmRotZ = -1.45 + Math.sin(danceCycle) * 0.65;
              rightArmRotZ = 1.45 + Math.sin(danceCycle) * 0.65;
              leftLegRotX = Math.sin(danceCycle) * 0.46;
              rightLegRotX = -Math.sin(danceCycle) * 0.46;
            } else {
              // 变体 3：凌空雀跃 · 迎风欢跳 (HAPPY_STAR_JUMP)
              const jumpCycle = elapsed * 7.2;
              const highJump = Math.pow(Math.abs(Math.sin(jumpCycle)), 0.75);
              rootTargetY = highJump * 0.28 + stateRef.current.impulseY;
              headTargetRotX = -0.14;
              leftEarRotZ = 0.06 + highJump * 0.18;
              rightEarRotZ = -0.06 - highJump * 0.18;
              leftArmRotZ = -2.05 - highJump * 0.35;
              rightArmRotZ = 2.05 + highJump * 0.35;
              leftLegRotZ = -0.18 - highJump * 0.12;
              rightLegRotZ = 0.18 + highJump * 0.12;
            }
          }

          // --- 状态三（SHY）的 3 种动作变体 ---
          if (curEmotion === 'SHY') {
            rootTargetY = -0.04 + Math.sin(elapsed * 2.5) * 0.025 + stateRef.current.impulseY;
            leftEarRotZ = 0.88;
            rightEarRotZ = -0.88;
            leftEarRotX = 0.22;
            rightEarRotX = 0.22;
            tailSwingSpeed = 1.8;
            tailSwingAmp = 0.12;
            leftLegRotZ = 0.14;
            rightLegRotZ = -0.14;
            leftPawRotY = 0.26;
            rightPawRotY = -0.26;

            if (curVariant === 'SHY_COVER_CHEEK') {
              // 变体 1：拢爪掩面
              headTargetRotX = 0.15;
              headTargetRotZ = Math.sin(elapsed * 2.2) * 0.08;
              leftArmRotZ = 0.58;
              rightArmRotZ = -0.58;
              leftArmRotX = -0.92;
              rightArmRotX = -0.92;
            } else if (curVariant === 'SHY_HIDE_TAIL') {
              // 变体 2：侧身藏尾 · 偷瞄一眼
              rootTargetRotZ = 0.05;
              headTargetRotY = -0.38 + Math.sin(elapsed * 1.8) * 0.06;
              headTargetRotX = 0.12;
              leftArmRotZ = 0.42;
              rightArmRotZ = -0.72;
              leftArmRotX = -0.65;
              rightArmRotX = -0.88;
              tailSwingAmp = 0.28;
            } else {
              // 变体 3：对指扭捏 · 低头含羞 (SHY_FIDGET_PAWS)
              headTargetRotX = 0.28;
              headTargetRotZ = Math.sin(elapsed * 3.0) * 0.06;
              const fidget = Math.sin(elapsed * 6.5) * 0.12;
              leftArmRotZ = 0.68 + fidget;
              rightArmRotZ = -0.68 - fidget;
              leftArmRotX = -0.52;
              rightArmRotX = -0.52;
              leftLegRotX = Math.sin(elapsed * 4.2) * 0.1;
              rightLegRotX = -Math.sin(elapsed * 4.2) * 0.1;
            }
          }

          // --- 状态四（SLEEPY）的 3 种动作变体 ---
          if (curEmotion === 'SLEEPY') {
            leftEarRotZ = 0.72;
            rightEarRotZ = -0.72;
            leftEarRotX = 0.18;
            rightEarRotX = 0.18;
            tailSwingSpeed = 1.1;
            tailSwingAmp = 0.08;
            leftLegRotX = 0.06;
            rightLegRotX = 0.06;

            if (curVariant === 'SLEEPY_BUBBLE') {
              // 变体 1：鼻息泡泡 · 垂耳酣眠
              rootTargetY = -0.05 + Math.sin(elapsed * 1.2) * 0.025 + stateRef.current.impulseY;
              headTargetRotX = 0.18 + Math.sin(elapsed * 1.2) * 0.04;
              headTargetRotZ = 0.07;
              leftArmRotZ = 0.28;
              rightArmRotZ = -0.28;
              leftArmRotX = -0.42;
              rightArmRotX = -0.42;
            } else if (curVariant === 'SLEEPY_HEAD_NOD') {
              // 变体 2：小鸡啄米 · 点头打盹
              const nodPhase = (elapsed * 0.85) % 1;
              const nodDrop = nodPhase < 0.78 ? nodPhase * 0.32 : (1 - nodPhase) * 1.1;
              rootTargetY = -0.05 - nodDrop * 0.08 + stateRef.current.impulseY;
              headTargetRotX = 0.12 + nodDrop * 0.85;
              headTargetRotZ = 0.05;
              leftArmRotZ = 0.22;
              rightArmRotZ = -0.22;
            } else {
              // 变体 3：舒展猫爪 · 哈欠连连 (SLEEPY_STRETCH_YAWN)
              const stretchWave = 0.5 + 0.5 * Math.sin(elapsed * 1.8);
              rootTargetY = stretchWave * 0.08 + stateRef.current.impulseY;
              headTargetRotX = -0.12 * stretchWave;
              leftArmRotZ = -0.35 - stretchWave * 1.65;
              rightArmRotZ = 0.35 + stretchWave * 1.65;
              leftArmRotX = -0.35;
              rightArmRotX = -0.35;
            }
          }

          // ==========================================================
          // 对话展开 / 收起时的侧步行走：覆盖当前动作，走到新位置
          // ==========================================================
          if (curWalking) {
            const walkDir = curWalkDirection < 0 ? -1 : 1;
            const walkPhase = elapsed * 9.4;
            const stride = Math.sin(walkPhase);
            const stepLift = Math.abs(Math.sin(walkPhase));

            rootTargetY = stepLift * 0.075 + stateRef.current.impulseY;
            rootTargetRotZ = Math.sin(walkPhase * 2) * 0.018 - walkDir * 0.05;
            headTargetRotX = 0.04;
            headTargetRotY = walkDir * 0.12 + Math.sin(walkPhase) * 0.04;
            headTargetRotZ = -walkDir * 0.045;

            leftEarRotZ = 0.3 + Math.sin(walkPhase) * 0.16;
            rightEarRotZ = -0.3 - Math.sin(walkPhase + 0.6) * 0.16;
            leftEarRotX = -0.06;
            rightEarRotX = -0.06;

            tailSwingSpeed = 10.5;
            tailSwingAmp = 0.32;

            leftArmRotZ = -0.26;
            rightArmRotZ = 0.26;
            leftArmRotX = -0.18 - stride * 0.55;
            rightArmRotX = -0.18 + stride * 0.55;

            leftLegRotX = stride * 0.45;
            rightLegRotX = -stride * 0.45;
            leftLegRotZ = -0.05;
            rightLegRotZ = 0.05;
          }

          spiritRoot.position.y += (rootTargetY - spiritRoot.position.y) * 0.14;
          spiritRoot.rotation.z += (rootTargetRotZ - spiritRoot.rotation.z) * 0.14;
          const shadowScale = Math.max(0.72, 1.12 - spiritRoot.position.y * 0.75);
          groundShadowMesh.scale.set(shadowScale, 1, shadowScale * 0.48);

          leftCatLeg.hipPivot.rotation.x += (leftLegRotX - leftCatLeg.hipPivot.rotation.x) * 0.18;
          rightCatLeg.hipPivot.rotation.x += (rightLegRotX - rightCatLeg.hipPivot.rotation.x) * 0.18;
          leftCatLeg.hipPivot.rotation.z += (leftLegRotZ - leftCatLeg.hipPivot.rotation.z) * 0.16;
          rightCatLeg.hipPivot.rotation.z += (rightLegRotZ - rightCatLeg.hipPivot.rotation.z) * 0.16;
          leftCatLeg.pawGroup.rotation.y += (leftPawRotY - leftCatLeg.pawGroup.rotation.y) * 0.16;
          rightCatLeg.pawGroup.rotation.y += (rightPawRotY - rightCatLeg.pawGroup.rotation.y) * 0.16;

          leftForelimb.rotation.z += (leftArmRotZ - leftForelimb.rotation.z) * 0.16;
          rightForelimb.rotation.z += (rightArmRotZ - rightForelimb.rotation.z) * 0.16;
          leftForelimb.rotation.x += (leftArmRotX - leftForelimb.rotation.x) * 0.16;
          rightForelimb.rotation.x += (rightArmRotX - rightForelimb.rotation.x) * 0.16;

          headGroup.rotation.x += (headTargetRotX - headGroup.rotation.x) * 0.14;
          headGroup.rotation.y += (headTargetRotY - headGroup.rotation.y) * 0.14;
          headGroup.rotation.z += (headTargetRotZ - headGroup.rotation.z) * 0.14;

          sproutGroup.rotation.z =
            Math.sin(elapsed * (curEmotion === 'HAPPY' ? 7 : 2.6)) * 0.15 -
            headGroup.rotation.z * 0.55;
          tailPivot.rotation.z = Math.sin(elapsed * tailSwingSpeed) * tailSwingAmp;

          leftEarPivot.rotation.z += (leftEarRotZ - leftEarPivot.rotation.z) * 0.14;
          rightEarPivot.rotation.z += (rightEarRotZ - rightEarPivot.rotation.z) * 0.14;
          leftEarPivot.rotation.x += (leftEarRotX - leftEarPivot.rotation.x) * 0.14;
          rightEarPivot.rotation.x += (rightEarRotX - rightEarPivot.rotation.x) * 0.14;

          const walkFacingTarget = curWalking
            ? (curWalkDirection < 0 ? -1 : 1) * 0.42
            : 0;
          stateRef.current.walkFacing +=
            (walkFacingTarget - stateRef.current.walkFacing) * 0.14;

          dragCurrentRotY += (dragTargetRotY - dragCurrentRotY) * 0.12;
          dragRoot.rotation.y =
            dragCurrentRotY + stateRef.current.impulseSpin + stateRef.current.walkFacing;

          renderer.render(scene, camera);
        };

        setEngineReady(true);
        onEngineReady?.();
        animate();

        const handleResize = () => {
          if (!mountRef.current) return;
          const w = mountRef.current.clientWidth;
          const h = mountRef.current.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          domElem.removeEventListener('mousedown', onPointerDown);
          window.removeEventListener('mousemove', onPointerMove);
          window.removeEventListener('mouseup', onPointerUp);
          domElem.removeEventListener('touchstart', onPointerDown);
          window.removeEventListener('touchmove', onPointerMove);
          window.removeEventListener('touchend', onPointerUp);
        };
      } catch (err) {
        setEngineReady(false);
      }
    }

    initThreeFieldSpirit();

    return () => {
      isMounted = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const nodes = sceneNodesRef.current;
    if (!nodes) return;
    if (activeTheme.isNight) {
      nodes.hemiLight.intensity = 0.88;
      nodes.sunKeyLight.intensity = 0.68;
    } else {
      nodes.hemiLight.intensity = 1.14;
      nodes.sunKeyLight.intensity = 0.88;
    }
  }, [activeTheme]);

  const handleStageClick = () => {
    // 拖拽旋转后的 click 事件不应再触发动作
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    onPetCompanion();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        ref={mountRef}
        onClick={handleStageClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        title="点击小灵触发不同动作变体，左右拖拽可旋转立体视角"
      />
      {!engineReady && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-600 pointer-events-none">
          正在渲染立体灵宠视图……
        </div>
      )}
    </div>
  );
}
