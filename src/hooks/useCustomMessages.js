import { useCallback, useEffect, useState } from 'react';
import { storage, KEYS } from '../lib/storage';

export const MAX_MESSAGE_LENGTH = 30;
export const MAX_MESSAGE_COUNT = 10;

function load() {
  const raw = storage.get(KEYS.customMessages, '[]');
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((m) => typeof m === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * 사용자가 추가한 건배사 관리 훅.
 * - localStorage 영속
 * - 30자 / 10개 제한
 */
export function useCustomMessages() {
  const [messages, setMessages] = useState(load);

  useEffect(() => {
    storage.set(KEYS.customMessages, JSON.stringify(messages));
  }, [messages]);

  const add = useCallback((text) => {
    const trimmed = (text ?? '').trim();
    if (!trimmed) return false;
    if (trimmed.length > MAX_MESSAGE_LENGTH) return false;
    let added = false;
    setMessages((curr) => {
      if (curr.length >= MAX_MESSAGE_COUNT) return curr;
      if (curr.includes(trimmed)) return curr; // 중복 방지
      added = true;
      return [...curr, trimmed];
    });
    return added;
  }, []);

  const remove = useCallback((index) => {
    setMessages((curr) => curr.filter((_, i) => i !== index));
  }, []);

  return { messages, add, remove };
}
