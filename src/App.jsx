import { useCallback, useMemo, useRef, useState } from 'react';
import Glass from './components/Glass';
import CheersPopup from './components/CheersPopup';
import RoomSetup from './components/RoomSetup';
import RoomBar from './components/RoomBar';
import MembersList from './components/MembersList';
import ThemePicker from './components/ThemePicker';
import CheersMessagesEditor from './components/CheersMessagesEditor';
import SettingsSidebar from './components/SettingsSidebar';
import OrientationGate from './components/OrientationGate';
import { useMotionSensor } from './hooks/useMotionSensor';
import { useCheers } from './hooks/useCheers';
import { useRoom } from './hooks/useRoom';
import { useCustomMessages } from './hooks/useCustomMessages';
import { useDisabledDefaults } from './hooks/useDisabledDefaults';
import { useReadyTracker } from './hooks/useReadyTracker';
import { triggerCheers, emitReady } from './core/cheersTrigger';
import { generateRoomCode, getSelfId } from './core/realtime';
import { CHEERS_MESSAGES, DEFAULT_THEME } from './config/theme';
import { readRoomFromURL, writeRoomToURL } from './lib/url';
import { storage, KEYS } from './lib/storage';
import { eulReul } from './lib/korean';

export default function App() {
  // URL 을 한 번만 읽어 setup 화면 모드 / presence host 여부 결정.
  // - setupIsHost: 화면 분기("방 만들기" vs "방 입장") 는 URL 에만 의존.
  //   같은 브라우저에서 두 번째 탭으로 들어가는 케이스가 막힘.
  // - presenceIsHost: 호스트 crown(👑) 만 유지 — wasHost 인 사용자가 새로고침해도
  //   crown 유지되도록 함.
  const initial = useMemo(() => {
    const { roomId, title } = readRoomFromURL();
    const wasHost = roomId ? storage.get(KEYS.hostOf(roomId)) === '1' : false;
    return {
      roomId,
      title,
      setupIsHost: !roomId,
      presenceIsHost: !roomId || wasHost,
      nickname: storage.get(KEYS.nickname, ''),
    };
  }, []);

  // setup 완료 전: null. 완료 후: { roomId, title, nickname, isHost }
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // 사용자 건배사 + 비활성화한 기본 건배사 (localStorage 영속)
  const customMessages = useCustomMessages();
  const disabledDefaults = useDisabledDefaults();

  // 활성 기본 + 사용자 건배사 합본. 짠 발동 순서대로 순환.
  // 풀이 비면 (모두 비활성 + 커스텀 0개) "건배! 🍻" 로 폴백.
  const messagePool = useMemo(() => {
    const activeDefaults = CHEERS_MESSAGES.filter((m) => !disabledDefaults.disabled.has(m));
    const pool = [...activeDefaults, ...customMessages.messages];
    return pool.length > 0 ? pool : [CHEERS_MESSAGES[0]];
  }, [disabledDefaults.disabled, customMessages.messages]);
  const cheersCounterRef = useRef(0);

  // 로컬 짠 발생 시: 즉시 애니메이션 X. "건배 준비됨" 신호만 발산.
  // 룸 전원이 ready 되면 useReadyTracker 가 triggerCheers 로 발사.
  const fireLocalReady = useCallback(() => {
    const msg = messagePool[cheersCounterRef.current % messagePool.length];
    cheersCounterRef.current += 1;
    emitReady({
      from: getSelfId(),
      nickname: session?.nickname || '익명',
      message: msg,
    });
  }, [messagePool, session?.nickname]);

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
        isHost: initial.presenceIsHost,
      });
    },
    [initial],
  );

  const ready = !!session;

  // 충격 감지 -> ready 발산 (애니메이션은 모두 ready 됐을 때만)
  const handleShake = useCallback(() => {
    fireLocalReady();
  }, [fireLocalReady]);
  useMotionSensor({ enabled: ready, onShake: handleShake });

  // Supabase 룸 참여
  const { members, status } = useRoom({
    enabled: ready,
    roomId: session?.roomId ?? null,
    nickname: session?.nickname ?? '',
    isHost: session?.isHost ?? false,
  });

  // 멤버 ready 상태 추적. 전원 ready 되면 로컬에서 최종 cheers 발사.
  // presence sync 가 늦게 도착해도 자기 자신은 항상 참여자로 강제 포함.
  // (그렇지 않으면 memberIds=[상대만] 상태에서 상대 ready 한 번에 false-positive 발사됨)
  const memberIds = useMemo(() => {
    const ids = new Set(members.map((m) => m.id));
    ids.add(getSelfId());
    return Array.from(ids);
  }, [members]);
  const handleAllReady = useCallback((finalMessage) => {
    triggerCheers('local', { message: finalMessage });
  }, []);
  const { ready: readyMap } = useReadyTracker({
    memberIds,
    onAllReady: handleAllReady,
  });

  // 건배 이벤트 구독 — 페이로드의 message 를 그대로 표시
  const { active, count, lastEvent } = useCheers();
  const message = lastEvent?.message ?? CHEERS_MESSAGES[0];

  return (
    <div className={`relative w-full h-full overflow-hidden ${theme.background.className}`}>
      <OrientationGate />
      <Sparkles />

      {ready && <RoomBar roomId={session.roomId} title={session.title} memberCount={members.length || 1} status={status} />}
      {ready && <MembersList members={members} readyMap={readyMap} />}

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
        <div className="my-6 border-t border-white/10" />
        <div>
          <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">건배사</h3>
          <CheersMessagesEditor
            messages={customMessages.messages}
            onAdd={customMessages.add}
            onRemove={customMessages.remove}
            disabledDefaults={disabledDefaults.disabled}
            onToggleDefault={disabledDefaults.toggle}
          />
        </div>
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

      <CheersPopup visible={active} message={message} nonce={count} />

      {ready && (
        <div className="absolute bottom-20 left-3 text-xs text-white/60 pointer-events-none">
          마신 횟수 <span className="text-white font-semibold ml-1">{count}</span>
        </div>
      )}

      {!ready && (
        <RoomSetup
          isHost={initial.setupIsHost}
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
