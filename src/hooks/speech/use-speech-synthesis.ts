'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'

import VOICE_MANIFEST_JSON from '@configs/voice-manifest.json'
import { CHILD_VOICE_PRESETS, EMOTION_VOICE_MODIFIERS } from '@configs/voice-presets'
import { cleanSpeechText } from '@libs/speech/clean-speech-text'
import { getSortedChineseVoices } from '@libs/speech/voices'
import type {
  ChildVoicePresetKey,
  EmotionKey,
  VoiceClip,
  VoiceManifest
} from '@/types/companion'

const VOICE_MANIFEST = VOICE_MANIFEST_JSON as VoiceManifest
const EMOTION_LOOKUP_ORDER: EmotionKey[] = ['IDLE', 'HAPPY', 'SHY', 'SLEEPY']
const PAUSE_PATTERN = /[，。！？、；：,.!?\s]/

/** 按预设 → 情绪 → 原始台词查找预生成音频；精确情绪缺失时回退到其它情绪的同句录音。 */
function findVoiceClip(
  preset: ChildVoicePresetKey,
  emotionKey: EmotionKey,
  rawText: string
): VoiceClip | null {
  const entries = VOICE_MANIFEST.presets[preset]?.entries
  if (!entries) return null

  const exact = entries[emotionKey]?.[rawText]
  if (exact) return exact

  const idle = entries.IDLE?.[rawText]
  if (idle) return idle

  for (const key of EMOTION_LOOKUP_ORDER) {
    const clip = entries[key]?.[rawText]
    if (clip) return clip
  }

  return null
}

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
 * 清脆儿童语音职责：优先播放预生成音频，缺失或播放失败时回退到 Web Speech API。
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
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)
  // 每次新朗读递增；异步回调只在 token 未变化时生效，避免旧音频/旧语音串台
  const playbackTokenRef = useRef(0)

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

  // 切换童声预设时同步更新基础音调与语速（预生成音频使用对应预设的录音）
  const handleSelectChildPreset = useCallback((presetKey: ChildVoicePresetKey) => {
    const preset = CHILD_VOICE_PRESETS[presetKey]
    if (!preset) return
    setChildVoicePreset(presetKey)
    setTtsPitchOverride(preset.basePitch)
    setTtsRateOverride(preset.baseRate)
  }, [])

  const cancelLipSync = useCallback(() => {
    if (lipSyncRafRef.current !== null) {
      cancelAnimationFrame(lipSyncRafRef.current)
      lipSyncRafRef.current = null
    }
    mouthOpenRef.current = 0
  }, [])

  // 停止当前音频 / 实时合成 / 口型，但不递增 token，供新一次朗读内部调用
  const stopActivePlayback = useCallback(() => {
    if (ttsDelayTimerRef.current) {
      clearTimeout(ttsDelayTimerRef.current)
      ttsDelayTimerRef.current = null
    }
    cancelLipSync()
    activeUtteranceRef.current = null

    const audio = activeAudioRef.current
    if (audio) {
      try {
        audio.pause()
        audio.currentTime = 0
      } catch {
        // 元数据尚未就绪时 currentTime 可能不可写，忽略
      }
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel()
      } catch {
        // 忽略取消异常
      }
    }
  }, [cancelLipSync])

  // 停止当前语音与口型动画
  const stopChildSpeech = useCallback(() => {
    playbackTokenRef.current += 1
    stopActivePlayback()
    setIsSpeaking(false)
  }, [stopActivePlayback])

  const getAudioElement = useCallback(() => {
    if (typeof window === 'undefined') return null
    if (!activeAudioRef.current) {
      const audio = new Audio()
      audio.preload = 'auto'
      audio.volume = 1
      activeAudioRef.current = audio
    }
    return activeAudioRef.current
  }, [])

  // 用真实音频时长与 currentTime 驱动口型；元数据未就绪时使用清单里的时长兜底
  const startAudioLipSync = useCallback(
    (
      audio: HTMLAudioElement,
      cleanText: string,
      fallbackDurationSec: number,
      token: number
    ) => {
      cancelLipSync()
      const chars = Array.from(cleanText)
      if (chars.length === 0) return

      const estimatedDurationMs = Math.min(8500, Math.max(850, chars.length * 125))
      const fallbackDuration =
        fallbackDurationSec > 0 ? fallbackDurationSec : estimatedDurationMs / 1000

      const animate = () => {
        if (token !== playbackTokenRef.current) return
        if (audio.ended) {
          mouthOpenRef.current = 0
          return
        }

        const duration =
          Number.isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : fallbackDuration
        const currentTime = audio.currentTime
        const progress = Math.min(0.999, Math.max(0, currentTime / duration))
        const charIdx = Math.min(chars.length - 1, Math.floor(progress * chars.length))
        const currentChar = chars[charIdx] || ''

        if (audio.paused && currentTime === 0) {
          mouthOpenRef.current = 0
        } else if (PAUSE_PATTERN.test(currentChar)) {
          mouthOpenRef.current = 0.06
        } else {
          const stepSec = duration / chars.length
          const phase = stepSec > 0 ? (currentTime % stepSec) / stepSec : 0
          mouthOpenRef.current = Math.max(
            0.14,
            Math.min(1, Math.sin(phase * Math.PI) * 0.68 + 0.12)
          )
        }

        lipSyncRafRef.current = requestAnimationFrame(animate)
      }

      lipSyncRafRef.current = requestAnimationFrame(animate)
    },
    [cancelLipSync]
  )

  // Web Speech API 兜底：整句单次合成 + 本地音源优先 + 按字数估算口型
  const speakWithSynthesis = useCallback(
    (cleanText: string, emotionKey: EmotionKey, token: number) => {
      const mod = EMOTION_VOICE_MODIFIERS[emotionKey] || EMOTION_VOICE_MODIFIERS.IDLE
      const chars = Array.from(cleanText)
      const effectiveRate = Math.min(1.25, Math.max(0.9, ttsRateOverride * mod.rateMultiplier))
      const stepMs = Math.round(125 / effectiveRate)
      const estimatedDurationMs = Math.min(8500, Math.max(850, chars.length * stepMs))

      setIsSpeaking(true)
      const startTime = performance.now()

      const animateLipSync = (now: number) => {
        if (token !== playbackTokenRef.current) return
        const elapsed = now - startTime
        if (elapsed >= estimatedDurationMs + 260) {
          mouthOpenRef.current = 0
          lipSyncRafRef.current = null
          setIsSpeaking(false)
          return
        }
        const charIdx = Math.min(chars.length - 1, Math.floor(elapsed / stepMs))
        const curChar = chars[charIdx] || ''
        const isPause = PAUSE_PATTERN.test(curChar)

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

      if (typeof window === 'undefined' || !window.speechSynthesis) return

      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel()
        }

        // 延迟 35ms 启动新语句，避免浏览器 cancel() 与 speak() 同帧调用引起的吞字和卡顿
        ttsDelayTimerRef.current = setTimeout(() => {
          if (token !== playbackTokenRef.current) return
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
              if (token !== playbackTokenRef.current) return
              cancelLipSync()
              activeUtteranceRef.current = null
              setIsSpeaking(false)
            }

            utter.onerror = () => {
              if (token !== playbackTokenRef.current) return
              cancelLipSync()
              activeUtteranceRef.current = null
              setIsSpeaking(false)
            }

            window.speechSynthesis.speak(utter)
          } catch {
            // 忽略底层异常
          }
        }, 35)
      } catch {
        // 忽略语音接口异常
      }
    },
    [
      availableVoices,
      selectedVoiceURI,
      ttsPitchOverride,
      ttsRateOverride,
      cancelLipSync
    ]
  )

  // 播放预生成音频；加载/解码/自动播放失败时无缝回退到实时合成
  const playRecordedClip = useCallback(
    (clip: VoiceClip, cleanText: string, emotionKey: EmotionKey, token: number) => {
      const audio = getAudioElement()
      if (!audio) return false

      let fallbackStarted = false
      const fallbackToSynthesis = () => {
        if (fallbackStarted || token !== playbackTokenRef.current) return
        fallbackStarted = true
        cancelLipSync()
        setIsSpeaking(false)
        speakWithSynthesis(cleanText, emotionKey, token)
      }

      audio.onended = () => {
        if (fallbackStarted || token !== playbackTokenRef.current) return
        cancelLipSync()
        setIsSpeaking(false)
      }
      audio.onerror = fallbackToSynthesis

      try {
        audio.pause()
      } catch {
        // 忽略暂停异常
      }
      audio.src = clip.file
      try {
        audio.currentTime = 0
      } catch {
        // 元数据尚未就绪时忽略
      }

      setIsSpeaking(true)
      startAudioLipSync(audio, cleanText, clip.duration, token)

      let playPromise: Promise<void> | undefined
      try {
        playPromise = audio.play()
      } catch {
        fallbackToSynthesis()
        return true
      }

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(fallbackToSynthesis)
      }

      return true
    },
    [getAudioElement, startAudioLipSync, speakWithSynthesis, cancelLipSync]
  )

  // 核心入口：优先预生成音频，未命中时回退实时合成
  const speakChildVoice = useCallback(
    (rawText: string, emotionKey: EmotionKey = emotionState) => {
      if (!soundEnabled || !rawText || typeof window === 'undefined') return

      const token = playbackTokenRef.current + 1
      playbackTokenRef.current = token
      stopActivePlayback()

      // 预生成音频按原始台词索引；实时合成前再做装饰符清理
      const cleanText = cleanSpeechText(rawText)
      if (!cleanText) {
        setIsSpeaking(false)
        return
      }

      const clip = findVoiceClip(childVoicePreset, emotionKey, rawText)
      if (clip && playRecordedClip(clip, cleanText, emotionKey, token)) return

      speakWithSynthesis(cleanText, emotionKey, token)
    },
    [
      emotionState,
      soundEnabled,
      childVoicePreset,
      stopActivePlayback,
      playRecordedClip,
      speakWithSynthesis
    ]
  )

  useEffect(() => {
    return () => {
      stopChildSpeech()
      const audio = activeAudioRef.current
      if (audio) {
        try {
          audio.pause()
        } catch {
          // 卸载时忽略暂停异常
        }
        activeAudioRef.current = null
      }
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
