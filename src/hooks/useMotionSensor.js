import { useEffect, useRef, useState } from 'react';
import { MOTION_CONFIG } from '../config/theme';

/**
 * DeviceMotionEvent 를 구독해 충격(짠)을 감지한다.
 * 감지 자체만 책임지고, 트리거 후 동작은 상위 onShake 콜백에 위임한다.
 *
 * @param {object} opts
 * @param {boolean} opts.enabled - 권한 획득 후 true 로 켠다
 * @param {(info: {delta:number, magnitude:number}) => void} opts.onShake
 * @param {number} [opts.threshold]
 * @param {number} [opts.cooldownMs]
 */
export function useMotionSensor({
  enabled,
  onShake,
  threshold = MOTION_CONFIG.SHAKE_THRESHOLD,
  cooldownMs = MOTION_CONFIG.COOLDOWN_MS,
}) {
  const lastTriggerRef = useRef(0);
  const lastMagRef = useRef(0);
  const smoothedRef = useRef(0);
  const [latest, setLatest] = useState({ delta: 0, magnitude: 0 });

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;
    if (!('DeviceMotionEvent' in window)) return;

    const handler = (e) => {
      const a = e.accelerationIncludingGravity || e.acceleration;
      if (!a || a.x == null) return;
      const magnitude = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);

      // 노이즈 완화용 EMA
      const smoothing = MOTION_CONFIG.SAMPLE_SMOOTHING;
      smoothedRef.current = smoothedRef.current * smoothing + magnitude * (1 - smoothing);

      const delta = Math.abs(magnitude - lastMagRef.current);
      lastMagRef.current = magnitude;
      setLatest({ delta, magnitude });

      const now = Date.now();
      if (delta > threshold && now - lastTriggerRef.current > cooldownMs) {
        lastTriggerRef.current = now;
        onShake?.({ delta, magnitude });
      }
    };

    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [enabled, onShake, threshold, cooldownMs]);

  return latest; // 디버깅/UI 표시 용도
}

/**
 * iOS 13+ 에서는 DeviceMotionEvent.requestPermission() 을 호출해야 센서를 받을 수 있다.
 * 안드로이드 / 데스크톱에선 함수가 없으므로 즉시 granted 처리.
 */
export async function requestMotionPermission() {
  if (typeof window === 'undefined') return false;
  if (typeof DeviceMotionEvent === 'undefined') return false;
  if (typeof DeviceMotionEvent.requestPermission !== 'function') {
    return true; // iOS 외 플랫폼
  }
  try {
    const res = await DeviceMotionEvent.requestPermission();
    return res === 'granted';
  } catch (err) {
    console.warn('[motion] permission denied', err);
    return false;
  }
}
