const KEY = 'feeling.entries.v1';
export function readEntries(storage = localStorage) {
  const raw = storage.getItem(KEY);
  if (!raw) return [];
  const entries = JSON.parse(raw);
  if (!Array.isArray(entries) || entries.some(e =>
    !e || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) ||
    !Number.isFinite(e.value) || e.value < -100 || e.value > 100 ||
    typeof e.note !== 'string'
  )) throw new Error('Invalid saved entries');
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}
export function saveEntry(entry, storage = localStorage) {
  const entries = readEntries(storage).filter(e => e.date !== entry.date);
  entries.push(entry);
  entries.sort((a, b) => b.date.localeCompare(a.date));
  storage.setItem(KEY, JSON.stringify(entries));
  return entries;
}
