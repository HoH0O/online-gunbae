import { useCallback, useEffect, useState } from 'react';
import { storage, KEYS } from '../lib/storage';

/**
 * 비활성화한 기본 건배사 목록 관리 훅.
 * - 저장은 텍스트 그대로 (기본 메시지 텍스트가 키)
 * - 토글로 끄기/켜기 (영구 삭제가 아닌 토글)
 */
export function useDisabledDefaults() {
  const [disabled, setDisabled] = useState(() => {
    const raw = storage.get(KEYS.disabledDefaults, '[]');
    try {
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    storage.set(KEYS.disabledDefaults, JSON.stringify(Array.from(disabled)));
  }, [disabled]);

  const toggle = useCallback((text) => {
    setDisabled((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  }, []);

  const isDisabled = useCallback((text) => disabled.has(text), [disabled]);

  return { disabled, toggle, isDisabled };
}
