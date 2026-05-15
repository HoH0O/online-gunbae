import { useState } from 'react';
import { MAX_MESSAGE_LENGTH, MAX_MESSAGE_COUNT } from '../hooks/useCustomMessages';
import { CHEERS_MESSAGES } from '../config/theme';

export default function CheersMessagesEditor({
  messages,
  onAdd,
  onRemove,
  disabledDefaults,
  onToggleDefault,
}) {
  const [text, setText] = useState('');
  const trimmed = text.trim();
  const isFull = messages.length >= MAX_MESSAGE_COUNT;
  const isDuplicate = messages.includes(trimmed);
  const canAdd = trimmed.length > 0 && trimmed.length <= MAX_MESSAGE_LENGTH && !isFull && !isDuplicate;

  const handleAdd = () => {
    if (!canAdd) return;
    if (onAdd(trimmed)) setText('');
  };

  const activeDefaultCount = CHEERS_MESSAGES.filter((m) => !disabledDefaults?.has(m)).length;
  const totalActive = activeDefaultCount + messages.length;

  return (
    <div>
      {/* 기본 건배사 관리 — 토글로 끄고 켜기 */}
      <details className="mb-3 group">
        <summary className="text-[11px] text-white/55 cursor-pointer list-none flex items-center gap-1 select-none">
          <span className="transition-transform group-open:rotate-90">▸</span>
          기본 건배사 관리 ({activeDefaultCount}/{CHEERS_MESSAGES.length})
        </summary>
        <ul className="mt-2 space-y-1">
          {CHEERS_MESSAGES.map((m) => {
            const off = disabledDefaults?.has(m);
            return (
              <li
                key={m}
                className={[
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[12px] transition',
                  off
                    ? 'bg-white/[0.02] border-white/10 text-white/35 line-through'
                    : 'bg-white/5 border-white/10 text-white/80',
                ].join(' ')}
              >
                <span className="flex-1 truncate">{m}</span>
                <button
                  type="button"
                  onClick={() => onToggleDefault?.(m)}
                  aria-label={off ? '복원' : '끄기'}
                  className={[
                    'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold transition',
                    off
                      ? 'bg-white/10 hover:bg-white/20 text-white/80'
                      : 'bg-white/5 hover:bg-red-500/40 text-white/50 hover:text-white',
                  ].join(' ')}
                >
                  {off ? '복원' : '✕'}
                </button>
              </li>
            );
          })}
        </ul>
        {activeDefaultCount === 0 && messages.length === 0 && (
          <p className="mt-2 text-[11px] text-yellow-300/80">
            ⚠ 활성화된 건배사가 없으면 기본값으로 대체됩니다.
          </p>
        )}
      </details>

      {/* 내 건배사 리스트 */}
      {messages.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {messages.map((m, i) => (
            <li
              key={`${i}-${m}`}
              className="flex items-center gap-2 bg-white/5 rounded-lg px-2.5 py-2 border border-white/10"
            >
              <span className="flex-1 text-sm text-white/90 break-all">{m}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="삭제"
                className="w-6 h-6 rounded-full bg-white/5 hover:bg-red-500/40 text-white/60 hover:text-white text-xs shrink-0 transition flex items-center justify-center"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={isFull}
          placeholder={isFull ? `최대 ${MAX_MESSAGE_COUNT}개까지` : '건배사 추가'}
          className="flex-1 bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-yellow-300 transition disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="px-3.5 py-2 rounded-lg bg-yellow-300 text-black text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition"
        >
          추가
        </button>
      </div>

      {/* 힌트 / 카운터 */}
      <p className="mt-1.5 text-[11px] text-white/45 flex justify-between">
        <span>
          {isDuplicate
            ? '이미 추가된 건배사예요'
            : `최대 ${MAX_MESSAGE_LENGTH}자 · 룸 멤버 모두에게 표시됨`}
        </span>
        <span>
          {messages.length}/{MAX_MESSAGE_COUNT}
        </span>
      </p>

      {/* 합계 알림 */}
      {totalActive > 0 && (
        <p className="mt-0.5 text-[10px] text-white/35 text-right">
          순환 중: {totalActive}개
        </p>
      )}
    </div>
  );
}
