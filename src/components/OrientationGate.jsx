// 가로 모드(터치 기기 한정)일 때 세로 회전을 유도하는 풀스크린 오버레이.
// CSS 미디어쿼리만으로 토글 — 별도 JS 상태 불필요.
//
// 조건:
// - orientation: landscape  (가로)
// - pointer: coarse         (터치 입력 — 휴대폰/태블릿 한정, 데스크톱 가로창은 제외)

export default function OrientationGate() {
  return (
    <div className="hidden landscape:pointer-coarse:flex fixed inset-0 z-[100] bg-black flex-col items-center justify-center text-white p-6 text-center">
      <div className="text-6xl sm:text-7xl mb-8 origin-center inline-block animate-rotate-phone">
        📱
      </div>
      <h2 className="text-xl sm:text-2xl font-bold mb-2">기기를 세로로 돌려주세요</h2>
      <p className="text-white/55 text-sm">세로 모드에서만 지원해요</p>
    </div>
  );
}
