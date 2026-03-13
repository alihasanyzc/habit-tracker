import 'react-native-gesture-handler';
import { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import OnboardingScreen from './screens/OnboardingScreen';
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
  const [onboardingDone, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    getOnboardingDone().then(setDone);
  }, []);

  const handleOnboardingDone = useCallback(async () => {
    await setOnboardingDone();
    setDone(true);
  }, []);

  if (onboardingDone === null) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
      {onboardingDone ? (
        <AppNavigator />
      ) : (
        <OnboardingScreen onDone={handleOnboardingDone} />
      )}
    </>
  );
}
