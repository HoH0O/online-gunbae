import { useEffect, useRef, useState } from 'react';
import { eventBus, EVENTS } from '../core/eventBus';

/**
 * 룸 참여자들의 "건배 준비됨(ready)" 상태를 추적.
 * 모든 현재 멤버가 ready 가 되면 onAllReady 콜백을 호출하고 자동 초기화.
 *
 * - local/remote 출처 무관, 같은 EVENTS.READY 로 들어오는 이벤트를 모두 집계
 * - 결정론적 메시지 선택: 가장 먼저 ready 한 사람의 message (각 클라이언트 동일 결과)
 * - 자동 만료: holdMs 동안 새 ready 가 없으면 클리어 (무한 대기 방지)
 *
 * @param {object} opts
 * @param {string[]} opts.memberIds - 현재 룸 멤버 id 배열
 * @param {(message: string, entries: Array) => void} opts.onAllReady
 * @param {number} [opts.holdMs=15000]
 * @returns {{ ready: Map<string, {from, nickname, message, ts}> }}
 */
export function useReadyTracker({ memberIds, onAllReady, holdMs = 15000 }) {
  const [ready, setReady] = useState(() => new Map());
  const onAllReadyRef = useRef(onAllReady);
  const expireRef = useRef(null);

  onAllReadyRef.current = onAllReady;

  // 1. ready 이벤트 구독 (local/remote 통합 처리)
  useEffect(() => {
    const off = eventBus.on(EVENTS.READY, (payload) => {
      const id = payload?.from;
      if (!id) return;
      setReady((prev) => {
        const next = new Map(prev);
        next.set(id, {
          from: id,
          nickname: payload.nickname || '익명',
          message: payload.message || null,
          ts: payload.ts || Date.now(),
        });
        return next;
      });
    });
    return off;
  }, []);

  // 2. 자동 만료 타이머 — 마지막 ready 후 holdMs 동안 정적이면 클리어
  useEffect(() => {
    if (ready.size === 0) return;
    clearTimeout(expireRef.current);
    expireRef.current = setTimeout(() => {
      setReady(new Map());
    }, holdMs);
    return () => clearTimeout(expireRef.current);
  }, [ready, holdMs]);

  // 3. 모든 현재 멤버가 ready 인지 체크
  useEffect(() => {
    if (!memberIds || memberIds.length === 0) return;
    if (ready.size === 0) return;
    const allReady = memberIds.every((id) => ready.has(id));
    if (!allReady) return;

    const entries = Array.from(ready.entries())
      .filter(([id]) => memberIds.includes(id))
      .sort((a, b) => a[1].ts - b[1].ts || a[0].localeCompare(b[0]));
    if (entries.length === 0) return;

    const message = entries[0][1].message;
    onAllReadyRef.current?.(message, entries);
    setReady(new Map());
    clearTimeout(expireRef.current);
  }, [ready, memberIds]);

  return { ready };
}
