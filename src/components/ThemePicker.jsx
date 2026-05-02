import { DRINKS, GLASSES, BACKGROUNDS } from '../config/theme';

// 사이드바 안에서 세로 그룹 + 가로 칩 그리드로 표시.
// 추후 항목이 늘어나도 config 사전에만 추가하면 자동 노출.
export default function ThemePicker({ theme, onChange }) {
  const update = (patch) => onChange({ ...theme, ...patch });

  return (
    <div className="space-y-5">
      <Group
        label="잔"
        options={Object.values(GLASSES)}
        selectedId={theme.glass.id}
        onSelect={(id) => update({ glass: GLASSES[id] })}
      />
      <Group
        label="술"
        options={Object.values(DRINKS).map((d) => ({ ...d, swatch: d.liquidColor }))}
        selectedId={theme.drink.id}
        onSelect={(id) => update({ drink: DRINKS[id] })}
      />
      <Group
        label="배경"
        options={Object.values(BACKGROUNDS)}
        selectedId={theme.background.id}
        onSelect={(id) => update({ background: BACKGROUNDS[id] })}
      />
    </div>
  );
}

function Group({ label, options, selectedId, onSelect }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">{label}</h3>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => {
          const active = selectedId === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelect(o.id)}
              className={[
                'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition active:scale-[0.97]',
                active
                  ? 'bg-yellow-300 text-black border-yellow-300 font-semibold shadow-[0_0_0_2px_rgba(253,224,71,0.25)]'
                  : 'bg-white/5 text-white/85 border-white/15 hover:bg-white/10',
              ].join(' ')}
            >
              {o.swatch && (
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20"
                  style={{ backgroundColor: o.swatch }}
                />
              )}
              <span className="truncate">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
