/**
 * Builds a 'YYYY-MM-DD' date `offset` days from today.
 *
 * Demo data uses this instead of fixed calendar dates: a hardcoded date drifts
 * into the past and every product ends up reading "Scaduto", which hides the
 * expiry states the prototype is meant to show. Offsets keep the spread stable
 * on any day the prototype is opened.
 *
 * 'YYYY-MM-DD' is the shape the rest of the app expects — it is what
 * <input type="date"> reads and writes in ProductDetailModal.
 */
export const daysFromToday = (offset) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Funzione helper per calcolare i giorni alla scadenza
export const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
