// Достаёт номер из названия лекции: «3.1 Геометрический смысл» → { num: '3.1', title: 'Геометрический смысл' }
export const splitLectureTitle = (title = '') => {
  const match = title.match(/^\s*(\d+(?:\.\d+)*)\.?\s+(.*)$/);
  return match ? { num: match[1], title: match[2] } : { num: null, title };
};

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';

export const scoreTone = (score) => (score >= 80 ? 'good' : score >= 60 ? 'mid' : 'bad');

export const plural = (n, one, few, many) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};
