const options = ['До 500 000 ₽', '500 000 – 1 000 000 ₽', '1 000 000 – 2 000 000 ₽', 'От 2 000 000 ₽', 'Пока не знаю'];

export default function Step5({ value, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={`rounded-2xl border p-4 text-left transition hover:scale-[1.01] ${
            value === option ? 'border-cyan-300 bg-cyan-200/20 shadow-xl' : 'border-white/20 bg-white/5 hover:bg-white/10'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
