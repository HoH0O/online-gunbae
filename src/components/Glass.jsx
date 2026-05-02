import { motion } from 'framer-motion';

// 술잔 모양별 path/dimension 사전.
// 모양을 추가하려면 이 객체에만 항목을 더하면 된다.
// fill: 액체 영역 path. 액체는 cup path 안에 clipPath 로 잘려 표시된다.
const SHAPES = {
  shotGlass: {
    viewBox: '0 0 120 160',
    cup: 'M30 30 L90 30 L82 140 Q60 150 38 140 Z',
    rim: 'M30 30 L90 30',
  },
  pintGlass: {
    viewBox: '0 0 120 200',
    cup: 'M22 20 L98 20 L88 188 Q60 198 32 188 Z',
    rim: 'M22 20 L98 20',
  },
  wineGlass: {
    viewBox: '0 0 120 220',
    cup: 'M20 20 Q20 90 60 110 Q100 90 100 20 Z',
    rim: 'M20 20 L100 20',
    stem: 'M58 110 L58 180 L40 195 L80 195 L62 180 L62 110',
  },
  rockGlass: {
    viewBox: '0 0 140 140',
    cup: 'M22 20 L118 20 L112 124 Q70 134 28 124 Z',
    rim: 'M22 20 L118 20',
  },
};

/**
 * 술잔 일러스트.
 *
 * @param {object} props
 * @param {keyof typeof SHAPES} props.shape - 잔 모양 id
 * @param {string} props.liquidColor - 액체 색상 (hex)
 * @param {string|null} props.foamColor - 거품 색상 (없으면 null)
 * @param {number} props.fillLevel - 0~1, 액체가 채워진 비율
 * @param {boolean} props.cheering - 건배 중 상태 (애니메이션 트리거)
 */
export default function Glass({
  shape = 'shotGlass',
  liquidColor = '#dff7ec',
  foamColor = null,
  fillLevel = 0.85,
  cheering = false,
}) {
  const def = SHAPES[shape] ?? SHAPES.shotGlass;
  const clipId = `glass-clip-${shape}`;

  // 건배 시 잔이 살짝 흔들리는 모션
  const wiggle = cheering
    ? { rotate: [0, -8, 9, -6, 4, 0], y: [0, -6, 0, -3, 0] }
    : { rotate: 0, y: 0 };

  return (
    <motion.svg
      viewBox={def.viewBox}
      className="w-56 h-72 sm:w-64 sm:h-80 drop-shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
      animate={wiggle}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={def.cup} />
        </clipPath>
        <linearGradient id={`liquid-${shape}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={liquidColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={liquidColor} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* 잔 테두리 */}
      <path
        d={def.cup}
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* 액체: 잔 path 안에서만 보이도록 클립 */}
      <g clipPath={`url(#${clipId})`}>
        <motion.rect
          x="0"
          width="200"
          fill={`url(#liquid-${shape})`}
          initial={false}
          animate={{
            // 건배 순간 액체가 줄어드는(마시는) 연출
            y: cheering ? 200 - 200 * (fillLevel * 0.3) : 200 - 200 * fillLevel,
            height: 400,
          }}
          transition={{ duration: cheering ? 0.9 : 0.5, ease: 'easeInOut' }}
        />
        {/* 찰랑이는 표면 */}
        <motion.ellipse
          cx="60"
          rx="60"
          ry="6"
          fill={liquidColor}
          opacity="0.9"
          animate={{
            cy: cheering ? 200 - 200 * (fillLevel * 0.3) : 200 - 200 * fillLevel,
            rx: [55, 62, 55],
          }}
          transition={{ cy: { duration: 0.5 }, rx: { duration: 1.4, repeat: Infinity } }}
        />
        {/* 거품 (맥주 등) */}
        {foamColor && !cheering && (
          <ellipse
            cx="60"
            cy={200 - 200 * fillLevel - 6}
            rx="36"
            ry="10"
            fill={foamColor}
            opacity="0.95"
          />
        )}
      </g>

      {/* 잔 다리 (와인잔 등) */}
      {def.stem && (
        <path d={def.stem} stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" fill="none" />
      )}

      {/* 잔 입구 라인 강조 */}
      <path d={def.rim} stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  );
}
