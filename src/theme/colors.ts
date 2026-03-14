export const colors = {
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  secondary: {
    50: '#EDE7F6',
    100: '#D1C4E9',
    200: '#B39DDB',
    300: '#9575CD',
    400: '#7E57C2',
    500: '#673AB7',
    600: '#5E35B1',
    700: '#512DA8',
    800: '#4527A0',
    900: '#311B92',
  },
  accent: {
    50: '#E0F2F1',
    100: '#B2DFDB',
    200: '#80CBC4',
    300: '#4DB6AC',
    400: '#26A69A',
    500: '#009688',
    600: '#00897B',
    700: '#00796B',
    800: '#00695C',
    900: '#004D40',
  },
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  info: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },
  category: {
    meditation: '#9C27B0',
    breathing: '#03A9F4',
    exercise: '#FF5722',
    nature: '#4CAF50',
    creative: '#E91E63',
    social: '#FF9800',
    mindfulness: '#673AB7',
    relaxation: '#00BCD4',
  },
  appCategory: {
    social: '#E91E63',
    entertainment: '#9C27B0',
    games: '#F44336',
    productivity: '#4CAF50',
    communication: '#2196F3',
    education: '#FF9800',
    shopping: '#795548',
    finance: '#607D8B',
    health: '#00BCD4',
    news: '#3F51B5',
    travel: '#009688',
    utilities: '#9E9E9E',
    other: '#757575',
  },
  badge: {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  },
  transparent: {
    black10: 'rgba(0, 0, 0, 0.1)',
    black20: 'rgba(0, 0, 0, 0.2)',
    black30: 'rgba(0, 0, 0, 0.3)',
    black40: 'rgba(0, 0, 0, 0.4)',
    black50: 'rgba(0, 0, 0, 0.5)',
    black60: 'rgba(0, 0, 0, 0.6)',
    black70: 'rgba(0, 0, 0, 0.7)',
    black80: 'rgba(0, 0, 0, 0.8)',
    white10: 'rgba(255, 255, 255, 0.1)',
    white20: 'rgba(255, 255, 255, 0.2)',
    white30: 'rgba(255, 255, 255, 0.3)',
    white40: 'rgba(255, 255, 255, 0.4)',
    white50: 'rgba(255, 255, 255, 0.5)',
    white60: 'rgba(255, 255, 255, 0.6)',
    white70: 'rgba(255, 255, 255, 0.7)',
    white80: 'rgba(255, 255, 255, 0.8)',
  },
} as const;
export type ColorPalette = typeof colors;
export interface SemanticColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  success: string;
  successLight: string;
  successDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  error: string;
  errorLight: string;
  errorDark: string;
  info: string;
  infoLight: string;
  infoDark: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  modal: string;
  overlay: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;
  textOnPrimary: string;
  textOnSecondary: string;
  border: string;
  borderLight: string;
  borderDark: string;
  divider: string;
  link: string;
  linkVisited: string;
  focus: string;
  ripple: string;
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;
  tabBarBackground: string;
  tabBarBorder: string;
  headerBackground: string;
  statusBar: string;
}
export interface ThemeColors extends SemanticColors {
  palette: ColorPalette;
}
export const lightColors: SemanticColors = {
  primary: colors.primary[500],
  primaryLight: colors.primary[300],
  primaryDark: colors.primary[700],
  secondary: colors.secondary[500],
  secondaryLight: colors.secondary[300],
  secondaryDark: colors.secondary[700],
  accent: colors.accent[500],
  accentLight: colors.accent[300],
  accentDark: colors.accent[700],
  success: colors.success[500],
  successLight: colors.success[100],
  successDark: colors.success[700],
  warning: colors.warning[500],
  warningLight: colors.warning[100],
  warningDark: colors.warning[700],
  error: colors.error[500],
  errorLight: colors.error[100],
  errorDark: colors.error[700],
  info: colors.info[500],
  infoLight: colors.info[100],
  infoDark: colors.info[700],
  background: colors.neutral[50],
  backgroundSecondary: colors.neutral[100],
  surface: colors.neutral[0],
  surfaceVariant: colors.neutral[100],
  card: colors.neutral[0],
  modal: colors.neutral[0],
  overlay: colors.transparent.black50,
  text: colors.neutral[900],
  textSecondary: colors.neutral[700],
  textTertiary: colors.neutral[500],
  textDisabled: colors.neutral[400],
  textInverse: colors.neutral[0],
  textOnPrimary: colors.neutral[0],
  textOnSecondary: colors.neutral[0],
  border: colors.neutral[300],
  borderLight: colors.neutral[200],
  borderDark: colors.neutral[400],
  divider: colors.neutral[200],
  link: colors.info[600],
  linkVisited: colors.secondary[600],
  focus: colors.primary[500],
  ripple: colors.transparent.black10,
  inputBackground: colors.neutral[0],
  inputBorder: colors.neutral[300],
  inputPlaceholder: colors.neutral[500],
  tabBarBackground: colors.neutral[0],
  tabBarBorder: colors.neutral[200],
  headerBackground: colors.neutral[0],
  statusBar: colors.primary[500],
};
export const darkColors: SemanticColors = {
  primary: colors.primary[400],
  primaryLight: colors.primary[300],
  primaryDark: colors.primary[600],
  secondary: colors.secondary[400],
  secondaryLight: colors.secondary[300],
  secondaryDark: colors.secondary[600],
  accent: colors.accent[400],
  accentLight: colors.accent[300],
  accentDark: colors.accent[600],
  success: colors.success[400],
  successLight: colors.success[900],
  successDark: colors.success[600],
  warning: colors.warning[400],
  warningLight: colors.warning[900],
  warningDark: colors.warning[600],
  error: colors.error[400],
  errorLight: colors.error[900],
  errorDark: colors.error[600],
  info: colors.info[400],
  infoLight: colors.info[900],
  infoDark: colors.info[600],
  background: '#121212',
  backgroundSecondary: '#1E1E1E',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  card: '#252525',
  modal: '#2C2C2C',
  overlay: colors.transparent.black70,
  text: colors.neutral[50],
  textSecondary: colors.neutral[300],
  textTertiary: colors.neutral[400],
  textDisabled: colors.neutral[600],
  textInverse: colors.neutral[900],
  textOnPrimary: colors.neutral[900],
  textOnSecondary: colors.neutral[0],
  border: colors.neutral[700],
  borderLight: colors.neutral[800],
  borderDark: colors.neutral[600],
  divider: colors.neutral[800],
  link: colors.info[400],
  linkVisited: colors.secondary[400],
  focus: colors.primary[400],
  ripple: colors.transparent.white10,
  inputBackground: '#2C2C2C',
  inputBorder: colors.neutral[700],
  inputPlaceholder: colors.neutral[500],
  tabBarBackground: '#1E1E1E',
  tabBarBorder: colors.neutral[800],
  headerBackground: '#1E1E1E',
  statusBar: '#121212',
};
