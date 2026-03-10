import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import ProfileThemeCard from '../components/ProfileThemeCard';
import {
  useAppColors,
  useIsDark,
  type AppColors,
} from '../constants/colors';

const PROFILE_FIELDS = [
  { icon: 'user', label: 'Ad Soyad', value: 'Henüz eklenmedi' },
  { icon: 'mail', label: 'E-posta', value: 'Yerel kullanım modu' },
  { icon: 'phone', label: 'Telefon', value: 'Henüz eklenmedi' },
] as const;

const SECURITY_ITEMS = [
  { icon: 'lock', label: 'Şifre', value: 'Yerel kullanım' },
] as const;

export default function ProfileScreen() {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Profil" subtitle="Temel hesap bilgileri ve görünüm ayarları" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroAvatar}>
            <Feather name="user" size={22} color={colors.orangeDark} />
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Hesabını buradan yönet</Text>
            <Text style={styles.heroText}>
              Kişisel bilgilerini kontrol edebilir, tema tercihini değiştirebilir ve hesap
              durumunu tek ekranda sade bir şekilde görebilirsin.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temel Bilgiler</Text>
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
                  <Text style={styles.rowValue}>{field.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görünüm</Text>
          <ProfileThemeCard />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Güvenlik</Text>
          <View style={styles.listCard}>
            {SECURITY_ITEMS.map((item, index) => (
              <View
                key={item.label}
                style={[styles.row, index < SECURITY_ITEMS.length - 1 && styles.rowBorder]}
              >
                <View style={styles.rowIcon}>
                  <Feather name={item.icon} size={16} color={colors.orange} />
                </View>

                <View style={styles.rowCopy}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowValue}>{item.value}</Text>
                </View>
              </View>
            ))}
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
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadowSoft,
      shadowOpacity: isDark ? 0.14 : 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: isDark ? 0 : 2,
    },
    heroAvatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.softInfoBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    heroCopy: {
      flex: 1,
    },
    heroTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    heroText: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      color: colors.muted,
    },
    section: {
      gap: 12,
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
  });
}
