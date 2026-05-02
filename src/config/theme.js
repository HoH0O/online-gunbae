// 테마/설정 중앙 집중 관리 파일.
// 추후 사용자가 술잔, 술 종류, 배경을 직접 변경할 수 있도록
// 모든 조정 가능 값을 이곳에서만 변경하면 되도록 설계했다.

// --- 충격 감지 임계값 -------------------------------------------------
// 기기마다 가속도 센서 민감도가 달라 기기별 조정이 필요할 수 있다.
// magnitude delta 가 SHAKE_THRESHOLD 를 넘으면 건배 트리거 발생.
export const MOTION_CONFIG = {
  SHAKE_THRESHOLD: 18,      // m/s^2 단위, 일반 폰 기준 12~25 사이가 적당
  COOLDOWN_MS: 1200,        // 한 번 건배 후 다음 트리거까지 무시할 시간
  SAMPLE_SMOOTHING: 0.8,    // 0~1, 클수록 노이즈에 둔감
};

// --- 술 종류 (drink) -------------------------------------------------
// liquidColor: SVG 액체 색상
// foamColor: 거품 (있을 경우)
// label: UI 표시명
export const DRINKS = {
  soju:  { id: 'soju',  label: '소주',  liquidColor: '#dff7ec', foamColor: null },
  beer:  { id: 'beer',  label: '맥주',  liquidColor: '#f5b73b', foamColor: '#fff8dc' },
  wine:  { id: 'wine',  label: '와인',  liquidColor: '#7a1f3d', foamColor: null },
  whisky:{ id: 'whisky',label: '위스키',liquidColor: '#b56a2a', foamColor: null },
};

// --- 술잔 종류 (glass) -----------------------------------------------
// 각 잔 모양은 Glass.jsx 안에서 SVG 렌더링 분기에 사용된다.
export const GLASSES = {
  shotGlass: { id: 'shotGlass', label: '소주잔' },
  pintGlass: { id: 'pintGlass', label: '맥주잔' },
  wineGlass: { id: 'wineGlass', label: '와인잔' },
  rockGlass: { id: 'rockGlass', label: '온더락' },
};

// --- 배경 테마 -------------------------------------------------------
export const BACKGROUNDS = {
  night:   { id: 'night',   label: '밤하늘', className: 'bg-gradient-to-b from-[#0b1020] via-[#1a1340] to-[#000]' },
  bar:     { id: 'bar',     label: '바',     className: 'bg-gradient-to-b from-[#3b1f0f] via-[#1d0d05] to-black' },
  sunset:  { id: 'sunset',  label: '노을',   className: 'bg-gradient-to-b from-[#ff7e5f] via-[#feb47b] to-[#2c1338]' },
  forest:  { id: 'forest',  label: '숲',     className: 'bg-gradient-to-b from-[#0e3b2e] via-[#0a1f1a] to-black' },
};

// --- 기본 데모 테마 --------------------------------------------------
// 추후 사용자 설정 / 서버 설정으로 덮어쓸 수 있다.
export const DEFAULT_THEME = {
  drink: DRINKS.soju,
  glass: GLASSES.shotGlass,
  background: BACKGROUNDS.night,
};

// --- 건배 메시지 풀 ---------------------------------------------------
// 무작위로 한 개 골라 띄운다.
export const CHEERS_MESSAGES = [
  '건배! 🍻',
  'Cheers! 🥂',
  '짠! ✨',
  '위하여! 🎉',
  '오늘도 수고했어 🌙',
];
