// 카탈로그 메타데이터로부터 SVG 병을 그리는 컴포넌트.
// bottleShape 별로 외곽 path / 캡 / 라벨 영역을 사전에서 가져와 색상만 입힌다.
// 이미지(real photo) 가 들어오면 SVG 대신 <img> 로 치환 — drink.image 필드만 채우면 됨.

const SHAPES = {
  // 소주 / 증류 — 슬림 스트레이트
  soju: {
    viewBox: '0 0 60 200',
    bodyPath:
      'M22 12 Q22 30 18 38 L18 50 Q15 56 16 60 L16 184 Q16 192 30 192 Q44 192 44 184 L44 60 Q45 56 42 50 L42 38 Q38 30 38 12 Z',
    cap: { x: 20, y: 6, w: 20, h: 10 },
    label: { x: 13, y: 80, w: 34, h: 64, fontSize: 7 },
    highlight: { x: 22, y: 70, w: 4, h: 110 },
  },
  // 맥주 — 약간 통통 + 긴 목
  beer: {
    viewBox: '0 0 70 220',
    bodyPath:
      'M24 12 Q22 30 20 50 L20 70 Q14 78 14 90 L14 200 Q14 210 35 210 Q56 210 56 200 L56 90 Q56 78 50 70 L50 50 Q48 30 46 12 Z',
    cap: { x: 22, y: 4, w: 26, h: 10 },
    label: { x: 10, y: 110, w: 50, h: 80, fontSize: 8 },
    highlight: { x: 26, y: 95, w: 4, h: 95 },
  },
  // 와인 — Bordeaux 형태 (어깨)
  wine: {
    viewBox: '0 0 80 240',
    bodyPath:
      'M30 12 Q28 50 26 90 Q22 100 18 108 L18 230 Q18 234 40 234 Q62 234 62 230 L62 108 Q58 100 54 90 Q52 50 50 12 Z',
    cap: { x: 26, y: 4, w: 28, h: 14 },
    label: { x: 12, y: 145, w: 56, h: 70, fontSize: 8 },
    highlight: { x: 28, y: 110, w: 4, h: 110 },
  },
  // 샴페인 — 어깨 없이 매끈한 경사
  champagne: {
    viewBox: '0 0 80 240',
    bodyPath:
      'M30 12 Q24 70 18 110 Q15 124 15 132 L15 230 Q15 234 40 234 Q65 234 65 230 L65 132 Q65 124 62 110 Q56 70 50 12 Z',
    cap: { x: 24, y: 2, w: 32, h: 18 },
    label: { x: 10, y: 150, w: 60, h: 70, fontSize: 8 },
    highlight: { x: 28, y: 130, w: 4, h: 90 },
  },
  // 위스키 — 직사각 + 둥근 어깨
  whisky: {
    viewBox: '0 0 90 200',
    bodyPath:
      'M22 12 L68 12 L70 30 Q70 50 70 70 Q78 76 78 88 L78 184 Q78 192 70 192 L20 192 Q12 192 12 184 L12 88 Q12 76 20 70 Q20 50 20 30 Z',
    cap: { x: 22, y: 2, w: 46, h: 12 },
    label: { x: 14, y: 100, w: 62, h: 80, fontSize: 9 },
    highlight: { x: 22, y: 90, w: 4, h: 90 },
  },
  // 막걸리 — 짧고 둥글, 큰 캡
  makgeolli: {
    viewBox: '0 0 90 170',
    bodyPath:
      'M30 12 L60 12 L60 28 L70 36 Q74 44 74 50 L74 144 Q74 158 45 158 Q16 158 16 144 L16 50 Q16 44 20 36 L30 28 Z',
    cap: { x: 28, y: 2, w: 34, h: 12 },
    label: { x: 12, y: 60, w: 66, h: 80, fontSize: 10 },
    highlight: { x: 26, y: 50, w: 4, h: 90 },
  },
};

function fitFontSize(text, maxChars, baseSize) {
  if (!text) return baseSize;
  if (text.length <= maxChars) return baseSize;
  return Math.max(5, baseSize * (maxChars / text.length));
}

export default function Bottle({ drink, className = '' }) {
  if (!drink) return null;

  // 사진 이미지가 등록되어 있으면 SVG 대신 그것을 사용 (추후 교체 경로)
  if (drink.image) {
    return (
      <img
        src={drink.image}
        alt={drink.label}
        className={`pointer-events-none select-none ${className}`}
        draggable={false}
      />
    );
  }

  const shape = SHAPES[drink.bottleShape] || SHAPES.soju;
  const clipId = `bottle-clip-${drink.id}`;
  const gradId = `bottle-grad-${drink.id}`;
  const labelFontSize = fitFontSize(drink.labelText, 7, shape.label.fontSize);

  return (
    <svg
      viewBox={shape.viewBox}
      className={`pointer-events-none select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] ${className}`}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={shape.bodyPath} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={drink.bottleColor} stopOpacity="0.95" />
          <stop offset="50%" stopColor={drink.bottleColor} stopOpacity="0.75" />
          <stop offset="100%" stopColor={drink.bottleColor} stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* 액체 (병 안에 클립) */}
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="40" width="100%" height="100%" fill={drink.liquidColor} opacity="0.85" />
      </g>

      {/* 병 외곽 + 색상 */}
      <path
        d={shape.bodyPath}
        fill={`url(#${gradId})`}
        stroke="rgba(0,0,0,0.45)"
        strokeWidth="1.2"
      />

      {/* 캡 */}
      <rect
        x={shape.cap.x}
        y={shape.cap.y}
        width={shape.cap.w}
        height={shape.cap.h}
        fill={drink.capColor}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="0.8"
        rx="1.5"
      />

      {/* 라벨 */}
      <rect
        x={shape.label.x}
        y={shape.label.y}
        width={shape.label.w}
        height={shape.label.h}
        fill={drink.labelColor}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="0.4"
        rx="1.2"
      />
      <text
        x={shape.label.x + shape.label.w / 2}
        y={shape.label.y + shape.label.h / 2 + labelFontSize / 3}
        textAnchor="middle"
        fontSize={labelFontSize}
        fontWeight="700"
        fill={drink.labelTextColor}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', letterSpacing: '-0.3px' }}
      >
        {drink.labelText}
      </text>

      {/* 입체감용 하이라이트 스트라이프 */}
      <rect
        x={shape.highlight.x}
        y={shape.highlight.y}
        width={shape.highlight.w}
        height={shape.highlight.h}
        fill="rgba(255,255,255,0.35)"
        rx="1"
      />
    </svg>
  );
}
