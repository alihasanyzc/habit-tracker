import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import * as NativeSplash from 'expo-splash-screen';
import { useAppColors } from '../constants/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const colors = useAppColors();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageLoaded) {
      NativeSplash.hideAsync();
      const timer = setTimeout(() => onFinish(), 2000);
      return () => clearTimeout(timer);
    }
  }, [imageLoaded]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        onLoad={() => setImageLoaded(true)}
      />
      {imageLoaded && (
        <Text style={[styles.appName, { color: colors.text }]}>Habition</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 24,
  },
  appName: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
