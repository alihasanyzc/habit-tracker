import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { ToastProvider } from './components/ToastProvider';
import { useAppColors, useIsDark } from './constants/colors';

export default function App() {
  const colors = useAppColors();
  const isDark = useIsDark();

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.bg} />
        <AppNavigator />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
