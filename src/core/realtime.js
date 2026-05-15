// Supabase Realtime 연결 모듈.
// - 로컬 "건배 준비됨(ready)" 신호 -> 룸 전체로 브로드캐스트
// - 원격 ready 수신 -> eventBus.READY 로 emit -> useReadyTracker 가 집계
// - presence 로 룸 인원/닉네임/호스트 여부 추적
//
// 핵심: 최종 건배 애니메이션(EVENTS.CHEERS)은 각 클라이언트가 로컬에서
// "all ready" 를 감지해 독립적으로 발사하므로, 이 파일에서는 브로드캐스트하지 않음.

import { createClient } from '@supabase/supabase-js';
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

  // 1. 다른 사람의 "건배 준비됨" 신호 수신 -> 로컬 bus 로 전달
  channel.on('broadcast', { event: 'cheers-ready' }, ({ payload }) => {
    eventBus.emit(EVENTS.READY, { ...payload, source: 'remote' });
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

  // 3. 로컬 ready 신호 -> 룸 전체로 broadcast.
  //    'remote' 출처는 다시 보내지 않아 무한루프 방지.
  const offReady = eventBus.on(EVENTS.READY, (e) => {
    if (e.source === 'remote') return;
    channel.send({
      type: 'broadcast',
      event: 'cheers-ready',
      payload: { from: selfId, nickname, ...e },
    });
  });

  return {
    leave: () => {
      offReady();
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
