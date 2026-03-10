// ── Ay isimleri ────────────────────────────────────────
export const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const DAY_LABELS = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

// ── Seçilen rengi pastel arka plana dönüştür ───────────
export function lightenColor(hex: string, mix = 0.82): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.round(r + (255 - r) * mix);
  const ng = Math.round(g + (255 - g) * mix);
  const nb = Math.round(b + (255 - b) * mix);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

// ── Tarih formatlama ────────────────────────────────────
export function formatDate(d: Date): string {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

// ── Seed'li sahte-rastgele ─────────────────────────────
export function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ── Saate göre selamlama & ikon ───────────────────────
export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: 'Günaydın', icon: 'weather-sunny', bg: '#FF8A1F', type: 'day' };
  if (hour >= 12 && hour < 17) return { greeting: 'İyi Günler', icon: 'white-balance-sunny', bg: '#F5A623', type: 'day' };
  if (hour >= 17 && hour < 21) return { greeting: 'İyi Akşamlar', icon: 'weather-sunset', bg: '#E06B00', type: 'night' };
  return { greeting: 'İyi Geceler', icon: 'weather-night', bg: '#3D5A99', type: 'night' };
}

// ── Bezier Alan Yolu (Rapor grafiği) ──────────────────
export function buildBezierPath(
  pts: { x: number; y: number }[],
  chartH: number,
): { linePath: string; areaPath: string } {
  if (pts.length < 2) return { linePath: '', areaPath: '' };
  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const cpX = (p.x + c.x) / 2;
    line += ` C ${cpX} ${p.y} ${cpX} ${c.y} ${c.x} ${c.y}`;
  }
  const last = pts[pts.length - 1];
  const first = pts[0];
  const area = `${line} L ${last.x} ${chartH} L ${first.x} ${chartH} Z`;
  return { linePath: line, areaPath: area };
}

// ── HSL → Hex (Spektrum renk seçici) ──────────────────
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
