import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, AppColors } from '../theme/colors';

type ThemeMode = 'dark' | 'light';

interface ThemeContextData {
  mode: ThemeMode;
  colors: AppColors;
  toggleTheme: () => void;
  isDark: boolean;
  needsThemePick: boolean;
  confirmTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

const THEME_KEY = '@pizzaria:theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [needsThemePick, setNeedsThemePick] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setMode(saved);
      } else {
        /* No theme saved yet — show picker on first login */
        setNeedsThemePick(true);
      }
    });
  }, []);

  function toggleTheme() {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    AsyncStorage.setItem(THEME_KEY, next);
  }

  function confirmTheme(chosen: ThemeMode) {
    setMode(chosen);
    setNeedsThemePick(false);
    AsyncStorage.setItem(THEME_KEY, chosen);
  }

  return (
    <ThemeContext.Provider
      value={{
        mode,
        colors: mode === 'dark' ? darkColors : lightColors,
        toggleTheme,
        isDark: mode === 'dark',
        needsThemePick,
        confirmTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
