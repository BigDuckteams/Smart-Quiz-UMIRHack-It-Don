const phoneRegex = /^\d{11}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(step, form) {
  if (step === 1 && !form.room_type) return 'Выберите тип помещения';
  if (step === 2 && form.zones.length < 1) return 'Выберите минимум одну зону';
  if (step === 4 && !form.style) return 'Выберите стиль';
  if (step === 5 && !form.budget) return 'Выберите бюджет';

  if (step === 6) {
    if (!form.phone.trim()) return 'Телефон обязателен';
    if (!phoneRegex.test(form.phone.trim())) return 'Введите корректный телефон';
    if (form.email.trim() && !emailRegex.test(form.email.trim())) return 'Введите корректный email';
    if (!form.consent) return 'Необходимо согласие на обработку данных';
  }

  return '';
}
