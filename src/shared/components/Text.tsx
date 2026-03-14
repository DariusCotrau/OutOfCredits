import React, { memo } from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';
import { useTheme } from '@theme';
import type { TextVariant } from '@theme/typography';
export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  uppercase?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  size?: number;
  numberOfLines?: number;
  selectable?: boolean;
  children?: React.ReactNode;
}
export const Text = memo<TextProps>(function Text({
  variant = 'body',
  color,
  align,
  uppercase,
  italic,
  underline,
  strikethrough,
  weight,
  size,
  style,
  children,
  ...props
}) {
  const { theme } = useTheme();
  const typographyStyle = theme.typography[variant];
  const resolvedColor = color
    ? (theme.colors as unknown as Record<string, string>)[color] || color
    : theme.colors.text;
  const textDecorationLine: TextStyle['textDecorationLine'] = (() => {
    if (underline && strikethrough) return 'underline line-through';
    if (underline) return 'underline';
    if (strikethrough) return 'line-through';
    return 'none';
  })();
  const fontWeight = weight
    ? theme.fonts.weights[weight]
    : typographyStyle.fontWeight;
  const combinedStyle: TextStyle = {
    ...typographyStyle,
    color: resolvedColor,
    ...(align && { textAlign: align }),
    ...(uppercase && { textTransform: 'uppercase' }),
    ...(italic && { fontStyle: 'italic' }),
    ...(textDecorationLine !== 'none' && { textDecorationLine }),
    ...(fontWeight && { fontWeight }),
    ...(size && { fontSize: size, lineHeight: size * 1.5 }),
  };
  return (
    <RNText style={[combinedStyle, style]} {...props}>
      {children}
    </RNText>
  );
});
export const DisplayText = memo<Omit<TextProps, 'variant'>>(function DisplayText(
  props
) {
  return <Text variant="display1" {...props} />;
});
export const H1 = memo<Omit<TextProps, 'variant'>>(function H1(props) {
  return <Text variant="h1" {...props} />;
});
export const H2 = memo<Omit<TextProps, 'variant'>>(function H2(props) {
  return <Text variant="h2" {...props} />;
});
export const H3 = memo<Omit<TextProps, 'variant'>>(function H3(props) {
  return <Text variant="h3" {...props} />;
});
export const H4 = memo<Omit<TextProps, 'variant'>>(function H4(props) {
  return <Text variant="h4" {...props} />;
});
export const BodyText = memo<Omit<TextProps, 'variant'>>(function BodyText(
  props
) {
  return <Text variant="body" {...props} />;
});
export const SmallText = memo<Omit<TextProps, 'variant'>>(function SmallText(
  props
) {
  return <Text variant="bodySmall" {...props} />;
});
export const Caption = memo<Omit<TextProps, 'variant'>>(function Caption(props) {
  return <Text variant="caption" color="textSecondary" {...props} />;
});
export const Label = memo<Omit<TextProps, 'variant'>>(function Label(props) {
  return <Text variant="label" {...props} />;
});
export default Text;
