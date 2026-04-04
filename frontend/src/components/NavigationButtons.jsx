export default function NavigationButtons({
  onPrev,
  onNext,
  showPrev,
  isLoading,
  canContinue,
  nextLabel,
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={!showPrev || isLoading}
        className="rounded-xl border border-white/25 px-4 py-2 text-sm text-white transition hover:scale-[1.02] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Назад
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canContinue || isLoading}
        className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Отправка...' : nextLabel}
      </button>
    </div>
  );
}
