import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AnimatedTimeIconProps {
  icon: string;
  type: string;
}

export default function AnimatedTimeIcon({ icon, type }: AnimatedTimeIconProps) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (type === 'day') {
      Animated.loop(
        Animated.timing(animValue, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
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
        ]),
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
