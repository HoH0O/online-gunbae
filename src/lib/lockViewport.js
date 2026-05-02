// iOS Safari (10+) 는 viewport 메타의 user-scalable=no 를 무시하므로
// JS 로 핀치줌 / 더블탭줌 제스처를 차단해야 한다.
// 한 번만 호출되도록 main.jsx 진입 직후에서 사용.

let installed = false;

export function lockViewport() {
  if (installed) return;
  if (typeof document === 'undefined') return;
  installed = true;

  // iOS pinch zoom 제스처 (Safari 전용 이벤트)
  const preventGesture = (e) => e.preventDefault();
  document.addEventListener('gesturestart', preventGesture);
  document.addEventListener('gesturechange', preventGesture);
  document.addEventListener('gestureend', preventGesture);

  // 멀티터치 핀치 (Android 포함 폴백)
  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    { passive: false },
  );

  // 더블탭 줌 차단 (300ms 이내 연속 터치)
  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 350) e.preventDefault();
      lastTouchEnd = now;
    },
    { passive: false },
  );
}
