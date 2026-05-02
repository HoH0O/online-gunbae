import { AnimatePresence, motion } from 'framer-motion';
import { CHEERS_MESSAGES } from '../config/theme';

// 폭죽 파티클 개수
const PARTICLES = Array.from({ length: 14 }, (_, i) => i);

// 글자 수에 따른 폰트 크기 (이모지를 1글자로 정확히 카운트하기 위해 [...str] 사용)
function pickSizeClass(message) {
  const len = message ? [...message].length : 0;
  if (len <= 5)  return 'text-5xl sm:text-7xl';
  if (len <= 10) return 'text-4xl sm:text-6xl';
  if (len <= 16) return 'text-3xl sm:text-5xl';
  if (len <= 22) return 'text-2xl sm:text-4xl';
  return 'text-xl sm:text-3xl';
}

export default function CheersPopup({ visible, message }) {
  const text = message ?? CHEERS_MESSAGES[0];
  const sizeClass = pickSizeClass(text);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cheers"
          className="pointer-events-none absolute left-0 right-0 top-[12vh] sm:top-[14vh] flex justify-center z-20 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative inline-block">
            {/* 텍스트 팝 */}
            <motion.div
              initial={{ scale: 0.4, rotate: -8 }}
              animate={{ scale: [0.4, 1.2, 1], rotate: [-8, 4, 0] }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'backOut' }}
              className={`${sizeClass} font-extrabold text-yellow-300 drop-shadow-[0_4px_24px_rgba(255,200,0,0.6)] tracking-tight text-center max-w-[88vw] leading-tight break-keep`}
            >
              {text}
            </motion.div>

            {/* 파티클 — 텍스트 중심에서 방사 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {PARTICLES.map((i) => {
                const angle = (i / PARTICLES.length) * Math.PI * 2;
                const distance = 140 + Math.random() * 70;
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
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
