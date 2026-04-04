const options = ['Квартира', 'Частный дом', 'Офис', 'Коммерческое помещение', 'Студия / апартаменты', 'Другое'];

export default function Step1({ value, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={`rounded-2xl border p-4 text-left transition hover:scale-[1.01] ${
            value === option
              ? 'border-cyan-300 bg-cyan-200/20 shadow-xl'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
