import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { C } from '../constants/colors';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  maxHeight?: number;
  children: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, maxHeight, children }: BottomSheetProps) {
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

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 36,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 20 },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 100,
    backgroundColor: C.handle,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
});
