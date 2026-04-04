export default function ProgressBar({ progress }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-slate-300 mb-2">
        <span>Прогресс</span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-700/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
