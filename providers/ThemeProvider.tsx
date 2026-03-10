import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import {
  getThemePreference as loadThemePreference,
  setThemePreference as persistThemePreference,
  type ThemePreference,
} from '../utils/storage';

type ResolvedScheme = 'light' | 'dark';

interface ThemeContextValue {
  themePreference: ThemePreference;
  resolvedScheme: ResolvedScheme;
  isDark: boolean;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(
  preference: ThemePreference,
  systemScheme: 'light' | 'dark' | null | undefined
): ResolvedScheme {
  if (preference === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }

  return preference;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let isActive = true;

    (async () => {
      try {
        const storedPreference = await loadThemePreference();
        if (isActive) {
          setThemePreferenceState(storedPreference);
        }
      } catch (error) {
        console.warn('Failed to load theme preference.', error);
      }
    })();

    return () => {
      isActive = false;
    };
  }, []);

  const resolvedScheme = resolveScheme(themePreference, systemScheme);

  async function setThemePreference(preference: ThemePreference) {
    setThemePreferenceState(preference);

    try {
      await persistThemePreference(preference);
    } catch (error) {
      console.warn('Failed to save theme preference.', error);
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        resolvedScheme,
        isDark: resolvedScheme === 'dark',
        setThemePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  const systemScheme = useColorScheme();
  const fallbackScheme = systemScheme === 'dark' ? 'dark' : 'light';

  if (context) {
    return context;
  }

  return {
    themePreference: 'system',
    resolvedScheme: fallbackScheme,
    isDark: fallbackScheme === 'dark',
    setThemePreference: async () => {},
  };
}
