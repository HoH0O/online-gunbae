import { useCallback, useMemo, useState } from 'react';
import Glass from './components/Glass';
import CheersPopup from './components/CheersPopup';
import RoomSetup from './components/RoomSetup';
import RoomBar from './components/RoomBar';
import MembersList from './components/MembersList';
import ThemePicker from './components/ThemePicker';
import { useMotionSensor } from './hooks/useMotionSensor';
import { useCheers } from './hooks/useCheers';
import { useRoom } from './hooks/useRoom';
import { triggerCheers } from './core/cheersTrigger';
import { generateRoomCode } from './core/realtime';
import { CHEERS_MESSAGES, DEFAULT_THEME } from './config/theme';
import { readRoomFromURL, writeRoomToURL } from './lib/url';
import { storage, KEYS } from './lib/storage';

export default function App() {
  // URL 을 한 번만 읽어 host/guest 결정.
  const initial = useMemo(() => {
    const { roomId, title } = readRoomFromURL();
    const wasHost = roomId ? storage.get(KEYS.hostOf(roomId)) === '1' : false;
    return {
      roomId,
      title,
      isHost: !roomId || wasHost, // 룸 코드 없으면 신규 호스트, 있으면 이전 호스트 여부
      nickname: storage.get(KEYS.nickname, ''),
    };
  }, []);

  // setup 완료 전: null. 완료 후: { roomId, title, nickname, isHost }
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState(DEFAULT_THEME);

  const handleSetupSubmit = useCallback(
    ({ title, nickname }) => {
      storage.set(KEYS.nickname, nickname);

      let roomId = initial.roomId;
      let resolvedTitle = title || initial.title || '';

      if (!roomId) {
        // 호스트가 새 방 생성
        roomId = generateRoomCode();
        storage.set(KEYS.hostOf(roomId), '1');
      }

      // URL 갱신 (호스트가 공유했을 때 게스트도 제목을 받도록)
      writeRoomToURL({ roomId, title: resolvedTitle });

      setSession({
        roomId,
        title: resolvedTitle,
        nickname,
        isHost: initial.isHost,
      });
    },
    [initial],
  );

  const ready = !!session;

  // 충격 감지 -> triggerCheers 호출 (UI 와 결합 X)
  const handleShake = useCallback(({ delta, magnitude }) => {
    triggerCheers('local', { delta, magnitude });
  }, []);
  const motion = useMotionSensor({ enabled: ready, onShake: handleShake });

  // Supabase 룸 참여
  const { members, status } = useRoom({
    enabled: ready,
    roomId: session?.roomId ?? null,
    nickname: session?.nickname ?? '',
    isHost: session?.isHost ?? false,
  });

  // 건배 이벤트 구독
  const { active, count, lastEvent } = useCheers();

  const message = useMemo(() => {
    if (!lastEvent) return CHEERS_MESSAGES[0];
    return CHEERS_MESSAGES[count % CHEERS_MESSAGES.length];
  }, [lastEvent, count]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${theme.background.className}`}>
      <Sparkles />

      {ready && <RoomBar roomId={session.roomId} title={session.title} memberCount={members.length || 1} status={status} />}
      {ready && <MembersList members={members} />}
      {ready && <ThemePickerSlot theme={theme} setTheme={setTheme} />}

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Glass
          shape={theme.glass.id}
          liquidColor={theme.drink.liquidColor}
          foamColor={theme.drink.foamColor}
          fillLevel={0.85}
          cheering={active}
        />
        <p className="mt-6 text-white/80 text-sm tracking-wide">
          {ready ? '핸드폰을 부딪쳐 보세요' : '시작하려면 입장해주세요'}
        </p>
      </div>

      <CheersPopup visible={active} message={message} />

      <button
        type="button"
        onClick={() => triggerCheers('button')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-6 py-2.5 rounded-full bg-white/15 text-white text-sm backdrop-blur-md border border-white/20 active:scale-95 transition"
      >
        🥂 짠! (테스트)
      </button>

      {ready && (
        <div className="absolute bottom-20 left-2 text-[10px] text-white/40 font-mono pointer-events-none">
          mag {motion.magnitude.toFixed(1)} · Δ {motion.delta.toFixed(1)} · count {count}
        </div>
      )}

      {!ready && (
        <RoomSetup
          isHost={initial.isHost}
          initialTitle={initial.title || ''}
          initialNickname={initial.nickname}
          onSubmit={handleSetupSubmit}
        />
      )}
    </div>
  );
}

// ThemePicker 위치를 MembersList 와 안 겹치게 살짝 아래로 내림
function ThemePickerSlot({ theme, setTheme }) {
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
      <ThemePicker theme={theme} onChange={setTheme} />
    </div>
  );
}

function Sparkles() {
  const stars = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        size: 2 + Math.random() * 3,
      })),
    [],
  );
  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-sparkle"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
        />
      ))}
    </div>
  );
}
