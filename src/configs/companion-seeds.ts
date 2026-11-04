import type { DialogueMessage, EventLog, SystemToast } from '@/types/companion'

/** 初始只展示禾禾的话语；点击互动不再插入用户消息 */
export const INITIAL_DIALOGUE: DialogueMessage[] = [
  {
    id: 'turn-init-1',
    role: 'companion',
    text: '你回来啦～禾禾一直在水榭等你，今天想一起做点什么呀？',
    emotion: 'HAPPY',
    intentTag: '日常问候',
    actionName: '高举双爪 · 亮出肉垫'
  }
]

/** 系统初始化日志（时间在客户端挂载时生成，避免 SSR 水合时间不一致） */
export const createInitialEventLogs = (): EventLog[] => [
  {
    id: 'init-1',
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    source: '水榭日志',
    transition: '初始化 -> 开心雀跃（高举双爪 · 亮出肉垫）',
    detail: '宋韵山水水榭、清脆儿童语音与十二种多动作变体系统已就绪。'
  }
]

export const INITIAL_SYSTEM_TOAST: SystemToast = {
  id: 1,
  text: '水榭笺注：点击禾禾或快捷按钮，就能看到不同的动作与回应'
}

export const SYSTEM_TOAST_PRESETS = [
  '水榭笺注：新沏了一壶雨前龙井',
  '水榭笺注：亲密度提升十点',
  '水榭笺注：平湖远处划过一叶扁舟'
]
