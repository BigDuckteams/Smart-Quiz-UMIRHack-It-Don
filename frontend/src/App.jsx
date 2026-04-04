import { Link, Navigate, Route, Routes } from 'react-router-dom';
import QuizContainer from './components/QuizContainer';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import { hasAdminToken, setAdminToken } from './services/api';

function Shell({ children }) {
  const isAdmin = hasAdminToken();

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 md:py-10">
      <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-20 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />

      <header className="relative mx-auto mb-8 flex w-full max-w-4xl items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-300" />
          <h1 className="text-sm font-semibold tracking-[0.12em] uppercase mx-auto w-fit rounded-full border text-x border-white/20 bg-white/10 px-4 text-cyan-200">Smart Quiz</h1>
        </div>
        <nav className="flex items-center gap-2">
          <Link className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10" to="*">Главная</Link>
          <Link className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10" to="/analytics">Для разработчиков</Link>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setAdminToken('')}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-slate-100 hover:bg-white/10"
            >
              Выйти
            </button>
          ) : null}
        </nav>
      </header>



      <div className="relative mx-auto max-w-4xl">{children}</div>
    </main>
  );
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<QuizContainer />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}
