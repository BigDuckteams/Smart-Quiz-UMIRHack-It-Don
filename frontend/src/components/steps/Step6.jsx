export default function Step6({ form, setField }) {
  const inputClass =
    'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:border-cyan-300 focus:outline-none';

  return (
    <div className="space-y-4">
      <input className={inputClass} placeholder="Имя" value={form.name} onChange={(e) => setField('name', e.target.value)} />
      <input className={inputClass} placeholder="Телефон *" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
      <input className={inputClass} placeholder="Email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
      <textarea className={inputClass} rows="4" placeholder="Комментарий" value={form.comment} onChange={(e) => setField('comment', e.target.value)} />
      <label className="flex items-start gap-3 text-sm text-slate-200">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setField('consent', e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-white/40 bg-white/10"
        />
        Я согласен на обработку персональных данных
      </label>
    </div>
  );
}
