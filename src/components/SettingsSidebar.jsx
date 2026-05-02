import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

/**
 * 우측 슬라이드인 사이드바.
 * - 배경 클릭 / ESC / 닫기 버튼으로 닫힘
 * - 열려 있을 때 페이지 스크롤 잠그지 않음 (앱이 단일 화면이라 영향 없음)
 */
export default function SettingsSidebar({ open, onClose, title = '설정', children }) {
  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            className="fixed top-0 right-0 bottom-0 z-50 w-[78vw] max-w-[320px] bg-black/85 backdrop-blur-xl border-l border-white/10 text-white p-5 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            role="dialog"
            aria-label={title}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
