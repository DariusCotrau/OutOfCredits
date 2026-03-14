import React, { memo } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme, type SpacingValue } from '@theme';
export type SpacerSize =
  | SpacingValue
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl';
const semanticSizeMap: Partial<Record<SpacerSize, SpacingValue>> = {
  xs: '1',
  sm: '2',
  md: '4',
  lg: '6',
  xl: '8',
};
export interface SpacerProps {
  size?: SpacerSize;
  px?: number;
  direction?: 'vertical' | 'horizontal' | 'both';
  flex?: boolean | number;
  testID?: string;
}
export const Spacer = memo<SpacerProps>(function Spacer({
  size = '4',
  px,
  direction = 'vertical',
  flex,
  testID,
}) {
  const { theme } = useTheme();
  const spacingKey = (semanticSizeMap[size] ?? size) as SpacingValue;
  const spacingValue = px ?? theme.spacing[spacingKey];
  const style: ViewStyle = {};
  if (flex) {
    style.flex = typeof flex === 'number' ? flex : 1;
  } else {
    switch (direction) {
      case 'vertical':
        style.height = spacingValue;
        break;
      case 'horizontal':
        style.width = spacingValue;
        break;
      case 'both':
        style.width = spacingValue;
        style.height = spacingValue;
        break;
    }
  }
  return <View style={style} testID={testID} />;
});
export interface VSpacerProps {
  size?: SpacerSize;
  px?: number;
  testID?: string;
}
export const VSpacer = memo<VSpacerProps>(function VSpacer({
  size = '4',
  px,
  testID,
}) {
  return <Spacer size={size} px={px} direction="vertical" testID={testID} />;
});
export interface HSpacerProps {
  size?: SpacerSize;
  px?: number;
  testID?: string;
}
export const HSpacer = memo<HSpacerProps>(function HSpacer({
  size = '4',
  px,
  testID,
}) {
  return <Spacer size={size} px={px} direction="horizontal" testID={testID} />;
});
export interface FlexSpacerProps {
  flex?: number;
  testID?: string;
}
export const FlexSpacer = memo<FlexSpacerProps>(function FlexSpacer({
  flex = 1,
  testID,
}) {
  return <Spacer flex={flex} testID={testID} />;
});
export const SpacerXS = memo(function SpacerXS() {
  return <Spacer size="1" />;
});
export const SpacerSM = memo(function SpacerSM() {
  return <Spacer size="2" />;
});
export const SpacerMD = memo(function SpacerMD() {
  return <Spacer size="4" />;
});
export const SpacerLG = memo(function SpacerLG() {
  return <Spacer size="6" />;
});
export const SpacerXL = memo(function SpacerXL() {
  return <Spacer size="8" />;
});
export default Spacer;
