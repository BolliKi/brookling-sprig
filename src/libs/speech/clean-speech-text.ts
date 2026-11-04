/**
 * 统一清理朗读文本：保留自然标点停顿，只把 TTS 容易读错的装饰符号换成逗号。
 * 预生成音频与浏览器实时合成共用这一套规则，避免两条链路的发音不一致。
 */
export function cleanSpeechText(rawText: string): string {
  return rawText
    .replace(/[～~]+/g, '，')
    .replace(/……/g, '，')
    .replace(/——/g, '，')
    .replace(/·/g, '')
    .trim()
}
