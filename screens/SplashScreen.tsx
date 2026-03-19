import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet } from 'react-native';
import { useAppColors } from '../constants/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const colors = useAppColors();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => onFinish());
      }, 1200);
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image source={require('../logo.png')} style={styles.logo} />
      </Animated.View>
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
    width: 120,
    height: 120,
    borderRadius: 28,
  },
});
