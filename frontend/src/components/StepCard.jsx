export default function StepCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl sm:p-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-200">Smart Quiz</p>
      <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-slate-200">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
