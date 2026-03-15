import 'react-native-gesture-handler';
import { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import AuthScreen from './screens/AuthScreen';
import { ToastProvider } from './components/ToastProvider';
import { useAppColors, useIsDark } from './constants/colors';
import { ThemeProvider } from './providers/ThemeProvider';
import { LanguageProvider } from './providers/LanguageProvider';

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

  const handleOnboardingDone = useCallback(async () => {
    setDone(true);
  }, []);

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
