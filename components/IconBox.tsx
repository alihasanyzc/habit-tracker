import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getThemedAccentSurface, useAppColors, useIsDark } from '../constants/colors';

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
  const colors = useAppColors();
  const isDark = useIsDark();
  const resolvedBgColor = useMemo(
    () => getThemedAccentSurface(bgColor, colors, isDark, 0.7),
    [bgColor, colors, isDark]
  );

  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: resolvedBgColor,
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
