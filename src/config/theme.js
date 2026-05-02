// 앱 전역 설정. 잔/술 카탈로그는 src/data/ 로 분리됨.
// 이 파일은 카탈로그가 아닌 동작/배경/메시지 설정만 담당.

import {
  GLASSES_BY_ID,
  DRINKS_BY_ID,
  DEFAULT_GLASS_ID,
  DEFAULT_DRINK_ID,
} from '../data';

// --- 충격 감지 임계값 -------------------------------------------------
export const MOTION_CONFIG = {
  SHAKE_THRESHOLD: 1,       // m/s^2 단위, 6~8 민감 / 10~12 보통 / 15+ 둔감
  COOLDOWN_MS: 1200,
  SAMPLE_SMOOTHING: 0.8,
};

// --- 배경 테마 -------------------------------------------------------
export const BACKGROUNDS = {
  night:  { id: 'night',   label: '밤하늘', className: 'bg-gradient-to-b from-[#0b1020] via-[#1a1340] to-[#000]' },
  bar:    { id: 'bar',     label: '바',     className: 'bg-gradient-to-b from-[#3b1f0f] via-[#1d0d05] to-black' },
  sunset: { id: 'sunset',  label: '노을',   className: 'bg-gradient-to-b from-[#ff7e5f] via-[#feb47b] to-[#2c1338]' },
  forest: { id: 'forest',  label: '숲',     className: 'bg-gradient-to-b from-[#0e3b2e] via-[#0a1f1a] to-black' },
};

// --- 기본 데모 테마 --------------------------------------------------
export const DEFAULT_THEME = {
  glass: GLASSES_BY_ID[DEFAULT_GLASS_ID],
  drink: DRINKS_BY_ID[DEFAULT_DRINK_ID],
  background: BACKGROUNDS.night,
};

// --- 건배 메시지 풀 ---------------------------------------------------
export const CHEERS_MESSAGES = [
  '건배! 🍻',
  'Cheers! 🥂',
  '짠! ✨',
  '위하여! 🎉',
  '오늘도 수고했어 🌙',
];
