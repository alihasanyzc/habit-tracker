import 'react-native-gesture-handler';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import * as NativeSplash from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

NativeSplash.preventAutoHideAsync();
import AppNavigator from './navigation/AppNavigator';
import OnboardingScreen from './screens/OnboardingScreen';
import SplashScreen from './screens/SplashScreen';
import { ToastProvider } from './components/ToastProvider';
import { useAppColors, useIsDark } from './constants/colors';
import { ThemeProvider } from './providers/ThemeProvider';
import { LanguageProvider } from './providers/LanguageProvider';
import { getOnboardingDone, setOnboardingDone } from './utils/storage';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const colors = useAppColors();
  const isDark = useIsDark();
  const [splashDone, setSplashDone] = useState(false);
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

  if (!splashDone) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
        <SplashScreen onFinish={() => setSplashDone(true)} />
      </>
    );
  }

  if (!isReady) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
        <View style={{ flex: 1, backgroundColor: colors.bg }} />
      </>
    );
  }

  const isShowingOnboarding = !onboardingDone;

  return (
    <>
      <StatusBar
        style={isShowingOnboarding ? 'light' : isDark ? 'light' : 'dark'}
        backgroundColor={isShowingOnboarding ? '#FF7000' : colors.bg}
      />
      {onboardingDone ? (
        <AppNavigator />
      ) : (
        <OnboardingScreen onDone={handleOnboardingDone} />
      )}
    </>
  );
}
