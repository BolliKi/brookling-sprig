'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

import { CHILD_VOICE_PRESETS, EMOTION_VOICE_MODIFIERS } from '@configs/voice-presets'
import { getSortedChineseVoices } from '@libs/speech/voices'
import type { ChildVoicePresetKey, EmotionKey } from '@/types/companion'

interface UseSpeechSynthesisOptions {
  emotionState: EmotionKey
  soundEnabled: boolean
}

export interface SpeechSynthesisController {
  availableVoices: SpeechSynthesisVoice[]
  selectedVoiceURI: string
  setSelectedVoiceURI: (voiceURI: string) => void
  childVoicePreset: ChildVoicePresetKey
  ttsPitchOverride: number
  setTtsPitchOverride: (pitch: number) => void
  ttsRateOverride: number
  setTtsRateOverride: (rate: number) => void
  isSpeaking: boolean
  mouthOpenRef: MutableRefObject<number>
  speakChildVoice: (rawText: string, emotionKey?: EmotionKey) => void
  stopChildSpeech: () => void
  handleSelectChildPreset: (presetKey: ChildVoicePresetKey) => void
}

/**
 * 清脆儿童语音（TTS）职责：音源优选、童声预设、整句合成与口型开合 Ref 驱动。
 * 高频口型值放在 Ref 中，避免朗读时 60fps 触发整页重渲染造成语音卡顿。
 */
export function useSpeechSynthesis({
  emotionState,
  soundEnabled
}: UseSpeechSynthesisOptions): SpeechSynthesisController {
  const [childVoicePreset, setChildVoicePreset] = useState<ChildVoicePresetKey>('CRISP_GIRL')
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('AUTO')
  const [ttsPitchOverride, setTtsPitchOverride] = useState(1.22)
  const [ttsRateOverride, setTtsRateOverride] = useState(1.05)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const mouthOpenRef = useRef(0)
  const lipSyncRafRef = useRef<number | null>(null)
  const ttsDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const ttsBoundaryBoostRef = useRef(0)

  // 加载系统中文语音列表
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const updateVoiceList = () => {
      setAvailableVoices(getSortedChineseVoices())
    }
    updateVoiceList()
    window.speechSynthesis.onvoiceschanged = updateVoiceList
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  // 切换童声预设时同步更新基础音调与语速
  const handleSelectChildPreset = useCallback((presetKey: ChildVoicePresetKey) => {
    const preset = CHILD_VOICE_PRESETS[presetKey]
    if (!preset) return
    setChildVoicePreset(presetKey)
    setTtsPitchOverride(preset.basePitch)
    setTtsRateOverride(preset.baseRate)
  }, [])

  // 停止当前语音与口型动画
  const stopChildSpeech = useCallback(() => {
    if (ttsDelayTimerRef.current) {
      clearTimeout(ttsDelayTimerRef.current)
      ttsDelayTimerRef.current = null
    }
    if (lipSyncRafRef.current) {
      cancelAnimationFrame(lipSyncRafRef.current)
      lipSyncRafRef.current = null
    }
    activeUtteranceRef.current = null
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel()
      } catch (e) {
        // 忽略取消异常
      }
    }
    mouthOpenRef.current = 0
    setIsSpeaking(false)
  }, [])

  // 核心函数：流畅不卡顿的清脆儿童语音（整句单次合成 + 本地音源优先 + Ref 零重绘口型驱动）
  const speakChildVoice = useCallback(
    (rawText: string, emotionKey: EmotionKey = emotionState) => {
      if (!soundEnabled || !rawText || typeof window === 'undefined') return

      if (ttsDelayTimerRef.current) {
        clearTimeout(ttsDelayTimerRef.current)
        ttsDelayTimerRef.current = null
      }
      if (lipSyncRafRef.current) {
        cancelAnimationFrame(lipSyncRafRef.current)
        lipSyncRafRef.current = null
      }

      // 保留自然标点停顿，仅清理特殊波浪线，以整句单条 Utterance 交由底层引擎平滑朗读
      const cleanText = rawText
        .replace(/[～~]+/g, '，')
        .replace(/……/g, '，')
        .replace(/——/g, '，')
        .replace(/·/g, '')
        .trim()
      if (!cleanText) return

      const mod = EMOTION_VOICE_MODIFIERS[emotionKey] || EMOTION_VOICE_MODIFIERS.IDLE
      const chars = Array.from(cleanText)
      const effectiveRate = Math.min(1.25, Math.max(0.9, ttsRateOverride * mod.rateMultiplier))
      const stepMs = Math.round(125 / effectiveRate)
      const estimatedDurationMs = Math.min(8500, Math.max(850, chars.length * stepMs))

      setIsSpeaking(true)
      const startTime = performance.now()

      const animateLipSync = (now: number) => {
        const elapsed = now - startTime
        if (elapsed >= estimatedDurationMs + 260) {
          mouthOpenRef.current = 0
          setIsSpeaking(false)
          return
        }
        const charIdx = Math.min(chars.length - 1, Math.floor(elapsed / stepMs))
        const curChar = chars[charIdx] || ''
        const isPause = /[，。！？、；：,.!?\s]/.test(curChar)

        if (isPause) {
          mouthOpenRef.current = 0.06
        } else {
          const syllablePhase = (elapsed % stepMs) / stepMs
          const boundaryImpulse =
            Math.max(0, 1 - (now - ttsBoundaryBoostRef.current) / 140) * 0.25
          const openVal =
            Math.sin(syllablePhase * Math.PI) *
              (0.58 + 0.3 * Math.sin(elapsed * 0.03 + charIdx)) +
            boundaryImpulse
          mouthOpenRef.current = Math.max(0.14, Math.min(1, openVal))
        }
        lipSyncRafRef.current = requestAnimationFrame(animateLipSync)
      }
      lipSyncRafRef.current = requestAnimationFrame(animateLipSync)

      if (window.speechSynthesis) {
        try {
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel()
          }

          // 延迟 35ms 启动新语句，避免浏览器 cancel() 与 speak() 同帧调用引起的吞字和卡顿
          ttsDelayTimerRef.current = setTimeout(() => {
            try {
              if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume()
              }

              const utter = new window.SpeechSynthesisUtterance(cleanText)
              // 挂载到 Ref 防止浏览器垃圾回收器在朗读中途回收 Utterance 造成断音
              activeUtteranceRef.current = utter
              utter.lang = 'zh-CN'

              const sortedVoices =
                availableVoices.length > 0 ? availableVoices : getSortedChineseVoices()
              const chosenVoice =
                selectedVoiceURI !== 'AUTO'
                  ? sortedVoices.find((v) => v.voiceURI === selectedVoiceURI) || sortedVoices[0]
                  : sortedVoices[0]

              if (chosenVoice) {
                utter.voice = chosenVoice
              }

              // 将音调严格控制在 1.16 ~ 1.28 自然清脆童声区间，消除电音卡顿与断句吞字
              const targetPitch = Math.min(
                1.28,
                Math.max(1.16, ttsPitchOverride + mod.pitchDelta)
              )

              utter.pitch = targetPitch
              utter.rate = effectiveRate
              utter.volume = 1.0

              utter.onboundary = () => {
                ttsBoundaryBoostRef.current = performance.now()
              }

              utter.onend = () => {
                if (lipSyncRafRef.current) {
                  cancelAnimationFrame(lipSyncRafRef.current)
                  lipSyncRafRef.current = null
                }
                activeUtteranceRef.current = null
                mouthOpenRef.current = 0
                setIsSpeaking(false)
              }

              utter.onerror = () => {
                if (lipSyncRafRef.current) {
                  cancelAnimationFrame(lipSyncRafRef.current)
                  lipSyncRafRef.current = null
                }
                activeUtteranceRef.current = null
                mouthOpenRef.current = 0
                setIsSpeaking(false)
              }

              window.speechSynthesis.speak(utter)
            } catch (innerErr) {
              // 忽略底层异常
            }
          }, 35)
        } catch (err) {
          // 忽略语音接口异常
        }
      }
    },
    [
      emotionState,
      soundEnabled,
      ttsPitchOverride,
      ttsRateOverride,
      selectedVoiceURI,
      availableVoices
    ]
  )

  useEffect(() => {
    return () => {
      stopChildSpeech()
    }
  }, [stopChildSpeech])

  return {
    availableVoices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    childVoicePreset,
    ttsPitchOverride,
    setTtsPitchOverride,
    ttsRateOverride,
    setTtsRateOverride,
    isSpeaking,
    mouthOpenRef,
    speakChildVoice,
    stopChildSpeech,
    handleSelectChildPreset
  }
}
