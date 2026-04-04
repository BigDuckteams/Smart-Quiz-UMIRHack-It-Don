import { useState } from 'react';

const options = [
  { label: 'Пока не определился', image: './images/undecided.svg' },
  { label: 'Современный', image: '/images/modern.jpg' },
  { label: 'Минимализм', image: '/images/minimalism.jpg' },
  { label: 'Скандинавский', image: '/images/scandi.jpg' },
  { label: 'Лофт', image: '/images/loft.jpg' },
  { label: 'Неоклассика', image: '/images/neoclassic.jpg' },
  { label: 'Классика', image: './images/classic.jpg' }
];

export default function Step4({ value, onSelect }) {
  const [preview, setPreview] = useState(options[0].image);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/10">
        <img src={preview} alt="Превью стиля" className="h-96 w-full object-cover" loading="lazy" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onMouseEnter={() => setPreview(option.image)}
            onFocus={() => setPreview(option.image)}
            onClick={() => onSelect(option.label)}
            className={`rounded-2xl border p-4 text-left transition hover:scale-[1.01] ${value === option.label
              ? 'border-cyan-300 bg-cyan-200/20 shadow-xl'
              : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
