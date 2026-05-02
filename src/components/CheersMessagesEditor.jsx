import { useState } from 'react';
import { MAX_MESSAGE_LENGTH, MAX_MESSAGE_COUNT } from '../hooks/useCustomMessages';
import { CHEERS_MESSAGES } from '../config/theme';

export default function CheersMessagesEditor({ messages, onAdd, onRemove }) {
  const [text, setText] = useState('');
  const trimmed = text.trim();
  const isFull = messages.length >= MAX_MESSAGE_COUNT;
  const isDuplicate = messages.includes(trimmed);
  const canAdd = trimmed.length > 0 && trimmed.length <= MAX_MESSAGE_LENGTH && !isFull && !isDuplicate;

  const handleAdd = () => {
    if (!canAdd) return;
    if (onAdd(trimmed)) setText('');
  };

  return (
    <div>
      {/* 기본 메시지 안내 */}
      <details className="mb-3 group">
        <summary className="text-[11px] text-white/40 cursor-pointer list-none flex items-center gap-1">
          <span className="transition-transform group-open:rotate-90">▸</span>
          기본 건배사 {CHEERS_MESSAGES.length}개 보기
        </summary>
        <ul className="mt-2 pl-3 space-y-0.5 text-[11px] text-white/45">
          {CHEERS_MESSAGES.map((m) => (
            <li key={m}>· {m}</li>
          ))}
        </ul>
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
    </div>
  );
}
