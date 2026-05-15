import { useLayoutEffect, useRef, useState } from 'react';
import { getSelfId } from '../core/realtime';

/**
 * 룸 멤버 칩 리스트.
 * - 컨테이너 폭 안에 들어가면 중앙 정렬 + 줄바꿈
 * - 폭을 넘기면 가로 마퀴 (우 → 좌, 무한 루프) 로 자동 전환
 * - readyMap 에 포함된 멤버는 닉네임 아래 "건배해요!" 말풍선 표시
 *
 * @param {object} props
 * @param {Array} props.members
 * @param {Map<string, {nickname,message,ts}>} [props.readyMap]
 */
export default function MembersList({ members, readyMap }) {
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const selfId = getSelfId();

  useLayoutEffect(() => {
    if (!members || members.length === 0) return;
    const measure = () => {
      const container = containerRef.current;
      const inner = innerRef.current;
      if (!container || !inner) return;
      const original = Array.from(inner.children).slice(0, members.length);
      const totalWidth = original.reduce(
        (acc, el, i) => acc + el.offsetWidth + (i > 0 ? 6 : 0),
        0,
      );
      setShouldScroll(totalWidth > container.clientWidth - 16);
    };
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [members]);

  if (!members || members.length === 0) return null;

  const renderChip = (m, dup) => {
    const isSelf = !dup && m.id === selfId;
    const isReady = !!readyMap?.has(m.id) && !dup;
    return (
      <div key={dup ? `dup-${m.id}` : m.id} className="relative shrink-0">
        <span
          aria-hidden={dup ? 'true' : undefined}
          className={[
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs sm:text-sm border backdrop-blur-md whitespace-nowrap',
            isSelf
              ? 'bg-yellow-300/20 border-yellow-300/60 text-yellow-100'
              : 'bg-white/10 border-white/20 text-white/90',
          ].join(' ')}
        >
          {m.isHost && <span aria-hidden="true">👑</span>}
          <span className="font-medium">{m.nickname}</span>
          {isSelf && <span className="text-[10px] opacity-60">(나)</span>}
        </span>

        {isReady && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 pointer-events-none animate-bounce-soft">
            <div className="relative bg-yellow-300 text-black text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
              건배해요!
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-300 rotate-45" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-[5.5rem] left-0 right-0 z-10 overflow-x-hidden overflow-y-visible px-3"
    >
      <div
        ref={innerRef}
        className={[
          'flex gap-1.5',
          shouldScroll
            ? 'animate-marquee w-max'
            : 'justify-center flex-wrap max-w-[92vw] mx-auto',
        ].join(' ')}
      >
        {members.map((m) => renderChip(m, false))}
        {shouldScroll && members.map((m) => renderChip(m, true))}
      </div>
    </div>
  );
}
