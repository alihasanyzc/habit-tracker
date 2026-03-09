import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface IconBoxProps {
  icon: string;
  iconColor: string;
  iconSize?: number;
  size?: number;
  borderRadius?: number;
  bgColor: string;
  opacity?: number;
}

export default function IconBox({
  icon,
  iconColor,
  iconSize = 20,
  size = 38,
  borderRadius = 11,
  bgColor,
  opacity = 1,
}: IconBoxProps) {
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: bgColor,
          opacity,
        },
      ]}
    >
      <MaterialCommunityIcons name={icon as any} size={iconSize} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
