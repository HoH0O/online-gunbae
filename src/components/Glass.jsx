import { motion } from 'framer-motion';

/**
 * 술잔 일러스트.
 * shape 데이터(viewBox/cupPath/rimPath/stemPath/liquidArea)는 src/data/glasses.json 에서 옴.
 *
 * @param {object} props
 * @param {object} props.glass - glasses.json 항목
 * @param {string} props.liquidColor - drink.liquidColor
 * @param {string|null} [props.foamColor]
 * @param {number} [props.fillLevel] - 0~1
 * @param {boolean} [props.cheering]
 */
export default function Glass({
  glass,
  liquidColor = '#dff7ec',
  foamColor = null,
  fillLevel = 0.85,
  cheering = false,
}) {
  if (!glass) return null;

  const clipId = `glass-clip-${glass.id}`;
  const gradId = `liquid-${glass.id}`;
  const { liquidArea } = glass;

  // 가득 찼을 때 액체 윗면 y, 비었을 때 y
  const surfaceFull = liquidArea.top;
  const surfaceEmpty = liquidArea.bottom;
  const heightFull = surfaceEmpty - surfaceFull;
  const surfaceY = surfaceEmpty - heightFull * fillLevel;
  const surfaceCheering = surfaceEmpty - heightFull * fillLevel * 0.3;

  const wiggle = cheering
    ? { rotate: [0, -8, 9, -6, 4, 0], y: [0, -6, 0, -3, 0] }
    : { rotate: 0, y: 0 };

  return (
    <motion.svg
      viewBox={glass.viewBox}
      className="w-full h-full drop-shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
      animate={wiggle}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={glass.cupPath} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={liquidColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={liquidColor} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* 잔 외곽 */}
      <path
        d={glass.cupPath}
        fill="rgba(255,255,255,0.05)"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* 액체 (잔 path 내부에서만 표시) */}
      <g clipPath={`url(#${clipId})`}>
        <motion.rect
          x="-50"
          width="500"
          fill={`url(#${gradId})`}
          initial={false}
          animate={{
            y: cheering ? surfaceCheering : surfaceY,
            height: 1000,
          }}
          transition={{ duration: cheering ? 0.9 : 0.5, ease: 'easeInOut' }}
        />
        {/* 찰랑이는 표면 */}
        <motion.ellipse
          rx="80"
          ry="6"
          fill={liquidColor}
          opacity="0.9"
          animate={{
            cx: (parseFloat(glass.viewBox.split(' ')[2]) || 120) / 2,
            cy: cheering ? surfaceCheering : surfaceY,
            rx: [76, 84, 76],
          }}
          transition={{ cx: { duration: 0 }, cy: { duration: 0.5 }, rx: { duration: 1.4, repeat: Infinity } }}
        />
        {/* 거품 (맥주 등) */}
        {foamColor && !cheering && (
          <ellipse
            cx={(parseFloat(glass.viewBox.split(' ')[2]) || 120) / 2}
            cy={surfaceY - 6}
            rx="36"
            ry="10"
            fill={foamColor}
            opacity="0.95"
          />
        )}
      </g>

      {/* 잔 다리 (있는 경우) */}
      {glass.stemPath && (
        <path d={glass.stemPath} stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" fill="none" />
      )}

      {/* 잔 입구 라인 */}
      <path d={glass.rimPath} stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round" />
    </motion.svg>
  );
}
