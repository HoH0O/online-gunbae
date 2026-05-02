import { DRINKS, GLASSES, BACKGROUNDS } from '../config/theme';

// 데모용 간단 테마 선택 UI.
// 추후 사용자 설정 페이지로 확장하기 쉽도록 한 곳에 모아둔다.
export default function ThemePicker({ theme, onChange }) {
  const update = (patch) => onChange({ ...theme, ...patch });

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 flex-wrap justify-center px-3">
      <Select
        label="잔"
        value={theme.glass.id}
        options={Object.values(GLASSES).map((g) => ({ id: g.id, label: g.label }))}
        onChange={(id) => update({ glass: GLASSES[id] })}
      />
      <Select
        label="술"
        value={theme.drink.id}
        options={Object.values(DRINKS).map((d) => ({ id: d.id, label: d.label }))}
        onChange={(id) => update({ drink: DRINKS[id] })}
      />
      <Select
        label="배경"
        value={theme.background.id}
        options={Object.values(BACKGROUNDS).map((b) => ({ id: b.id, label: b.label }))}
        onChange={(id) => update({ background: BACKGROUNDS[id] })}
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="bg-white/10 text-white text-xs sm:text-sm rounded-full px-3 py-1.5 backdrop-blur-md border border-white/20">
      <span className="mr-2 opacity-70">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} className="text-black">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
