import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { Theme, ThemeMode, lightTheme, darkTheme, getTheme } from './theme';
interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  isSystemTheme: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setFollowSystem: (follow: boolean) => void;
}
interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode | 'system';
  storageKey?: string;
  getStoredTheme?: () => Promise<ThemeMode | 'system' | null>;
  setStoredTheme?: (mode: ThemeMode | 'system') => Promise<void>;
}
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'system',
  getStoredTheme,
  setStoredTheme,
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(
    initialMode === 'system'
      ? systemColorScheme === 'dark'
        ? 'dark'
        : 'light'
      : initialMode
  );
  const [isSystemTheme, setIsSystemTheme] = useState(initialMode === 'system');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        if (getStoredTheme) {
          const storedMode = await getStoredTheme();
          if (storedMode) {
            if (storedMode === 'system') {
              setIsSystemTheme(true);
              setModeState(systemColorScheme === 'dark' ? 'dark' : 'light');
            } else {
              setIsSystemTheme(false);
              setModeState(storedMode);
            }
          }
        }
      } catch (error) {
        console.warn('[ThemeProvider] Failed to load stored theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredTheme();
  }, [getStoredTheme, systemColorScheme]);
  useEffect(() => {
    if (!isSystemTheme) return;
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (isSystemTheme) {
        setModeState(colorScheme === 'dark' ? 'dark' : 'light');
      }
    });
    return () => subscription.remove();
  }, [isSystemTheme]);
  useEffect(() => {
    if (isSystemTheme && systemColorScheme) {
      setModeState(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [isSystemTheme, systemColorScheme]);
  const setMode = useCallback(
    async (newMode: ThemeMode) => {
      setModeState(newMode);
      setIsSystemTheme(false);
      if (setStoredTheme) {
        try {
          await setStoredTheme(newMode);
        } catch (error) {
          console.warn('[ThemeProvider] Failed to store theme:', error);
        }
      }
    },
    [setStoredTheme]
  );
  const toggleMode = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);
  const setFollowSystem = useCallback(
    async (follow: boolean) => {
      setIsSystemTheme(follow);
      if (follow) {
        const newMode = systemColorScheme === 'dark' ? 'dark' : 'light';
        setModeState(newMode);
      }
      if (setStoredTheme) {
        try {
          await setStoredTheme(follow ? 'system' : mode);
        } catch (error) {
          console.warn('[ThemeProvider] Failed to store theme:', error);
        }
      }
    },
    [mode, systemColorScheme, setStoredTheme]
  );
  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme: getTheme(mode),
      mode,
      isDark: mode === 'dark',
      isSystemTheme,
      setMode,
      toggleMode,
      setFollowSystem,
    }),
    [mode, isSystemTheme, setMode, toggleMode, setFollowSystem]
  );
  if (isLoading) {
    return null;
  }
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
export const useThemeMode = (): ThemeMode => {
  const { mode } = useTheme();
  return mode;
};
export const useIsDarkMode = (): boolean => {
  const { isDark } = useTheme();
  return isDark;
};
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};
export const useThemeSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};
export const useThemeTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};
export { ThemeContext };
