// 한국어 조사 자동 선택. 받침 유무에 따라 을/를, 이/가 등 선택.

/**
 * @param {string} word
 * @param {string} withBatchim - 받침 있을 때 (예: 을, 이, 은)
 * @param {string} withoutBatchim - 받침 없을 때 (예: 를, 가, 는)
 */
export function josa(word, withBatchim, withoutBatchim) {
  if (!word) return withoutBatchim;
  const last = word[word.length - 1];
  const code = last.charCodeAt(0);

  // 한글 음절 (가 ~ 힣)
  if (code >= 0xac00 && code <= 0xd7a3) {
    const hasBatchim = (code - 0xac00) % 28 !== 0;
    return hasBatchim ? withBatchim : withoutBatchim;
  }

  // 숫자: 한국어 발음 기준 끝소리 (0영, 1일, 3삼, 6육, 7칠, 8팔 → 받침)
  if (last >= '0' && last <= '9') {
    return '013678'.includes(last) ? withBatchim : withoutBatchim;
  }

  // 영문: 모음(aeiouy)으로 끝나면 받침 없음으로 간주
  const lower = last.toLowerCase();
  if ('aeiouy'.includes(lower)) return withoutBatchim;
  return withBatchim;
}

export const eulReul = (word) => josa(word, '을', '를');
export const iGa = (word) => josa(word, '이', '가');
export const eunNeun = (word) => josa(word, '은', '는');
