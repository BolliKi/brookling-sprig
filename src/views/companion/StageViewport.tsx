'use client'

import type { MutableRefObject } from 'react'

import { Spirit2DCharacter } from '@components/character/Spirit2DCharacter'
import { ThreeFieldSpiritStage } from '@components/character/Spirit3DStage'
import { CompanionSpeechBubble } from '@components/companion/CompanionSpeechBubble'
import { DimensionalMorphOverlay } from '@components/transition/DimensionalMorphOverlay'
import { getStageLayerStyle } from '@utils/stage-layer'
import type { DialogueMessage, EmotionKey, LightingTheme, ReconState, RenderMode } from '@/types/companion'

interface StageViewportProps {
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
  renderMode: RenderMode
  speechMessage?: DialogueMessage | null
  chatCollapsed: boolean
  onOrbitDrag?: (deltaX: number) => void
  onEngineReady?: () => void
}

/**
 * 核心角色大舞台：平面 / 立体双层同时挂载，通过红枫化形样式切换可见性。
 */
export function StageViewport({
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
  renderMode,
  speechMessage,
  chatCollapsed,
  onOrbitDrag,
  onEngineReady
}: StageViewportProps) {
  return (
    <div className='absolute inset-0 z-[18] flex items-center justify-center overflow-hidden pointer-events-none'>
      <div
        data-pet-stage
        className={`relative flex h-full max-h-[560px] w-full max-w-[680px] translate-y-[2vh] items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform lg:translate-y-[17vh] ${
          chatCollapsed ? 'translate-x-0' : 'lg:translate-x-[200px] xl:translate-x-[210px]'
        }`}
      >
        <div
          className='absolute inset-0 flex items-center justify-center'
          style={getStageLayerStyle(reconState, renderMode, 'STEREO')}
        >
          <ThreeFieldSpiritStage
            emotionState={emotionState}
            actionVariantId={actionVariantId}
            activeTheme={activeTheme}
            mouseOffset={mouseOffset}
            isBlinking={isBlinking}
            onPetCompanion={onPetCompanion}
            petBurst={petBurst}
            reconState={reconState}
            isSpeaking={isSpeaking}
            mouthOpenRef={mouthOpenRef}
            onOrbitDrag={onOrbitDrag}
            onEngineReady={onEngineReady}
          />
        </div>

        <div
          className='absolute inset-0 flex items-center justify-center'
          style={getStageLayerStyle(reconState, renderMode, 'FLAT')}
        >
          <Spirit2DCharacter
            emotionState={emotionState}
            actionVariantId={actionVariantId}
            mouseOffset={mouseOffset}
            isBlinking={isBlinking}
            onPetCompanion={onPetCompanion}
            petBurst={petBurst}
            reconState={reconState}
            isSpeaking={isSpeaking}
            mouthOpenRef={mouthOpenRef}
          />
        </div>

        {speechMessage && (
          <div className='absolute right-[2%] top-[10%] z-30 w-[min(72%,300px)] lg:top-[3%]'>
            <CompanionSpeechBubble key={speechMessage.id} message={speechMessage} />
          </div>
        )}
      </div>

      <DimensionalMorphOverlay reconState={reconState} />
    </div>
  )
}
