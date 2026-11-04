/**
 * three.js r128 运行时加载器。
 * 立体灵宠与立体背景共用同一份 CDN 脚本与 Promise，避免重复请求。
 */

const THREE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

let threeRuntimePromise: Promise<any> | null = null;

export function loadThreeRuntime(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('three.js 只能在浏览器中加载'));
  }

  if (window.THREE) {
    return Promise.resolve(window.THREE);
  }

  if (threeRuntimePromise) {
    return threeRuntimePromise;
  }

  threeRuntimePromise = new Promise<any>((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${THREE_CDN}"]`
    ) as HTMLScriptElement | null;

    const handleLoad = () => {
      if (window.THREE) {
        resolve(window.THREE);
      } else {
        reject(new Error('three.js 脚本已加载，但未挂载到 window.THREE'));
      }
    };

    const handleError = () => {
      threeRuntimePromise = null;
      reject(new Error('three.js 脚本加载失败'));
    };

    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true' && window.THREE) {
        resolve(window.THREE);
        return;
      }
      existing.addEventListener('load', handleLoad, { once: true });
      existing.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = THREE_CDN;
    script.async = true;
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      handleLoad();
    };
    script.onerror = handleError;
    document.head.appendChild(script);
  });

  return threeRuntimePromise;
}
