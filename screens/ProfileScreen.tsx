import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from '../components/ScreenHeader';
import ProfileThemeCard from '../components/ProfileThemeCard';
import PlusScreen from './PlusScreen';
import {
  useAppColors,
  useIsDark,
  type AppColors,
} from '../constants/colors';

const PROFILE_FIELDS = [
  { icon: 'user' as const, label: 'Ad Soyad', key: 'name' as const, placeholder: 'Adınızı girin...', keyboard: 'default' as const },
  { icon: 'mail' as const, label: 'E-posta', key: 'email' as const, placeholder: 'E-posta adresinizi girin...', keyboard: 'email-address' as const },
  { icon: 'phone' as const, label: 'Telefon', key: 'phone' as const, placeholder: 'Telefon numaranızı girin...', keyboard: 'phone-pad' as const },
];

export default function ProfileScreen() {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [plusVisible, setPlusVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<'profile' | 'security' | null>(null);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const updateField = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleCancel = () => {
    setEditingSection(null);
  };

  const handleSave = () => {
    // TODO: persist
    setEditingSection(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Profil" subtitle="Temel hesap bilgileri ve görünüm ayarları" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={styles.plusCard}
          activeOpacity={0.85}
          onPress={() => setPlusVisible(true)}
        >
          <LinearGradient
            colors={isDark
              ? ['#3A2200', '#2A1800']
              : ['#FFF4EA', '#FFE8D0']
            }
            style={styles.plusGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.plusIconWrap}>
              <MaterialCommunityIcons name="crown" size={22} color={colors.orange} />
            </View>
            <View style={styles.plusCopy}>
              <Text style={styles.plusTitle}>Plus'a Yükselt</Text>
              <Text style={styles.plusDesc}>Sınırsız alışkanlık, detaylı istatistik ve daha fazlası</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.orange} />
          </LinearGradient>
        </TouchableOpacity>

        <Modal
          visible={plusVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setPlusVisible(false)}
        >
          <PlusScreen onClose={() => setPlusVisible(false)} />
        </Modal>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
            <TouchableOpacity
              onPress={() => setEditingSection(editingSection === 'profile' ? null : 'profile')}
              hitSlop={8}
            >
              <Feather
                name={editingSection === 'profile' ? 'x' : 'edit-2'}
                size={16}
                color={colors.muted}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.listCard}>
            {PROFILE_FIELDS.map((field, index) => (
              <View
                key={field.label}
                style={[styles.row, index < PROFILE_FIELDS.length - 1 && styles.rowBorder]}
              >
                <View style={styles.rowIcon}>
                  <Feather name={field.icon} size={16} color={colors.orange} />
                </View>

                <View style={styles.rowCopy}>
                  <Text style={styles.rowLabel}>{field.label}</Text>
                  {editingSection === 'profile' ? (
                    <TextInput
                      value={form[field.key]}
                      onChangeText={(v) => updateField(field.key, v)}
                      placeholder={field.placeholder}
                      placeholderTextColor={colors.muted}
                      keyboardType={field.keyboard}
                      autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                      style={styles.input}
                    />
                  ) : (
                    <Text style={[styles.rowValue, form[field.key] && styles.rowValueFilled]}>
                      {form[field.key] || 'Henüz eklenmedi'}
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {editingSection === 'profile' && (
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelBtnText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görünüm</Text>
          <ProfileThemeCard />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Güvenlik</Text>
            <TouchableOpacity
              onPress={() => setEditingSection(editingSection === 'security' ? null : 'security')}
              hitSlop={8}
            >
              <Feather
                name={editingSection === 'security' ? 'x' : 'edit-2'}
                size={16}
                color={colors.muted}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.listCard}>
            {editingSection === 'security' ? (
              <>
                <View style={[styles.row, styles.rowBorder]}>
                  <View style={styles.rowIcon}>
                    <Feather name="lock" size={16} color={colors.orange} />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowLabel}>Mevcut Şifre</Text>
                    <TextInput
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Mevcut şifrenizi girin..."
                      placeholderTextColor={colors.muted}
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={styles.rowIcon}>
                    <Feather name="key" size={16} color={colors.orange} />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowLabel}>Yeni Şifre</Text>
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Yeni şifrenizi girin..."
                      placeholderTextColor={colors.muted}
                      secureTextEntry
                      style={styles.input}
                    />
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                    <Text style={styles.cancelBtnText}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Kaydet</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Feather name="lock" size={16} color={colors.orange} />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowLabel}>Şifre</Text>
                  <Text style={styles.rowValue}>••••••••</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      gap: 18,
    },
    section: {
      gap: 12,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      color: colors.muted,
    },
    listCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    rowCopy: {
      flex: 1,
    },
    rowLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    rowValue: {
      marginTop: 2,
      fontSize: 13,
      color: colors.muted,
    },
    rowValueFilled: {
      color: colors.text,
    },
    plusCard: {
      borderRadius: 24,
      overflow: 'hidden',
    },
    plusGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: isDark ? colors.border : 'rgba(255,138,31,0.2)',
    },
    plusIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(255,138,31,0.15)' : 'rgba(255,138,31,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    plusCopy: {
      flex: 1,
    },
    plusTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    plusDesc: {
      marginTop: 2,
      fontSize: 12,
      color: colors.muted,
    },
    input: {
      marginTop: 4,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cancelBtn: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center' as const,
    },
    cancelBtnText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.muted,
    },
    saveBtn: {
      flex: 1,
      backgroundColor: colors.orange,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center' as const,
    },
    saveBtnText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: '#fff',
    },
  });
}
