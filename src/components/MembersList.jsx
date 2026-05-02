import { useLayoutEffect, useRef, useState } from 'react';
import { getSelfId } from '../core/realtime';

/**
 * 룸 멤버 칩 리스트.
 * - 컨테이너 폭 안에 들어가면 중앙 정렬 + 줄바꿈
 * - 폭을 넘기면 가로 마퀴 (우 → 좌, 무한 루프) 로 자동 전환
 */
export default function MembersList({ members }) {
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
      // 원본 칩 (앞 members.length 개) 의 총 너비만 측정 — 듀플 카운트 제외
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
    return (
      <span
        key={dup ? `dup-${m.id}` : m.id}
        aria-hidden={dup ? 'true' : undefined}
        className={[
          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs sm:text-sm border backdrop-blur-md whitespace-nowrap shrink-0',
          isSelf
            ? 'bg-yellow-300/20 border-yellow-300/60 text-yellow-100'
            : 'bg-white/10 border-white/20 text-white/90',
        ].join(' ')}
      >
        {m.isHost && <span aria-hidden="true">👑</span>}
        <span className="font-medium">{m.nickname}</span>
        {isSelf && <span className="text-[10px] opacity-60">(나)</span>}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-[5.5rem] left-0 right-0 z-10 overflow-hidden px-3"
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
        {/* 마퀴 시 끊김 없는 루프를 위한 복제 */}
        {shouldScroll && members.map((m) => renderChip(m, true))}
      </div>
    </div>
  );
}
