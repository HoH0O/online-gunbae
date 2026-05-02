import { useEffect, useState } from 'react';
import { joinRoom, isRealtimeConfigured } from '../core/realtime';

/**
 * 룸 참여/유지 훅. setup 이 끝난 뒤 enabled=true 로 전환되어야 호출된다.
 *
 * @param {object} opts
 * @param {boolean} opts.enabled
 * @param {string|null} opts.roomId
 * @param {string} opts.nickname
 * @param {boolean} opts.isHost
 */
export function useRoom({ enabled, roomId, nickname, isHost }) {
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState(isRealtimeConfigured ? 'idle' : 'disabled');

  useEffect(() => {
    if (!enabled || !roomId || !nickname) return;

    const handle = joinRoom(roomId, {
      nickname,
      isHost,
      onMembers: setMembers,
      onStatus: setStatus,
    });
    return () => handle.leave();
  }, [enabled, roomId, nickname, isHost]);

  return { members, status };
}
