import { useCallback, useMemo, useState } from 'react';
import Glass from './components/Glass';
import CheersPopup from './components/CheersPopup';
import PermissionGate from './components/PermissionGate';
import ThemePicker from './components/ThemePicker';
import { useMotionSensor } from './hooks/useMotionSensor';
import { useCheers } from './hooks/useCheers';
import { triggerCheers } from './core/cheersTrigger';
import { CHEERS_MESSAGES, DEFAULT_THEME } from './config/theme';

export default function App() {
  // 권한 단계: idle -> ready
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState(DEFAULT_THEME);

  // 충격 감지 -> triggerCheers 호출 (UI 와는 결합되지 않은 순수 트리거)
  const handleShake = useCallback(({ delta, magnitude }) => {
    triggerCheers('local', { delta, magnitude });
  }, []);

  const motion = useMotionSensor({ enabled: ready, onShake: handleShake });

  // 건배 이벤트 구독 (local/button/remote 어디서 와도 동일하게 처리)
  const { active, count, lastEvent } = useCheers();

  const message = useMemo(() => {
    if (!lastEvent) return CHEERS_MESSAGES[0];
    // 트리거마다 무작위 메시지 (count 를 시드로 안정적 선택)
    return CHEERS_MESSAGES[count % CHEERS_MESSAGES.length];
  }, [lastEvent, count]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${theme.background.className}`}>
      {/* 배경 별 효과 */}
      <Sparkles />

      {/* 테마 변경 (잔/술/배경) */}
      {ready && <ThemePicker theme={theme} onChange={setTheme} />}

      {/* 메인 술잔 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Glass
          shape={theme.glass.id}
          liquidColor={theme.drink.liquidColor}
          foamColor={theme.drink.foamColor}
          fillLevel={0.85}
          cheering={active}
        />
        <p className="mt-6 text-white/80 text-sm tracking-wide">
          {ready ? '핸드폰을 부딪쳐 보세요' : '센서 권한이 필요해요'}
        </p>
      </div>

      {/* 건배 팝업 */}
      <CheersPopup visible={active} message={message} />

      {/* 데스크톱/테스트용 수동 트리거 */}
      <button
        type="button"
        onClick={() => triggerCheers('button')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-6 py-2.5 rounded-full bg-white/15 text-white text-sm backdrop-blur-md border border-white/20 active:scale-95 transition"
      >
        🥂 짠! (테스트)
      </button>

      {/* 디버그 정보 (센서 값 확인용) */}
      {ready && (
        <div className="absolute bottom-20 left-2 text-[10px] text-white/40 font-mono pointer-events-none">
          mag {motion.magnitude.toFixed(1)} · Δ {motion.delta.toFixed(1)} · count {count}
        </div>
      )}

      {/* 권한 게이트 */}
      {!ready && <PermissionGate onGranted={() => setReady(true)} />}
    </div>
  );
}

// 단순 별 효과 — 배경 분위기용
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
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
