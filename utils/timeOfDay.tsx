import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import i18n from './i18n';

export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { greeting: i18n.t('time.goodMorning'), icon: 'weather-sunny', bg: '#FF8A1F', type: 'day' };
  if (hour >= 12 && hour < 17) return { greeting: i18n.t('time.goodAfternoon'), icon: 'white-balance-sunny', bg: '#F5A623', type: 'day' };
  if (hour >= 17 && hour < 21) return { greeting: i18n.t('time.goodEvening'), icon: 'weather-sunset', bg: '#E06B00', type: 'night' };
  return { greeting: i18n.t('time.goodNight'), icon: 'weather-night', bg: '#3D5A99', type: 'night' };
}

export function AnimatedTimeIcon({ icon, type }: { icon: string; type: string }) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (type === 'day') {
      Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [type, animValue]);

  const animatedStyle =
    type === 'day'
      ? {
          transform: [
            {
              rotate: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }
      : {
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.15],
              }),
            },
          ],
        };

  return (
    <Animated.View style={animatedStyle}>
      <MaterialCommunityIcons name={icon as any} size={26} color="#fff" />
    </Animated.View>
  );
}
