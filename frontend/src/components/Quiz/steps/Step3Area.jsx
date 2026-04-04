export default function Step3Area({ value, onChange }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">Укажите примерную площадь помещения</h2>
      <div className="text-lg mb-5">Площадь: <b>{value} м²</b></div>
      <input
        type="range"
        min={20}
        max={300}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-400"
      />
    </div>
  );
}
