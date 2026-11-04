export {}

declare global {
  interface Window {
    /** three.js r128 由 CDN 动态加载后挂载到全局 */
    THREE: any
    webkitAudioContext?: typeof AudioContext
  }
}
