// 모든 카탈로그를 한 곳에서 합쳐 export.
// 새 카테고리 추가 시 import 한 줄과 DRINK_CATEGORIES 한 줄만 추가하면 된다.

import glasses from './glasses.json';
import soju from './drinks/soju.json';
import traditional from './drinks/traditional.json';
import beer from './drinks/beer.json';
import wine from './drinks/wine.json';
import whisky from './drinks/whisky.json';

export const GLASSES_LIST = glasses;
export const GLASSES_BY_ID = Object.fromEntries(glasses.map((g) => [g.id, g]));

// 카테고리별 배열 + id 인덱스
export const DRINK_CATEGORIES = [
  { id: 'soju', label: '소주', items: soju },
  { id: 'traditional', label: '전통주', items: traditional },
  { id: 'beer', label: '맥주', items: beer },
  { id: 'wine', label: '와인/샴페인', items: wine },
  { id: 'whisky', label: '위스키', items: whisky },
];

export const DRINKS_LIST = DRINK_CATEGORIES.flatMap((c) => c.items);
export const DRINKS_BY_ID = Object.fromEntries(DRINKS_LIST.map((d) => [d.id, d]));

// 잔과 술의 디폴트
export const DEFAULT_GLASS_ID = 'shot-glass';
export const DEFAULT_DRINK_ID = 'chamisul-original';
