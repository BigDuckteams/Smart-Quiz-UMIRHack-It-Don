export default function Step3({ value, onChange }) {
  return (
    <div>
      <p className="mb-3 text-lg text-cyan-200">Площадь: {value} м²</p>
      <input
        type="range"
        min="20"
        max="300"
        step="5"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/30"
      />
      <div className="mt-2 flex justify-between text-xs text-slate-300">
        <span>20 м²</span>
        <span>300 м²</span>
      </div>
    </div>
  );
}
