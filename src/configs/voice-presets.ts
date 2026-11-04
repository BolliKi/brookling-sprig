import type {
  ChildVoicePreset,
  ChildVoicePresetKey,
  EmotionKey,
  EmotionVoiceModifier
} from '@/types/companion'

// 清脆儿童语音（TTS）音色预设配置
export const CHILD_VOICE_PRESETS: Record<ChildVoicePresetKey, ChildVoicePreset> = {
  CRISP_GIRL: {
    id: 'CRISP_GIRL',
    label: '清脆女童',
    basePitch: 1.22,
    baseRate: 1.05,
    desc: '自然连贯、吐字清晰的清脆女童声线'
  },
  SWEET_TODDLER: {
    id: 'SWEET_TODDLER',
    label: '乖巧幼童',
    basePitch: 1.28,
    baseRate: 1.0,
    desc: '软糯乖巧、尾音轻柔的幼童声线'
  },
  LIVELY_YOUTH: {
    id: 'LIVELY_YOUTH',
    label: '元气少年',
    basePitch: 1.16,
    baseRate: 1.08,
    desc: '明朗干净、流畅不卡顿的少年声线'
  }
};

// 四种情绪对童声语调的微调系数（严格控制在 Web Speech API 无失真区间）
// 四种情绪对童声语调的微调系数（严格控制在 Web Speech API 无失真区间）
export const EMOTION_VOICE_MODIFIERS: Record<EmotionKey, EmotionVoiceModifier> = {
  IDLE: { pitchDelta: 0.0, rateMultiplier: 1.0, label: '清朗平和童声' },
  HAPPY: { pitchDelta: 0.04, rateMultiplier: 1.05, label: '欢快雀跃童声' },
  SHY: { pitchDelta: 0.02, rateMultiplier: 0.96, label: '轻柔含羞童声' },
  SLEEPY: { pitchDelta: -0.06, rateMultiplier: 0.9, label: '绵软困倦童声' }
};
