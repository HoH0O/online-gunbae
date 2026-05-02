// 건배 트리거 함수.
// 로컬 모션 센서, 데모 버튼, 추후 서버 이벤트(WebSocket) 모두 이 함수만 호출하면 된다.
// 이 한 곳을 통과시킴으로써 source 메타데이터를 일관되게 붙이고
// 이후 분석/로깅/네트워크 브로드캐스트를 쉽게 추가할 수 있다.

import { eventBus, EVENTS } from './eventBus';

/**
 * 건배 이벤트를 발행한다.
 * @param {'local'|'button'|'remote'} source - 트리거 출처
 * @param {object} [payload] - 부가 데이터 (가속도 magnitude, 원격 사용자 id 등)
 */
export function triggerCheers(source = 'local', payload = {}) {
  eventBus.emit(EVENTS.CHEERS, {
    source,
    ts: Date.now(),
    ...payload,
  });
}
