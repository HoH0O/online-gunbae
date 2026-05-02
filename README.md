# 🥂 온라인 건배 (Online Gunbae)

혼술하는 사람들을 위한 '온라인 짠' 데모. 핸드폰을 부딪히는 동작을 가속도 센서로 감지해 건배 애니메이션을 재생하고, 같은 링크에 들어온 사람들끼리 실시간으로 짠을 공유한다.

## 빠른 시작

```bash
npm install
cp .env.example .env.local   # Supabase 키 입력
npm run dev
```

`.env.local` 을 비워둬도 단일 사용자 모드(룸 비활성)로 동작한다.

## Supabase Realtime 설정 (룸 기능)

1. https://supabase.com/dashboard 가입 → **New project** (무료 플랜)
2. 프로젝트 생성 후 **Settings → API** 에서 두 값 복사
   - `Project URL` → `VITE_SUPABASE_URL`
   - `Project API Keys → anon public` → `VITE_SUPABASE_ANON_KEY`
3. `.env.local` 에 붙여넣기 (DB 테이블 생성 불필요 — Broadcast 만 사용)
4. Vercel 배포 시: **Project → Settings → Environment Variables** 에 동일하게 등록 후 재배포

## 디렉토리 구조

```
src/
├── config/theme.js          # 모든 조정 가능 값 (테마 / 임계값 / 메시지)
├── core/
│   ├── eventBus.js          # pub/sub - 트리거와 UI 분리
│   ├── cheersTrigger.js     # 건배 트리거 진입점 (로컬/원격 공용)
│   └── realtime.js          # Supabase Realtime 연결 (룸 브로드캐스트 + presence)
├── hooks/
│   ├── useMotionSensor.js   # DeviceMotionEvent 구독, 충격 감지만 담당
│   ├── useCheers.js         # 건배 이벤트 구독 → 활성 상태 관리
│   └── useRoom.js           # URL ?room= 파라미터 처리, Supabase 룸 참여
└── components/
    ├── Glass.jsx
    ├── CheersPopup.jsx
    ├── PermissionGate.jsx
    ├── ThemePicker.jsx
    └── RoomBar.jsx          # 룸 코드 + 인원 + 공유 버튼
```

## 멀티플레이 동작 흐름

```
첫 접속 → 룸코드 자동 생성, URL 에 ?room=XXXXXX 추가
방장이 RoomBar [공유] 버튼으로 링크 전송
참가자가 링크 클릭 → 같은 channel('gunbae:XXXXXX') 구독
누군가 짠 → triggerCheers('local') → eventBus → realtime 이 broadcast
다른 참가자 → broadcast 수신 → triggerCheers('remote') → 동일 애니메이션 재생
```

이벤트 트리거(`triggerCheers`)와 UI 렌더(`useCheers`)가 분리돼있어 로컬/원격이 같은 경로로 동일하게 처리된다.
