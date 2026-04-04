const options = ['До 500 000 ₽', '500 000 – 1 000 000 ₽', '1 000 000 – 2 000 000 ₽', 'От 2 000 000 ₽', 'Пока не знаю'];

export default function Step5Budget({ value, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">Какой бюджет на реализацию интерьера вы рассматриваете?</h2>
      <div className="grid grid-cols-1 gap-3">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`rounded-2xl border p-4 text-left transition hover:scale-[1.01] ${value === item ? 'border-cyan-300 bg-cyan-400/20' : 'border-white/20 bg-white/5'}`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
