import { useEffect, useState } from 'react';
import { joinRoom, generateRoomCode, isRealtimeConfigured } from '../core/realtime';

// URL ?room= 파라미터에서 룸코드 읽기. 없으면 생성하고 URL 업데이트.
function readOrCreateRoomCode() {
  if (typeof window === 'undefined') return generateRoomCode();
  const params = new URLSearchParams(window.location.search);
  const existing = params.get('room');
  if (existing) return existing.toUpperCase();
  const fresh = generateRoomCode();
  params.set('room', fresh);
  const next = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  window.history.replaceState({}, '', next);
  return fresh;
}

export function useRoom({ enabled }) {
  const [roomId, setRoomId] = useState(null);
  const [members, setMembers] = useState(1);
  const [status, setStatus] = useState(isRealtimeConfigured ? 'idle' : 'disabled');

  useEffect(() => {
    if (!enabled) return;
    const code = readOrCreateRoomCode();
    setRoomId(code);

    const handle = joinRoom(code, {
      onPresence: setMembers,
      onStatus: setStatus,
    });
    return () => handle.leave();
  }, [enabled]);

  return { roomId, members, status };
}
