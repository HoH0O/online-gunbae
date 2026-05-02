// URL 쿼리 파라미터 헬퍼.
// roomId / title 만 다루며 URL 인코딩/디코딩 책임만 진다.

export function readRoomFromURL() {
  if (typeof window === 'undefined') return { roomId: null, title: null };
  const params = new URLSearchParams(window.location.search);
  const room = params.get('room');
  const title = params.get('title');
  return {
    roomId: room ? room.toUpperCase() : null,
    title: title ? decodeURIComponent(title) : null,
  };
}

export function writeRoomToURL({ roomId, title }) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams();
  if (roomId) params.set('room', roomId);
  if (title) params.set('title', encodeURIComponent(title));
  const qs = params.toString();
  const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
  window.history.replaceState({}, '', next);
}
