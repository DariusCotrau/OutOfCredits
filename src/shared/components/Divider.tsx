import React, { memo } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@theme';
import { Text } from './Text';
export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerThickness = 'hairline' | 'thin' | 'medium' | 'thick';
export interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  thickness?: DividerThickness;
  color?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  insetStart?: number;
  insetEnd?: number;
  label?: string;
  labelPosition?: 'start' | 'center' | 'end';
  style?: ViewStyle;
  testID?: string;
}
const getThicknessValue = (thickness: DividerThickness): number => {
  switch (thickness) {
    case 'hairline':
      return StyleSheet.hairlineWidth;
    case 'thin':
      return 1;
    case 'medium':
      return 2;
    case 'thick':
      return 4;
    default:
      return 1;
  }
};
const getSpacingValue = (
  spacing: 'none' | 'sm' | 'md' | 'lg',
  themeSpacing: Record<string, number>
): number => {
  switch (spacing) {
    case 'none':
      return 0;
    case 'sm':
      return themeSpacing['2'];
    case 'md':
      return themeSpacing['4'];
    case 'lg':
      return themeSpacing['6'];
    default:
      return 0;
  }
};
export const Divider = memo<DividerProps>(function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  thickness = 'thin',
  color,
  spacing = 'none',
  insetStart = 0,
  insetEnd = 0,
  label,
  labelPosition = 'center',
  style,
  testID,
}) {
  const { theme } = useTheme();
  const isHorizontal = orientation === 'horizontal';
  const thicknessValue = getThicknessValue(thickness);
  const spacingValue = getSpacingValue(spacing, theme.spacing);
  const dividerColor = color ?? theme.colors.border;
  const dividerStyle: ViewStyle = {
    backgroundColor: dividerColor,
    ...(isHorizontal
      ? {
          height: thicknessValue,
          marginVertical: spacingValue,
          marginLeft: insetStart,
          marginRight: insetEnd,
        }
      : {
          width: thicknessValue,
          marginHorizontal: spacingValue,
          marginTop: insetStart,
          marginBottom: insetEnd,
        }),
  };
  if (variant !== 'solid') {
    dividerStyle.backgroundColor = 'transparent';
    dividerStyle.borderStyle = variant;
    dividerStyle.borderColor = dividerColor;
    if (isHorizontal) {
      dividerStyle.borderBottomWidth = thicknessValue;
    } else {
      dividerStyle.borderLeftWidth = thicknessValue;
    }
  }
  if (label && isHorizontal) {
    return (
      <View
        style={[styles.labeledContainer, { marginVertical: spacingValue }]}
        testID={testID}
      >
        {(labelPosition === 'center' || labelPosition === 'end') && (
          <View
            style={[
              styles.labeledLine,
              { backgroundColor: dividerColor, height: thicknessValue },
              labelPosition === 'end' && styles.labeledLineFlex,
            ]}
          />
        )}
        <Text
          variant="caption"
          color="textTertiary"
          style={styles.label}
        >
          {label}
        </Text>
        {(labelPosition === 'center' || labelPosition === 'start') && (
          <View
            style={[
              styles.labeledLine,
              { backgroundColor: dividerColor, height: thicknessValue },
              labelPosition === 'start' && styles.labeledLineFlex,
            ]}
          />
        )}
      </View>
    );
  }
  return (
    <View
      style={[dividerStyle, style]}
      testID={testID}
      accessibilityRole="text"
    />
  );
});
export const HDivider = memo(function HDivider(
  props: Omit<DividerProps, 'orientation'>
) {
  return <Divider {...props} orientation="horizontal" />;
});
export const VDivider = memo(function VDivider(
  props: Omit<DividerProps, 'orientation'>
) {
  return <Divider {...props} orientation="vertical" />;
});
export const ListDivider = memo<{
  inset?: number;
  spacing?: DividerProps['spacing'];
}>(function ListDivider({ inset = 16, spacing = 'none' }) {
  return <Divider insetStart={inset} spacing={spacing} />;
});
export const SectionDivider = memo<{
  label?: string;
}>(function SectionDivider({ label }) {
  return <Divider spacing="lg" label={label} />;
});
const styles = StyleSheet.create({
  labeledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labeledLine: {
    flex: 1,
  },
  labeledLineFlex: {
    flex: 1,
  },
  label: {
    paddingHorizontal: 12,
  },
});
export default Divider;
