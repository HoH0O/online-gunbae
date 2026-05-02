import { useState } from 'react';
import { requestMotionPermission } from '../hooks/useMotionSensor';

/**
 * 시작 게이트.
 * 호스트(URL 에 ?room= 없음): 방 제목 + 닉네임 입력
 * 게스트(URL 에 ?room= 있음): 방 제목 표시 + 닉네임 입력
 *
 * 제출 시 모션 센서 권한도 함께 요청 (iOS 13+ 정책: 사용자 탭 안에서 호출 필요)
 */
export default function RoomSetup({
  isHost,
  initialTitle = '',
  initialNickname = '',
  onSubmit,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [nickname, setNickname] = useState(initialNickname);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const trimmedNick = nickname.trim();
  const trimmedTitle = title.trim();
  const canSubmit = trimmedNick.length > 0 && (!isHost || trimmedTitle.length > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    setError(null);
    const granted = await requestMotionPermission();
    setPending(false);
    if (!granted) {
      // 권한 거부되어도 룸 자체는 진행 가능 (테스트 버튼은 동작).
      // 단, 사용자에게 안내만 한 줄.
      setError('모션 센서 권한이 거부되었어요. 짠 버튼으로만 동작합니다.');
    }
    onSubmit({
      title: trimmedTitle || initialTitle,
      nickname: trimmedNick,
    });
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/8 border border-white/20 rounded-2xl p-6 text-white shadow-2xl"
      >
        <div className="text-5xl text-center mb-3">🥂</div>
        <h1 className="text-xl sm:text-2xl font-bold text-center mb-1">
          {isHost ? '방 만들기' : '방에 입장하기'}
        </h1>
        <p className="text-center text-white/60 text-xs mb-6">
          {isHost
            ? '방 제목과 닉네임을 정해주세요.'
            : initialTitle
              ? `'${initialTitle}' 방에 입장합니다.`
              : '닉네임을 정해주세요.'}
        </p>

        {isHost ? (
          <Field label="방 제목">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 30))}
              placeholder="예) 오늘은 금요일"
              maxLength={30}
              autoFocus
              className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2.5 text-white placeholder-white/30 outline-none focus:border-yellow-300 transition"
            />
          </Field>
        ) : initialTitle ? (
          <div className="mb-4 px-3 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white/90">
            <span className="text-xs text-white/40 mr-2">방</span>
            <span className="font-medium">{initialTitle}</span>
          </div>
        ) : null}

        <Field label="닉네임">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 12))}
            placeholder="최대 12자"
            maxLength={12}
            autoFocus={!isHost}
            className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2.5 text-white placeholder-white/30 outline-none focus:border-yellow-300 transition"
          />
        </Field>

        <button
          type="submit"
          disabled={!canSubmit || pending}
          className="w-full mt-2 px-6 py-3 rounded-full bg-yellow-300 text-black font-semibold shadow-lg active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {pending ? '준비 중…' : isHost ? '방 만들기' : '입장하기'}
        </button>
        {error && <p className="mt-3 text-yellow-300/90 text-xs text-center">{error}</p>}
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs text-white/60 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
