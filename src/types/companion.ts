// ==========================================
// 灵宠陪伴领域的公共类型：情绪状态机、宋韵主题、语音与对话记录
// ==========================================

export type EmotionKey = 'IDLE' | 'HAPPY' | 'SHY' | 'SLEEPY'

export type LightingThemeKey =
  | 'CELADON_MIST'
  | 'JADE_LANDSCAPE'
  | 'DUSK_PAVILION'
  | 'PINE_MOONLIGHT'

export type RenderMode = 'FLAT' | 'STEREO'

export type ThemeOverride = 'AUTO' | LightingThemeKey

export type ChildVoicePresetKey = 'CRISP_GIRL' | 'SWEET_TODDLER' | 'LIVELY_YOUTH'

export type QuickActionType = 'PAT_HEAD' | 'PRAISE' | 'SLEEP' | 'IDLE_PLAY'

/** 每种情绪下的一个专属动作变体（含三句不重复台词） */
export interface ActionVariant {
  id: string
  name: string
  speeches: string[]
}

/** 四种情绪状态配置（含三种动作变体） */
export interface EmotionStateConfig {
  id: EmotionKey
  code: string
  shortCode: string
  label: string
  themeKey: LightingThemeKey
  breathDuration: string
  defaultRevertSec: number
  badgeClass: string
  sceneStory: string
  description: string
  variants: ActionVariant[]
}

/** 宋韵山水四时设色主题 */
export interface LightingTheme {
  id: LightingThemeKey
  name: string
  isNight: boolean
  skyTop: string
  skyMid: string
  skyBottom: string
  farMountain: string
  midMountain: string
  nearMountain: string
  mistColor: string
  waterTop: string
  waterBottom: string
  pavilionPillar: string
  pavilionWood: string
  stoneFloorTop: string
  stoneFloorDark: string
  windowGlow: string
  bambooColor: string
  accentColor: string
  swatchClass: string
}

/** 童声音色预设 */
export interface ChildVoicePreset {
  id: ChildVoicePresetKey
  label: string
  basePitch: number
  baseRate: number
  desc: string
}

/** 情绪对童声语调的微调系数 */
export interface EmotionVoiceModifier {
  pitchDelta: number
  rateMultiplier: number
  label: string
}

/** 对话流中的一条消息 */
export interface DialogueMessage {
  id: string
  role: 'user' | 'companion'
  text: string
  emotion?: EmotionKey
  intentTag?: string
  actionName?: string
}

/** 调试台事件日志 */
export interface EventLog {
  id: string
  time: string
  source: string
  transition: string
  detail: string
}

/** 2D / 3D 红枫化形过渡状态 */
export interface ReconState {
  active: boolean
  progress: number
  fromMode: RenderMode
  toMode: RenderMode
  runId: number
}

/** 立体舞台拖拽共享的镜头环绕状态：角色自转同时带动背景视差 */
export interface StageOrbitState {
  targetYaw: number
  currentYaw: number
}

/** 系统通知（主画面居中堆栈显示，可同时存在多条） */
export interface SystemToast {
  id: number
  text: string
}

/** 本地语义识别引擎的输出 */
export interface UserIntentResult {
  targetState: EmotionKey
  preferredVariantIndex: number | null
  customReply: string
  intentTag: string
  affectionDelta: number
  energyDelta: number
}

/** 状态切换参数 */
export interface TransitionEmotionOptions {
  source?: string
  userMessage?: string | null
  preferredVariantIndex?: number | null
  customSpeech?: string | null
  intentTag?: string
  logDetail?: string
  affectionDelta?: number
  energyDelta?: number
}
