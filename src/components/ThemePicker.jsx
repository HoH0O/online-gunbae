import { useEffect, useRef, useState } from 'react';
import { GLASSES_LIST, DRINK_CATEGORIES, DRINKS_BY_ID } from '../data';
import { BACKGROUNDS } from '../config/theme';

export default function ThemePicker({ theme, onChange }) {
  const update = (patch) => onChange({ ...theme, ...patch });

  return (
    <div className="space-y-5">
      {/* 잔 — 칩 그리드 */}
      <Section label="잔">
        <div className="grid grid-cols-2 gap-2">
          {GLASSES_LIST.map((g) => (
            <Chip
              key={g.id}
              active={theme.glass.id === g.id}
              onClick={() => update({ glass: g })}
              label={g.label}
            />
          ))}
        </div>
      </Section>

      {/* 술 — 드롭다운 (트리거 한 줄 + 클릭 시 카테고리/브랜드 패널) */}
      <Section label="술">
        <DrinkPicker
          selectedId={theme.drink.id}
          onSelect={(id) => update({ drink: DRINKS_BY_ID[id] })}
        />
      </Section>

      {/* 배경 — 칩 그리드 */}
      <Section label="배경">
        <div className="grid grid-cols-2 gap-2">
          {Object.values(BACKGROUNDS).map((b) => (
            <Chip
              key={b.id}
              active={theme.background.id === b.id}
              onClick={() => update({ background: b })}
              label={b.label}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">{label}</h3>
      {children}
    </div>
  );
}

function Chip({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-3 py-2.5 rounded-lg border text-sm transition active:scale-[0.97] text-left',
        active
          ? 'bg-yellow-300 text-black border-yellow-300 font-semibold shadow-[0_0_0_2px_rgba(253,224,71,0.25)]'
          : 'bg-white/5 text-white/85 border-white/15 hover:bg-white/10',
      ].join(' ')}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}

function DrinkPicker({ selectedId, onSelect }) {
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(
    () =>
      DRINK_CATEGORIES.find((c) => c.items.some((d) => d.id === selectedId))?.id ??
      DRINK_CATEGORIES[0].id,
  );
  const wrapperRef = useRef(null);

  // 외부 클릭 / ESC 로 닫기
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  // 선택된 술이 바뀌면 그 술의 카테고리로 활성 탭 동기화
  useEffect(() => {
    const cat = DRINK_CATEGORIES.find((c) => c.items.some((d) => d.id === selectedId));
    if (cat && cat.id !== activeCat) setActiveCat(cat.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const selected = DRINKS_BY_ID[selectedId];
  const category = DRINK_CATEGORIES.find((c) => c.id === activeCat) ?? DRINK_CATEGORIES[0];

  const handlePick = (id) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {/* 트리거 — 현재 선택 표시 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border bg-white/5 border-white/15 text-white/90 hover:bg-white/10 active:scale-[0.99] transition"
        aria-expanded={open}
      >
        <span
          className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0"
          style={{ backgroundColor: selected.bottleColor }}
        />
        <span className="flex-1 text-left text-sm truncate font-medium">{selected.label}</span>
        <span className="text-[10px] opacity-60 shrink-0">{selected.abv}%</span>
        <svg
          className={`w-4 h-4 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.5 7.5l4.5 4.5 4.5-4.5z" />
        </svg>
      </button>

      {/* 드롭다운 패널 */}
      {open && (
        <div className="absolute left-0 right-0 mt-1.5 z-30 bg-[#0d0d18]/95 backdrop-blur-md border border-white/15 rounded-lg shadow-2xl overflow-hidden">
          {/* 카테고리 탭 */}
          <div className="flex gap-1 px-2 py-2 border-b border-white/10 overflow-x-auto">
            {DRINK_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCat(c.id)}
                className={[
                  'shrink-0 px-2.5 py-1 rounded-full text-[11px] transition border',
                  c.id === activeCat
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10',
                ].join(' ')}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* 브랜드 리스트 */}
          <div className="max-h-52 overflow-y-auto py-1">
            {category.items.map((d) => {
              const active = d.id === selectedId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handlePick(d.id)}
                  className={[
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition text-left',
                    active
                      ? 'bg-yellow-300/20 text-yellow-100'
                      : 'text-white/85 hover:bg-white/10',
                  ].join(' ')}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0"
                    style={{ backgroundColor: d.bottleColor }}
                  />
                  <span className="flex-1 truncate">{d.label}</span>
                  <span className="text-[10px] opacity-60 shrink-0">{d.abv}%</span>
                  {active && <span className="text-yellow-300 ml-1 shrink-0">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
