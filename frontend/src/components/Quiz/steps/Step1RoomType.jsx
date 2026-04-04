const options = ['Квартира', 'Частный дом', 'Офис', 'Коммерческое помещение', 'Студия / апартаменты', 'Другое'];

export default function Step1RoomType({ value, onSelect }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">Какое помещение вы планируете оформить?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
