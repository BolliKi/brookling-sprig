// 古琴泛音、青铜风铎与红枫化形音效（仅在点击交互时轻柔点缀，绝不干扰 TTS 人声）
export function playClassicalChime(type: string, enabled = true) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'MAPLE_MORPH') {
      // 古琴五声音阶泛音琶音（宫-商-角-徵-羽）
      [392.0, 440.0, 523.25, 587.33, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startAt = now + idx * 0.09;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt);
        gain.gain.setValueAtTime(0.028, startAt);
        gain.gain.exponentialRampToValueAtTime(0.0008, startAt + 0.42);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + 0.44);
      });
      return;
    }

    if (type === 'BRONZE_BELL') {
      // 檐下青铜风铎与古琴清越泛音
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startAt = now + idx * 0.06;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt);
        gain.gain.setValueAtTime(0.032, startAt);
        gain.gain.exponentialRampToValueAtTime(0.0008, startAt + 0.72);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startAt);
        osc.stop(startAt + 0.75);
      });
      return;
    }

    // 简短清澈的单颗泛音提示（时长仅 0.14s，避免与随后的 TTS 语音重叠）
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const freqMap = { HAPPY: 659.25, SHY: 523.25, SLEEPY: 392.0, IDLE: 587.33 };
    osc.frequency.setValueAtTime(freqMap[type] || 523.25, now);
    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (err) {
    // 忽略浏览器自动播放限制
  }
}
