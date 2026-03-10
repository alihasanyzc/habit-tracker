import { useAppTheme } from '../providers/ThemeProvider';

export const ACCENT = {
  white: '#FFFFFF',
  orange: '#FF8A1F',
  orangeDark: '#E06B00',
  orangeLight: '#FFC58A',
  orangeBg: '#FFF4EA',
  green: '#8FB339',
  brown: '#A35414',
  pink: '#E78AC3',
  purple: '#7B6FCF',
  purpleLight: '#F0EFF9',
  red: '#E85A4F',
  redLight: '#FFF0EE',
};

export const LIGHT_COLORS = {
  ...ACCENT,
  screen: '#FFFDFC',
  bg: '#F6EFEA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceAlt: '#F5F5F5',
  text: '#1F1F1F',
  muted: '#7A7A7A',
  border: '#E6E6E6',
  tabBg: '#EFE5DD',
  dot: '#EFE5DD',
  handle: '#DEDEDE',
  overlay: 'rgba(0,0,0,0.38)',
  calBg: '#FFF2D0',
  chevron: '#BBBBBB',
  axisTick: '#BBBBBB',
  dayMuted: '#A39590',
  shadow: '#4D2A00',
  shadowSoft: '#000000',
  ringFill: 'rgba(255,138,31,0.08)',
  translucentCard: 'rgba(255,255,255,0.55)',
  toastBorder: '#F0E3D8',
  navBg: '#FFFFFF',
  softSuccessBg: '#EEF7DF',
  softErrorBg: '#FFF0EE',
  softInfoBg: '#FFF4EA',
};

export const DARK_COLORS = {
  ...ACCENT,
  screen: '#0F0C0A',
  bg: '#16120F',
  surface: '#1F1A16',
  surfaceElevated: '#26201B',
  surfaceAlt: '#2B241F',
  text: '#F6EFEA',
  muted: '#B5ACA4',
  border: '#3A322C',
  tabBg: '#2D251F',
  dot: '#3C3129',
  handle: '#5E5147',
  overlay: 'rgba(0,0,0,0.58)',
  calBg: '#2A2118',
  chevron: '#8E8178',
  axisTick: '#8E8178',
  dayMuted: '#9B8E86',
  shadow: '#000000',
  shadowSoft: '#000000',
  ringFill: 'rgba(255,138,31,0.18)',
  translucentCard: 'rgba(255,255,255,0.08)',
  toastBorder: '#40352D',
  navBg: '#1F1A16',
  softSuccessBg: '#25311A',
  softErrorBg: '#3A201E',
  softInfoBg: '#3A2918',
};

export type AppColors = typeof LIGHT_COLORS;

export function getAppColors(scheme: 'light' | 'dark' | null | undefined): AppColors {
  return scheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

export function useAppColors(): AppColors {
  const { resolvedScheme } = useAppTheme();
  return getAppColors(resolvedScheme);
}

export function useIsDark() {
  return useAppTheme().isDark;
}

function normalizeHex(hex: string) {
  const value = hex.replace('#', '').trim();
  if (value.length === 3) {
    return value.split('').map(char => `${char}${char}`).join('');
  }
  return value;
}

export function mixHexColors(sourceHex: string, targetHex: string, amount: number) {
  const source = normalizeHex(sourceHex);
  const target = normalizeHex(targetHex);
  const mix = Math.max(0, Math.min(1, amount));

  const channel = (start: number, end: number) =>
    Math.round(start + (end - start) * mix)
      .toString(16)
      .padStart(2, '0');

  const sourceR = parseInt(source.slice(0, 2), 16);
  const sourceG = parseInt(source.slice(2, 4), 16);
  const sourceB = parseInt(source.slice(4, 6), 16);

  const targetR = parseInt(target.slice(0, 2), 16);
  const targetG = parseInt(target.slice(2, 4), 16);
  const targetB = parseInt(target.slice(4, 6), 16);

  return `#${channel(sourceR, targetR)}${channel(sourceG, targetG)}${channel(sourceB, targetB)}`;
}

export function getThemedAccentSurface(
  color: string,
  colors: AppColors,
  isDark: boolean,
  amount = 0.8
) {
  if (!isDark) return color;
  return mixHexColors(color, colors.surfaceElevated, amount);
}
