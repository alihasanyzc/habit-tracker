import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Dimensions, FlatList, Platform, Switch, PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenHeader from '../components/ScreenHeader';
import BottomSheet from '../components/BottomSheet';
import HabitIcon from '../components/HabitIcon';
import { useAppColors, useIsDark, type AppColors } from '../constants/colors';
import { HabitCard } from './HomeScreen';
import { useToast } from '../components/ToastProvider';
import type { Habit } from '../types/habit';
import { addHabit, updateHabit } from '../utils/habitRepository';
import { useLanguage } from '../providers/LanguageProvider';

const SCREEN_H = Dimensions.get('window').height;
const ICON_PICKER_GLYPH_SIZE = 20;
const ICON_GRID_COLUMNS = 6;

// ── Aktivite ikonları ───────────────────────────────────
type IconName = string;
type IconOption = {
  value: IconName;
  search: string[];
};
type IconGridItem =
  | { type: 'icon'; option: IconOption }
  | { type: 'placeholder'; key: string };

function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getSearchTokens(value: string) {
  return normalizeSearchValue(value)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

const TOKEN_TR_MAP: Record<string, string[]> = {
  account: ['hesap'],
  add: ['ekle'],
  alert: ['uyari', 'uyarı', 'alarm'],
  arrow: ['ok'],
  bag: ['canta', 'çanta'],
  ball: ['top'],
  bank: ['banka'],
  base: ['temel'],
  battery: ['pil', 'batarya'],
  beach: ['plaj'],
  bed: ['yatak'],
  bell: ['zil', 'bildirim'],
  bike: ['bisiklet'],
  book: ['kitap'],
  bottle: ['sise', 'şişe'],
  box: ['kutu'],
  brain: ['beyin', 'zeka', 'zeka'],
  briefcase: ['evrak', 'canta', 'çanta', 'is', 'iş'],
  brightness: ['parlaklik', 'parlaklık'],
  broom: ['supurge', 'süpürge'],
  brush: ['firca', 'fırça'],
  bug: ['hata', 'bocek', 'böcek'],
  bullseye: ['hedef'],
  bus: ['otobus', 'otobüs'],
  calendar: ['takvim'],
  camera: ['kamera'],
  camp: ['kamp'],
  cancel: ['iptal'],
  car: ['araba'],
  card: ['kart'],
  cash: ['nakit', 'para'],
  cat: ['kedi'],
  cell: ['hucre', 'hücre'],
  chart: ['grafik'],
  check: ['kontrol', 'onay', 'tik'],
  checkbox: ['onay kutusu'],
  chevron: ['ok'],
  circle: ['daire', 'yuvarlak'],
  city: ['sehir', 'şehir'],
  clock: ['saat'],
  close: ['kapat', 'kapatma'],
  cloud: ['bulut'],
  coffee: ['kahve'],
  cog: ['ayar'],
  compass: ['pusula'],
  content: ['icerik', 'içerik'],
  controller: ['kumanda'],
  cookie: ['kurabiye'],
  counter: ['sayac', 'sayaç'],
  credit: ['kredi'],
  crop: ['kirp', 'kırp'],
  crown: ['taç'],
  cup: ['bardak', 'kupa'],
  cursor: ['imlec', 'imleç'],
  delete: ['sil'],
  diamond: ['elmas'],
  directions: ['yon', 'yön'],
  dog: ['kopek', 'köpek'],
  door: ['kapi', 'kapı'],
  download: ['indir'],
  dumbbell: ['dambıl', 'agirlik', 'ağırlık'],
  earth: ['dunya', 'dünya'],
  email: ['eposta', 'mail'],
  eye: ['goz', 'göz'],
  face: ['yuz', 'yüz'],
  file: ['dosya'],
  filter: ['filtre'],
  fire: ['ates', 'ateş'],
  fish: ['balik', 'balık'],
  flag: ['bayrak'],
  flash: ['flaş', 'simsek', 'şimşek'],
  flask: ['sisecik', 'şişecik', 'laboratuvar'],
  flower: ['cicek', 'çiçek'],
  folder: ['klasor', 'klasör'],
  food: ['yiyecek', 'yemek'],
  football: ['futbol'],
  format: ['bicim', 'biçim'],
  gamepad: ['oyun', 'kol'],
  gift: ['hediye'],
  glass: ['bardak', 'cam'],
  globe: ['dunya', 'küre', 'dünya'],
  golf: ['golf'],
  gym: ['spor salonu'],
  hammer: ['cicek', 'çekiç'],
  hand: ['el'],
  handbag: ['canta', 'çanta'],
  heart: ['kalp'],
  help: ['yardim', 'yardım'],
  home: ['ev', 'ana sayfa'],
  hospital: ['hastane'],
  image: ['gorsel', 'görsel', 'resim'],
  information: ['bilgi'],
  key: ['anahtar'],
  keyboard: ['klavye'],
  lamp: ['lamba'],
  laptop: ['laptop', 'bilgisayar'],
  leaf: ['yaprak'],
  light: ['isik', 'ışık'],
  lightning: ['simsek', 'şimşek'],
  link: ['baglanti', 'bağlantı'],
  list: ['liste'],
  location: ['konum'],
  lock: ['kilit'],
  mail: ['posta', 'eposta'],
  map: ['harita'],
  marker: ['isaret', 'işaret'],
  medal: ['madalya'],
  menu: ['menu', 'menü'],
  message: ['mesaj'],
  microphone: ['mikrofon'],
  minus: ['eksi'],
  moon: ['ay'],
  music: ['muzik', 'müzik'],
  navigation: ['yonlendirme', 'yönlendirme'],
  note: ['not'],
  notebook: ['defter'],
  notification: ['bildirim'],
  office: ['ofis'],
  open: ['ac', 'aç'],
  outline: ['cizgi', 'çizgi', 'hat'],
  palette: ['palet', 'renk'],
  paper: ['kagit', 'kağıt'],
  pause: ['duraklat'],
  pencil: ['kalem'],
  percent: ['yuzde', 'yüzde'],
  phone: ['telefon'],
  pill: ['ilac', 'ilaç'],
  pin: ['iğne', 'igne', 'sabitle'],
  play: ['oynat'],
  plus: ['arti', 'artı'],
  pulse: ['nabiz', 'nabız'],
  racket: ['raket'],
  road: ['yol'],
  robot: ['robot'],
  rocket: ['roket'],
  room: ['oda'],
  rope: ['ip'],
  run: ['kosu', 'koşu', 'kosmak', 'koşmak'],
  save: ['kaydet'],
  scale: ['olcek', 'ölçek', 'tarti', 'tartı'],
  school: ['okul'],
  search: ['ara', 'arama'],
  send: ['gonder', 'gönder'],
  server: ['sunucu'],
  settings: ['ayarlar'],
  shape: ['sekil', 'şekil'],
  share: ['paylas', 'paylaş'],
  shield: ['kalkan'],
  shoe: ['ayakkabi', 'ayakkabı'],
  shopping: ['alisveris', 'alışveriş'],
  sign: ['isaret', 'işaret'],
  silverware: ['catal', 'çatal', 'bicak', 'bıçak'],
  sleep: ['uyku', 'uyumak'],
  snow: ['kar'],
  soccer: ['futbol'],
  sound: ['ses'],
  speaker: ['hoparlor', 'hoparlör'],
  speedometer: ['hiz gostergesi', 'hız göstergesi'],
  star: ['yildiz', 'yıldız'],
  station: ['istasyon'],
  stethoscope: ['stetoskop'],
  stop: ['dur'],
  store: ['magaza', 'mağaza'],
  subway: ['metro'],
  suitcase: ['valiz'],
  sun: ['gunes', 'güneş'],
  swim: ['yuzme', 'yüzme'],
  sync: ['senkronize'],
  table: ['masa'],
  target: ['hedef'],
  tea: ['cay', 'çay'],
  tennis: ['tenis'],
  timer: ['zamanlayici', 'zamanlayıcı'],
  tool: ['arac', 'araç'],
  tooth: ['dis', 'diş'],
  torch: ['mesale', 'meşale'],
  track: ['iz', 'takip'],
  train: ['tren'],
  trash: ['cop', 'çöp'],
  tree: ['agac', 'ağaç'],
  trophy: ['kupa', 'odul', 'ödül'],
  truck: ['kamyon'],
  umbrella: ['semsiye', 'şemsiye'],
  upload: ['yukle', 'yükle'],
  video: ['video'],
  view: ['gorunum', 'görünüm'],
  wallet: ['cuzdan', 'cüzdan'],
  walk: ['yuruyus', 'yürüyüş', 'yurumek', 'yürümek'],
  wall: ['duvar'],
  warning: ['uyari', 'uyarı'],
  water: ['su'],
  wave: ['dalga'],
  weather: ['hava'],
  weight: ['agirlik', 'ağırlık'],
  wifi: ['wifi', 'kablosuz'],
  wind: ['ruzgar', 'rüzgar'],
  window: ['pencere'],
  wrench: ['anahtar', 'tamir'],
  yoga: ['yoga'],
};

const PHRASE_TR_MAP: Record<string, string[]> = {
  'account plus': ['hesap arti', 'hesap arti'],
  'air conditioner': ['klima'],
  'arrow left': ['sol ok'],
  'arrow right': ['sag ok', 'sağ ok'],
  'arrow up': ['yukari ok', 'yukarı ok'],
  'arrow down': ['asagi ok', 'aşağı ok'],
  'baseball diamond': ['beysbol sahasi', 'beysbol elmasi'],
  'battery charging': ['sarj olan pil', 'şarj olan pil'],
  'book open': ['acik kitap', 'açık kitap'],
  'boxing glove': ['boks eldiveni'],
  'calendar check': ['takvim onay'],
  'checkbox marked': ['isaretli kutu', 'işaretli kutu'],
  'chevron left': ['sol yon', 'sol yön'],
  'chevron right': ['sag yon', 'sağ yön'],
  'close circle': ['kapat daire'],
  'coffee outline': ['kahve cizgi', 'kahve çizgi'],
  'credit card': ['kredi karti', 'kredi kartı'],
  'heart pulse': ['kalp atisi', 'kalp atışı'],
  'home outline': ['ev cizgi', 'ev çizgi'],
  'jump rope': ['ip atlama'],
  'map marker': ['harita isareti', 'harita işareti'],
  'message text': ['metin mesaji', 'metin mesajı'],
  'moon waning crescent': ['hilal', 'azalan ay'],
  'table tennis': ['masa tenisi'],
  'target variant': ['hedef cesidi', 'hedef çeşidi'],
  'timer outline': ['zamanlayici cizgi', 'zamanlayıcı çizgi'],
  'weight lifter': ['halterci', 'agirlik kaldiran', 'ağırlık kaldıran'],
};

function getAutoTranslatedTerms(iconName: string) {
  const spaced = iconName.replace(/-/g, ' ');
  const tokens = spaced.split(' ').filter(Boolean);
  const translated = new Set<string>();
  const normalizedPhrase = normalizeSearchValue(spaced);

  const exactPhraseTranslations = PHRASE_TR_MAP[normalizedPhrase] ?? [];
  exactPhraseTranslations.forEach((term) => translated.add(term));

  for (let size = Math.min(3, tokens.length); size >= 2; size -= 1) {
    for (let index = 0; index <= tokens.length - size; index += 1) {
      const phrase = normalizeSearchValue(tokens.slice(index, index + size).join(' '));
      (PHRASE_TR_MAP[phrase] ?? []).forEach((term) => translated.add(term));
    }
  }

  const translatedTokens = tokens.flatMap((token) => TOKEN_TR_MAP[normalizeSearchValue(token)] ?? []);
  translatedTokens.forEach((term) => translated.add(term));

  if (translatedTokens.length) {
    translated.add(translatedTokens.join(' '));
  }

  return Array.from(translated);
}

const GROUP_KEYWORDS = {
  sport: ['sport', 'sports', 'ball', 'team', 'oyun', 'spor'],
  cardio: ['cardio', 'run', 'walk', 'swim', 'bike', 'hareket'],
  fitness: ['fitness', 'gym', 'workout', 'exercise', 'antrenman'],
} as const;

const ICON_KEYWORD_ALIASES: Record<string, string[]> = {
  run: [...GROUP_KEYWORDS.cardio, 'jog', 'runner', 'kosu', 'koşu'],
  'run-fast': [...GROUP_KEYWORDS.cardio, 'jog', 'runner', 'kosu', 'koşu', 'hizli kosu'],
  walk: [...GROUP_KEYWORDS.cardio, 'steps', 'adim', 'adım', 'yuruyus', 'yürüyüş'],
  bike: [...GROUP_KEYWORDS.cardio, 'bicycle', 'cycling', 'bisiklet'],
  swim: [...GROUP_KEYWORDS.cardio, 'pool', 'water', 'yuzme', 'yüzme'],
  basketball: [...GROUP_KEYWORDS.sport, 'basket', 'ball', 'basketbol'],
  soccer: [...GROUP_KEYWORDS.sport, 'football', 'goal', 'futbol'],
  football: [...GROUP_KEYWORDS.sport, 'rugby', 'ball', 'amerikan futbolu'],
  tennis: [...GROUP_KEYWORDS.sport, 'racket', 'racquet', 'tenis'],
  badminton: [...GROUP_KEYWORDS.sport, 'racket', 'racquet', 'badminton'],
  cricket: [...GROUP_KEYWORDS.sport, 'bat', 'ball', 'kriket'],
  golf: [...GROUP_KEYWORDS.sport, 'club', 'ball', 'golf'],
  volleyball: [...GROUP_KEYWORDS.sport, 'voleybol'],
  baseball: [...GROUP_KEYWORDS.sport, 'beysbol'],
  'table-tennis': [...GROUP_KEYWORDS.sport, 'ping pong', 'racket', 'masa tenisi'],
  dumbbell: [...GROUP_KEYWORDS.fitness, 'weights', 'strength', 'agirlik', 'ağırlık'],
  'weight-lifter': [...GROUP_KEYWORDS.fitness, 'weights', 'strength', 'halter'],
  'arm-flex': [...GROUP_KEYWORDS.fitness, 'muscle', 'strength', 'kas'],
  yoga: [...GROUP_KEYWORDS.fitness, 'stretch', 'balance', 'yoga'],
  meditation: [...GROUP_KEYWORDS.fitness, 'mindful', 'calm', 'breath', 'meditasyon'],
  target: [...GROUP_KEYWORDS.fitness, 'goal', 'focus', 'hedef'],
  'target-variant': [...GROUP_KEYWORDS.fitness, 'goal', 'focus', 'hedef'],
  'bullseye-arrow': [...GROUP_KEYWORDS.fitness, 'goal', 'focus', 'hedef'],
  hiking: [...GROUP_KEYWORDS.cardio, 'trail', 'dag yuruyusu', 'dağ yürüyüşü'],
  rowing: [...GROUP_KEYWORDS.cardio, 'boat', 'kurek', 'kürek'],
  surfing: [...GROUP_KEYWORDS.cardio, 'wave', 'sorf'],
  snowboard: [...GROUP_KEYWORDS.cardio, 'snow', 'kar'],
  skateboarding: [...GROUP_KEYWORDS.cardio, 'skate', 'kaykay'],
  'jump-rope': [...GROUP_KEYWORDS.cardio, 'rope', 'ip atlama'],
  trophy: ['award', 'win', 'champion', 'odul', 'ödül', 'kupa'],
  medal: ['award', 'win', 'champion', 'madalya'],
  'trophy-outline': ['award', 'win', 'champion', 'odul', 'ödül', 'kupa'],
  'heart-pulse': ['health', 'pulse', 'wellness', 'saglik', 'sağlık', 'kalp'],
  pulse: ['health', 'pulse', 'wellness', 'nabiz', 'nabız'],
};

const FEATURED_ACTIVITY_ICONS = [
  'run', 'walk', 'bike', 'swim', 'dumbbell', 'yoga',
  'meditation', 'basketball', 'soccer', 'football', 'tennis', 'golf',
  'boxing-glove', 'badminton', 'volleyball', 'baseball', 'target', 'trophy',
  'medal', 'heart-pulse', 'timer-outline', 'pulse', 'hiking', 'rowing',
  'skateboarding', 'snowboard', 'surfing', 'weight-lifter', 'arm-flex', 'jump-rope',
] as const;

const ALL_MATERIAL_ICON_NAMES = Object.keys(MaterialCommunityIcons.glyphMap);

const ICONS_ACTIVITY: IconOption[] = ALL_MATERIAL_ICON_NAMES.map((value) => ({
  value,
  search: Array.from(
    new Set([
      value,
      value.replace(/-/g, ' '),
      ...value.split('-'),
      ...getAutoTranslatedTerms(value),
      ...(ICON_KEYWORD_ALIASES[value] ?? []),
    ])
  ),
}));

const FEATURED_ACTIVITY_OPTIONS: IconOption[] = FEATURED_ACTIVITY_ICONS
  .map((value) => ICONS_ACTIVITY.find((item) => item.value === value))
  .filter((item): item is IconOption => Boolean(item));
const FEATURED_ACTIVITY_SET = new Set<string>(FEATURED_ACTIVITY_ICONS);

// ── Renk listesi (Figma paleti) ────────────────────────
const COLORS = [
  '#E63956', '#9B8EC4', '#F2B5C8', '#F5D547', '#3A7C8C',
  '#1A6B6A', '#E84B8A', '#9B8DBF', '#F5ADA0', '#B3C4E8', '#7A6B9E',
  '#A0403E', '#5BAA9D', '#E8734A', '#F5B5C8', '#1A2B6B', '#C2A84D',
  '#F53D3D', '#A8295A', '#F5BA73', '#F5B81C', '#A8D8E8', '#BDE1E6',
  '#1A5C4C', '#5B9E6F', '#C2A84D', '#F5C523', '#8E9EC0', '#8BC562',
];

// Date arrays are now sourced from i18n via useLanguage()

// ── Seçilen rengi pastel arka plana dönüştür (HomeScreen pattern) ──
function lightenColor(hex: string, mix = 0.82): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const nr = Math.round(r + (255 - r) * mix);
  const ng = Math.round(g + (255 - g) * mix);
  const nb = Math.round(b + (255 - b) * mix);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

// ── Tarih formatlama ────────────────────────────────────
function formatDate(d: Date, months: string[]) {
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function isSameDay(left: Date, right: Date) {
  return left.getDate() === right.getDate()
    && left.getMonth() === right.getMonth()
    && left.getFullYear() === right.getFullYear();
}

function useThemedStyles() {
  const colors = useAppColors();
  const isDark = useIsDark();
  return useMemo(() => createStyles(colors, isDark), [colors, isDark]);
}

// ════════════════════════════════════════════════════════
// TAKVİM BOTTOM SHEET
// ════════════════════════════════════════════════════════
function CalendarSheet({ visible, selectedDate, onConfirm, onCancel }: {
  visible: boolean;
  selectedDate: Date;
  onConfirm: (d: Date) => void;
  onCancel: () => void;
}) {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const { t } = useLanguage();
  const MONTH_NAMES = t('dates.months') as unknown as string[];
  const DAY_LABELS = t('dates.weekdaysCalendar') as unknown as string[];
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  useEffect(() => {
    if (!visible) return;
    setViewDate(new Date(selectedDate));
  }, [selectedDate, visible]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { date: Date; day: number; current: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) {
    const day = prevMonthDays - firstDay + 1 + i;
    cells.push({ date: new Date(year, month - 1, day), day, current: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), day: d, current: true });
  }
  while (cells.length < 42) {
    const day = cells.length - firstDay - daysInMonth + 1;
    cells.push({ date: new Date(year, month + 1, day), day, current: false });
  }

  const isPicked = (date: Date) => isSameDay(selectedDate, date);

  const isToday = (date: Date) => isSameDay(today, date);

  return (
    <BottomSheet visible={visible} onClose={onCancel} maxHeight={SCREEN_H * 0.58}>
      <View style={styles.calendarSheetContent}>
        <View style={styles.iconSheetHeader}>
          <Text style={styles.sheetTitle}>{t('create.selectDate')}</Text>
          <TouchableOpacity
            onPress={onCancel}
            style={styles.iconSheetClose}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.calBox}>
          <View style={styles.calNavRow}>
            <TouchableOpacity
              onPress={() => setViewDate(new Date(year, month - 1, 1))}
              style={styles.calNavBtn}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="chevron-left" size={20} color={colors.orangeDark} />
            </TouchableOpacity>
            <View style={styles.calMonthBadge}>
              <Text style={styles.calMonthLabel}>
                {MONTH_NAMES[month]} {year}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setViewDate(new Date(year, month + 1, 1))}
              style={styles.calNavBtn}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.orangeDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.calDayRow}>
            {DAY_LABELS.map(d => (
              <Text key={d} style={styles.calDayLabel}>{d}</Text>
            ))}
          </View>

          <View style={styles.calGrid}>
            {cells.map((cell, idx) => {
              const picked = isPicked(cell.date);
              const todayCell = isToday(cell.date);
              return (
                <TouchableOpacity
                  key={`${cell.date.toISOString()}-${idx}`}
                  onPress={() => {
                    onConfirm(new Date(cell.date));
                  }}
                  activeOpacity={0.7}
                  style={[
                    styles.calCell,
                    !cell.current && styles.calCellOutside,
                    todayCell && styles.calCellToday,
                  ]}
                >
                  {picked ? (
                    <LinearGradient
                      pointerEvents="none"
                      colors={['#FFB347', '#FF8A1F']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.calCellPicked}
                    >
                      <Text style={[styles.calCellText, styles.calCellTextPicked]}>
                        {cell.date.getDate()}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <Text style={[
                      styles.calCellText,
                      !cell.current && styles.calCellMuted,
                      todayCell && styles.calCellTextToday,
                    ]}>
                      {cell.date.getDate()}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.calendarTodayButton}
            onPress={() => onConfirm(new Date(today))}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="calendar-today" size={16} color={colors.orangeDark} />
            <Text style={styles.calendarTodayText}>{t('create.goToToday')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}

// ════════════════════════════════════════════════════════
// İCON SEÇİCİ BOTTOM SHEET
// ════════════════════════════════════════════════════════
function IconPickerSheet({ visible, selectedIcon, onSelect, onCancel }: {
  visible: boolean;
  selectedIcon: IconName;
  onSelect: (icon: IconName) => void;
  onCancel: () => void;
}) {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const filteredList = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query.trim());
    const tokens = getSearchTokens(query);

    if (!normalizedQuery) {
      return FEATURED_ACTIVITY_OPTIONS;
    }

    const maxResults = normalizedQuery.length === 1 ? 36 : normalizedQuery.length === 2 ? 60 : 90;

    return ICONS_ACTIVITY
      .map((item) => {
        let score = FEATURED_ACTIVITY_SET.has(item.value) ? 100 : 0;
        const normalizedTerms = item.search.map((rawTerm) => normalizeSearchValue(rawTerm));

        const matchesAllTokens = tokens.every((token) =>
          normalizedTerms.some((term) => {
            if (token.length === 1) {
              return term.startsWith(token) || term.split(' ').some((part) => part.startsWith(token));
            }

            return term.includes(token) || term.split(' ').some((part) => part.startsWith(token));
          })
        );

        if (!matchesAllTokens) {
          return null;
        }

        for (const term of normalizedTerms) {
          const words = term.split(' ');

          if (term === normalizedQuery) {
            score = Math.max(score, 1000);
            continue;
          }

          if (term.startsWith(normalizedQuery)) {
            score = Math.max(score, 820);
            continue;
          }

          if (words.some((word) => word.startsWith(normalizedQuery))) {
            score = Math.max(score, 720);
            continue;
          }

          if (normalizedQuery.length >= 2 && term.includes(normalizedQuery)) {
            score = Math.max(score, 520);
          }
        }

        return score > 0 ? { item, score } : null;
      })
      .filter((entry): entry is { item: IconOption; score: number } => Boolean(entry))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (FEATURED_ACTIVITY_SET.has(left.item.value) !== FEATURED_ACTIVITY_SET.has(right.item.value)) {
          return FEATURED_ACTIVITY_SET.has(right.item.value) ? 1 : -1;
        }

        return left.item.value.localeCompare(right.item.value);
      })
      .slice(0, maxResults)
      .map((entry) => entry.item);
  }, [query]);
  const gridData = useMemo<IconGridItem[]>(() => {
    if (filteredList.length === 0) {
      return [];
    }

    const items: IconGridItem[] = filteredList.map((option) => ({ type: 'icon', option }));
    const remainder = items.length % ICON_GRID_COLUMNS;

    if (remainder === 0) {
      return items;
    }

    const missingCount = ICON_GRID_COLUMNS - remainder;
    for (let index = 0; index < missingCount; index += 1) {
      items.push({ type: 'placeholder', key: `placeholder-${index}` });
    }

    return items;
  }, [filteredList]);

  useEffect(() => {
    if (!visible) {
      setQuery('');
    }
  }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onCancel} maxHeight={SCREEN_H * 0.65}>
      <View style={styles.iconSheetBody}>
        <View style={styles.iconSheetHeader}>
          <Text style={styles.sheetTitle}>{t('create.selectIcon')}</Text>
          <TouchableOpacity
            onPress={onCancel}
            style={styles.iconSheetClose}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.iconSearchWrap}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('create.searchIcons')}
            placeholderTextColor={colors.muted}
            style={styles.iconSearchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity
              onPress={() => setQuery('')}
              style={styles.iconSearchClear}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <FlatList
          data={gridData}
          keyExtractor={(item) => item.type === 'icon' ? item.option.value : item.key}
          numColumns={ICON_GRID_COLUMNS}
          contentContainerStyle={styles.iconGridContent}
          columnWrapperStyle={styles.iconGridRow}
          ListEmptyComponent={(
            <View style={styles.iconEmptyWrap}>
              <Text style={styles.iconEmptyText}>{t('create.noIconsFound')}</Text>
            </View>
          )}
          renderItem={({ item }) => {
            if (item.type === 'placeholder') {
              return <View style={styles.iconCellPlaceholder} />;
            }

            const isSelected = selectedIcon === item.option.value;
            return (
              <TouchableOpacity
                onPress={() => onSelect(item.option.value)}
                activeOpacity={0.7}
                style={[
                  styles.iconCell,
                  isSelected
                    ? styles.iconCellSelected
                    : { backgroundColor: colors.tabBg, borderColor: 'transparent' },
                ]}
              >
                <View style={styles.iconGlyphWrap}>
                  <HabitIcon
                    icon={item.option.value}
                    size={ICON_PICKER_GLYPH_SIZE}
                    color={isSelected ? colors.white : colors.text}
                    style={styles.iconGlyph}
                  />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </BottomSheet>
  );
}

// ════════════════════════════════════════════════════════
// SPEKTRUM RENK SEÇİCİ
// ════════════════════════════════════════════════════════
const SPECTRUM_SIZE = Dimensions.get('window').width - 72;

function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const CURSOR_SIZE = 30;

function SpectrumPicker({ onColorChange, onBack }: {
  onColorChange: (c: string) => void;
  onBack: () => void;
}) {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const { t } = useLanguage();
  const [pickedColor, setPickedColor] = useState('#FF8A1F');
  const [cursorX, setCursorX] = useState(SPECTRUM_SIZE / 2);
  const [cursorY, setCursorY] = useState(SPECTRUM_SIZE / 3);

  const getColor = (x: number, y: number) => {
    const hue = (x / SPECTRUM_SIZE) * 360;
    const light = 100 - (y / SPECTRUM_SIZE) * 100;
    return hslToHex(hue, 100, Math.max(0, Math.min(100, light)));
  };

  const handleTouch = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    const cx = Math.max(0, Math.min(SPECTRUM_SIZE, locationX));
    const cy = Math.max(0, Math.min(SPECTRUM_SIZE, locationY));
    setCursorX(cx);
    setCursorY(cy);
    const c = getColor(cx, cy);
    setPickedColor(c);
    onColorChange(c);
  };

  return (
    <View style={styles.spectrumWrap}>
      {/* Geri butonu */}
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.7}
        style={styles.spectrumBackBtn}
      >
        <MaterialCommunityIcons name="arrow-left" size={18} color={colors.text} />
        <Text style={styles.spectrumBackText}>{t('create.palette')}</Text>
      </TouchableOpacity>

      <View
        style={[styles.spectrumBox, { width: SPECTRUM_SIZE, height: SPECTRUM_SIZE }]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        <LinearGradient
          colors={['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000']}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['#FFFFFF', 'transparent']}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['transparent', '#000000']}
          start={{ x: 0.5, y: 0.5 }} end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Yuvarlak cursor */}
        <View
          pointerEvents="none"
          style={[styles.spectrumCursor, {
            left: cursorX - CURSOR_SIZE / 2,
            top: cursorY - CURSOR_SIZE / 2,
            backgroundColor: pickedColor,
          }]}
        />
      </View>
    </View>
  );
}

// ════════════════════════════════════════════════════════
// RENK SEÇİCİ BOTTOM SHEET
// ════════════════════════════════════════════════════════
function ColorPickerSheet({ visible, selectedColor, onSelect, onCancel }: {
  visible: boolean;
  selectedColor: string;
  onSelect: (c: string) => void;
  onCancel: () => void;
}) {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const { t } = useLanguage();
  const [showSpectrum, setShowSpectrum] = useState(false);

  if (!visible) return null;

  const dismiss = () => {
    setShowSpectrum(false);
    onCancel();
  };

  return (
    <BottomSheet visible={visible} onClose={dismiss}>
      <View style={{ paddingBottom: 36 }}>
        {!showSpectrum && (
          <View style={styles.iconSheetHeader}>
            <Text style={styles.sheetTitle}>{t('create.selectColor')}</Text>
            <TouchableOpacity onPress={dismiss} style={styles.iconSheetClose} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={18} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        {showSpectrum ? (
          <SpectrumPicker
            onColorChange={(c) => { onSelect(c); }}
            onBack={() => setShowSpectrum(false)}
          />
        ) : (
          <View style={styles.cpGrid}>
            {COLORS.map((color, i) => {
              const picked = selectedColor === color;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => onSelect(color)}
                  activeOpacity={0.8}
                  style={styles.cpCellWrap}
                >
                  <View style={[
                    styles.cpCircle,
                    { backgroundColor: color },
                    picked && { borderWidth: 3, borderColor: colors.text },
                  ]} />
                </TouchableOpacity>
              );
            })}

            {/* Gökkuşağı — sağ alt */}
            <TouchableOpacity
              style={styles.cpCellWrap}
              activeOpacity={0.8}
              onPress={() => setShowSpectrum(true)}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FFB347', '#FFE66D', '#4EC9B0', '#74B9FF', '#A29BFE', '#FD79A8']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.cpCircle}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

// ════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════════════
export default function CreateScreen() {
  const colors = useAppColors();
  const styles = useThemedStyles();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const MONTH_NAMES = t('dates.months') as unknown as string[];
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const editingHabit: Habit | undefined = route.params?.habit;
  const isEditing = !!editingHabit;

  const [taskName, setTaskName] = useState(editingHabit?.name ?? '');
  const [selectedIcon, setSelectedIcon] = useState<IconName>(
    (editingHabit?.icon as IconName) ?? 'medal'
  );
  const [selectedColor, setSelectedColor] = useState(editingHabit?.iconColor ?? '#FF8A1F');
  const [startDate, setStartDate] = useState(
    editingHabit ? new Date(editingHabit.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState(
    editingHabit?.endDate ? new Date(editingHabit.endDate) : new Date()
  );
  const [noEndDate, setNoEndDate] = useState(editingHabit?.noEndDate ?? false);

  // Reset form when params change (navigating between create/edit)
  useEffect(() => {
    if (editingHabit) {
      setTaskName(editingHabit.name);
      setSelectedIcon((editingHabit.icon as IconName) ?? 'medal');
      setSelectedColor(editingHabit.iconColor ?? '#FF8A1F');
      setStartDate(new Date(editingHabit.startDate));
      setEndDate(editingHabit.endDate ? new Date(editingHabit.endDate) : new Date());
      setNoEndDate(editingHabit.noEndDate ?? false);
    } else {
      resetForm();
    }
  }, [editingHabit?.id]);

  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const navigateBack = () => {
    // Clear params so returning to Create tab later starts fresh
    navigation.setParams({ habit: undefined });
    if (isEditing) {
      navigation.navigate('Habit');
      return;
    }
    const parentNavigation = navigation.getParent?.();
    if (parentNavigation?.navigate) {
      parentNavigation.navigate('Home');
      return;
    }
    navigation.navigate('Home');
  };

  const resetForm = () => {
    setTaskName('');
    setSelectedIcon('medal');
    setSelectedColor('#FF8A1F');
    setStartDate(new Date());
    setEndDate(new Date());
    setNoEndDate(false);
  };

  const handleSave = async () => {
    if (!taskName.trim()) {
      showToast({
        type: 'error',
        title: t('create.nameRequired'),
        message: t('create.nameRequiredMsg'),
      });
      return;
    }
    if (!noEndDate && endDate < startDate) {
      showToast({
        type: 'error',
        title: t('create.invalidDate'),
        message: t('create.invalidDateMsg'),
      });
      return;
    }
    const trimmedName = taskName.trim();

    try {
      if (isEditing) {
        await updateHabit(editingHabit.id, {
          name: trimmedName,
          bgColor: lightenColor(selectedColor),
          icon: selectedIcon,
          iconColor: selectedColor,
          startDate: startDate.toISOString().slice(0, 10),
          endDate: noEndDate ? null : endDate.toISOString().slice(0, 10),
          noEndDate,
        });
        showToast({
          type: 'success',
          title: t('create.updated'),
          message: t('create.updatedMsg', { name: trimmedName }),
        });
      } else {
        const habit: Habit = {
          id: `habit-${Date.now()}`,
          name: trimmedName,
          completed: false,
          bgColor: lightenColor(selectedColor),
          icon: selectedIcon,
          iconColor: selectedColor,
          createdAt: new Date().toISOString(),
          startDate: startDate.toISOString().slice(0, 10),
          endDate: noEndDate ? null : endDate.toISOString().slice(0, 10),
          noEndDate,
        };
        await addHabit(habit);
        resetForm();
        showToast({
          type: 'success',
          title: t('create.saved'),
          message: t('create.savedMsg', { name: trimmedName }),
        });
      }
      navigateBack();
    } catch (error) {
      console.error('Habit save failed', error);
      showToast({
        type: 'error',
        title: t('create.saveFailed'),
        message: t('create.saveFailedMsg'),
      });
    }
  };

  const swipeBackResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dx > 20 && Math.abs(g.dy) < 20,
      onPanResponderRelease: (_, g) => {
        if (g.dx > 80 && Math.abs(g.dy) < 80) {
          navigateBack();
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...swipeBackResponder.panHandlers}>
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Başlık ──────────────────────────────────── */}
      <ScreenHeader
        title={isEditing ? t('create.editHabit') : t('create.addHabit')}
        subtitle={isEditing ? t('create.editHabitSubtitle') : t('create.addHabitSubtitle')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Önizleme (Preview) ────────────────────── */}
        <Text style={styles.sectionLabel}>{t('create.preview')}</Text>
        <View style={{ marginHorizontal: -20, marginBottom: 28 }}>
          <HabitCard
            habit={{
              id: 'preview',
              name: taskName || t('create.preview'),
              completed: false,
              bgColor: lightenColor(selectedColor),
              icon: selectedIcon,
              iconColor: selectedColor,
              createdAt: new Date().toISOString(),
              startDate: startDate.toISOString().slice(0, 10),
              endDate: noEndDate ? null : endDate.toISOString().slice(0, 10),
              noEndDate,
            }}
            onToggle={() => { }}
          />
        </View>

        {/* ── Görev Adı ─────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('create.habitName')}</Text>
        <View style={styles.card}>
          <TextInput
            value={taskName}
            onChangeText={setTaskName}
            placeholder={t('create.habitNamePlaceholder')}
            placeholderTextColor={colors.muted}
            style={styles.nameInput}
          />
        </View>

        {/* ── Görünüm (İkon & Renk) ─────────────────── */}
        <Text style={styles.sectionLabel}>{t('create.appearance')}</Text>
        <View style={styles.appearanceRow}>
          <TouchableOpacity
            style={styles.appearanceCard}
            onPress={() => setShowIconPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.rowIconWrap}>
              <MaterialCommunityIcons name="run" size={18} color={colors.orange} />
            </View>
            <Text style={styles.appearanceLabel}>{t('create.icon')}</Text>
            <HabitIcon icon={selectedIcon} size={22} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.appearanceCard}
            onPress={() => setShowColorPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.rowIconWrap}>
              <MaterialCommunityIcons name="palette-outline" size={18} color={colors.orange} />
            </View>
            <Text style={styles.appearanceLabel}>{t('create.color')}</Text>
            <View style={[styles.colorDot, { backgroundColor: selectedColor }]} />
          </TouchableOpacity>
        </View>

        {/* ── Ne Zaman ──────────────────────────────── */}
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>{t('create.when')}</Text>
          <View style={styles.noEndDateInline}>
            <Text style={[styles.noEndDateText, noEndDate && { color: colors.orange }]}>{t('create.unlimited')}</Text>
            <Switch
              value={noEndDate}
              onValueChange={setNoEndDate}
              trackColor={{ false: colors.border, true: colors.orange }}
              thumbColor={colors.white}
              style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
            />
          </View>
        </View>
        <View style={styles.card}>

          {/* Başlangıç tarihi */}
          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => setShowStartCal(true)}
            activeOpacity={0.8}
          >
            <View style={styles.cardRowLeft}>
              <View style={styles.rowIconWrap}>
                <MaterialCommunityIcons name="calendar-start-outline" size={18} color={colors.orange} />
              </View>
              <Text style={styles.cardRowLabel}>{t('create.start')}</Text>
            </View>
            <View style={styles.cardRowRight}>
              <Text style={styles.cardRowValue}>{formatDate(startDate, MONTH_NAMES)}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
            </View>
          </TouchableOpacity>

          {/* Bitiş tarihi — sadece süresiz kapalıyken */}
          {!noEndDate && (
            <>
              <View style={styles.cardDivider} />
              <TouchableOpacity
                style={styles.cardRow}
                onPress={() => setShowEndCal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.cardRowLeft}>
                  <View style={styles.rowIconWrap}>
                    <MaterialCommunityIcons name="calendar-end-outline" size={18} color={colors.red} />
                  </View>
                  <Text style={styles.cardRowLabel}>{t('create.end')}</Text>
                </View>
                <View style={styles.cardRowRight}>
                  <Text style={styles.cardRowValue}>{formatDate(endDate, MONTH_NAMES)}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Kaydet Butonu ─────────────────────────────── */}
        <View style={styles.saveWrap}>
          <TouchableOpacity activeOpacity={0.85} style={{ borderRadius: 16, overflow: 'hidden' }} onPress={handleSave}>
            <LinearGradient
              colors={['#FFA94D', '#FF8A1F']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>{isEditing ? t('common.update') : t('common.save')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>


      </ScrollView>

      {/* ── Modaller ──────────────────────────────────── */}
      <CalendarSheet
        visible={showStartCal}
        selectedDate={startDate}
        onConfirm={(d) => { setStartDate(d); setShowStartCal(false); }}
        onCancel={() => setShowStartCal(false)}
      />
      <CalendarSheet
        visible={showEndCal}
        selectedDate={endDate}
        onConfirm={(d) => { setEndDate(d); setShowEndCal(false); }}
        onCancel={() => setShowEndCal(false)}
      />
      <IconPickerSheet
        visible={showIconPicker}
        selectedIcon={selectedIcon}
        onSelect={(icon) => { setSelectedIcon(icon); setShowIconPicker(false); }}
        onCancel={() => setShowIconPicker(false)}
      />
      <ColorPickerSheet
        visible={showColorPicker}
        selectedColor={selectedColor}
        onSelect={(c) => { setSelectedColor(c); setShowColorPicker(false); }}
        onCancel={() => setShowColorPicker(false)}
      />
    </SafeAreaView>
    </View>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 24 },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.muted,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 10,
      marginLeft: 4,
    },
    sectionLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    noEndDateInline: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    noEndDateText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.muted,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      marginBottom: 28,
      overflow: 'hidden',
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowSoft,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.24 : 0.06,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      justifyContent: 'space-between',
    },
    cardRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardRowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    rowIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.orangeBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardRowLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    cardRowValue: {
      fontSize: 14,
      color: colors.muted,
    },
    cardDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: 60,
    },
    colorDot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: colors.border,
    },
    appearanceRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 28,
    },
    appearanceCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowSoft,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.24 : 0.06,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    appearanceLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    nameInput: {
      fontSize: 15,
      color: colors.text,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    cpGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 12,
    },
    cpCellWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    cpCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    spectrumWrap: {
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    spectrumBackBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 4,
      marginBottom: 8,
    },
    spectrumBackText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    spectrumBox: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    spectrumCursor: {
      position: 'absolute',
      width: CURSOR_SIZE,
      height: CURSOR_SIZE,
      borderRadius: CURSOR_SIZE / 2,
      borderWidth: 3,
      borderColor: colors.white,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowSoft,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.28 : 0.3,
          shadowRadius: 4,
        },
        android: { elevation: 6 },
      }),
    },
    saveWrap: { paddingHorizontal: 40, paddingBottom: 32, paddingTop: 8 },
    saveBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
    saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.white, letterSpacing: 0.3 },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      paddingBottom: 2,
    },
    calendarSheetContent: {
      paddingBottom: 20,
    },
    calBox: {
      marginHorizontal: 20,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    calNavRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    calNavBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: colors.orangeBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calMonthBadge: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: isDark ? colors.tabBg : '#FFF8F1',
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.orangeBg,
    },
    calMonthLabel: { fontSize: 16, fontWeight: '700', color: colors.text },
    calDayRow: { flexDirection: 'row', marginBottom: 8 },
    calDayLabel: {
      flex: 1,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: '600',
      color: colors.muted,
      paddingBottom: 4,
      textTransform: 'uppercase',
    },
    calGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: 0,
      rowGap: 6,
    },
    calCell: {
      width: `${100 / 7}%` as any,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 18,
    },
    calCellOutside: {
      opacity: 0.55,
    },
    calCellToday: {
      borderWidth: 1,
      borderColor: colors.orangeLight,
      backgroundColor: isDark ? colors.tabBg : '#FFF8F1',
    },
    calCellPicked: {
      width: '100%',
      height: '100%',
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calCellText: { fontSize: 14, fontWeight: '600', color: colors.text },
    calCellMuted: { color: colors.chevron },
    calCellTextToday: { color: colors.orangeDark },
    calCellTextPicked: { color: colors.white, fontWeight: '700' },
    calendarTodayButton: {
      marginTop: 14,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor: isDark ? colors.tabBg : '#FFF8F1',
    },
    calendarTodayText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.orangeDark,
    },
    iconSheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    iconSheetClose: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconSheetBody: {
      height: SCREEN_H * 0.65,
      paddingBottom: 32,
    },
    iconSearchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginHorizontal: 20,
      marginBottom: 14,
      paddingHorizontal: 14,
      height: 48,
      borderRadius: 16,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: isDark ? colors.border : colors.orangeBg,
    },
    iconSearchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      paddingVertical: 0,
    },
    iconSearchClear: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconGridContent: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 8,
    },
    iconGridRow: {
      gap: 8,
    },
    iconCell: {
      flex: 1,
      height: 56,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    iconCellPlaceholder: {
      flex: 1,
      height: 56,
      borderRadius: 14,
      opacity: 0,
    },
    iconCellSelected: {
      backgroundColor: colors.orange,
      borderColor: colors.orangeDark,
      ...Platform.select({
        ios: {
          shadowColor: colors.orange,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.24 : 0.18,
          shadowRadius: 8,
        },
        android: { elevation: 2 },
      }),
    },
    iconEmptyWrap: {
      paddingTop: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconEmptyText: {
      fontSize: 13,
      color: colors.muted,
    },
    iconGlyphWrap: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconGlyph: {
      width: 28,
      height: 28,
      lineHeight: 28,
      textAlign: 'center',
      includeFontPadding: false,
    },
  });
}
