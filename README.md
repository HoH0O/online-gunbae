# 🥂 온라인 건배 (Online Gunbae)

혼술하는 사람들을 위한 '온라인 짠' 데모. 핸드폰을 부딪히는 동작을 가속도 센서로 감지해 건배 애니메이션을 재생한다.

## 빠른 시작

```bash
npm install
npm run dev
```

iOS Safari 에서는 `https` 이거나 `localhost` 여야 모션 센서 권한 요청이 가능하다. Vercel 배포 후 모바일에서 테스트하는 걸 추천.

## 디렉토리 구조

```
src/
├── config/theme.js          # 모든 조정 가능 값 (테마 / 임계값 / 메시지)
├── core/
│   ├── eventBus.js          # pub/sub - 트리거와 UI 분리
│   └── cheersTrigger.js     # 건배 트리거 진입점 (로컬/원격 공용)
├── hooks/
│   ├── useMotionSensor.js   # DeviceMotionEvent 구독, 충격 감지만 담당
│   └── useCheers.js         # 건배 이벤트 구독 → 활성 상태 관리
└── components/
    ├── Glass.jsx            # SVG 술잔 (모양 / 색 / 액체 레벨 prop)
    ├── CheersPopup.jsx      # "건배!" 팝업 + 파티클
    ├── PermissionGate.jsx   # iOS 13+ 권한 요청
    └── ThemePicker.jsx      # 잔/술/배경 변경 UI
```
