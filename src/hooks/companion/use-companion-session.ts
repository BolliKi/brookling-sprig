'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { usePointerGaze } from '@core/hooks/use-pointer-gaze'
import { useBlink } from '@hooks/companion/use-blink'
import { useDialogue } from '@hooks/companion/use-dialogue'
import { useEventLog } from '@hooks/companion/use-event-log'
import { useMapleMorph } from '@hooks/companion/use-maple-morph'
import { useSystemToast } from '@hooks/companion/use-system-toast'
import { useTimeOfDayTheme } from '@hooks/scene/use-time-of-day-theme'
import { useSpeechSynthesis } from '@hooks/speech/use-speech-synthesis'

import { BELL_SPEECH } from '@configs/companion-seeds'
import { EMOTION_STATES } from '@configs/emotions'
import { LIGHTING_THEMES } from '@configs/lighting-themes'
import { MOOD_ATMOSPHERES } from '@configs/mood-atmospheres'
import { CHILD_VOICE_PRESETS } from '@configs/voice-presets'
import { playClassicalChime } from '@libs/audio/chime'
import { analyzeUserInput } from '@libs/intent/analyze-user-input'

import type {
  ChildVoicePresetKey,
  DialogueMessage,
  EmotionKey,
  QuickActionType,
  ThemeOverride,
  TransitionEmotionOptions
} from '@/types/companion'

const INITIAL_LAST_VARIANT: Record<EmotionKey, number> = {
  IDLE: -1,
  HAPPY: 0,
  SHY: -1,
  SLEEPY: -1
}

/**
 * 灵宠会话控制器：把「情绪状态机、对话流、语音、化形、提示气泡、本地交互」编排成一个会话模型。
 * 页面与视图只负责呈现和转发用户操作，不持有行为逻辑。
 */
export function useCompanionSession() {
  // 情绪状态机
  const [emotionState, setEmotionState] = useState<EmotionKey>('HAPPY')
  const [variantIndex, setVariantIndex] = useState(0)

  // 记录每种情绪上一次使用的动作变体与台词索引，确保点击时绝不重复
  const lastVariantTrackerRef = useRef<Record<EmotionKey, number>>({ ...INITIAL_LAST_VARIANT })
  const lastSpeechTrackerRef = useRef<Record<string, number>>({})
  // 标记是否已为当前情绪挂起自动回落，避免初始 0 秒倒计时误触发
  const revertArmedRef = useRef(false)
  // 限制连续点击频率，避免连点打断动作演出
  const lastActionAtRef = useRef(0)

  const canStartAction = useCallback(() => {
    const now = Date.now()
    if (now - lastActionAtRef.current < 850) return false
    lastActionAtRef.current = now
    return true
  }, [])

  // 画面与交互偏好
  const [themeOverride, setThemeOverrideState] = useState<ThemeOverride>('AUTO')
  // 默认保持静音，由用户主动开启童声
  const [soundEnabled, setSoundEnabled] = useState(false)

  // 陪伴数据
  const [affection, setAffection] = useState(92)
  const [energy, setEnergy] = useState(96)
  const [revertCountdown, setRevertCountdown] = useState(0)
  const [lockState, setLockState] = useState(false)
  const [petBurst, setPetBurst] = useState(0)

  const { mouseOffset, handleViewportMouseMove } = usePointerGaze()
  const isBlinking = useBlink()
  // 背景画卷跟随真实时间，情绪只影响光影氛围与漂浮物
  const { timeTheme, dayPeriod } = useTimeOfDayTheme()

  // 横切职责
  const { logs, appendLog, clearLogs } = useEventLog()
  const { messages, pushTurn } = useDialogue()
  const speech = useSpeechSynthesis({ emotionState, soundEnabled })
  const {
    speakChildVoice,
    stopChildSpeech,
    handleSelectChildPreset,
    childVoicePreset
  } = speech

  const handleMorphComplete = useCallback(() => {
    setPetBurst((prev) => prev + 1)
  }, [])

  const { renderMode, reconState, triggerMapleLeafMorph } = useMapleMorph({
    soundEnabled,
    appendLog,
    onMorphComplete: handleMorphComplete
  })

  const { systemToasts, dismissSystemToast, triggerSystemToast, setSystemToastHovered } =
    useSystemToast({
      soundEnabled,
      appendLog
    })

  const activeTheme = useMemo(() => {
    if (themeOverride !== 'AUTO' && LIGHTING_THEMES[themeOverride]) {
      return LIGHTING_THEMES[themeOverride]
    }
    return timeTheme
  }, [themeOverride, timeTheme])

  const atmosphere = MOOD_ATMOSPHERES[emotionState] || MOOD_ATMOSPHERES.IDLE
  const currentEmotionObj = EMOTION_STATES[emotionState] || EMOTION_STATES.IDLE
  const currentVariantObj =
    currentEmotionObj.variants[variantIndex] || currentEmotionObj.variants[0]

  // 核心选择器：为指定情绪挑选一个「不重复于上次」的动作变体与台词
  const selectNonRepeatingVariantAndSpeech = useCallback(
    (
      stateKey: EmotionKey,
      preferredVariantIdx: number | null = null,
      customSpeech: string | null = null
    ) => {
      const stateConfig = EMOTION_STATES[stateKey] || EMOTION_STATES.IDLE
      const variants = stateConfig.variants
      const lastVIdx = lastVariantTrackerRef.current[stateKey] ?? -1

      let chosenVIdx: number
      if (
        preferredVariantIdx !== null &&
        preferredVariantIdx >= 0 &&
        preferredVariantIdx < variants.length
      ) {
        chosenVIdx = preferredVariantIdx
      } else {
        // 轮换推进，保证每次点击都切换到新的动作变体
        chosenVIdx = (lastVIdx + 1) % variants.length
      }
      lastVariantTrackerRef.current[stateKey] = chosenVIdx

      const variantObj = variants[chosenVIdx]
      let chosenSpeech = customSpeech
      if (!chosenSpeech) {
        const speeches = variantObj.speeches
        const lastSIdx = lastSpeechTrackerRef.current[variantObj.id] ?? -1
        const nextSIdx = (lastSIdx + 1) % speeches.length
        lastSpeechTrackerRef.current[variantObj.id] = nextSIdx
        chosenSpeech = speeches[nextSIdx]
      }

      return {
        variantIndex: chosenVIdx,
        variantObj,
        speech: chosenSpeech
      }
    },
    []
  )

  // 状态与动作变体切换主函数
  const transitionEmotion = useCallback(
    (nextStateKey: EmotionKey, options: TransitionEmotionOptions = {}) => {
      const {
        source = '互动触发',
        userMessage = null,
        preferredVariantIndex = null,
        customSpeech = null,
        intentTag = '互动感知 · 灵犀回应',
        logDetail = '',
        affectionDelta = 0,
        energyDelta = 0
      } = options

      const validState = EMOTION_STATES[nextStateKey] ? nextStateKey : 'IDLE'
      const prevLabel = EMOTION_STATES[emotionState].label
      const nextLabel = EMOTION_STATES[validState].label

      const {
        variantIndex: nextVIdx,
        variantObj,
        speech: finalSpeech
      } = selectNonRepeatingVariantAndSpeech(validState, preferredVariantIndex, customSpeech)

      setEmotionState(validState)
      setVariantIndex(nextVIdx)
      setPetBurst((prev) => prev + 1)

      playClassicalChime(validState, soundEnabled)

      pushTurn(userMessage, finalSpeech, validState, variantObj.name, intentTag)
      speakChildVoice(finalSpeech, validState)

      if (affectionDelta !== 0) {
        setAffection((prev) => Math.max(0, Math.min(100, prev + affectionDelta)))
      }
      if (energyDelta !== 0) {
        setEnergy((prev) => Math.max(0, Math.min(100, prev + energyDelta)))
      }

      const revertSec = EMOTION_STATES[validState].defaultRevertSec
      revertArmedRef.current = revertSec > 0
      setRevertCountdown(revertSec)

      appendLog(
        source,
        `${prevLabel} -> ${nextLabel}（${variantObj.name}）`,
        logDetail || `执行动作「${variantObj.name}」，播报童声：「${finalSpeech}」`
      )
    },
    [
      emotionState,
      selectNonRepeatingVariantAndSpeech,
      soundEnabled,
      pushTurn,
      speakChildVoice,
      appendLog
    ]
  )

  // 情绪倒计时递减（副作用保持纯净，避免 StrictMode 下重复触发）
  useEffect(() => {
    if (emotionState === 'IDLE' || lockState || revertCountdown <= 0) return
    const timer = setInterval(() => {
      setRevertCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [emotionState, lockState, revertCountdown])

  // 动作演出结束：自动切换到一个随机待机动作
  useEffect(() => {
    if (!revertArmedRef.current) return
    if (emotionState === 'IDLE' || lockState || revertCountdown > 0) return

    revertArmedRef.current = false
    const idleVariants = EMOTION_STATES.IDLE.variants
    const lastIdleIdx = lastVariantTrackerRef.current.IDLE
    const candidates = idleVariants
      .map((_, idx) => idx)
      .filter((idx) => idx !== lastIdleIdx)
    const randomIdleIdx = candidates[Math.floor(Math.random() * candidates.length)] ?? 0
    const variantObj = idleVariants[randomIdleIdx]
    const prevLabel = EMOTION_STATES[emotionState].label

    lastVariantTrackerRef.current.IDLE = randomIdleIdx
    appendLog(
      '水榭日志',
      `${prevLabel} -> 待机呼吸（${variantObj.name}）`,
      '动作演出完成，自动切换到随机待机动作。'
    )
    setEmotionState('IDLE')
    setVariantIndex(randomIdleIdx)
    setPetBurst((prev) => prev + 1)
  }, [emotionState, lockState, revertCountdown, appendLog])

  // 点击角色本体：在当前情绪或互动情绪中轮换不同的动作变体，绝不单调重复
  const handlePetCompanion = useCallback(() => {
    if (!canStartAction()) return

    if (emotionState === 'SLEEPY') {
      // 在打瞌睡时点击：前两次切换不同睡姿（点头打盹 / 伸懒腰哈欠），第三次温柔羞怯醒来
      const nextSleepCycle = (variantIndex + 1) % 4
      if (nextSleepCycle < 3) {
        transitionEmotion('SLEEPY', {
          source: '轻触灵宠',
          preferredVariantIndex: nextSleepCycle,
          logDetail: '轻触酣眠中的禾禾，触发新睡姿动作变体',
          affectionDelta: 3
        })
      } else {
        transitionEmotion('SHY', {
          source: '轻触灵宠',
          logDetail: '唤醒打瞌睡中的禾禾，触发委屈害羞动作变体',
          affectionDelta: 4
        })
      }
      return
    }

    // 正常状态下点击角色：在开心雀跃与待机互动的多个动作变体间趣味轮换
    const nextPool: EmotionKey[] = ['HAPPY', 'HAPPY', 'SHY', 'IDLE']
    const chosenState = nextPool[(petBurst + 1) % nextPool.length]
    const touchLabels: Record<string, string> = {
      HAPPY: '摸了摸禾禾软乎乎的小脑袋',
      SHY: '轻轻挠了挠禾禾的下巴与粉肉垫',
      IDLE: '陪禾禾一起凭栏远眺山水'
    }
    transitionEmotion(chosenState, {
      source: '轻触灵宠',
      intentTag: '触碰感知 · 亲昵互动',
      logDetail: '用户点击禾禾本体，自动轮换触发全新动作变体与童声台词',
      affectionDelta: 4,
      energyDelta: 2
    })
  }, [emotionState, variantIndex, petBurst, transitionEmotion, canStartAction])

  // 底部快捷互动按钮（每次点击都会轮换该状态下的 3 种不同动作变体与台词）
  const handleQuickAction = useCallback(
    (actionType: QuickActionType) => {
      if (!canStartAction()) return

      if (actionType === 'PAT_HEAD') {
        transitionEmotion('SHY', {
          source: '快捷互动',
          intentTag: '动作感知 · 温柔抚摸',
          logDetail: '点击「摸摸头」，轮换触发委屈害羞专属动作变体',
          affectionDelta: 5
        })
      } else if (actionType === 'PRAISE') {
        transitionEmotion('HAPPY', {
          source: '快捷互动',
          intentTag: '心情感知 · 夸奖鼓励',
          logDetail: '点击「夸夸它」，轮换触发开心雀跃专属动作变体',
          affectionDelta: 8,
          energyDelta: 5
        })
      } else if (actionType === 'SLEEP') {
        transitionEmotion('SLEEPY', {
          source: '快捷互动',
          intentTag: '心情感知 · 轻拍哄睡',
          logDetail: '点击「哄它睡觉」，轮换触发犯困打瞌睡专属动作变体',
          affectionDelta: 4,
          energyDelta: 15
        })
      } else if (actionType === 'IDLE_PLAY') {
        transitionEmotion('IDLE', {
          source: '快捷互动',
          intentTag: '动作感知 · 凭栏赏景',
          logDetail: '点击「水榭赏景」，轮换触发待机呼吸专属动作变体',
          affectionDelta: 3,
          energyDelta: 3
        })
      }
    },
    [transitionEmotion, canStartAction]
  )

  // 聊天输入：先本地语义识别，再交给状态机执行
  const sendChat = useCallback(
    (rawText: string) => {
      const userText = rawText.trim()
      if (!userText) return

      const result = analyzeUserInput(userText)
      transitionEmotion(result.targetState, {
        source: '对话输入',
        userMessage: userText,
        preferredVariantIndex: result.preferredVariantIndex,
        customSpeech: result.customReply,
        intentTag: result.intentTag,
        logDetail: `识别为「${result.intentTag}」，用户输入：「${userText}」`,
        affectionDelta: result.affectionDelta,
        energyDelta: result.energyDelta
      })
    },
    [transitionEmotion]
  )

  const handleReplayMessage = useCallback(
    (message: DialogueMessage) => {
      speakChildVoice(message.text, message.emotion || emotionState)
    },
    [speakChildVoice, emotionState]
  )

  // 调试台：切换童声预设（同步音调 / 语速并记录日志）
  const selectChildVoicePreset = useCallback(
    (presetId: ChildVoicePresetKey) => {
      handleSelectChildPreset(presetId)
      const preset = CHILD_VOICE_PRESETS[presetId]
      if (preset) {
        appendLog('远程调试', `童声预设 -> ${preset.label}`, preset.desc)
      }
    },
    [handleSelectChildPreset, appendLog]
  )

  // 调试台：试听当前童声（优先重播最新一条禾禾回复）
  const previewVoice = useCallback(() => {
    const lastCompanionMsg =
      [...messages].reverse().find((m) => m.role === 'companion')?.text ||
      '我乖乖把两只软乎乎的小爪爪举高高啦，晃着粉肉垫给你看～'
    speakChildVoice(lastCompanionMsg, emotionState)
    appendLog(
      '远程调试',
      `试听儿童语音（${CHILD_VOICE_PRESETS[childVoicePreset].label}）`,
      '优先播放预生成音频；未命中或播放失败时回退实时合成'
    )
  }, [messages, speakChildVoice, emotionState, appendLog, childVoicePreset])

  // 轻触檐下青铜风铎：古琴泛音 + 童声回应
  const handleRingBronzeBell = useCallback(() => {
    if (!canStartAction()) return

    playClassicalChime('BRONZE_BELL', soundEnabled)
    const bellSpeech = BELL_SPEECH
    pushTurn(
      null,
      bellSpeech,
      emotionState,
      currentVariantObj.name,
      '环境感知 · 风铎清音'
    )
    speakChildVoice(bellSpeech, emotionState)
    appendLog('风铎互动', '奏响檐下青铜风铎', '触发古琴泛音与清脆童声回应')
  }, [
    soundEnabled,
    pushTurn,
    emotionState,
    currentVariantObj.name,
    speakChildVoice,
    appendLog,
    canStartAction
  ])

  const toggleSound = useCallback(() => {
    if (soundEnabled) {
      stopChildSpeech()
    }
    setSoundEnabled((prev) => !prev)
  }, [soundEnabled, stopChildSpeech])

  const toggleLockState = useCallback(() => {
    setLockState((prev) => !prev)
    appendLog(
      '远程调试',
      !lockState ? '锁定状态开启' : '锁定状态解除',
      !lockState ? '已暂停情绪自动回落计时' : '已恢复情绪自动回落计时'
    )
  }, [lockState, appendLog])

  const setThemeOverride = useCallback(
    (next: ThemeOverride) => {
      setThemeOverrideState(next)
      if (next === 'AUTO') {
        appendLog('远程调试', '山水设色 -> 自动同步', '恢复宋韵山水随情绪自动同步')
      } else {
        const theme = LIGHTING_THEMES[next]
        appendLog(
          '远程调试',
          `山水设色 -> ${theme.name}`,
          `手动切换山水画卷主题为「${theme.name}」`
        )
      }
    },
    [appendLog]
  )

  return {
    // 情绪状态机
    emotionState,
    variantIndex,
    currentEmotion: currentEmotionObj,
    currentVariant: currentVariantObj,
    activeTheme,
    dayPeriod,
    atmosphere,
    transitionEmotion,

    // 画面模式与化形
    renderMode,
    reconState,
    triggerMapleLeafMorph,

    // 宋韵设色
    themeOverride,
    setThemeOverride,

    // 陪伴数据
    affection,
    energy,
    revertCountdown,
    lockState,
    toggleLockState,

    // 交互信号
    petBurst,
    isBlinking,
    mouseOffset,
    handleViewportMouseMove,

    // 界面开关
    soundEnabled,
    toggleSound,

    // 语音
    speech,
    selectChildVoicePreset,
    previewVoice,

    // 对话
    dialogueMessages: messages,
    handleReplayMessage,

    // 日志
    logs,
    clearLogs,

    // 系统提示气泡
    systemToasts,
    dismissSystemToast,
    triggerSystemToast,
    setSystemToastHovered,

    // 用户操作
    handlePetCompanion,
    handleQuickAction,
    sendChat,
    handleRingBronzeBell
  }
}

export type CompanionSession = ReturnType<typeof useCompanionSession>
