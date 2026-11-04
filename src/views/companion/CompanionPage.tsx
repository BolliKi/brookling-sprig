'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'

import { CompanionBootScreen } from '@components/character/CompanionBootScreen'
import { CompanionChatDock } from '@components/companion/CompanionChatDock'
import { CompanionDanmakuOverlay } from '@components/companion/CompanionDanmakuOverlay'
import { CompanionHeader } from '@components/companion/CompanionHeader'
import { SystemToastLayer } from '@components/companion/SystemToastLayer'
import { DevDebugDrawer } from '@components/devtools/DevDebugDrawer'
import { MoodAmbientLayer } from '@components/stage/MoodAmbientLayer'
import { SongDynastyPavilionStage } from '@components/stage/SongDynastyPavilionStage'
import { ThreeLandscapeStage } from '@components/stage/ThreeLandscapeStage'
import { useCompanionSession } from '@hooks/companion/use-companion-session'
import type { StageOrbitState } from '@/types/companion'

import { StageViewport } from './StageViewport'

/**
 * 灵宠陪伴主页面：只负责把会话模型装配到各职责视图中。
 */
export default function CompanionPage() {
  const session = useCompanionSession()
  const { activeTheme, currentEmotion, currentVariant } = session

  // 面向用户默认隐藏调试台；维护者可通过 /?debug=1 打开
  const [debugOpen, setDebugOpen] = useState(false)
  const [chatCollapsed, setChatCollapsed] = useState(false)
  const [engineReady, setEngineReady] = useState(false)
  const [landscapeReady, setLandscapeReady] = useState(false)
  const stageOrbitRef = useRef<StageOrbitState>({ targetYaw: 0, currentYaw: 0 })
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setDebugOpen(params.get('debug') === '1')
  }, [])

  // 拖拽角色时把水平位移共享给立体背景，镜头轻环绕形成近远景视差
  const handleStageOrbitDrag = useCallback((deltaX: number) => {
    const orbit = stageOrbitRef.current
    orbit.targetYaw = Math.max(-0.14, Math.min(0.14, orbit.targetYaw + deltaX * 0.0016))
  }, [])

  const isStereo = session.renderMode === 'STEREO'
  const show3DBackdrop = isStereo && landscapeReady

  const latestCompanionMessage = [...session.dialogueMessages]
    .reverse()
    .find((message) => message.role === 'companion')

  // 点击场景任意空白处都能逗禾禾；按钮、聊天卡、头部与角色舞台由各自处理
  const handleSceneClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (
      target.closest(
        'button, a, input, textarea, select, form, header, aside, [role="dialog"], [data-pet-stage]'
      )
    ) {
      return
    }
    session.handlePetCompanion()
  }

  return (
    <div
      onMouseMove={session.handleViewportMouseMove}
      className='relative w-screen h-screen overflow-hidden flex flex-col select-none font-sans text-field-soil-deep'
    >
      {/* 立体视图：远山画卷 + three.js 近景水榭与水面，拖拽产生真实视差 */}
      <ThreeLandscapeStage
        activeTheme={activeTheme}
        visible={isStereo}
        orbitRef={stageOrbitRef}
        onReadyChange={setLandscapeReady}
      />

      {/* 平面视图：宋韵山水与江南水榭回廊写意画卷（立体背景就绪后淡出，风铎仍保留） */}
      <SongDynastyPavilionStage
        activeTheme={activeTheme}
        atmosphere={session.atmosphere}
        onRingBronzeBell={session.handleRingBronzeBell}
        canvasVisible={!show3DBackdrop}
      />

      <MoodAmbientLayer
        atmosphere={session.atmosphere}
        isNight={activeTheme.isNight}
      />

      <main
        onClick={handleSceneClick}
        className='relative z-10 flex-1 flex flex-col h-full min-w-0 px-4 sm:px-8 py-3.5 overflow-hidden cursor-pointer'
      >
        <CompanionHeader
          emotionLabel={currentEmotion.label}
          emotionBadgeClass={currentEmotion.badgeClass}
          variantName={currentVariant.name}
          accentColor={activeTheme.accentColor}
          isNight={activeTheme.isNight}
          renderMode={session.renderMode}
          soundEnabled={session.soundEnabled}
          onTriggerMorph={(mode) => session.triggerMapleLeafMorph(mode, '视图切换')}
          onToggleSound={session.toggleSound}
          onOpenDebug={() => setDebugOpen(true)}
        />

        <SystemToastLayer
          toasts={session.systemToasts}
          onDismiss={session.dismissSystemToast}
          onHoverChange={session.setSystemToastHovered}
        />

        <CompanionDanmakuOverlay
          messages={session.dialogueMessages}
          active={chatCollapsed}
        />

        <StageViewport
          emotionState={session.emotionState}
          actionVariantId={currentVariant.id}
          activeTheme={activeTheme}
          mouseOffset={session.mouseOffset}
          isBlinking={session.isBlinking}
          onPetCompanion={session.handlePetCompanion}
          petBurst={session.petBurst}
          reconState={session.reconState}
          isSpeaking={session.speech.isSpeaking}
          mouthOpenRef={session.speech.mouthOpenRef}
          renderMode={session.renderMode}
          speechMessage={latestCompanionMessage}
          chatCollapsed={chatCollapsed}
          onOrbitDrag={handleStageOrbitDrag}
          onEngineReady={() => setEngineReady(true)}
        />

        <CompanionChatDock
          session={session}
          collapsed={chatCollapsed}
          onToggle={() => setChatCollapsed((prev) => !prev)}
        />
      </main>

      <DevDebugDrawer
        session={session}
        open={debugOpen}
        onClose={() => setDebugOpen(false)}
      />

      <CompanionBootScreen engineReady={engineReady} />
    </div>
  )
}
