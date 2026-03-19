import React, { useMemo, useState, useCallback } from 'react';
import { View, ImageBackground, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppColors, useIsDark, type AppColors } from '../constants/colors';

interface OnboardingScreenProps {
  onDone: () => void;
}

const BOARDS = [
  require('../assets/board1.png'),
  require('../assets/board2.png'),
  require('../assets/board3.png'),
] as const;

export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [currentPage, setCurrentPage] = useState(0);

  const isLastPage = currentPage === BOARDS.length - 1;

  const handleNext = useCallback(() => {
    if (isLastPage) {
      onDone();
      return;
    }

    setCurrentPage((page) => page + 1);
  }, [isLastPage, onDone]);

  return (
    <View style={styles.screen}>
      <ImageBackground
        key={`board-${currentPage}`}
        source={BOARDS[currentPage]}
        style={styles.boardImage}
        imageStyle={styles.boardImageInner}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safe}>
          <View style={styles.overlay} pointerEvents="box-none">
            <Pressable
              style={({ pressed }) => [
                styles.footerPressTarget,
                pressed && styles.footerPressTargetPressed,
              ]}
              onPress={handleNext}
            >
              <View style={styles.pagination}>
                {BOARDS.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentPage && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>

              <View style={styles.nextButton}>
                <Feather name="chevron-right" size={30} color={colors.white} />
              </View>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: isDark ? colors.bg : '#FFF8F3',
    },
    boardImage: {
      flex: 1,
    },
    boardImageInner: {
      width: '100%',
      height: '100%',
    },
    safe: {
      flex: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
    },
    footerPressTarget: {
      position: 'absolute',
      left: 24,
      right: 24,
      bottom: 20,
      alignItems: 'center',
      gap: 16,
      zIndex: 20,
      paddingVertical: 8,
    },
    footerPressTargetPressed: {
      opacity: 0.96,
    },
    pagination: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.7)',
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      backgroundColor: isDark ? colors.handle : '#E6D8CF',
    },
    paginationDotActive: {
      width: 28,
      backgroundColor: colors.orange,
    },
    nextButton: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.orange,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.92)',
      shadowColor: colors.orange,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: isDark ? 0.22 : 0.28,
      shadowRadius: 18,
      elevation: 8,
      zIndex: 30,
    },
  });
}
