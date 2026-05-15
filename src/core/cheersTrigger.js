// 건배 관련 트리거 진입점 모음.
//
// 흐름:
// - emitReady(): 로컬 사용자가 짠을 했음을 알리는 신호 발산.
//   realtime.js 가 받아 룸 전체로 브로드캐스트.
//   원격에서 받은 ready 도 같은 EVENTS.READY 로 emit 됨.
//   모든 ready 가 모이면 useReadyTracker 가 triggerCheers 를 호출.
// - triggerCheers(): 최종 건배 애니메이션 발사. 룸 내 각 클라이언트가
//   "all ready" 를 감지해 로컬에서 독립적으로 호출 -> 모두 같은 메시지로 수렴.

import { eventBus, EVENTS } from './eventBus';

/**
 * 최종 건배 발사. 모든 멤버가 ready 됐을 때 로컬에서 호출됨.
 * @param {'local'|'button'|'remote'} source
 * @param {object} [payload]
 */
export function triggerCheers(source = 'local', payload = {}) {
  eventBus.emit(EVENTS.CHEERS, {
    ts: Date.now(),
    ...payload,
    source,
  });
}

/**
 * "건배 준비됨" 신호 발산. 같은 룸의 모두에게 broadcast 된다.
 * @param {object} payload - { from, nickname, message, ... }
 */
export function emitReady(payload = {}) {
  eventBus.emit(EVENTS.READY, {
    ts: Date.now(),
    ...payload,
    source: 'local',
  });
}
