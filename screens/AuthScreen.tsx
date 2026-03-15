import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppColors, useIsDark } from '../constants/colors';
import { useLanguage } from '../providers/LanguageProvider';

interface AuthScreenProps {
  onDone: () => void;
}

type AuthMode = 'login' | 'signup';

const backgroundImage = require('../assets/background.png');
const lightImage = require('../assets/light.png');

export default function AuthScreen({ onDone }: AuthScreenProps) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { language } = useLanguage();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const isLogin = mode === 'login';
  const isTurkish = language === 'tr';
  const submitLabel = isLogin
    ? (isTurkish ? 'Giris Yap' : 'Login')
    : (isTurkish ? 'Kayit Ol' : 'Create Account');
  const subtitle = isLogin
    ? (isTurkish ? 'Hesabin yok mu?' : "Don't have an account?")
    : (isTurkish ? 'Zaten hesabin var mi?' : 'Already have an account?');
  const actionLabel = isLogin
    ? (isTurkish ? 'Kayit Ol' : 'SignUp')
    : (isTurkish ? 'Giris Yap' : 'Login');
  const handleModeToggle = () => {
    setMode((currentMode) => currentMode === 'login' ? 'signup' : 'login');
  };

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
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

            <View key={mode} style={styles.form}>
              {!isLogin ? (
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder={isTurkish ? 'Kullanici Adi' : 'Username'}
                  placeholderTextColor={isDark ? colors.dayMuted : '#9DA6B4'}
                  style={styles.input}
                />
              ) : null}

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={isTurkish ? 'E-posta' : 'Email'}
                placeholderTextColor={isDark ? colors.dayMuted : '#9DA6B4'}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={isTurkish ? 'Sifre' : 'Password'}
                placeholderTextColor={isDark ? colors.dayMuted : '#9DA6B4'}
                style={styles.input}
                secureTextEntry
              />

              <Pressable style={styles.primaryButton} onPress={onDone}>
                <Text style={styles.primaryButtonText}>{submitLabel}</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.switchRow,
                  pressed && styles.switchRowPressed,
                ]}
                onPress={handleModeToggle}
                hitSlop={12}
              >
                <Text style={styles.switchText}>{subtitle} </Text>
                <Text style={styles.switchAction}>{actionLabel}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    keyboard: {
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
    title: {
      display: 'none',
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
    form: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 68,
      paddingBottom: 28,
      gap: 16,
    },
    input: {
      height: 54,
      borderRadius: 14,
      backgroundColor: isDark ? colors.surfaceAlt : '#F2F3F6',
      paddingHorizontal: 16,
      color: colors.text,
      fontSize: 14,
      borderWidth: 1,
      borderColor: isDark ? colors.border : '#EBEEF2',
    },
    primaryButton: {
      marginTop: 8,
      height: 54,
      borderRadius: 14,
      backgroundColor: colors.orange,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '700',
    },
    switchRow: {
      marginTop: 8,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
      alignSelf: 'center',
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    switchRowPressed: {
      opacity: 0.82,
    },
    switchText: {
      color: colors.muted,
      fontSize: 13,
    },
    switchAction: {
      color: colors.orangeDark,
      fontSize: 13,
      fontWeight: '700',
    },
  });
}
