import { useState } from 'react';
import { requestMotionPermission } from '../hooks/useMotionSensor';

/**
 * iOS 13+ 정책 대응용 게이트.
 * 사용자의 명시적 탭(터치) 안에서 requestPermission() 을 호출해야 권한 팝업이 뜬다.
 * 권한 받으면 onGranted() 호출 후 게이트 사라짐.
 */
export default function PermissionGate({ onGranted }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setPending(true);
    setError(null);
    const granted = await requestMotionPermission();
    setPending(false);
    if (granted) onGranted?.();
    else setError('센서 권한이 거부되었어요. 브라우저 설정에서 허용해주세요.');
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-6 text-center">
      <div className="text-5xl mb-4">🥂</div>
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">온라인 건배</h1>
      <p className="text-white/70 mb-8 max-w-xs">
        핸드폰을 부딪히면 건배 애니메이션이 재생돼요.<br />
        먼저 모션 센서 사용을 허용해주세요.
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="px-8 py-3 rounded-full bg-yellow-300 text-black font-semibold shadow-lg active:scale-95 transition disabled:opacity-50"
      >
        {pending ? '요청 중…' : '시작하기'}
      </button>
      {error && <p className="mt-4 text-red-300 text-sm">{error}</p>}
    </div>
  );
}
