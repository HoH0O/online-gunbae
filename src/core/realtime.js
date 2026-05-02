// Supabase Realtime 연결 모듈.
// - 로컬 짠 -> 같은 룸의 다른 사람들에게 브로드캐스트
// - 다른 사람의 짠 -> triggerCheers('remote') -> 같은 애니메이션 자동 재생
// - presence 로 룸 인원 수 추적
//
// 핵심: 이 파일은 eventBus 와 cheersTrigger 만 알고, UI(React) 와는 완전히 분리.

import { createClient } from '@supabase/supabase-js';
import { triggerCheers } from './cheersTrigger';
import { eventBus, EVENTS } from './eventBus';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isRealtimeConfigured = Boolean(url && key);

// 클라이언트는 한 번만 만든다.
const supabase = isRealtimeConfigured
  ? createClient(url, key, {
      realtime: { params: { eventsPerSecond: 10 } },
      auth: { persistSession: false },
    })
  : null;

// 내 고유 id (presence 키). 새로고침마다 새로 발급.
const selfId =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

/**
 * 룸 참여. 한 룸에 한 채널.
 *
 * @param {string} roomId
 * @param {object} handlers
 * @param {(count:number)=>void} handlers.onPresence - 룸 인원 변화
 * @param {(status:'connecting'|'connected'|'error'|'disabled')=>void} handlers.onStatus
 * @returns {{ leave: () => void }}
 */
export function joinRoom(roomId, { onPresence, onStatus } = {}) {
  if (!isRealtimeConfigured) {
    onStatus?.('disabled');
    console.warn('[realtime] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 설정되지 않음 - 오프라인 모드');
    return { leave: () => {} };
  }

  onStatus?.('connecting');

  const channel = supabase.channel(`gunbae:${roomId}`, {
    config: {
      broadcast: { self: false, ack: false },
      presence: { key: selfId },
    },
  });

  // 1. 다른 사람의 건배 수신 -> 로컬 트리거 (UI 자동 재생)
  channel.on('broadcast', { event: 'cheers' }, ({ payload }) => {
    triggerCheers('remote', payload);
  });

  // 2. presence: 룸 인원 추적
  const reportCount = () => {
    const state = channel.presenceState();
    onPresence?.(Object.keys(state).length);
  };
  channel.on('presence', { event: 'sync' }, reportCount);
  channel.on('presence', { event: 'join' }, reportCount);
  channel.on('presence', { event: 'leave' }, reportCount);

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ joinedAt: Date.now() });
      onStatus?.('connected');
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      onStatus?.('error');
    }
  });

  // 3. 로컬에서 발생한 짠을 룸으로 송신.
  //    'remote' 출처는 다시 보내지 않아 무한루프 방지.
  const offBus = eventBus.on(EVENTS.CHEERS, (e) => {
    if (e.source === 'remote') return;
    channel.send({
      type: 'broadcast',
      event: 'cheers',
      payload: { from: selfId, ...e },
    });
  });

  return {
    leave: () => {
      offBus();
      supabase.removeChannel(channel);
    },
  };
}

// 룸 코드 생성 (6자, 헷갈리는 문자 제외)
export function generateRoomCode() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
