import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import ScreenHeader from '../components/ScreenHeader';
import {
  useAppColors,
  useIsDark,
  type AppColors,
} from '../constants/colors';
import { useLanguage } from '../providers/LanguageProvider';

type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

const DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getNextFocusPauseMode(completedFocusSessions: number): PomodoroMode {
  return completedFocusSessions % 4 === 0 ? 'longBreak' : 'shortBreak';
}

interface PomodoroScreenProps {
  onClose?: () => void;
}

export default function PomodoroScreen({ onClose }: PomodoroScreenProps) {
  const colors = useAppColors();
  const isDark = useIsDark();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

  const MODE_META = useMemo(() => ([
    {
      key: 'focus' as const,
      icon: 'flash-outline' as const,
      label: t('pomodoro.focus'),
      duration: DURATIONS.focus,
    },
    {
      key: 'shortBreak' as const,
      icon: 'cafe-outline' as const,
      label: t('pomodoro.shortBreak'),
      duration: DURATIONS.shortBreak,
    },
    {
      key: 'longBreak' as const,
      icon: 'moon-outline' as const,
      label: t('pomodoro.longBreak'),
      duration: DURATIONS.longBreak,
    },
  ]), [t]);

  const updateMode = useCallback((nextMode: PomodoroMode) => {
    setIsRunning(false);
    setMode(nextMode);
    setSecondsLeft(DURATIONS[nextMode]);
  }, []);

  const handleCompleteSession = useCallback(() => {
    if (mode === 'focus') {
      const nextCompleted = completedFocusSessions + 1;
      const nextBreakMode = getNextFocusPauseMode(nextCompleted);
      setCompletedFocusSessions(nextCompleted);
      setMode(nextBreakMode);
      setSecondsLeft(DURATIONS[nextBreakMode]);
      return;
    }

    setMode('focus');
    setSecondsLeft(DURATIONS.focus);
  }, [completedFocusSessions, mode]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    if (secondsLeft === 0) {
      setIsRunning(false);
      handleCompleteSession();
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [handleCompleteSession, isRunning, secondsLeft]);

  const totalDuration = DURATIONS[mode];
  const progress = (totalDuration - secondsLeft) / totalDuration;
  const circleSize = 248;
  const strokeWidth = 12;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const activeModeLabel = MODE_META.find((item) => item.key === mode)?.label ?? '';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <ScreenHeader
          title={t('pomodoro.title')}
          subtitle={t('pomodoro.subtitle')}
        />
        {onClose ? (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={isDark ? ['#3A2200', '#241811'] : ['#FFF4EA', '#FFE8D0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="timer-outline" size={18} color={colors.orange} />
              <Text style={styles.heroBadgeText}>{t('pomodoro.methodLabel')}</Text>
            </View>
            <Text style={styles.heroMode}>{activeModeLabel}</Text>
          </View>

          <View style={styles.modeRow}>
            {MODE_META.map((item) => {
              const active = item.key === mode;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.modeChip, active && styles.modeChipActive]}
                  onPress={() => updateMode(item.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={active ? colors.white : colors.text}
                  />
                  <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.timerWrap}>
            <Svg width={circleSize} height={circleSize}>
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(31,31,31,0.08)'}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke={colors.orange}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                origin={`${circleSize / 2}, ${circleSize / 2}`}
              />
            </Svg>

            <View style={styles.timerContent}>
              <Text style={styles.timerLabel}>
                {isRunning ? t('pomodoro.inProgress') : t('pomodoro.ready')}
              </Text>
              <Text style={styles.timerValue}>{formatTime(secondsLeft)}</Text>
              <Text style={styles.timerHint}>
                {t('pomodoro.sessionLength', { minutes: Math.round(totalDuration / 60) })}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.primaryButton, isRunning && styles.primaryButtonMuted]}
              activeOpacity={0.85}
              onPress={() => setIsRunning((previous) => !previous)}
            >
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={18}
                color={colors.white}
              />
              <Text style={styles.primaryButtonText}>
                {isRunning ? t('pomodoro.pause') : t('pomodoro.start')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={() => updateMode(mode)}
            >
              <Ionicons name="refresh" size={18} color={colors.text} />
              <Text style={styles.secondaryButtonText}>{t('pomodoro.reset')}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedFocusSessions}</Text>
            <Text style={styles.statLabel}>{t('pomodoro.completedSessions')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedFocusSessions * 25}</Text>
            <Text style={styles.statLabel}>{t('pomodoro.focusMinutes')}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="chart-donut" size={18} color={colors.orange} />
            <Text style={styles.infoTitle}>{t('pomodoro.workflowTitle')}</Text>
          </View>
          <Text style={styles.infoDescription}>{t('pomodoro.workflowDescription')}</Text>

          <View style={styles.workflowRow}>
            <View style={styles.workflowItem}>
              <Text style={styles.workflowValue}>25</Text>
              <Text style={styles.workflowLabel}>{t('pomodoro.workflowFocus')}</Text>
            </View>
            <View style={styles.workflowItem}>
              <Text style={styles.workflowValue}>5</Text>
              <Text style={styles.workflowLabel}>{t('pomodoro.workflowShort')}</Text>
            </View>
            <View style={styles.workflowItem}>
              <Text style={styles.workflowValue}>15</Text>
              <Text style={styles.workflowLabel}>{t('pomodoro.workflowLong')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="sparkles-outline" size={18} color={colors.orange} />
            <Text style={styles.infoTitle}>{t('pomodoro.focusTipsTitle')}</Text>
          </View>

          <View style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{t('pomodoro.tip1')}</Text>
          </View>
          <View style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{t('pomodoro.tip2')}</Text>
          </View>
          <View style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{t('pomodoro.tip3')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: AppColors, isDark: boolean) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    headerWrap: {
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      right: 20,
      top: 14,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 120 : 96,
      gap: 16,
    },
    heroCard: {
      borderRadius: 28,
      padding: 18,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
      shadowColor: colors.shadowSoft,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.28 : 0.08,
      shadowRadius: 20,
      elevation: 8,
    },
    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    heroBadgeText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    heroMode: {
      color: colors.orange,
      fontSize: 13,
      fontWeight: '700',
    },
    modeRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 18,
    },
    modeChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 10,
      paddingVertical: 12,
    },
    modeChipActive: {
      backgroundColor: colors.orange,
    },
    modeChipText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    modeChipTextActive: {
      color: colors.white,
    },
    timerWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 22,
    },
    timerContent: {
      position: 'absolute',
      alignItems: 'center',
    },
    timerLabel: {
      color: colors.muted,
      fontSize: 13,
      marginBottom: 8,
    },
    timerValue: {
      color: colors.text,
      fontSize: 46,
      fontWeight: '800',
      letterSpacing: 1,
    },
    timerHint: {
      color: colors.muted,
      fontSize: 13,
      marginTop: 8,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 18,
    },
    primaryButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.orange,
      borderRadius: 18,
      paddingVertical: 16,
    },
    primaryButtonMuted: {
      backgroundColor: colors.orangeDark,
    },
    primaryButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: '800',
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.surface,
      borderRadius: 18,
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 18,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    statValue: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
    },
    statLabel: {
      color: colors.muted,
      fontSize: 13,
      marginTop: 6,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 18,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    infoTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    infoDescription: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 10,
    },
    workflowRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    workflowItem: {
      flex: 1,
      backgroundColor: colors.bg,
      borderRadius: 18,
      paddingVertical: 16,
      alignItems: 'center',
    },
    workflowValue: {
      color: colors.orange,
      fontSize: 24,
      fontWeight: '800',
    },
    workflowLabel: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 6,
      textAlign: 'center',
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginTop: 14,
    },
    tipDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.orange,
      marginTop: 6,
    },
    tipText: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
    },
  });
}
