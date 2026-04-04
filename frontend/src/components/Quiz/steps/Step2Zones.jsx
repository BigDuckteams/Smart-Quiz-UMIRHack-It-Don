const options = ['Кухня', 'Гостиная', 'Спальня', 'Детская', 'Санузел', 'Прихожая', 'Кабинет', 'Гардеробная', 'Балкон / лоджия', 'Полностью всё помещение'];

export default function Step2Zones({ values, onToggle }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">Какие зоны нужно включить в дизайн-проект?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={`rounded-2xl border p-4 text-left transition hover:scale-[1.01] ${values.includes(item) ? 'border-cyan-300 bg-cyan-400/20' : 'border-white/20 bg-white/5'}`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
