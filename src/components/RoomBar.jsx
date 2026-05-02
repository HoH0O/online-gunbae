import { useState } from 'react';

const STATUS_LABEL = {
  idle: '준비 중',
  connecting: '연결 중…',
  connected: '연결됨',
  error: '연결 오류',
  disabled: '오프라인',
};

const STATUS_COLOR = {
  idle: 'bg-white/40',
  connecting: 'bg-yellow-300',
  connected: 'bg-emerald-400',
  error: 'bg-red-400',
  disabled: 'bg-white/30',
};

export default function RoomBar({ roomId, members, status }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!roomId) return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: '온라인 건배', text: '같이 짠 하자!', url });
        return;
      } catch {
        // 사용자가 공유 취소 -> 그냥 클립보드로 폴백
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('링크를 복사하세요', url);
    }
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 text-white text-xs sm:text-sm">
      <span className={`w-2 h-2 rounded-full ${STATUS_COLOR[status] ?? 'bg-white/30'}`} />
      <span className="opacity-70">방</span>
      <span className="font-mono font-semibold tracking-widest">{roomId ?? '------'}</span>
      <span className="opacity-50">·</span>
      <span>{members}명</span>
      <button
        type="button"
        onClick={handleShare}
        disabled={!roomId || status === 'disabled'}
        className="ml-1 px-2.5 py-0.5 rounded-full bg-yellow-300 text-black font-medium disabled:opacity-40 active:scale-95 transition"
      >
        {copied ? '복사됨!' : '공유'}
      </button>
      {status === 'disabled' && (
        <span className="ml-1 opacity-60 text-[10px]">(키 미설정)</span>
      )}
    </div>
  );
}
