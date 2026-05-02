import { motion, AnimatePresence } from 'framer-motion';
import { getSelfId } from '../core/realtime';

// 룸 안의 접속자 칩 리스트.
// 자기 자신은 살짝 강조, 호스트는 👑 표시.
export default function MembersList({ members }) {
  const selfId = getSelfId();
  if (!members || members.length === 0) return null;

  return (
    <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 flex-wrap justify-center max-w-[90vw] px-2">
      <AnimatePresence initial={false}>
        {members.map((m) => {
          const isSelf = m.id === selfId;
          return (
            <motion.span
              key={m.id}
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
              className={[
                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs sm:text-sm border backdrop-blur-md',
                isSelf
                  ? 'bg-yellow-300/20 border-yellow-300/60 text-yellow-100'
                  : 'bg-white/10 border-white/20 text-white/90',
              ].join(' ')}
              title={m.isHost ? '방장' : ''}
            >
              {m.isHost && <span aria-hidden="true">👑</span>}
              <span className="font-medium">{m.nickname}</span>
              {isSelf && <span className="text-[10px] opacity-60">(나)</span>}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
