import { AnimatePresence, motion } from 'framer-motion';
import { CHEERS_MESSAGES } from '../config/theme';

// 폭죽처럼 튀어나오는 파티클
const PARTICLES = Array.from({ length: 14 }, (_, i) => i);

export default function CheersPopup({ visible, message }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cheers"
          className="pointer-events-none absolute inset-0 flex items-center justify-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 텍스트 팝 */}
          <motion.div
            initial={{ scale: 0.4, rotate: -8 }}
            animate={{ scale: [0.4, 1.25, 1], rotate: [-8, 4, 0] }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'backOut' }}
            className="text-5xl sm:text-7xl font-extrabold text-yellow-300 drop-shadow-[0_4px_24px_rgba(255,200,0,0.6)] tracking-tight"
          >
            {message ?? CHEERS_MESSAGES[0]}
          </motion.div>

          {/* 파티클 */}
          {PARTICLES.map((i) => {
            const angle = (i / PARTICLES.length) * Math.PI * 2;
            const distance = 160 + Math.random() * 80;
            return (
              <motion.span
                key={i}
                className="absolute text-2xl sm:text-3xl"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  opacity: 0,
                  scale: 1.2,
                }}
                transition={{ duration: 1.0, ease: 'easeOut' }}
              >
                {['✨', '🎉', '🥂', '⭐'][i % 4]}
              </motion.span>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
