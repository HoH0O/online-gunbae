// Supabase Realtime 연결 모듈.
// - 로컬 짠 -> 같은 룸의 다른 사람들에게 브로드캐스트
// - 다른 사람의 짠 -> triggerCheers('remote') -> 같은 애니메이션 자동 재생
// - presence 로 룸 인원/닉네임/호스트 여부 추적
//
// 핵심: 이 파일은 eventBus 와 cheersTrigger 만 알고, UI(React) 와는 완전히 분리.

import { createClient } from '@supabase/supabase-js';
import { triggerCheers } from './cheersTrigger';
import { eventBus, EVENTS } from './eventBus';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isRealtimeConfigured = Boolean(url && key);

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

export function getSelfId() {
  return selfId;
}

/**
 * 룸 참여. 한 룸에 한 채널.
 *
 * @param {string} roomId
 * @param {object} opts
 * @param {string} opts.nickname
 * @param {boolean} [opts.isHost]
 * @param {(members: Array<{id:string,nickname:string,isHost:boolean,joinedAt:number}>) => void} [opts.onMembers]
 * @param {(status:'connecting'|'connected'|'error'|'disabled') => void} [opts.onStatus]
 * @returns {{ leave: () => void }}
 */
export function joinRoom(roomId, { nickname, isHost = false, onMembers, onStatus } = {}) {
  if (!isRealtimeConfigured) {
    onStatus?.('disabled');
    // 오프라인 모드: 자기 자신만 멤버로 통보
    onMembers?.([{ id: selfId, nickname: nickname || '나', isHost: true, joinedAt: Date.now() }]);
    console.warn('[realtime] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 미설정 - 오프라인 모드');
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

  // 2. presence: 룸 멤버 메타데이터 동기화
  const reportMembers = () => {
    const state = channel.presenceState();
    const members = Object.entries(state)
      .map(([id, presences]) => {
        const meta = presences[0] || {};
        return {
          id,
          nickname: meta.nickname || '익명',
          isHost: !!meta.isHost,
          joinedAt: meta.joinedAt || 0,
        };
      })
      .sort((a, b) => a.joinedAt - b.joinedAt);
    onMembers?.(members);
  };
  channel.on('presence', { event: 'sync' }, reportMembers);
  channel.on('presence', { event: 'join' }, reportMembers);
  channel.on('presence', { event: 'leave' }, reportMembers);

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({
        nickname,
        isHost,
        joinedAt: Date.now(),
      });
      onStatus?.('connected');
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      onStatus?.('error');
    }
  });

  // 3. 로컬에서 발생한 짠을 룸으로 송신.
  //    'remote' 출처는 다시 보내지 않아 무한루프 방지.
  //    payload 에 닉네임을 함께 실어 받는 쪽에서 누가 짠 했는지 표시 가능.
  const offBus = eventBus.on(EVENTS.CHEERS, (e) => {
    if (e.source === 'remote') return;
    channel.send({
      type: 'broadcast',
      event: 'cheers',
      payload: { from: selfId, nickname, ...e },
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
