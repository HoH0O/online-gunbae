import { useCallback, useMemo, useState } from 'react';
import Glass from './components/Glass';
import CheersPopup from './components/CheersPopup';
import RoomSetup from './components/RoomSetup';
import RoomBar from './components/RoomBar';
import MembersList from './components/MembersList';
import ThemePicker from './components/ThemePicker';
import SettingsSidebar from './components/SettingsSidebar';
import { useMotionSensor } from './hooks/useMotionSensor';
import { useCheers } from './hooks/useCheers';
import { useRoom } from './hooks/useRoom';
import { triggerCheers } from './core/cheersTrigger';
import { generateRoomCode } from './core/realtime';
import { CHEERS_MESSAGES, DEFAULT_THEME } from './config/theme';
import { readRoomFromURL, writeRoomToURL } from './lib/url';
import { storage, KEYS } from './lib/storage';
import { eulReul } from './lib/korean';

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
  const [settingsOpen, setSettingsOpen] = useState(false);

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
  useMotionSensor({ enabled: ready, onShake: handleShake });

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

      {ready && (
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="메뉴 열기"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:scale-95 transition hover:bg-white/15"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      )}

      <SettingsSidebar open={settingsOpen} onClose={() => setSettingsOpen(false)} title="설정">
        <ThemePicker theme={theme} onChange={setTheme} />
      </SettingsSidebar>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-6 text-center">
        <div className="w-56 h-72 sm:w-64 sm:h-80 flex items-center justify-center">
          <Glass
            glass={theme.glass}
            liquidColor={theme.drink.liquidColor}
            foamColor={theme.drink.foamColor}
            fillLevel={0.85}
            cheering={active}
          />
        </div>
        {ready ? (
          <>
            <p className="mt-6 text-white text-base sm:text-lg font-medium">
              현재 <span className="text-yellow-300 font-bold">{theme.drink.label}</span>
              {eulReul(theme.drink.label)} 마시는 중입니다
            </p>
            <p className="mt-2 text-white/55 text-xs">핸드폰을 부딪쳐 짠!</p>
          </>
        ) : (
          <p className="mt-6 text-white/80 text-sm tracking-wide">시작하려면 입장해주세요</p>
        )}
      </div>

      <CheersPopup visible={active} message={message} />

      {ready && (
        <div className="absolute bottom-20 left-3 text-xs text-white/60 pointer-events-none">
          마신 횟수 <span className="text-white font-semibold ml-1">{count}</span>
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
