import 'react-native-gesture-handler';
import { useState } from 'react';
import * as NativeSplash from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

NativeSplash.preventAutoHideAsync();
import AppNavigator from './navigation/AppNavigator';
import OnboardingScreen from './screens/OnboardingScreen';
import { ToastProvider } from './components/ToastProvider';
import { useAppColors, useIsDark } from './constants/colors';
import { ThemeProvider } from './providers/ThemeProvider';
import { LanguageProvider } from './providers/LanguageProvider';

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

  if (!splashDone) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
        <SplashScreen onFinish={() => setSplashDone(true)} />
      </>
    );
  }

  const isShowingOnboarding = !onboardingDone;

  return (
    <>
      <StatusBar
        style={isShowingOnboarding ? 'light' : isDark ? 'light' : 'dark'}
        backgroundColor={isShowingOnboarding ? '#FF8A1F' : colors.bg}
      />
      {onboardingDone ? (
        <AppNavigator />
      ) : (
        <OnboardingScreen onDone={handleOnboardingDone} />
      )}
    </>
  );
}
