import { useState } from 'react';
import { GLASSES_LIST, DRINK_CATEGORIES, DRINKS_BY_ID } from '../data';
import { BACKGROUNDS } from '../config/theme';

export default function ThemePicker({ theme, onChange }) {
  const update = (patch) => onChange({ ...theme, ...patch });

  return (
    <div className="space-y-6">
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

      {/* 술 — 카테고리 탭 + 스크롤 리스트 */}
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

function Chip({ active, onClick, label, swatch }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition active:scale-[0.97] text-left',
        active
          ? 'bg-yellow-300 text-black border-yellow-300 font-semibold shadow-[0_0_0_2px_rgba(253,224,71,0.25)]'
          : 'bg-white/5 text-white/85 border-white/15 hover:bg-white/10',
      ].join(' ')}
    >
      {swatch && (
        <span
          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
          style={{ backgroundColor: swatch }}
        />
      )}
      <span className="truncate">{label}</span>
    </button>
  );
}

function DrinkPicker({ selectedId, onSelect }) {
  // 선택된 술의 카테고리를 기본 탭으로 시작
  const initialCat =
    DRINK_CATEGORIES.find((c) => c.items.some((d) => d.id === selectedId))?.id ??
    DRINK_CATEGORIES[0].id;
  const [activeCat, setActiveCat] = useState(initialCat);
  const category = DRINK_CATEGORIES.find((c) => c.id === activeCat) ?? DRINK_CATEGORIES[0];

  return (
    <div>
      {/* 카테고리 탭 — 가로 스크롤 가능 */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        {DRINK_CATEGORIES.map((c) => {
          const active = c.id === activeCat;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCat(c.id)}
              className={[
                'shrink-0 px-3 py-1 rounded-full text-xs transition border',
                active
                  ? 'bg-white text-black border-white font-semibold'
                  : 'bg-white/5 text-white/70 border-white/15 hover:bg-white/10',
              ].join(' ')}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* 브랜드 리스트 — 세로 스크롤 */}
      <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
        {category.items.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelect(d.id)}
            className={[
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg border text-sm transition active:scale-[0.99] text-left',
              selectedId === d.id
                ? 'bg-yellow-300 text-black border-yellow-300 font-semibold'
                : 'bg-white/5 text-white/85 border-white/15 hover:bg-white/10',
            ].join(' ')}
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0"
              style={{ backgroundColor: d.bottleColor }}
            />
            <span className="flex-1 truncate">{d.label}</span>
            <span className="text-[10px] opacity-60 shrink-0">{d.abv}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}
