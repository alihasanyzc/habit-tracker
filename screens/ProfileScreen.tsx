import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  const [plusVisible, setPlusVisible] = useState(false);

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
  });
}
