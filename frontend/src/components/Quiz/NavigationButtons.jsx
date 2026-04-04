export default function NavigationButtons({ onPrev, onNext, nextLabel = 'Далее', disableNext, showPrev, loading }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {showPrev ? (
        <button
          type="button"
          onClick={onPrev}
          className="rounded-2xl bg-slate-800/70 px-5 py-3 text-slate-200 hover:scale-[1.02] transition"
        >
          Назад
        </button>
      ) : <span />}
      <button
        type="button"
        onClick={onNext}
        disabled={disableNext || loading}
        className="rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-900 shadow-xl hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Отправка...' : nextLabel}
      </button>
    </div>
  );
}
