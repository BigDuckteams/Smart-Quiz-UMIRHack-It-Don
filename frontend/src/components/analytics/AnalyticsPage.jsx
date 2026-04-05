import { useEffect, useMemo, useRef, useState } from 'react';
import { adminLogin, adminLogout, adminMe, fetchAnalytics, fetchSubmissions, hasAdminToken } from '../../services/api';

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
      <p className="text-sm text-slate-300">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function AdminLoginForm({ onSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      await adminLogin(username, password);
      onSuccess();
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
      <h2 className="mb-1 text-2xl font-semibold">Панель администратора</h2>
      <p className="mb-2 text-sm text-slate-300">Войдите, чтобы смотреть все заявки и статистику.</p>
      <div className="space-y-3">
        <input className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Логин администратора" />
        <input type="password" className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль администратора" />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button type="button" onClick={submit} className="w-full rounded-xl bg-indigo-500 px-4 py-2 font-semibold" disabled={loading}>
          {loading ? 'Вход...' : 'Войти в admin'}
        </button>
      </div>
    </section>
  );
}

function downloadCsv(rows) {
  const headers = ['id', 'имя', 'телефон', 'email', 'тип помещения', 'зоны', 'площадь', 'стиль интерьера', 'бюджет', 'комментарий пользователя', 'utm_source', 'created_at'];
  const csv = [headers.join(';')]
    .concat(
      rows.map((r) =>
        [
          r.id,
          r.name,
          r.phone,
          r.email,
          r.room_type,
          Array.isArray(r.zones) ? r.zones.join(', ') : '',
          r.area,
          r.style,
          r.budget,
          (r.comment || '').replaceAll(';', ','),
          r.utm_source,
          r.created_at,
        ]
          .map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`)
          .join(';'),
      ),
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `smart-quiz-submissions-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const [authorized, setAuthorized] = useState(hasAdminToken());
  const [adminName, setAdminName] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ name: '', phone: '', email: '', query: '' });

  const roomChartRef = useRef(null);
  const styleChartRef = useRef(null);
  const budgetChartRef = useRef(null);
  const chartInstances = useRef([]);

  const loadData = async (nextFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const [meData, analyticsData, submissionsData] = await Promise.all([
        adminMe(),
        fetchAnalytics(),
        fetchSubmissions({ ...nextFilters, limit: 150 }),
      ]);
      setAdminName(meData?.admin?.username || 'admin');
      setAnalytics(analyticsData);
      setSubmissions(submissionsData);
    } catch {
      setError('Сессия истекла или нет доступа. Авторизуйтесь снова.');
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) loadData();
    else setLoading(false);
  }, [authorized]);

  useEffect(() => {
    if (!authorized || !analytics || !window.Chart) return;
    chartInstances.current.forEach((chart) => chart.destroy());
    chartInstances.current = [];

    const createChart = (canvasRef, label, data, color) => {
      if (!canvasRef.current) return;
      const chart = new window.Chart(canvasRef.current, {
        type: 'doughnut',
        data: { labels: data.map((item) => item[label]), datasets: [{ data: data.map((item) => item.c), backgroundColor: color }] },
        options: { plugins: { legend: { labels: { color: '#e2e8f0' } } } },
      });
      chartInstances.current.push(chart);
    };

    createChart(roomChartRef, 'room_type', analytics.room_type_distribution, ['#22d3ee', '#818cf8', '#34d399', '#a78bfa', '#f472b6', '#fbbf24']);
    createChart(styleChartRef, 'style', analytics.style_distribution, ['#38bdf8', '#6366f1', '#f472b6', '#fb7185', '#2dd4bf', '#facc15', '#94a3b8']);
    createChart(budgetChartRef, 'budget', analytics.budget_distribution, ['#4ade80', '#0ea5e9', '#8b5cf6', '#f97316', '#eab308']);

    return () => chartInstances.current.forEach((chart) => chart.destroy());
  }, [analytics, authorized]);

  const onChange = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));
  const filteredCount = useMemo(() => submissions.length, [submissions]);

  if (!authorized) return <AdminLoginForm onSuccess={() => setAuthorized(true)} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl">
        <p className="text-sm text-slate-200">Вы вошли как <span className="font-semibold">{adminName}</span></p>
        <div className="flex gap-2">
          <button className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10" onClick={() => downloadCsv(submissions)} type="button">Экспорт CSV</button>
          <button
            type="button"
            onClick={async () => {
              await adminLogout();
              setAuthorized(false);
            }}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Всего заявок" value={analytics?.total ?? '—'} />
        <StatCard title="Заявок по фильтру" value={filteredCount} />
        <button type="button" onClick={() => loadData(filters)} className="rounded-2xl border border-white/20 bg-white/10 p-5 text-left shadow-xl hover:bg-white/15">
          <p className="text-sm text-slate-300">Обновление</p>
          <p className="mt-2 text-xl font-semibold">Перезагрузить данные</p>
        </button>
      </div>

      <section className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl sm:p-6">
        <h2 className="mb-4 text-xl font-semibold">Поиск по заявкам</h2>
        <div className="grid gap-3 md:grid-cols-5">
          <input className="rounded-xl border border-white/20 bg-white/10 px-3 py-2" placeholder="Имя" value={filters.name} onChange={(e) => onChange('name', e.target.value)} />
          <input className="rounded-xl border border-white/20 bg-white/10 px-3 py-2" placeholder="Телефон" value={filters.phone} onChange={(e) => onChange('phone', e.target.value)} />
          <input className="rounded-xl border border-white/20 bg-white/10 px-3 py-2" placeholder="Email" value={filters.email} onChange={(e) => onChange('email', e.target.value)} />
          <input className="rounded-xl border border-white/20 bg-white/10 px-3 py-2" placeholder="Общий поиск" value={filters.query} onChange={(e) => onChange('query', e.target.value)} />
          <button className="rounded-xl bg-indigo-500 px-4 py-2 font-medium" onClick={() => loadData(filters)} type="button">Найти</button>
        </div>
      </section>

      {error ? <div className="rounded-xl border border-rose-300/40 bg-rose-300/10 px-3 py-2">{error}</div> : null}
      {loading ? <div className="h-28 animate-pulse rounded-2xl bg-white/10" /> : null}

      {!loading && analytics ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl"><canvas ref={roomChartRef} /></div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl"><canvas ref={styleChartRef} /></div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl"><canvas ref={budgetChartRef} /></div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/10 text-left text-slate-300">
              <tr>
                <th className="px-4 py-3">Имя</th><th className="px-4 py-3">Телефон</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Помещение</th><th className="px-4 py-3">Зоны</th><th className="px-4 py-3">Площадь</th><th className="px-4 py-3">Стиль</th><th className="px-4 py-3">Бюджет</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((item) => (
                <tr key={item.id} className="border-t border-white/10 align-top">
                  <td className="px-4 py-3">{item.name || '—'}</td>
                  <td className="px-4 py-3">{item.phone}</td>
                  <td className="px-4 py-3">{item.email || '—'}</td>
                  <td className="px-4 py-3">{item.room_type}</td>
                  <td className="px-4 py-3">{Array.isArray(item.zones) ? item.zones.join(', ') : '—'}</td>
                  <td className="px-4 py-3">{item.area} м²</td>
                  <td className="px-4 py-3">{item.style}</td>
                  <td className="px-4 py-3">{item.budget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
