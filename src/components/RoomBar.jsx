import { useState } from 'react';

const STATUS_COLOR = {
  idle: 'bg-white/40',
  connecting: 'bg-yellow-300',
  connected: 'bg-emerald-400',
  error: 'bg-red-400',
  disabled: 'bg-white/30',
};

export default function RoomBar({ roomId, title, memberCount, status }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!roomId) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || '온라인 건배',
          text: title ? `'${title}' 방으로 초대합니다 🥂` : '같이 짠 하자!',
          url,
        });
        return;
      } catch {
        // 사용자가 공유 취소 -> 클립보드 폴백
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
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 max-w-[92vw]">
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-white text-sm">
        <span className={`w-2 h-2 rounded-full ${STATUS_COLOR[status] ?? 'bg-white/30'}`} />
        <span className="font-semibold truncate max-w-[40vw]">
          {title || '제목 없는 방'}
        </span>
        <span className="opacity-50">·</span>
        <span className="opacity-80">{memberCount}명</span>
        <button
          type="button"
          onClick={handleShare}
          disabled={!roomId || status === 'disabled'}
          className="ml-1 px-2.5 py-0.5 rounded-full bg-yellow-300 text-black text-xs font-medium disabled:opacity-40 active:scale-95 transition"
        >
          {copied ? '복사됨!' : '공유'}
        </button>
      </div>
      <div className="text-[10px] text-white/40 font-mono tracking-widest">
        {roomId ?? '------'} {status === 'disabled' && '(키 미설정)'}
      </div>
    </div>
  );
}
