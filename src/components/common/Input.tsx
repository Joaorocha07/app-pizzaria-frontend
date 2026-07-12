import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword,
  value,
  onChangeText,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.danger : colors.border, colors.primary],
  });

  const iconColor = isFocused ? colors.primary : colors.textMuted;

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text
          style={[
            styles.label,
            { color: colors.textSecondary },
            isFocused && { color: colors.primary },
            error ? { color: colors.danger } : null,
          ]}
        >
          {label.toUpperCase()}
        </Text>
      ) : null}

      <Animated.View
        style={[
          styles.container,
          { borderColor, backgroundColor: colors.bgInput },
          error ? { borderColor: colors.danger } : null,
        ]}
      >
        {leftIcon ? (
          <View style={styles.iconLeft}>
            {React.isValidElement(leftIcon)
              ? React.cloneElement(leftIcon as React.ReactElement<any>, { color: iconColor })
              : leftIcon}
          </View>
        ) : null}

        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            leftIcon ? styles.inputWithLeft : null,
            isPassword || rightIcon ? styles.inputWithRight : null,
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.iconRight}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={iconColor}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </Animated.View>

      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: letterSpacing.caps,
    marginBottom: 8,
  },
  container: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  iconLeft: {
    marginRight: 10,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 15,
    height: '100%',
  },
  inputWithLeft: {},
  inputWithRight: {
    marginRight: 8,
  },
  iconRight: {
    padding: 4,
    justifyContent: 'center',
  },
  error: {
    fontSize: 12,
    marginTop: 5,
    marginLeft: 2,
  },
});
