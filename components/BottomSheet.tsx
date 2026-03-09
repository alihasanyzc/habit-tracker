import React, { useMemo } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useAppColors, useIsDark, type AppColors } from '../constants/colors';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  maxHeight?: number;
  children: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, maxHeight, children }: BottomSheetProps) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, maxHeight ? { maxHeight } : undefined]}>
        <View style={styles.handle} />
        {children}
      </View>
    </Modal>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.overlay,
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surfaceElevated,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingBottom: 36,
      borderTopWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.32 : 0.12,
          shadowRadius: 16,
        },
        android: { elevation: 20 },
      }),
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 100,
      backgroundColor: colors.handle,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
  });
}
