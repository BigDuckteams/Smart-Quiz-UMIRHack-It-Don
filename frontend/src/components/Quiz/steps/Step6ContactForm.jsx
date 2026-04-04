export default function Step6ContactForm({ form, setField }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5">Контактные данные</h2>
      <div className="space-y-3">
        <input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Имя (необязательно)" className="w-full rounded-2xl bg-white/5 border border-white/20 p-3" />
        <input value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="Телефон *" className="w-full rounded-2xl bg-white/5 border border-white/20 p-3" />
        <input value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="Email (необязательно)" className="w-full rounded-2xl bg-white/5 border border-white/20 p-3" />
        <textarea value={form.comment} onChange={(e) => setField('comment', e.target.value)} placeholder="Комментарий" rows={4} className="w-full rounded-2xl bg-white/5 border border-white/20 p-3" />

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.consent} onChange={(e) => setField('consent', e.target.checked)} />
          Я согласен на обработку персональных данных
        </label>
      </div>
    </div>
  );
}
