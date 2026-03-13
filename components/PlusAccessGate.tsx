import React, { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenHeader from './ScreenHeader';
import PlusScreen from '../screens/PlusScreen';
import {
  useAppColors,
  useIsDark,
  type AppColors,
} from '../constants/colors';
import { useLanguage } from '../providers/LanguageProvider';

interface PlusAccessGateProps {
  title: string;
  subtitle?: string;
  lockedTitle: string;
  lockedDescription: string;
  ctaLabel?: string;
  benefits?: string[];
  embedded?: boolean;
}

export default function PlusAccessGate({
  title,
  subtitle,
  lockedTitle,
  lockedDescription,
  ctaLabel,
  benefits,
  embedded = false,
}: PlusAccessGateProps) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [plusVisible, setPlusVisible] = useState(false);
  const resolvedCtaLabel = ctaLabel ?? t('plus.ctaDefault');
  const resolvedBenefits = benefits ?? [
    t('plus.defaultBenefit1'),
    t('plus.defaultBenefit2'),
    t('plus.defaultBenefit3'),
  ];

  const gateContent = (
    <>
      {!embedded ? <ScreenHeader title={title} subtitle={subtitle} /> : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, embedded && styles.embeddedContent]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={isDark
            ? ['#3A2200', '#2A1800', colors.surface]
            : ['#FFF4EA', '#FFE8D0', colors.surface]
          }
          style={styles.heroCard}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroIconWrap}>
            <MaterialCommunityIcons name="crown" size={34} color={colors.orange} />
          </View>

          <View style={styles.lockBadge}>
            <Feather name="lock" size={14} color={colors.orange} />
            <Text style={styles.lockBadgeText}>{t('plus.lockBadge')}</Text>
          </View>

          <Text style={styles.heroTitle}>{lockedTitle}</Text>
          <Text style={styles.heroDescription}>{lockedDescription}</Text>
        </LinearGradient>

        <View style={styles.benefitCard}>
          <Text style={styles.benefitTitle}>{t('plus.benefitsTitle')}</Text>
          {resolvedBenefits.map((benefit, index) => (
            <View
              key={benefit}
              style={[styles.benefitRow, index < resolvedBenefits.length - 1 && styles.benefitRowBorder]}
            >
              <View style={styles.benefitIcon}>
                <MaterialCommunityIcons name="check-decagram" size={18} color={colors.orange} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => setPlusVisible(true)}
        >
          <LinearGradient
            colors={['#FF8A1F', '#E06B00']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="crown" size={20} color="#FFFFFF" />
            <Text style={styles.ctaText}>{resolvedCtaLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footnote}>
          {t('plus.footnote')}
        </Text>
      </ScrollView>
    </>
  );

  if (embedded) {
    return (
      <>
        {gateContent}
        <Modal
          visible={plusVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setPlusVisible(false)}
        >
          <PlusScreen onClose={() => setPlusVisible(false)} />
        </Modal>
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {gateContent}
      <Modal
        visible={plusVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPlusVisible(false)}
      >
        <PlusScreen onClose={() => setPlusVisible(false)} />
      </Modal>
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
      paddingTop: 8,
      paddingBottom: 40,
      gap: 18,
    },
    embeddedContent: {
      paddingHorizontal: 0,
      paddingTop: 4,
    },
    heroCard: {
      borderRadius: 28,
      padding: 24,
      borderWidth: 1,
      borderColor: isDark ? colors.border : 'rgba(255,138,31,0.16)',
      alignItems: 'flex-start',
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowSoft,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.24 : 0.08,
          shadowRadius: 18,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    heroIconWrap: {
      width: 68,
      height: 68,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(255,138,31,0.15)' : 'rgba(255,138,31,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    lockBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: isDark ? 'rgba(255,138,31,0.12)' : 'rgba(255,255,255,0.72)',
      borderWidth: 1,
      borderColor: isDark ? colors.border : 'rgba(255,138,31,0.14)',
      marginBottom: 16,
    },
    lockBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.orangeDark,
    },
    heroTitle: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 8,
    },
    heroDescription: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.muted,
    },
    benefitCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 18,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadowSoft,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.18 : 0.05,
          shadowRadius: 12,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    benefitTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    benefitRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
    },
    benefitRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    benefitIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,138,31,0.12)' : colors.orangeBg,
    },
    benefitText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
    },
    ctaButton: {
      borderRadius: 20,
      overflow: 'hidden',
    },
    ctaGradient: {
      minHeight: 58,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    ctaText: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    footnote: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      color: colors.muted,
      paddingHorizontal: 8,
    },
  });
}
