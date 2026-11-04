// 筛选并排序系统中的中文清脆童声/年轻女声音源（优先本地低延迟音源，避免云端缓冲卡顿）
export function getSortedChineseVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const allVoices = window.speechSynthesis.getVoices() || [];
  const zhVoices = allVoices.filter(
    (v) =>
      v.lang &&
      (v.lang.toLowerCase().includes('zh') || v.lang.toLowerCase().includes('cmn'))
  );
  const pool = zhVoices.length > 0 ? zhVoices : allVoices;

  const priorityKeywords = [
    'Xiaoyi',
    'Xiaoshuang',
    'Xiaoxiao',
    'Tingting',
    'Ting-Ting',
    'Meijia',
    'Sin-ji',
    'Yaoyao',
    'Huihui',
    'Lili',
    'Google 普通话'
  ];

  return [...pool].sort((a, b) => {
    // 优先使用 localService 本地合成音源，彻底杜绝网络请求造成的卡顿与断句
    if (a.localService !== b.localService) {
      return a.localService ? -1 : 1;
    }
    const scoreA = priorityKeywords.findIndex((kw) => a.name && a.name.includes(kw));
    const scoreB = priorityKeywords.findIndex((kw) => b.name && b.name.includes(kw));
    const rankA = scoreA === -1 ? 999 : scoreA;
    const rankB = scoreB === -1 ? 999 : scoreB;
    return rankA - rankB;
  });
}
