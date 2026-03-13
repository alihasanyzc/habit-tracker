import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';
import {
  useAppColors,
  useIsDark,
  type AppColors,
} from '../constants/colors';
import { useLanguage } from '../providers/LanguageProvider';

interface PlusScreenProps {
  onClose: () => void;
}

export default function PlusScreen({ onClose }: PlusScreenProps) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const FEATURES = useMemo(() => [
    { icon: 'infinity' as const, title: t('plus.unlimitedHabits'), desc: t('plus.unlimitedHabitsDesc') },
    { icon: 'chart-timeline-variant-shimmer' as const, title: t('plus.detailedStats'), desc: t('plus.detailedStatsDesc') },
    { icon: 'bell-ring-outline' as const, title: t('plus.smartReminders'), desc: t('plus.smartRemindersDesc') },
    { icon: 'cloud-sync-outline' as const, title: t('plus.cloudBackup'), desc: t('plus.cloudBackupDesc') },
  ], [t]);

  // ── Animations ──

  // Close button delay
  const closeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCloseButton(true);
      Animated.timing(closeOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 2500);
    return () => clearTimeout(timer);
  }, [closeOpacity]);

  // Feature staggered animation
  const featureAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = featureAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );
    Animated.stagger(120, animations).start();
  }, [featureAnims]);

  // CTA pulse animation
  const ctaPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ctaPulse, {
          toValue: 1.03,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ctaPulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [ctaPulse]);

  // ── Handlers ──

  const selectPlan = useCallback((plan: 'monthly' | 'yearly') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlan(plan);
  }, []);

  const handlePurchase = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowConfetti(true);
    setTimeout(() => onClose(), 3000);
  }, [onClose]);

  const handleRestore = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowConfetti(true);
    setTimeout(() => onClose(), 3000);
  }, [onClose]);

  const ctaText = selectedPlan === 'yearly'
    ? t('plus.subscribeYearly')
    : t('plus.subscribeMonthly');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        {showCloseButton ? (
          <Animated.View style={{ opacity: closeOpacity }}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Feather name="x" size={22} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.closePlaceholder} />
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero */}
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
          <Text style={styles.heroTitle}>{t('plus.title')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('plus.subtitle')}
          </Text>
        </LinearGradient>

        {/* Plan Selector */}
        <View style={styles.planRow}>
          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'yearly' && styles.planCardActive]}
            onPress={() => selectPlan('yearly')}
            activeOpacity={0.8}
          >
            {selectedPlan === 'yearly' && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>{t('plus.bestValue')}</Text>
              </View>
            )}
            <Text style={[styles.planDuration, selectedPlan === 'yearly' && styles.planDurationActive]}>
              {t('plus.yearly')}
            </Text>
            <View style={styles.planPriceRow}>
              <Text style={[styles.planPrice, selectedPlan === 'yearly' && styles.planPriceActive]}>
                ₺249,99
              </Text>
              <Text style={[styles.planUnit, selectedPlan === 'yearly' && styles.planUnitActive]}>
                {t('plus.perYear')}
              </Text>
            </View>
            <Text style={[styles.planSave, selectedPlan === 'yearly' && styles.planSaveActive]}>
              {t('plus.yearlySaving')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
            onPress={() => selectPlan('monthly')}
            activeOpacity={0.8}
          >
            <Text style={[styles.planDuration, selectedPlan === 'monthly' && styles.planDurationActive]}>
              {t('plus.monthly')}
            </Text>
            <View style={styles.planPriceRow}>
              <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceActive]}>
                ₺34,99
              </Text>
              <Text style={[styles.planUnit, selectedPlan === 'monthly' && styles.planUnitActive]}>
                {t('plus.perMonth')}
              </Text>
            </View>
            <Text style={styles.planNote}>₺419,88{t('plus.perYear')}</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('plus.featuresTitle')}</Text>
          <View style={styles.featureList}>
            {FEATURES.map((feature, index) => (
              <Animated.View
                key={feature.title}
                style={{
                  opacity: featureAnims[index],
                  transform: [{
                    translateY: featureAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                }}
              >
                <View
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
              </Animated.View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaWrap}>
          <Animated.View style={{ transform: [{ scale: ctaPulse }], width: '100%' }}>
            <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85} onPress={handlePurchase}>
              <LinearGradient
                colors={['#FF8A1F', '#E06B00']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialCommunityIcons name="crown" size={20} color="#FFFFFF" />
                <Text style={styles.ctaText}>{ctaText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.ctaNote}>
            {t('plus.trialNote')}
          </Text>
        </View>

        <TouchableOpacity style={styles.restoreBtn} activeOpacity={0.7} onPress={handleRestore}>
          <Text style={styles.restoreText}>{t('plus.restorePurchase')}</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          {t('plus.legalNote')}
        </Text>
      </ScrollView>

      {/* Confetti */}
      {showConfetti && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <ConfettiCannon
            count={120}
            origin={{ x: -10, y: 0 }}
            fadeOut
            autoStart
            explosionSpeed={300}
            fallSpeed={2500}
            colors={[colors.orange, colors.orangeLight, colors.green, '#FFD700', '#FF6B6B', '#A855F7']}
          />
        </View>
      )}
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
    closePlaceholder: {
      width: 36,
      height: 36,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 22,
    },

    // Hero
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

    // Plan Selector
    planRow: {
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
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    planPriceActive: {
      color: colors.orange,
    },
    planPriceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginTop: 6,
    },
    planUnit: {
      fontSize: 12,
      color: colors.muted,
      marginLeft: 2,
    },
    planUnitActive: {
      color: colors.orangeDark,
    },
    planNote: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 4,
    },
    planSave: {
      fontSize: 11,
      color: colors.muted,
      marginTop: 4,
      textAlign: 'center',
    },
    planSaveActive: {
      color: colors.green,
      fontWeight: '600',
    },

    // Features
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

    // CTA
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
