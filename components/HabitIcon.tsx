import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface HabitIconProps {
  icon: string;
  color: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}

function isMaterialIcon(icon: string) {
  return Object.prototype.hasOwnProperty.call(MaterialCommunityIcons.glyphMap, icon);
}

export default function HabitIcon({ icon, color, size = 20, style }: HabitIconProps) {
  if (isMaterialIcon(icon)) {
    return (
      <MaterialCommunityIcons
        name={icon as any}
        size={size}
        color={color}
        style={[
          {
            width: size + 6,
            height: size + 6,
            lineHeight: size + 6,
            textAlign: 'center',
            textAlignVertical: 'center',
            includeFontPadding: false,
          },
          style,
        ]}
      />
    );
  }

  return (
    <Text
      style={[
        {
          fontSize: size,
          lineHeight: size + 2,
          textAlign: 'center',
        },
        style,
      ]}
    >
      {icon}
    </Text>
  );
}
