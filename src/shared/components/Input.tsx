import React, { memo, useState, useCallback, forwardRef } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@theme';
import { Text } from './Text';
export type InputVariant = 'outlined' | 'filled' | 'underlined';
export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  error?: string;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  containerStyle?: ViewStyle;
  style?: TextStyle;
  testID?: string;
}
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
export const Input = memo(
  forwardRef<TextInput, InputProps>(function Input(
    {
      label,
      helperText,
      error,
      variant = 'outlined',
      leftIcon,
      rightIcon,
      disabled = false,
      required = false,
      containerStyle,
      style,
      onFocus,
      onBlur,
      testID,
      ...props
    },
    ref
  ) {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const focusAnimation = useSharedValue(0);
    const handleFocus = useCallback(
      (e: any) => {
        setIsFocused(true);
        focusAnimation.value = withTiming(1, { duration: 200 });
        onFocus?.(e);
      },
      [onFocus, focusAnimation]
    );
    const handleBlur = useCallback(
      (e: any) => {
        setIsFocused(false);
        focusAnimation.value = withTiming(0, { duration: 200 });
        onBlur?.(e);
      },
      [onBlur, focusAnimation]
    );
    const hasError = !!error;
    const borderColor = hasError
      ? theme.colors.error
      : isFocused
      ? theme.colors.primary
      : theme.colors.inputBorder;
    const getVariantStyles = (): ViewStyle => {
      switch (variant) {
        case 'filled':
          return {
            backgroundColor: theme.colors.inputBackground,
            borderWidth: 0,
            borderBottomWidth: 2,
            borderColor,
            borderRadius: theme.borderRadius.md,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          };
        case 'underlined':
          return {
            backgroundColor: 'transparent',
            borderWidth: 0,
            borderBottomWidth: 2,
            borderColor,
            borderRadius: 0,
          };
        case 'outlined':
        default:
          return {
            backgroundColor: theme.colors.inputBackground,
            borderWidth: 2,
            borderColor,
            borderRadius: theme.borderRadius.md,
          };
      }
    };
    const animatedContainerStyle = useAnimatedStyle(() => {
      return {
        borderColor: hasError
          ? theme.colors.error
          : interpolateColor(
              focusAnimation.value,
              [0, 1],
              [theme.colors.inputBorder, theme.colors.primary]
            ),
      };
    });
    const inputContainerStyle: ViewStyle = {
      ...getVariantStyles(),
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 56,
      paddingHorizontal: theme.spacing['4'],
      opacity: disabled ? 0.5 : 1,
    };
    return (
      <View style={[styles.container, containerStyle]} testID={testID}>
        {}
        {label && (
          <View style={styles.labelContainer}>
            <Text
              variant="label"
              color={hasError ? 'error' : isFocused ? 'primary' : 'textSecondary'}
              style={styles.label}
            >
              {label}
              {required && (
                <Text color="error" style={styles.required}>
                  {' '}
                  *
                </Text>
              )}
            </Text>
          </View>
        )}
        {}
        <AnimatedView
          style={[inputContainerStyle, animatedContainerStyle]}
        >
          {}
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          {}
          <AnimatedTextInput
            ref={ref}
            style={[
              styles.input,
              theme.typography.body,
              { color: theme.colors.text },
              style,
            ]}
            placeholderTextColor={theme.colors.inputPlaceholder}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            testID={testID ? `${testID}-input` : undefined}
            {...props}
          />
          {}
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </AnimatedView>
        {}
        {(helperText || error) && (
          <Text
            variant="caption"
            color={hasError ? 'error' : 'textTertiary'}
            style={styles.helperText}
          >
            {error || helperText}
          </Text>
        )}
      </View>
    );
  })
);
export interface PasswordInputProps extends Omit<InputProps, 'secureTextEntry'> {
  showToggle?: boolean;
}
export const PasswordInput = memo(
  forwardRef<TextInput, PasswordInputProps>(function PasswordInput(
    { showToggle = true, rightIcon, ...props },
    ref
  ) {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const toggleVisibility = useCallback(() => {
      setIsVisible((prev) => !prev);
    }, []);
    const toggleIcon = showToggle ? (
      <Pressable onPress={toggleVisibility} hitSlop={8}>
        <Text color="textSecondary">{isVisible ? '👁️' : '👁️‍🗨️'}</Text>
      </Pressable>
    ) : (
      rightIcon
    );
    return (
      <Input
        ref={ref}
        secureTextEntry={!isVisible}
        rightIcon={toggleIcon}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
    );
  })
);
export interface SearchInputProps extends InputProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
}
export const SearchInput = memo(
  forwardRef<TextInput, SearchInputProps>(function SearchInput(
    { onSearch, onClear, value, onChangeText, ...props },
    ref
  ) {
    const { theme } = useTheme();
    const handleSubmit = useCallback(() => {
      if (value && onSearch) {
        onSearch(value.toString());
      }
    }, [value, onSearch]);
    const handleClear = useCallback(() => {
      onChangeText?.('');
      onClear?.();
    }, [onChangeText, onClear]);
    const clearButton =
      value && value.toString().length > 0 ? (
        <Pressable onPress={handleClear} hitSlop={8}>
          <Text color="textSecondary">✕</Text>
        </Pressable>
      ) : null;
    return (
      <Input
        ref={ref}
        variant="filled"
        leftIcon={<Text color="textSecondary">🔍</Text>}
        rightIcon={clearButton}
        placeholder="Search..."
        returnKeyType="search"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
    );
  })
);
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 6,
  },
  label: {
    marginBottom: 4,
  },
  required: {
    marginLeft: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 12,
  },
  helperText: {
    marginTop: 4,
    marginLeft: 4,
  },
});
export default Input;
