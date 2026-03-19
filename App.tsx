import 'react-native-gesture-handler';
import { useState, useCallback, useEffect } from 'react';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import AuthScreen from './screens/AuthScreen';
import SplashScreen from './screens/SplashScreen';
import { ToastProvider } from './components/ToastProvider';
import { useAppColors, useIsDark } from './constants/colors';
import { ThemeProvider } from './providers/ThemeProvider';
import { LanguageProvider } from './providers/LanguageProvider';
import { getOnboardingDone, removeHabitDataByIdPrefix, setOnboardingDone } from './utils/storage';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ThemeProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </ThemeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const colors = useAppColors();
  const isDark = useIsDark();
  const [onboardingDone, setDone] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOnboardingState = async () => {
      try {
        await removeHabitDataByIdPrefix('demo-');

        const hasCompletedOnboarding = await getOnboardingDone();

        if (isMounted) {
          setDone(hasCompletedOnboarding);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    loadOnboardingState();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOnboardingDone = useCallback(async () => {
    await setOnboardingDone();
    setDone(true);
  }, []);

  if (!isReady || !splashDone) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
        <SplashScreen onFinish={() => setSplashDone(true)} />
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
      {onboardingDone ? (
        <AppNavigator />
      ) : (
        <AuthScreen onDone={handleOnboardingDone} />
      )}
    </>
  );
}
