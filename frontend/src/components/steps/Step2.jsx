const options = ['Кухня', 'Гостиная', 'Спальня', 'Детская', 'Санузел', 'Прихожая', 'Кабинет', 'Гардеробная', 'Балкон / лоджия', 'Полностью всё помещение'];

export default function Step2({ values, onToggle }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const active = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`rounded-2xl border p-4 text-left transition hover:scale-[1.01] ${
              active ? 'border-violet-300 bg-violet-200/20 shadow-xl' : 'border-white/20 bg-white/5 hover:bg-white/10'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
