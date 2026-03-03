import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Dimensions, FlatList, Platform, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HabitCard } from './HomeScreen';

// ── Renk Paleti ────────────────────────────────────────
const C = {
  bg: '#F6EFEA',
  orange: '#FF8A1F',
  orangeDark: '#E06B00',
  red: '#E85A4F',
  redLight: '#FFF0EE',
  text: '#1F1F1F',
  muted: '#7A7A7A',
  border: '#E6E6E6',
  tabBg: '#F6EFEA',
  overlay: 'rgba(0,0,0,0.38)',
  calBg: '#FFF2D0',
  purple: '#7B6FCF',
  purpleLight: '#F0EFF9',
  handle: '#DEDEDE',
};

const SCREEN_H = Dimensions.get('window').height;

// ── Icon listeleri (MaterialCommunityIcons) ──────────────
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const ICONS_ACTIVITY: IconName[] = [
  'run', 'walk', 'bike', 'swim', 'yoga', 'dumbbell', 'basketball', 'soccer',
  'tennis', 'trophy', 'medal', 'target', 'rowing', 'ski', 'skateboarding', 'hiking',
  'golf', 'boxing-glove', 'karate', 'football', 'weight-lifter', 'fencing',
  'handball', 'surfing',
];
const ICONS_LIFESTYLE: IconName[] = [
  'book-open-variant', 'music', 'leaf', 'lightbulb', 'brain', 'pencil', 'palette',
  'guitar-acoustic', 'food-apple', 'sleep', 'flower', 'water', 'silverware-fork-knife',
  'broom', 'note-text', 'flask', 'bullseye', 'cash', 'moon-waning-crescent',
  'white-balance-sunny', 'handshake', 'heart', 'hands-pray',
];

// ── Renk listesi (Figma paleti) ────────────────────────
const COLORS = [
  '#E63956', '#9B8EC4', '#F2B5C8', '#F5D547', '#3A7C8C',
  '#1A6B6A', '#E84B8A', '#9B8DBF', '#F5ADA0', '#B3C4E8', '#7A6B9E',
  '#A0403E', '#5BAA9D', '#E8734A', '#F5B5C8', '#1A2B6B', '#C2A84D',
  '#F53D3D', '#A8295A', '#F5BA73', '#F5B81C', '#A8D8E8', '#BDE1E6',
  '#1A5C4C', '#5B9E6F', '#C2A84D', '#F5C523', '#8E9EC0', '#8BC562',
];

// ── Ay isimleri ────────────────────────────────────────
const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];
const DAY_LABELS = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'];

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
function formatDate(d: Date) {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
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
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const [pickedDate, setPickedDate] = useState(new Date(selectedDate));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean }[] = [];
  for (let i = 0; i < firstDay; i++)
    cells.push({ day: prevMonthDays - firstDay + 1 + i, current: false });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, current: true });
  while (cells.length < 42)
    cells.push({ day: cells.length - firstDay - daysInMonth + 1, current: false });

  const isPicked = (day: number, current: boolean) =>
    current && pickedDate.getDate() === day &&
    pickedDate.getMonth() === month && pickedDate.getFullYear() === year;

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel} />
      <View style={[styles.sheet, { paddingBottom: 32 }]}>
        <View style={styles.handle} />

        {/* Takvim */}
        <View style={[styles.calBox, { marginTop: 8 }]}>
          {/* Ay navigasyonu */}
          <View style={styles.calNavRow}>
            <TouchableOpacity
              onPress={() => setViewDate(new Date(year, month - 1, 1))}
              style={styles.calNavBtn}
            >
              <Text style={styles.calNavArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calMonthLabel}>
              {MONTH_NAMES[month]} {year}
            </Text>
            <TouchableOpacity
              onPress={() => setViewDate(new Date(year, month + 1, 1))}
              style={styles.calNavBtn}
            >
              <Text style={styles.calNavArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Gün etiketleri */}
          <View style={styles.calDayRow}>
            {DAY_LABELS.map(d => (
              <Text key={d} style={styles.calDayLabel}>{d}</Text>
            ))}
          </View>

          {/* Hücreler */}
          <View style={styles.calGrid}>
            {cells.map((cell, idx) => {
              const picked = isPicked(cell.day, cell.current);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    if (cell.current) setPickedDate(new Date(year, month, cell.day));
                  }}
                  activeOpacity={cell.current ? 0.7 : 1}
                  style={[styles.calCell, picked && styles.calCellPicked]}
                >
                  <Text style={[
                    styles.calCellText,
                    !cell.current && styles.calCellMuted,
                    picked && styles.calCellTextPicked,
                  ]}>
                    {cell.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Butonlar */}
        <View style={[styles.sheetBtnRow, { paddingHorizontal: 20 }]}>
          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: C.purpleLight, flex: 1 }]}
            onPress={onCancel} activeOpacity={0.8}
          >
            <Text style={[styles.cancelBtnText, { color: C.purple }]}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => onConfirm(pickedDate)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B7FD4', '#7B6FCF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.cancelBtn}
            >
              <Text style={[styles.cancelBtnText, { color: '#fff' }]}>Tamam</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
  const [tab, setTab] = useState<'activity' | 'lifestyle'>('activity');
  const list = tab === 'activity' ? ICONS_ACTIVITY : ICONS_LIFESTYLE;

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel} />
      <View style={[styles.sheet, { maxHeight: SCREEN_H * 0.65, paddingBottom: 32 }]}>
        <View style={styles.handle} />

        <View style={styles.iconSheetHeader}>
          <Text style={styles.sheetTitle}>İkon Seç</Text>
          <TouchableOpacity
            onPress={onCancel}
            style={styles.iconSheetClose}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>

        <View style={[styles.sheetBtnRow, { paddingHorizontal: 20, marginBottom: 12 }]}>
          {(['activity', 'lifestyle'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
              style={{ flex: 1 }}
            >
              {tab === t ? (
                <LinearGradient
                  colors={[C.orange, C.orange]}
                  style={styles.iconTabBtn}
                >
                  <Text style={[styles.iconTabText, { color: '#fff' }]}>
                    {t === 'activity' ? 'Aktivite' : 'Yaşam'}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={[styles.iconTabBtn, { backgroundColor: C.tabBg }]}>
                  <Text style={[styles.iconTabText, { color: C.muted }]}>
                    {t === 'activity' ? 'Aktivite' : 'Yaşam'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={list}
          keyExtractor={(item) => item}
          numColumns={5}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const isSelected = selectedIcon === item;
            return (
              <TouchableOpacity
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
                style={[
                  styles.iconCell,
                  { backgroundColor: isSelected ? C.orange : C.tabBg },
                ]}
              >
                <MaterialCommunityIcons
                  name={item}
                  size={28}
                  color={isSelected ? '#fff' : C.text}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
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
        <MaterialCommunityIcons name="arrow-left" size={18} color={C.text} />
        <Text style={styles.spectrumBackText}>Palette</Text>
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
  const [showSpectrum, setShowSpectrum] = useState(false);

  if (!visible) return null;

  const dismiss = () => {
    setShowSpectrum(false);
    onCancel();
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={dismiss}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={dismiss} />
      <View style={[styles.sheet, { paddingBottom: 36 }]}>
        <View style={styles.handle} />

        {!showSpectrum && (
          <View style={styles.iconSheetHeader}>
            <Text style={styles.sheetTitle}>Renk Seç</Text>
            <TouchableOpacity onPress={dismiss} style={styles.iconSheetClose} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={18} color={C.muted} />
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
                    picked && { borderWidth: 3, borderColor: C.text },
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
    </Modal>
  );
}

// ════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════════════
export default function CreateScreen() {
  const [taskName, setTaskName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IconName>('medal');
  const [selectedColor, setSelectedColor] = useState('#FF8A1F');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [noEndDate, setNoEndDate] = useState(false);

  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSave = () => {
    if (!taskName.trim()) {
      Alert.alert('Alışkanlık adı gerekli', 'Lütfen bir alışkanlık adı girin.');
      return;
    }
    if (!noEndDate && endDate < startDate) {
      Alert.alert('Geçersiz tarih', 'Bitiş tarihi başlangıç tarihinden önce olamaz.');
      return;
    }
    Alert.alert('Kaydedildi!', `"${taskName.trim()}" alışkanlığı oluşturuldu.`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Başlık ──────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Alışkanlık Ekle</Text>
          <Text style={styles.headerSub}>Yeni bir alışkanlık ekle</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Önizleme (Preview) ────────────────────── */}
        <Text style={styles.sectionLabel}>Önizleme</Text>
        <View style={{ marginHorizontal: -20, marginBottom: 28 }}>
          <HabitCard
            habit={{
              id: 0,
              name: taskName || 'Alışkanlık adı girin...',
              completed: false,
              bgColor: lightenColor(selectedColor),
              icon: selectedIcon,
              iconColor: selectedColor
            }}
            onToggle={() => { }}
          />
        </View>

        {/* ── Görev Adı ─────────────────────────────── */}
        <Text style={styles.sectionLabel}>Alışkanlık Adı</Text>
        <View style={styles.card}>
          <TextInput
            value={taskName}
            onChangeText={setTaskName}
            placeholder="Alışkanlık adı girin..."
            placeholderTextColor={C.muted}
            style={styles.nameInput}
          />
        </View>

        {/* ── Görünüm (İkon & Renk) ─────────────────── */}
        <Text style={styles.sectionLabel}>Görünüm</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => setShowIconPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.cardRowLeft}>
              <View style={styles.rowIconWrap}>
                <MaterialCommunityIcons name="emoticon-outline" size={18} color={C.orange} />
              </View>
              <Text style={styles.cardRowLabel}>İkon</Text>
            </View>
            <View style={styles.cardRowRight}>
              <MaterialCommunityIcons name={selectedIcon} size={22} color={C.text} />
              <MaterialCommunityIcons name="chevron-right" size={20} color={C.muted} />
            </View>
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => setShowColorPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.cardRowLeft}>
              <View style={styles.rowIconWrap}>
                <MaterialCommunityIcons name="palette-outline" size={18} color={C.orange} />
              </View>
              <Text style={styles.cardRowLabel}>Renk</Text>
            </View>
            <View style={styles.cardRowRight}>
              <View style={[styles.colorDot, { backgroundColor: selectedColor }]} />
              <MaterialCommunityIcons name="chevron-right" size={20} color={C.muted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Ne Zaman ──────────────────────────────── */}
        <View style={styles.sectionLabelRow}>
          <Text style={styles.sectionLabel}>Ne Zaman</Text>
          <View style={styles.noEndDateInline}>
            <Text style={[styles.noEndDateText, noEndDate && { color: C.orange }]}>Süresiz</Text>
            <Switch
              value={noEndDate}
              onValueChange={setNoEndDate}
              trackColor={{ false: C.border, true: C.orange }}
              thumbColor="#fff"
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
                <MaterialCommunityIcons name="calendar-start-outline" size={18} color={C.orange} />
              </View>
              <Text style={styles.cardRowLabel}>Başlangıç</Text>
            </View>
            <View style={styles.cardRowRight}>
              <Text style={styles.cardRowValue}>{formatDate(startDate)}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={C.muted} />
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
                    <MaterialCommunityIcons name="calendar-end-outline" size={18} color={C.red} />
                  </View>
                  <Text style={styles.cardRowLabel}>Bitiş</Text>
                </View>
                <View style={styles.cardRowRight}>
                  <Text style={styles.cardRowValue}>{formatDate(endDate)}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={C.muted} />
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
              <Text style={styles.saveBtnText}>Kaydet</Text>
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
        onSelect={(c) => { setSelectedColor(c); }}
        onCancel={() => setShowColorPicker(false)}
      />
    </SafeAreaView>
  );
}

// ── Stiller ────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: C.text, lineHeight: 30 },
  headerSub: { fontSize: 13, color: C.muted, marginTop: 3 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.muted,
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
    color: C.muted,
  },

  // Kart container
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },

  // Kart satırı
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
    backgroundColor: '#FFF4E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
  },
  cardRowValue: {
    fontSize: 14,
    color: C.muted,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
    marginLeft: 60,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },

  // Görev adı input
  nameInput: {
    fontSize: 15, color: C.text,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  // Renk seçici modal grid
  cpGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16, paddingBottom: 8,
    gap: 12,
  },
  cpCellWrap: {
    alignItems: 'center', justifyContent: 'center',
  },
  cpCircle: {
    width: 48, height: 48, borderRadius: 24,
  },

  // Spektrum
  spectrumWrap: {
    alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16,
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
    color: C.text,
  },
  spectrumBox: {
    borderRadius: 16, overflow: 'hidden',
  },
  spectrumCursor: {
    position: 'absolute',
    width: CURSOR_SIZE, height: CURSOR_SIZE, borderRadius: CURSOR_SIZE / 2,
    borderWidth: 3, borderColor: '#FFFFFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
      android: { elevation: 6 },
    }),
  },

  // Kaydet
  saveWrap: { paddingHorizontal: 40, paddingBottom: 32, paddingTop: 8 },
  saveBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  // Ortak overlay
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: C.overlay,
  },

  // Bottom sheet
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingBottom: 36,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 20 },
    }),
  },
  handle: {
    width: 40, height: 4, borderRadius: 100,
    backgroundColor: C.handle, alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },

  sheetBtnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 15,
    backgroundColor: '#F4F4F4', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: C.text },

  // Takvim
  sheetTitle: {
    fontSize: 18, fontWeight: '700', color: C.text,
    textAlign: 'center', paddingTop: 16, paddingBottom: 4,
  },
  calBox: {
    margin: 20, backgroundColor: C.calBg,
    borderRadius: 18, padding: 16,
  },
  calNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  calNavBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  calNavArrow: { fontSize: 22, color: C.text },
  calMonthLabel: { fontSize: 16, fontWeight: '700', color: C.text },
  calDayRow: { flexDirection: 'row', marginBottom: 6 },
  calDayLabel: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '600', color: '#9A9A9A', paddingBottom: 6 },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 100,
  },
  calCellPicked: { backgroundColor: C.purple },
  calCellText: { fontSize: 14, fontWeight: '500', color: C.text },
  calCellMuted: { color: '#D0D0D0' },
  calCellTextPicked: { color: '#fff', fontWeight: '700' },

  // Icon picker
  iconSheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  iconSheetClose: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F4F4F4', alignItems: 'center', justifyContent: 'center',
  },
  iconTabBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 50,
    alignItems: 'center', marginHorizontal: 4,
  },
  iconTabText: { fontSize: 14, fontWeight: '700' },
  iconCell: {
    flex: 1, aspectRatio: 1, margin: 4, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
});
