export interface Theme {
  name: string;
  label: string;
  color: string;
}

export const THEMES: Theme[] = [
  { name: 'avemujica', label: 'AM', color: '#5a8fa8' },
  { name: 'mygo', label: 'MG', color: '#ff8899' },
  { name: 'ras', label: 'RAS', color: '#7c5cfc' },
];

export function get_theme_name(): string {
  const saved = localStorage.getItem('fufu-theme');
  if (saved && THEMES.some((t) => t.name === saved)) return saved;
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr && THEMES.some((t) => t.name === attr)) return attr;
  return 'avemujica';
}

export function apply_theme(name: string) {
  document.documentElement.setAttribute('data-theme', name);
  localStorage.setItem('fufu-theme', name);
}
