import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useLanguage } from '../providers/LanguageProvider';

interface OnboardingScreenProps {
  onDone: () => void;
}

type Slide = {
  key: 'intro' | 'track' | 'create';
  kind: 'brand' | 'illustration';
  title: string;
  description: string;
  image?: number;
};

const TRACK_IMAGE = require('../assets/Object 1.png');
const CREATE_IMAGE = require('../assets/Object 2.png');

export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const { width, height } = useWindowDimensions();
  const { t } = useLanguage();
  const listRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const styles = useMemo(() => createStyles(width, height), [height, width]);

  const slides = useMemo<Slide[]>(
    () => [
      {
        key: 'intro',
        kind: 'brand',
        title: t('onboarding.introTitle'),
        description: t('onboarding.introDesc'),
      },
      {
        key: 'track',
        kind: 'illustration',
        title: t('onboarding.trackTitle'),
        description: t('onboarding.trackDesc'),
        image: TRACK_IMAGE,
      },
      {
        key: 'create',
        kind: 'illustration',
        title: t('onboarding.createTitle'),
        description: t('onboarding.createDesc'),
        image: CREATE_IMAGE,
      },
    ],
    [t]
  );

  const isLastSlide = currentIndex === slides.length - 1;

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setCurrentIndex(nextIndex);
    },
    [width]
  );

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      onDone();
      return;
    }

    const nextIndex = currentIndex + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  }, [currentIndex, isLastSlide, onDone]);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#FFAC49', '#FF8A1F', '#FF7A00']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <SafeAreaView style={styles.safe}>
        <FlatList
          ref={listRef}
          data={slides}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              {item.kind === 'brand' ? (
                <View style={styles.brandContent}>
                  <Text style={styles.brandTitle}>{item.title}</Text>
                  {item.description ? (
                    <Text style={styles.brandDescription}>{item.description}</Text>
                  ) : null}
                </View>
              ) : (
                <>
                  <View style={styles.heroSection}>
                    <View style={styles.heroShadow} />
                    <Image source={item.image} style={styles.heroImage} resizeMode="contain" />
                  </View>

                  <View style={styles.copySection}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                  </View>
                </>
              )}
            </View>
          )}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {slides.map((slide, index) => (
              <View
                key={slide.key}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextButton,
              currentIndex === 0 && styles.nextButtonDark,
              pressed && styles.nextButtonPressed,
            ]}
          >
            <Feather
              name="chevron-right"
              size={22}
              color={currentIndex === 0 ? '#FFFFFF' : '#8C89FF'}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function createStyles(width: number, height: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#FF8A1F',
    },
    safe: {
      flex: 1,
    },
    glowTop: {
      position: 'absolute',
      top: -height * 0.16,
      right: -width * 0.18,
      width: width * 0.92,
      height: width * 0.92,
      borderRadius: width,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    glowBottom: {
      position: 'absolute',
      bottom: -height * 0.14,
      left: -width * 0.32,
      width: width * 0.96,
      height: width * 0.96,
      borderRadius: width,
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
    slide: {
      flex: 1,
      paddingHorizontal: 26,
      paddingTop: 12,
      paddingBottom: 120,
    },
    brandContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 84,
    },
    brandTitle: {
      color: '#FFFFFF',
      fontSize: Math.min(width * 0.16, 62),
      fontWeight: '800',
      letterSpacing: -2.2,
      textAlign: 'center',
    },
    brandDescription: {
      marginTop: 18,
      maxWidth: 260,
      color: 'rgba(255,255,255,0.84)',
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
    },
    heroSection: {
      flex: 0.58,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 22,
    },
    heroShadow: {
      position: 'absolute',
      bottom: 14,
      width: width * 0.44,
      height: 28,
      borderRadius: 999,
      backgroundColor: 'rgba(111, 47, 0, 0.22)',
    },
    heroImage: {
      width: width * 0.82,
      height: Math.min(height * 0.46, 430),
    },
    copySection: {
      flex: 0.42,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 18,
    },
    title: {
      color: '#FFFFFF',
      fontSize: Math.min(width * 0.12, 46),
      fontWeight: '800',
      lineHeight: Math.min(width * 0.14, 52),
      letterSpacing: -1.4,
      textAlign: 'center',
    },
    description: {
      marginTop: 14,
      maxWidth: width * 0.8,
      color: 'rgba(255,255,255,0.88)',
      fontSize: 15,
      lineHeight: 22,
      textAlign: 'center',
    },
    footer: {
      position: 'absolute',
      right: 28,
      bottom: 24,
      left: 28,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pagination: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    paginationDot: {
      width: 7,
      height: 7,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.35)',
    },
    paginationDotActive: {
      width: 28,
      backgroundColor: '#FFFFFF',
    },
    nextButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      shadowColor: '#7A3600',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 8,
    },
    nextButtonDark: {
      backgroundColor: '#A6550A',
    },
    nextButtonPressed: {
      transform: [{ scale: 0.97 }],
    },
  });
}
