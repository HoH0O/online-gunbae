// 매우 단순한 pub/sub 이벤트 버스.
// 핵심 목적: 충격 감지(트리거)와 UI 렌더링 사이의 결합도를 0 으로 만든다.
// 추후 WebSocket / WebRTC 로 원격 이벤트가 들어와도 동일한 emit 만 호출하면 된다.

const subscribers = new Map(); // event name -> Set<handler>

function getSet(event) {
  if (!subscribers.has(event)) subscribers.set(event, new Set());
  return subscribers.get(event);
}

export const eventBus = {
  on(event, handler) {
    const set = getSet(event);
    set.add(handler);
    return () => set.delete(handler);
  },
  emit(event, payload) {
    const set = subscribers.get(event);
    if (!set) return;
    set.forEach((h) => {
      try { h(payload); } catch (e) { console.error('[eventBus]', e); }
    });
  },
  clear() { subscribers.clear(); },
};

// 사용하는 이벤트 이름은 한 곳에 모은다 (오타 방지).
export const EVENTS = {
  CHEERS: 'cheers',
};
