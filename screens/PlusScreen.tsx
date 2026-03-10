import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useAppColors,
  useIsDark,
  type AppColors,
} from '../constants/colors';

const FEATURES = [
  {
    icon: 'infinity' as const,
    title: 'Sınırsız Alışkanlık',
    desc: 'Dilediğin kadar alışkanlık oluştur ve takip et.',
  },
  {
    icon: 'chart-timeline-variant-shimmer' as const,
    title: 'Detaylı İstatistikler',
    desc: 'Gelişmiş grafikler ve haftalık/aylık analizler.',
  },
  {
    icon: 'bell-ring-outline' as const,
    title: 'Akıllı Hatırlatıcılar',
    desc: 'Kişiselleştirilmiş bildirimlerle hiçbir günü kaçırma.',
  },
  {
    icon: 'cloud-sync-outline' as const,
    title: 'Bulut Yedekleme',
    desc: 'Verilerini güvenle yedekle, cihazlar arası senkronize et.',
  },
];

interface PlusScreenProps {
  onClose: () => void;
}

export default function PlusScreen({ onClose }: PlusScreenProps) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
          <Feather name="x" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <LinearGradient
          colors={isDark
            ? ['#3A2200', '#2A1800', colors.surface]
            : ['#FFF4EA', '#FFE8D0', colors.surface]
          }
          style={styles.heroGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={styles.heroIconWrap}>
            <MaterialCommunityIcons name="crown" size={36} color={colors.orange} />
          </View>
          <Text style={styles.heroTitle}>Habition Plus</Text>
          <Text style={styles.heroSubtitle}>
            Alışkanlıklarını bir üst seviyeye taşı.{'\n'}Tüm premium özelliklerin kilidini aç.
          </Text>
        </LinearGradient>

        <View style={styles.planSelector}>
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.8}
          >
            {selectedPlan === 'yearly' && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>En Avantajlı</Text>
              </View>
            )}
            <Text style={[styles.planDuration, selectedPlan === 'yearly' && styles.planDurationActive]}>
              Yıllık
            </Text>
            <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceActive]}>
              ₺249,99
            </Text>
            <Text style={[styles.planUnit, selectedPlan === 'yearly' && styles.planUnitActive]}>
              /yıl
            </Text>
            <Text style={[styles.planSave, selectedPlan === 'yearly' && styles.planSaveActive]}>
              Aylık ₺20,83 — %40 tasarruf
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.8}
          >
            <Text style={[styles.planDuration, selectedPlan === 'monthly' && styles.planDurationActive]}>
              Aylık
            </Text>
            <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceActive]}>
              ₺34,99
            </Text>
            <Text style={[styles.planUnit, selectedPlan === 'monthly' && styles.planUnitActive]}>
              /ay
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plus ile Neler Kazanırsın?</Text>
          <View style={styles.featureList}>
            {FEATURES.map((feature, index) => (
              <View
                key={feature.title}
                style={[styles.featureRow, index < FEATURES.length - 1 && styles.featureRowBorder]}
              >
                <View style={styles.featureIcon}>
                  <MaterialCommunityIcons name={feature.icon} size={20} color={colors.orange} />
                </View>
                <View style={styles.featureCopy}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.ctaWrap}>
          <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85}>
            <LinearGradient
              colors={['#FF8A1F', '#E06B00']}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons name="crown" size={20} color="#FFFFFF" />
              <Text style={styles.ctaText}>
                {selectedPlan === 'yearly' ? 'Yıllık Plus\'a Abone Ol' : 'Aylık Plus\'a Abone Ol'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.ctaNote}>
            İstediğin zaman iptal edebilirsin. 7 gün ücretsiz deneme ile başla.
          </Text>
        </View>

        <TouchableOpacity style={styles.restoreBtn} activeOpacity={0.7}>
          <Text style={styles.restoreText}>Satın Alımı Geri Yükle</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          Abonelik, onay üzerine Apple ID hesabınızdan tahsil edilir. Mevcut dönem sona ermeden
          en az 24 saat önce iptal edilmezse otomatik olarak yenilenir.
        </Text>
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
    header: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 22,
    },
    heroGradient: {
      borderRadius: 28,
      padding: 28,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? colors.border : 'rgba(255,138,31,0.15)',
    },
    heroIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(255,138,31,0.15)' : 'rgba(255,138,31,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    heroTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    heroSubtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.muted,
      textAlign: 'center',
    },
    planSelector: {
      flexDirection: 'row',
      gap: 12,
    },
    planCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: 16,
      alignItems: 'center',
    },
    planCardActive: {
      borderColor: colors.orange,
      backgroundColor: isDark ? 'rgba(255,138,31,0.08)' : '#FFF8F0',
    },
    bestBadge: {
      position: 'absolute',
      top: -10,
      backgroundColor: colors.orange,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 8,
    },
    bestBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    planDuration: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.muted,
      marginTop: 4,
    },
    planDurationActive: {
      color: colors.text,
    },
    planPrice: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginTop: 6,
    },
    planPriceActive: {
      color: colors.orange,
    },
    planUnit: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    planUnitActive: {
      color: colors.orangeDark,
    },
    planSave: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 8,
      textAlign: 'center',
    },
    planSaveActive: {
      color: colors.green,
      fontWeight: '600',
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
    featureList: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    featureRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    featureIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255,138,31,0.12)' : colors.softInfoBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    featureCopy: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    featureDesc: {
      marginTop: 2,
      fontSize: 12,
      lineHeight: 17,
      color: colors.muted,
    },
    ctaWrap: {
      alignItems: 'center',
      gap: 10,
    },
    ctaBtn: {
      width: '100%',
      borderRadius: 18,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: colors.orange,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.25 : 0.35,
          shadowRadius: 14,
        },
        android: { elevation: 8 },
      }),
    },
    ctaGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
    },
    ctaText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    ctaNote: {
      fontSize: 12,
      color: colors.muted,
      textAlign: 'center',
    },
    restoreBtn: {
      alignSelf: 'center',
      paddingVertical: 8,
    },
    restoreText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.orange,
    },
    legalText: {
      fontSize: 10,
      lineHeight: 15,
      color: colors.muted,
      textAlign: 'center',
      paddingHorizontal: 10,
    },
  });
}
