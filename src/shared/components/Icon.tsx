import React, { memo } from 'react';
import { View, ViewStyle, StyleSheet, Text as RNText } from 'react-native';
import { useTheme } from '@theme';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type CommonIconName =
  | 'home'
  | 'back'
  | 'forward'
  | 'menu'
  | 'close'
  | 'settings'
  | 'add'
  | 'remove'
  | 'edit'
  | 'delete'
  | 'search'
  | 'filter'
  | 'sort'
  | 'share'
  | 'copy'
  | 'save'
  | 'refresh'
  | 'check'
  | 'error'
  | 'warning'
  | 'info'
  | 'help'
  | 'play'
  | 'pause'
  | 'stop'
  | 'camera'
  | 'image'
  | 'video'
  | 'notification'
  | 'message'
  | 'email'
  | 'phone'
  | 'user'
  | 'users'
  | 'profile'
  | 'logout'
  | 'timer'
  | 'calendar'
  | 'chart'
  | 'trophy'
  | 'star'
  | 'heart'
  | 'bookmark'
  | 'lock'
  | 'unlock'
  | string;
export interface IconProps {
  name: CommonIconName;
  size?: IconSize | number;
  color?: string;
  family?: 'material' | 'feather' | 'ionicons' | 'fontawesome';
  solid?: boolean;
  style?: ViewStyle;
  testID?: string;
}
const getSizeValue = (size: IconSize | number): number => {
  if (typeof size === 'number') {
    return size;
  }
  switch (size) {
    case 'xs':
      return 12;
    case 'sm':
      return 16;
    case 'md':
      return 24;
    case 'lg':
      return 32;
    case 'xl':
      return 40;
    case '2xl':
      return 48;
    default:
      return 24;
  }
};
const iconCharMap: Record<string, string> = {
  home: '🏠',
  back: '←',
  forward: '→',
  menu: '☰',
  close: '✕',
  settings: '⚙',
  add: '+',
  remove: '−',
  edit: '✎',
  delete: '🗑',
  search: '🔍',
  filter: '⚡',
  sort: '↕',
  share: '↗',
  copy: '⧉',
  save: '💾',
  refresh: '↻',
  check: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
  help: '?',
  play: '▶',
  pause: '⏸',
  stop: '⏹',
  camera: '📷',
  image: '🖼',
  video: '🎬',
  notification: '🔔',
  message: '💬',
  email: '✉',
  phone: '📱',
  user: '👤',
  users: '👥',
  profile: '👤',
  logout: '↪',
  timer: '⏱',
  calendar: '📅',
  chart: '📊',
  trophy: '🏆',
  star: '★',
  heart: '♥',
  bookmark: '🔖',
  lock: '🔒',
  unlock: '🔓',
};
export const Icon = memo<IconProps>(function Icon({
  name,
  size = 'md',
  color,
  family = 'material',
  solid = false,
  style,
  testID,
}) {
  const { theme } = useTheme();
  const sizeValue = getSizeValue(size);
  const iconColor = color ?? theme.colors.text;
  const iconChar = iconCharMap[name] ?? '•';
  const containerStyle: ViewStyle = {
    width: sizeValue,
    height: sizeValue,
    justifyContent: 'center',
    alignItems: 'center',
  };
  return (
    <View style={[containerStyle, style]} testID={testID}>
      <RNText
        style={{
          fontSize: sizeValue * 0.85,
          color: iconColor,
          textAlign: 'center',
          lineHeight: sizeValue,
        }}
      >
        {iconChar}
      </RNText>
    </View>
  );
});
const createIconComponent = (defaultName: CommonIconName) =>
  memo<Omit<IconProps, 'name'> & { name?: CommonIconName }>(
    function PresetIcon({ name = defaultName, ...props }) {
      return <Icon name={name} {...props} />;
    }
  );
export const HomeIcon = createIconComponent('home');
export const BackIcon = createIconComponent('back');
export const ForwardIcon = createIconComponent('forward');
export const MenuIcon = createIconComponent('menu');
export const CloseIcon = createIconComponent('close');
export const SettingsIcon = createIconComponent('settings');
export const AddIcon = createIconComponent('add');
export const RemoveIcon = createIconComponent('remove');
export const EditIcon = createIconComponent('edit');
export const DeleteIcon = createIconComponent('delete');
export const SearchIcon = createIconComponent('search');
export const FilterIcon = createIconComponent('filter');
export const ShareIcon = createIconComponent('share');
export const SaveIcon = createIconComponent('save');
export const RefreshIcon = createIconComponent('refresh');
export const CheckIcon = createIconComponent('check');
export const ErrorIcon = createIconComponent('error');
export const WarningIcon = createIconComponent('warning');
export const InfoIcon = createIconComponent('info');
export const HelpIcon = createIconComponent('help');
export const UserIcon = createIconComponent('user');
export const UsersIcon = createIconComponent('users');
export const ProfileIcon = createIconComponent('profile');
export const TimerIcon = createIconComponent('timer');
export const CalendarIcon = createIconComponent('calendar');
export const ChartIcon = createIconComponent('chart');
export const TrophyIcon = createIconComponent('trophy');
export const StarIcon = createIconComponent('star');
export const HeartIcon = createIconComponent('heart');
export const NotificationIcon = createIconComponent('notification');
export interface CircleIconProps extends IconProps {
  backgroundColor?: string;
  padding?: number;
}
export const CircleIcon = memo<CircleIconProps>(function CircleIcon({
  backgroundColor,
  padding = 8,
  size = 'md',
  ...props
}) {
  const { theme } = useTheme();
  const sizeValue = getSizeValue(size);
  const totalSize = sizeValue + padding * 2;
  return (
    <View
      style={[
        styles.circleContainer,
        {
          width: totalSize,
          height: totalSize,
          borderRadius: totalSize / 2,
          backgroundColor: backgroundColor ?? theme.colors.surfaceVariant,
        },
      ]}
    >
      <Icon size={size} {...props} />
    </View>
  );
});
export interface SquareIconProps extends IconProps {
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}
export const SquareIcon = memo<SquareIconProps>(function SquareIcon({
  backgroundColor,
  padding = 8,
  borderRadius = 8,
  size = 'md',
  ...props
}) {
  const { theme } = useTheme();
  const sizeValue = getSizeValue(size);
  const totalSize = sizeValue + padding * 2;
  return (
    <View
      style={[
        styles.squareContainer,
        {
          width: totalSize,
          height: totalSize,
          borderRadius,
          backgroundColor: backgroundColor ?? theme.colors.surfaceVariant,
        },
      ]}
    >
      <Icon size={size} {...props} />
    </View>
  );
});
const styles = StyleSheet.create({
  circleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default Icon;
