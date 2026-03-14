import React, { memo, useState, useCallback } from 'react';
import {
  View,
  Image,
  ImageSourcePropType,
  ViewStyle,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '@theme';
import { Text } from './Text';
import { Badge, StatusBadge } from './Badge';
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'rounded' | 'square';
export type UserStatus = 'online' | 'offline' | 'away' | 'busy' | 'dnd';
export interface AvatarProps {
  source?: ImageSourcePropType;
  uri?: string;
  initials?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  backgroundColor?: string;
  textColor?: string;
  status?: UserStatus;
  bordered?: boolean;
  borderColor?: string;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}
export interface AvatarGroupProps {
  avatars: Omit<AvatarProps, 'size'>[];
  max?: number;
  size?: AvatarSize;
  overlap?: number;
  style?: ViewStyle;
}
const getSizeConfig = (
  size: AvatarSize
): { container: number; fontSize: number; statusSize: 'sm' | 'md' | 'lg' } => {
  switch (size) {
    case 'xs':
      return { container: 24, fontSize: 10, statusSize: 'sm' };
    case 'sm':
      return { container: 32, fontSize: 12, statusSize: 'sm' };
    case 'md':
      return { container: 40, fontSize: 14, statusSize: 'sm' };
    case 'lg':
      return { container: 56, fontSize: 18, statusSize: 'md' };
    case 'xl':
      return { container: 72, fontSize: 24, statusSize: 'md' };
    case '2xl':
      return { container: 96, fontSize: 32, statusSize: 'lg' };
    default:
      return { container: 40, fontSize: 14, statusSize: 'sm' };
  }
};
const getBorderRadius = (shape: AvatarShape, size: number): number => {
  switch (shape) {
    case 'circle':
      return size / 2;
    case 'rounded':
      return size / 4;
    case 'square':
      return 0;
    default:
      return size / 2;
  }
};
const generateInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
const generateColorFromString = (str: string): string => {
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFC107', '#FF9800', '#FF5722', '#795548',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
export const Avatar = memo<AvatarProps>(function Avatar({
  source,
  uri,
  initials,
  name,
  size = 'md',
  shape = 'circle',
  backgroundColor,
  textColor,
  status,
  bordered = false,
  borderColor,
  onPress,
  style,
  testID,
}) {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);
  const sizeConfig = getSizeConfig(size);
  const borderRadius = getBorderRadius(shape, sizeConfig.container);
  const hasImage = (source || uri) && !imageError;
  const displayInitials =
    initials || (name ? generateInitials(name) : undefined);
  const bgColor =
    backgroundColor ||
    (name ? generateColorFromString(name) : theme.colors.surfaceVariant);
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  const containerStyle: ViewStyle = {
    width: sizeConfig.container,
    height: sizeConfig.container,
    borderRadius,
    backgroundColor: hasImage ? 'transparent' : bgColor,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...(bordered && {
      borderWidth: 2,
      borderColor: borderColor ?? theme.colors.background,
    }),
  };
  const renderContent = () => {
    if (hasImage) {
      const imageSource = source || { uri };
      return (
        <Image
          source={imageSource as ImageSourcePropType}
          style={styles.image}
          onError={handleImageError}
        />
      );
    }
    if (displayInitials) {
      return (
        <Text
          style={{
            fontSize: sizeConfig.fontSize,
            fontWeight: '600',
            color: textColor ?? '#FFFFFF',
          }}
        >
          {displayInitials}
        </Text>
      );
    }
    return (
      <View style={styles.placeholder}>
        <View
          style={[
            styles.placeholderHead,
            {
              width: sizeConfig.container * 0.35,
              height: sizeConfig.container * 0.35,
              borderRadius: sizeConfig.container * 0.175,
              backgroundColor: textColor ?? '#FFFFFF',
            },
          ]}
        />
        <View
          style={[
            styles.placeholderBody,
            {
              width: sizeConfig.container * 0.6,
              height: sizeConfig.container * 0.3,
              borderRadius: sizeConfig.container * 0.3,
              backgroundColor: textColor ?? '#FFFFFF',
            },
          ]}
        />
      </View>
    );
  };
  const avatarElement = (
    <View style={[containerStyle, style]} testID={testID}>
      {renderContent()}
    </View>
  );
  const content = onPress ? (
    <Pressable onPress={onPress}>{avatarElement}</Pressable>
  ) : (
    avatarElement
  );
  if (status) {
    return (
      <View style={styles.wrapper}>
        {content}
        <View
          style={[
            styles.statusIndicator,
            {
              right: shape === 'circle' ? 0 : -2,
              bottom: shape === 'circle' ? 0 : -2,
            },
          ]}
        >
          <StatusBadge status={status} size={sizeConfig.statusSize} />
        </View>
      </View>
    );
  }
  return content;
});
export const AvatarGroup = memo<AvatarGroupProps>(function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  overlap,
  style,
}) {
  const { theme } = useTheme();
  const sizeConfig = getSizeConfig(size);
  const overlapAmount = overlap ?? sizeConfig.container * 0.3;
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;
  return (
    <View style={[styles.groupContainer, style]}>
      {visibleAvatars.map((avatarProps, index) => (
        <View
          key={index}
          style={[
            styles.groupItem,
            {
              marginLeft: index === 0 ? 0 : -overlapAmount,
              zIndex: visibleAvatars.length - index,
            },
          ]}
        >
          <Avatar
            {...avatarProps}
            size={size}
            bordered
            borderColor={theme.colors.background}
          />
        </View>
      ))}
      {remainingCount > 0 && (
        <View
          style={[
            styles.groupItem,
            {
              marginLeft: -overlapAmount,
              zIndex: 0,
            },
          ]}
        >
          <View
            style={[
              styles.remainingCount,
              {
                width: sizeConfig.container,
                height: sizeConfig.container,
                borderRadius: sizeConfig.container / 2,
                backgroundColor: theme.colors.surfaceVariant,
                borderWidth: 2,
                borderColor: theme.colors.background,
              },
            ]}
          >
            <Text
              style={{
                fontSize: sizeConfig.fontSize * 0.8,
                fontWeight: '600',
                color: theme.colors.textSecondary,
              }}
            >
              +{remainingCount}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
});
export interface AvatarWithBadgeProps extends AvatarProps {
  badgeContent?: string | number;
  badgeColor?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}
export const AvatarWithBadge = memo<AvatarWithBadgeProps>(
  function AvatarWithBadge({ badgeContent, badgeColor = 'error', ...props }) {
    return (
      <View style={styles.wrapper}>
        <Avatar {...props} />
        {badgeContent !== undefined && (
          <View style={styles.badgePosition}>
            <Badge content={badgeContent} color={badgeColor} size="sm" />
          </View>
        )}
      </View>
    );
  }
);
const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  placeholderHead: {
    marginBottom: -2,
  },
  placeholderBody: {
    marginTop: -4,
  },
  statusIndicator: {
    position: 'absolute',
  },
  badgePosition: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  groupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupItem: {
  },
  remainingCount: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default Avatar;
