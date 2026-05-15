// localStorage 래퍼. SSR/시크릿모드 등 storage 접근 실패 시 조용히 무시.

const safe = (fn, fallback) => {
  try { return fn(); } catch { return fallback; }
};

export const storage = {
  get(key, fallback = null) {
    return safe(() => localStorage.getItem(key) ?? fallback, fallback);
  },
  set(key, value) {
    safe(() => localStorage.setItem(key, value));
  },
  remove(key) {
    safe(() => localStorage.removeItem(key));
  },
};

// 사용하는 키는 한 곳에 모은다.
export const KEYS = {
  nickname: 'gunbae:nickname',
  hostOf: (roomId) => `gunbae:hostOf:${roomId}`,
  customMessages: 'gunbae:customMessages',
  disabledDefaults: 'gunbae:disabledDefaults',
};
