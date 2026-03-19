import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppColors, useIsDark } from '../constants/colors';
import { useLanguage } from '../providers/LanguageProvider';

interface AuthScreenProps {
  onDone: () => void;
}

const backgroundImage = require('../assets/background.png');
const lightImage = require('../assets/light.png');

export default function AuthScreen({ onDone }: AuthScreenProps) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { language } = useLanguage();

  const leftDrop = useRef(new Animated.Value(-280)).current;
  const rightDrop = useRef(new Animated.Value(-320)).current;
  const leftOpacity = useRef(new Animated.Value(0)).current;
  const rightOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(leftDrop, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(rightDrop, {
        toValue: 12,
        duration: 1050,
        useNativeDriver: true,
      }),
      Animated.timing(leftOpacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(rightOpacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();
  }, [leftDrop, leftOpacity, rightDrop, rightOpacity]);

  const isTurkish = language === 'tr';
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <View style={styles.hero}>
          <Animated.Image
            source={lightImage}
            style={[
              styles.light,
              styles.lightRight,
              {
                opacity: rightOpacity,
                transform: [{ translateY: rightDrop }, { scale: 0.72 }],
              },
            ]}
            resizeMode="contain"
          />

          <Animated.Image
            source={lightImage}
            style={[
              styles.light,
              styles.lightLeft,
              {
                opacity: leftOpacity,
                transform: [{ translateY: leftDrop }],
              },
            ]}
            resizeMode="contain"
          />
        </View>

        <View style={styles.sheet}>
          <View style={styles.waveCap} />

          <View style={styles.content}>
            <Text style={styles.welcomeTitle}>
              {isTurkish ? 'Habition' : 'Habition'}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {isTurkish
                ? 'Alışkanlıklarını takip et,\nher gün daha iyi ol.'
                : 'Track your habits,\nget better every day.'}
            </Text>

            <Pressable style={styles.primaryButton} onPress={onDone}>
              <Text style={styles.primaryButtonText}>
                {isTurkish ? 'Başla' : 'Get Started'}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function createStyles(colors: ReturnType<typeof useAppColors>, isDark: boolean) {
  return StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: colors.orange,
    },
    safe: {
      flex: 1,
    },
    hero: {
      flex: 0.44,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    light: {
      position: 'absolute',
      width: 84,
      height: 220,
    },
    lightLeft: {
      top: -6,
      left: 52,
    },
    lightRight: {
      top: -52,
      right: 82,
    },
    sheet: {
      flex: 0.56,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 44,
      borderTopRightRadius: 44,
      marginTop: 40,
      overflow: 'hidden',
    },
    waveCap: {
      position: 'absolute',
      top: -48,
      left: -14,
      right: -14,
      height: 88,
      backgroundColor: colors.surface,
      borderBottomLeftRadius: 110,
      borderBottomRightRadius: 170,
      transform: [{ rotate: '-3deg' }],
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 68,
      paddingBottom: 28,
      gap: 16,
      alignItems: 'center',
    },
    welcomeTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    welcomeSubtitle: {
      fontSize: 15,
      color: colors.muted,
      textAlign: 'center',
      lineHeight: 22,
    },
    primaryButton: {
      marginTop: 24,
      height: 54,
      borderRadius: 14,
      backgroundColor: colors.orange,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'stretch',
    },
    primaryButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '700',
    },
  });
}
