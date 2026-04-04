import { motion } from 'framer-motion';

export default function SuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-200/30 bg-emerald-200/10 p-8 text-center shadow-xl"
    >
      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-300/30 text-2xl">✓</div>
      <h3 className="text-2xl font-semibold text-white">Заявка отправлена</h3>
      <p className="mt-2 text-slate-200">Спасибо! Мы свяжемся с вами в ближайшее время.</p>
    </motion.div>
  );
}
