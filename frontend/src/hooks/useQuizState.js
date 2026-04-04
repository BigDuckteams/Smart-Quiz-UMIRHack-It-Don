import { useMemo, useState } from 'react';

const initialForm = {
  room_type: '',
  zones: [],
  area: 60,
  style: '',
  budget: '',
  name: '',
  phone: '',
  email: '',
  comment: '',
  consent: false,
};

export function useQuizState(totalSteps = 6) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const next = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prev = () => setStep((prev) => Math.max(prev - 1, 0));

  const progress = useMemo(() => Math.round((Math.max(step, 1) / totalSteps) * 100), [step, totalSteps]);

  return { step, form, setField, next, prev, progress, isSubmitting, setIsSubmitting };
}
