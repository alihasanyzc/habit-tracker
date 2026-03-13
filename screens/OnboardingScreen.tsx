import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useAppColors,
  useIsDark,
  type AppColors,
} from '../constants/colors';
import { useLanguage } from '../providers/LanguageProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const PAGES = useMemo(() => [
    {
      type: 'logo' as const,
      title: t('onboarding.welcome'),
      desc: t('onboarding.welcomeDesc'),
    },
    {
      type: 'icon' as const,
      icon: 'check-circle' as const,
      iconColor: colors.green,
      title: t('onboarding.trackTitle'),
      desc: t('onboarding.trackDesc'),
    },
    {
      type: 'icon' as const,
      icon: 'bar-chart-2' as const,
      iconColor: colors.orange,
      title: t('onboarding.statsTitle'),
      desc: t('onboarding.statsDesc'),
    },
    {
      type: 'icon' as const,
      icon: 'zap' as const,
      iconColor: '#FFB800',
      title: t('onboarding.startTitle'),
      desc: t('onboarding.startDesc'),
    },
  ], [t, colors]);

  const isLastPage = currentPage === PAGES.length - 1;

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  }, []);

  const goToNext = useCallback(() => {
    if (isLastPage) {
      onDone();
    } else {
      scrollRef.current?.scrollTo({ x: (currentPage + 1) * SCREEN_WIDTH, animated: true });
    }
  }, [currentPage, isLastPage, onDone]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {!isLastPage && (
          <TouchableOpacity onPress={onDone} activeOpacity={0.7} hitSlop={12}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {PAGES.map((page, index) => (
          <View key={index} style={styles.page}>
            <View style={styles.illustrationWrap}>
              {page.type === 'logo' ? (
                <Image
                  source={require('../logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.iconCircle, { backgroundColor: `${page.iconColor}15` }]}>
                  <Feather name={page.icon} size={48} color={page.iconColor} />
                </View>
              )}
            </View>
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.desc}>{page.desc}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {PAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Action button */}
        {isLastPage ? (
          <TouchableOpacity activeOpacity={0.85} onPress={onDone}>
            <LinearGradient
              colors={['#FF8A1F', '#E06B00']}
              style={styles.ctaBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaText}>{t('onboarding.getStarted')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextBtn} activeOpacity={0.7} onPress={goToNext}>
            <Text style={styles.nextText}>{t('onboarding.next')}</Text>
            <Feather name="arrow-right" size={18} color={colors.orange} />
          </TouchableOpacity>
        )}
      </View>
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
      paddingHorizontal: 24,
      paddingVertical: 12,
      minHeight: 48,
    },
    skipText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.muted,
    },
    page: {
      width: SCREEN_WIDTH,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
      flex: 1,
    },
    illustrationWrap: {
      marginBottom: 40,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: 30,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    desc: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.muted,
      textAlign: 'center',
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
      gap: 24,
      alignItems: 'center',
    },
    dots: {
      flexDirection: 'row',
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: {
      backgroundColor: colors.orange,
      width: 24,
    },
    ctaBtn: {
      width: SCREEN_WIDTH - 48,
      borderRadius: 18,
      paddingVertical: 16,
      alignItems: 'center',
    },
    ctaText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    nextBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 16,
    },
    nextText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.orange,
    },
  });
}
