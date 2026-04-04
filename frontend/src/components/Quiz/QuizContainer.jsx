import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useQuizState } from '../../hooks/useQuizState';
import { submitQuiz, trackEvent } from '../../services/api';
import { validateStep } from '../../utils/validation';
import NavigationButtons from './NavigationButtons';
import ProgressBar from './ProgressBar';
import SuccessScreen from './SuccessScreen';
import Step1RoomType from './steps/Step1RoomType';
import Step2Zones from './steps/Step2Zones';
import Step3Area from './steps/Step3Area';
import Step4Style from './steps/Step4Style';
import Step5Budget from './steps/Step5Budget';
import Step6ContactForm from './steps/Step6ContactForm';

export default function QuizContainer() {
  const { step, form, setField, next, prev, progress, loading, setLoading } = useQuizState();
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    trackEvent('quiz_start');
  }, []);

  const goNext = async () => {
    const validationError = validateStep(step, form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    if (step < 6) {
      trackEvent('quiz_step_change', { step_from: step, step_to: step + 1 });
      next();
      return;
    }

    try {
      setLoading(true);
      trackEvent('quiz_submit');
      await submitQuiz({ ...form, timestamp: new Date().toISOString(), page_url: window.location.href, utm_source: new URLSearchParams(window.location.search).get('utm_source') || '' });
      setDone(true);
      trackEvent('quiz_success');
    } catch {
      setError('Не удалось отправить заявку. Попробуйте снова.');
      trackEvent('quiz_error');
    } finally {
      setLoading(false);
    }
  };

  const toggleZone = (zone) => {
    setField('zones', form.zones.includes(zone) ? form.zones.filter((z) => z !== zone) : [...form.zones, zone]);
  };

  const content = {
    1: <Step1RoomType value={form.room_type} onSelect={(value) => setField('room_type', value)} />,
    2: <Step2Zones values={form.zones} onToggle={toggleZone} />,
    3: <Step3Area value={form.area} onChange={(value) => setField('area', value)} />,
    4: <Step4Style value={form.style} onSelect={(value) => setField('style', value)} />,
    5: <Step5Budget value={form.budget} onSelect={(value) => setField('budget', value)} />,
    6: <Step6ContactForm form={form} setField={setField} />,
  };

  return (
    <section className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-xl p-5 sm:p-8">
      {done ? (
        <SuccessScreen />
      ) : (
        <>
          <ProgressBar progress={progress} />
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }} transition={{ duration: 0.25 }}>
              {content[step]}
            </motion.div>
          </AnimatePresence>

          {error && <p className="text-rose-300 mt-4">{error}</p>}

          <NavigationButtons
            showPrev={step > 1}
            onPrev={() => {
              trackEvent('quiz_step_change', { step_from: step, step_to: step - 1 });
              prev();
            }}
            onNext={goNext}
            nextLabel={step === 6 ? 'Получить консультацию' : 'Далее'}
            loading={loading}
          />
        </>
      )}
    </section>
  );
}
