import { useEffect, useState } from 'react';
import { eventBus, EVENTS } from '../core/eventBus';

// 건배 이벤트 구독 훅.
// 트리거 출처(local/button/remote)를 가리지 않고 동일하게 처리하므로
// 추후 서버에서 들어온 원격 건배에도 자동으로 같은 애니메이션이 재생된다.
export function useCheers({ holdMs = 1500 } = {}) {
  const [active, setActive] = useState(false);
  const [count, setCount] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    let timer;
    const off = eventBus.on(EVENTS.CHEERS, (payload) => {
      setLastEvent(payload);
      setActive(true);
      setCount((c) => c + 1);
      clearTimeout(timer);
      timer = setTimeout(() => setActive(false), holdMs);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, [holdMs]);

  return { active, count, lastEvent };
}
