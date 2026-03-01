import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Animated, Dimensions, FlatList, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// ── Tarih formatlama ────────────────────────────────────
function formatDate(d: Date) {
  return `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}

// ════════════════════════════════════════════════════════
// SİLME ONAY BOTTOM SHEET
// ════════════════════════════════════════════════════════
function DeleteSheet({ visible, onCancel, onConfirm }: {
  visible: boolean; onCancel: () => void; onConfirm: () => void;
}) {
  const slide = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    Animated.spring(slide, {
      toValue: visible ? 0 : 300,
      useNativeDriver: true,
      damping: 25, stiffness: 300,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onCancel} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slide }] }]}>
        <View style={styles.handle} />
        <View style={styles.deleteIconWrap}>
          <MaterialCommunityIcons name="delete-outline" size={24} color={C.red} />
        </View>
        <Text style={styles.deleteTitle}>Alışkanlığı sil</Text>
        <Text style={styles.deleteSubtitle}>
          Bu alışkanlığı silmek istediğinizden emin misiniz?
        </Text>
        <View style={styles.sheetBtnRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
            <Text style={styles.cancelBtnText}>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelBtn, { backgroundColor: C.red, flex: 1 }]}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Text style={[styles.cancelBtnText, { color: '#fff' }]}>Sil</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
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
            <Text style={[styles.cancelBtnText, { color: C.purple }]}>Cancel</Text>
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
              <Text style={[styles.cancelBtnText, { color: '#fff' }]}>OK</Text>
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

function SpectrumPicker({ onColorChange }: {
  onColorChange: (c: string) => void;
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
    <Modal transparent animationType="none" visible={visible} onRequestClose={dismiss}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={dismiss} />
      <View style={[styles.sheet, { paddingBottom: 36 }]}>
        <View style={styles.handle} />

        {!showSpectrum && (
          <View style={styles.iconSheetHeader}>
            <Text style={styles.sheetTitle}>Renk Seç</Text>
            <TouchableOpacity onPress={onCancel} style={styles.iconSheetClose} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={18} color={C.muted} />
            </TouchableOpacity>
          </View>
        )}

        {showSpectrum ? (
          <SpectrumPicker
            onColorChange={(c) => { onSelect(c); }}
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
  const [taskName, setTaskName] = useState('Design Competition');
  const [selectedIcon, setSelectedIcon] = useState<IconName>('medal');
  const [selectedColor, setSelectedColor] = useState('#F6EFEA');
  const [startDate, setStartDate] = useState(new Date(2025, 0, 1));
  const [endDate, setEndDate] = useState(new Date(2025, 11, 31));

  const [showDelete, setShowDelete] = useState(false);
  const [showStartCal, setShowStartCal] = useState(false);
  const [showEndCal, setShowEndCal] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Başlık ──────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Habit</Text>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setShowDelete(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color={C.red} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Görev Adı ─────────────────────────────── */}
        <Text style={styles.sectionLabel}>Task Name</Text>
        <View style={[styles.nameRow, { backgroundColor: selectedColor }]}>
          <TouchableOpacity
            style={styles.emojiBtn}
            onPress={() => setShowIconPicker(true)}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name={selectedIcon} size={26} color={C.text} />
          </TouchableOpacity>
          <TextInput
            value={taskName}
            onChangeText={setTaskName}
            placeholder="Enter habit name..."
            placeholderTextColor={C.muted}
            style={styles.nameInput}
          />
        </View>

        {/* ── Renk Seçici (satır, tıkla → modal) ──── */}
        <TouchableOpacity
          style={styles.colorRow}
          onPress={() => setShowColorPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.colorRowLabel}>Color</Text>
          <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
          <Text style={styles.colorRowChevron}>›</Text>
        </TouchableOpacity>

        {/* ── Ne Zaman ──────────────────────────────── */}
        <Text style={styles.sectionLabel}>When</Text>

        {/* Başlangıç tarihi */}
        <Text style={styles.dateSubLabel}>Start Date</Text>
        <TouchableOpacity
          style={styles.dateRow}
          onPress={() => setShowStartCal(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="calendar-month-outline" size={20} color={C.muted} />
          <Text style={styles.dateText}>{formatDate(startDate)}</Text>
          <MaterialCommunityIcons name="pencil-outline" size={18} color={C.muted} />
        </TouchableOpacity>

        {/* Bitiş tarihi */}
        <Text style={[styles.dateSubLabel, { marginTop: 12 }]}>End Date</Text>
        <TouchableOpacity
          style={styles.dateRow}
          onPress={() => setShowEndCal(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="calendar-month-outline" size={20} color={C.muted} />
          <Text style={styles.dateText}>{formatDate(endDate)}</Text>
          <MaterialCommunityIcons name="pencil-outline" size={18} color={C.muted} />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Kaydet Butonu ─────────────────────────────── */}
      <View style={styles.saveWrap}>
        <TouchableOpacity activeOpacity={0.85} style={{ borderRadius: 20, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#FFA94D', '#FF8A1F']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.saveBtn}
          >
            <Text style={styles.saveBtnText}>Save</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Modaller ──────────────────────────────────── */}
      <DeleteSheet
        visible={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={() => setShowDelete(false)}
      />
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  deleteBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: C.redLight,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },

  sectionLabel: {
    fontSize: 16, fontWeight: '700', color: C.text,
    marginBottom: 12,
  },

  // Görev adı
  nameRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, padding: 10,
    marginBottom: 28,
  },
  emojiBtn: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  nameInput: {
    flex: 1, fontSize: 15, color: C.text,
    paddingVertical: 4,
  },

  // Renk satırı (Color row)
  colorRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 4,
    borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: C.border,
    marginBottom: 28,
  },
  colorRowLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: C.text },
  colorPreview: {
    width: 48, height: 30, borderRadius: 15,
  },
  colorRowChevron: { fontSize: 22, color: '#BBBBBB', marginLeft: 10 },

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

  // Tarih satırı
  dateSubLabel: { fontSize: 12, fontWeight: '600', color: C.muted, marginBottom: 6, marginLeft: 4 },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14,
    backgroundColor: '#F6EFEA',
  },
  dateText: { flex: 1, fontSize: 15, color: C.text },

  // Kaydet
  saveWrap: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 24 : 16, paddingTop: 8 },
  saveBtn: { borderRadius: 20, paddingVertical: 18, alignItems: 'center' },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

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

  // Silme sheet
  deleteIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.redLight,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginTop: 16,
  },
  deleteTitle: { fontSize: 18, fontWeight: '700', color: C.text, textAlign: 'center', marginTop: 12 },
  deleteSubtitle: { fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 8, marginHorizontal: 24, marginBottom: 24 },

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
