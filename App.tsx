import 'react-native-gesture-handler';
import { useState, useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import AuthScreen from './screens/AuthScreen';
import { ToastProvider } from './components/ToastProvider';
import { useAppColors, useIsDark } from './constants/colors';
import { ThemeProvider } from './providers/ThemeProvider';
import { LanguageProvider } from './providers/LanguageProvider';
import { getOnboardingDone, setOnboardingDone } from './utils/storage';

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

  useEffect(() => {
    let isMounted = true;

    const loadOnboardingState = async () => {
      try {
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

  if (!isReady) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
        <View style={{ flex: 1, backgroundColor: colors.bg }} />
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
