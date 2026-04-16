/** Format a number as MXN currency */
export const currency = (n = 0, locale = 'es-MX', cur = 'MXN') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n);

/** Format ISO date string → "15 abr 2026" */
export const shortDate = (d) =>
  new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

/** Capitalize first letter */
export const capitalize = (s = '') => s.charAt(0).toUpperCase() + s.slice(1);

/** Return CSS color class per category */
export const categoryColor = (cat) => ({
  housing:       '#5e5ce6',
  food:          '#30b0c7',
  transport:     '#32ade6',
  health:        '#34c759',
  entertainment: '#ff9f0a',
  education:     '#bf5af2',
  clothing:      '#ff6b81',
  utilities:     '#8e8e93',
  savings:       '#30d158',
  other:         '#ff3b30',
}[cat] || '#8e8e93');

/** Category label in Spanish */
export const categoryLabel = (cat) => ({
  housing:       'Vivienda',
  food:          'Alimentación',
  transport:     'Transporte',
  health:        'Salud',
  entertainment: 'Ocio',
  education:     'Educación',
  clothing:      'Ropa',
  utilities:     'Servicios',
  savings:       'Ahorro',
  other:         'Otros',
}[cat] || cat);

/** Income source label */
export const sourceLabel = (src) => ({
  salary:     'Salario',
  freelance:  'Freelance',
  investment: 'Inversión',
  rental:     'Renta',
  gift:       'Regalo',
  other:      'Otro',
}[src] || src);
