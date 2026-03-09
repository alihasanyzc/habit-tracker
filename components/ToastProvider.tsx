import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppColors, useIsDark, type AppColors } from '../constants/colors';

type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

interface ToastItem {
  id: number;
  title: string;
  message?: string;
  type: ToastType;
  duration: number;
}

const DEFAULT_DURATION = 2800;
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [currentToast, setCurrentToast] = useState<ToastItem | null>(null);
  const queueRef = useRef<ToastItem[]>([]);
  const activeToastRef = useRef<ToastItem | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const clearHideTimer = useCallback(() => {
    if (!hideTimerRef.current) return;
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = null;
  }, []);

  const hideToast = useCallback(() => {
    if (!activeToastRef.current) return;

    clearHideTimer();
    Animated.timing(progress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      activeToastRef.current = null;
      setCurrentToast(null);
    });
  }, [clearHideTimer, progress]);

  const showToast = useCallback((options: ToastOptions) => {
    const toast: ToastItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: options.title,
      message: options.message,
      type: options.type ?? 'info',
      duration: options.duration ?? DEFAULT_DURATION,
    };

    if (activeToastRef.current) {
      queueRef.current.push(toast);
      return;
    }

    activeToastRef.current = toast;
    setCurrentToast(toast);
  }, []);

  useEffect(() => {
    if (!currentToast) {
      const nextToast = queueRef.current.shift();
      if (nextToast) {
        activeToastRef.current = nextToast;
        setCurrentToast(nextToast);
      }
      return;
    }

    clearHideTimer();
    progress.stopAnimation();
    progress.setValue(0);

    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.9,
    }).start();

    hideTimerRef.current = setTimeout(() => {
      hideToast();
    }, currentToast.duration);
  }, [clearHideTimer, currentToast, hideToast, progress]);

  useEffect(() => () => {
    clearHideTimer();
    progress.stopAnimation();
  }, [clearHideTimer, progress]);

  const ctxValue = useMemo(() => ({ showToast, hideToast }), [hideToast, showToast]);

  const top = insets.top + 10;
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-28, 0],
  });
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  return (
    <ToastContext.Provider value={ctxValue}>
      <View style={styles.appShell}>
        {children}

        <View pointerEvents="box-none" style={styles.viewport}>
          {currentToast && (
            <Animated.View
              style={[
                styles.toastWrap,
                {
                  top,
                  opacity: progress,
                  transform: [{ translateY }, { scale }],
                },
              ]}
            >
              <ToastCard toast={currentToast} onDismiss={hideToast} />
            </Animated.View>
          )}
        </View>
      </View>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const meta = getToastMeta(colors)[toast.type];

  return (
    <Pressable style={styles.toastCard} onPress={onDismiss}>
      <View style={[styles.iconWrap, { backgroundColor: meta.softBg }]}>
        <MaterialCommunityIcons name={meta.icon} size={20} color={meta.tint} />
      </View>

      <View style={styles.copyWrap}>
        <Text style={styles.title}>{toast.title}</Text>
        {toast.message ? <Text style={styles.message}>{toast.message}</Text> : null}
      </View>

      <MaterialCommunityIcons name="close" size={18} color={colors.muted} />
    </Pressable>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}

function getToastMeta(colors: AppColors): Record<
  ToastType,
  { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; tint: string; softBg: string }
> {
  return {
    success: { icon: 'check-circle', tint: colors.green, softBg: colors.softSuccessBg },
    error: { icon: 'alert-circle', tint: colors.red, softBg: colors.softErrorBg },
    info: { icon: 'bell-circle', tint: colors.orange, softBg: colors.softInfoBg },
  };
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    appShell: {
      flex: 1,
    },
    viewport: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1000,
    },
    toastWrap: {
      position: 'absolute',
      left: 16,
      right: 16,
    },
    toastCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderRadius: 22,
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderWidth: 1,
      borderColor: colors.toastBorder,
      ...Platform.select({
        ios: {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: isDark ? 0.28 : 0.12,
          shadowRadius: 24,
        },
        android: {
          elevation: 10,
        },
      }),
    },
    iconWrap: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    copyWrap: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    message: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.muted,
    },
  });
}
