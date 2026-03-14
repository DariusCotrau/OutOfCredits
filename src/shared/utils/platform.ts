import { Platform, Dimensions, PixelRatio, StatusBar } from 'react-native';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const platformSelect = <T>(options: { ios?: T; android?: T; default: T }): T => {
  if (isIOS && options.ios !== undefined) return options.ios;
  if (isAndroid && options.android !== undefined) return options.android;
  return options.default;
};
export const osVersion = Platform.Version;
export const isOSVersionAtLeast = (version: number): boolean => {
  const currentVersion =
    typeof osVersion === 'string' ? parseInt(osVersion, 10) : osVersion;
  return currentVersion >= version;
};
export const getScreenDimensions = () => {
  const { width, height } = Dimensions.get('screen');
  return { width, height };
};
export const getWindowDimensions = () => {
  const { width, height } = Dimensions.get('window');
  return { width, height };
};
export const screenWidth = Dimensions.get('screen').width;
export const screenHeight = Dimensions.get('screen').height;
export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;
export const isLandscape = (): boolean => {
  const { width, height } = getWindowDimensions();
  return width > height;
};
export const isPortrait = (): boolean => {
  const { width, height } = getWindowDimensions();
  return height >= width;
};
const TABLET_THRESHOLD = 600;
export const isTablet = (): boolean => {
  const { width, height } = getWindowDimensions();
  const minDimension = Math.min(width, height);
  return minDimension >= TABLET_THRESHOLD;
};
export const isPhone = (): boolean => !isTablet();
const SMALL_PHONE_THRESHOLD = 375;
export const isSmallPhone = (): boolean => {
  const { width } = getWindowDimensions();
  return width < SMALL_PHONE_THRESHOLD;
};
export const pixelRatio = PixelRatio.get();
export const fontScale = PixelRatio.getFontScale();
export const dpToPx = (dp: number): number => PixelRatio.getPixelSizeForLayoutSize(dp);
export const pxToDp = (px: number): number => px / pixelRatio;
export const roundToNearestPixel = (size: number): number =>
  PixelRatio.roundToNearestPixel(size);
export const getStatusBarHeight = (): number => {
  return StatusBar.currentHeight ?? (isIOS ? 44 : 0);
};
export const statusBarHeight = getStatusBarHeight();
const NOTCHED_DEVICES = {
  iphoneX: { width: 375, height: 812 },
  iphoneXsMax: { width: 414, height: 896 },
  iphone12: { width: 390, height: 844 },
  iphone12Mini: { width: 375, height: 812 },
  iphone12ProMax: { width: 428, height: 926 },
  iphone14Pro: { width: 393, height: 852 },
  iphone14ProMax: { width: 430, height: 932 },
};
export const hasNotch = (): boolean => {
  if (isAndroid) {
    return false;
  }
  const { width, height } = getWindowDimensions();
  return Object.values(NOTCHED_DEVICES).some(
    (device) =>
      (device.width === width && device.height === height) ||
      (device.width === height && device.height === width)
  );
};
export const breakpoints = {
  xs: 320,
  sm: 375,
  md: 414,
  lg: 600,
  xl: 768,
  xxl: 1024,
} as const;
export const getCurrentBreakpoint = (): keyof typeof breakpoints => {
  const width = windowWidth;
  if (width < breakpoints.sm) return 'xs';
  if (width < breakpoints.md) return 'sm';
  if (width < breakpoints.lg) return 'md';
  if (width < breakpoints.xl) return 'lg';
  if (width < breakpoints.xxl) return 'xl';
  return 'xxl';
};
export const isAtLeast = (breakpoint: keyof typeof breakpoints): boolean => {
  return windowWidth >= breakpoints[breakpoint];
};
export const isBelow = (breakpoint: keyof typeof breakpoints): boolean => {
  return windowWidth < breakpoints[breakpoint];
};
export const responsive = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
  default: T;
}): T => {
  const breakpoint = getCurrentBreakpoint();
  if (breakpoint === 'xxl' && values.xxl !== undefined) return values.xxl;
  if (breakpoint === 'xl' && values.xl !== undefined) return values.xl;
  if (breakpoint === 'lg' && values.lg !== undefined) return values.lg;
  if (breakpoint === 'md' && values.md !== undefined) return values.md;
  if (breakpoint === 'sm' && values.sm !== undefined) return values.sm;
  if (breakpoint === 'xs' && values.xs !== undefined) return values.xs;
  return values.default;
};
export const scale = (size: number): number => {
  const baseWidth = 375;
  return (windowWidth / baseWidth) * size;
};
export const verticalScale = (size: number): number => {
  const baseHeight = 812;
  return (windowHeight / baseHeight) * size;
};
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};
export const isRTL = (): boolean => {
  return false;
};
export const prefersReducedMotion = (): boolean => {
  return false;
};
