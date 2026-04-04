export default function ProgressBar({ step, totalSteps }) {
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
        <span>Шаг {step} из {totalSteps}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
