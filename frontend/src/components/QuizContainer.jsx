import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useQuizState } from '../hooks/useQuizState';
import { submitQuiz, trackEvent } from '../services/api';
import { validateStep } from '../utils/validation';
import NavigationButtons from './NavigationButtons';
import ProgressBar from './ProgressBar';
import StepCard from './StepCard';
import SuccessScreen from './SuccessScreen';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import Step6 from './steps/Step6';

const titles = {
  1: 'Какое помещение вы планируете оформить?',
  2: 'Какие зоны нужно включить в дизайн-проект?',
  3: 'Укажите примерную площадь помещения',
  4: 'Выберите стиль интерьера',
  5: 'Какой у вас бюджет?',
  6: 'Оставьте контакты для консультации',
};

function SkeletonStep() {
  return <div className="h-40 animate-pulse rounded-2xl bg-white/10" />;
}

function IntroScreen({ onStart }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 text-center">
      <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Ответьте и получите расчет</h2>
      <p className="mx-auto max-w-xl text-slate-200">
        Короткий бриф для точной консультации.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-xl transition hover:scale-[1.02]"
      >
        Начать квиз
      </button>
    </motion.div>
  );
}

export default function QuizContainer() {
  const { step, form, setField, next, prev, isSubmitting, setIsSubmitting } = useQuizState(6);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isStepLoading, setIsStepLoading] = useState(false);

  useEffect(() => {
    setError('');
  }, [step]);

  const onNext = async () => {
    const validationError = validateStep(step, form);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (step < 6) {
      trackEvent('quiz_step_change', { step_from: step, step_to: step + 1 });
      setIsStepLoading(true);
      setTimeout(() => {
        next();
        setIsStepLoading(false);
      }, 180);
      return;
    }

    setIsSubmitting(true);
    trackEvent('quiz_submit');
    try {
      await submitQuiz({
        ...form,
        page_url: window.location.href,
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || '',
        timestamp: new Date().toISOString(),
      });
      setShowSuccess(true);
      trackEvent('quiz_success');
    } catch {
      setError('Не удалось отправить заявку. Проверьте данные и попробуйте еще раз.');
      trackEvent('quiz_error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = {
    1: <Step1 value={form.room_type} onSelect={(value) => setField('room_type', value)} />,
    2: (
      <Step2
        values={form.zones}
        onToggle={(zone) =>
          setField(
            'zones',
            form.zones.includes(zone) ? form.zones.filter((item) => item !== zone) : [...form.zones, zone],
          )
        }
      />
    ),
    3: <Step3 value={form.area} onChange={(value) => setField('area', value)} />,
    4: <Step4 value={form.style} onSelect={(value) => setField('style', value)} />,
    5: <Step5 value={form.budget} onSelect={(value) => setField('budget', value)} />,
    6: <Step6 form={form} setField={setField} />,
  };

  if (showSuccess) return <SuccessScreen />;

  if (step === 0) {
    return (
      <StepCard title=" " subtitle=" ">
        <IntroScreen
          onStart={() => {
            trackEvent('quiz_start');
            next();
          }}
        />
      </StepCard>
    );
  }

  return (
    <StepCard title={titles[step]} subtitle="Премиальный smart quiz для подбора дизайн-проекта.">
      <ProgressBar step={step} totalSteps={6} />
      {isStepLoading ? (
        <SkeletonStep />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.25 }}
          >
            {renderStep[step]}
          </motion.div>
        </AnimatePresence>
      )}

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-300/40 bg-rose-300/10 px-3 py-2 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <NavigationButtons
        showPrev={step > 1}
        onPrev={() => {
          if (step === 1 || isSubmitting) return;
          trackEvent('quiz_step_change', { step_from: step, step_to: step - 1 });
          prev();
          setError('');
        }}
        onNext={onNext}
        canContinue={!isSubmitting}
        isLoading={isSubmitting}
        nextLabel={step === 6 ? 'Получить консультацию' : 'Далее'}
      />
    </StepCard>
  );
}
