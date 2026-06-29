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
    outputRange: [error ? '#E63946' : '#2A2A2A', '#E63946'],
  });

  const iconColor = isFocused ? '#E63946' : '#666666';

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={[styles.label, { color: colors.textSecondary }, isFocused && styles.labelFocused, error ? styles.labelError : null]}>
          {label}
        </Text>
      ) : null}

      <Animated.View
        style={[
          styles.container,
          { borderColor, backgroundColor: colors.bgInput },
          isFocused && styles.containerFocused,
          error ? styles.containerError : null,
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

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    color: '#A0A0A0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelFocused: {
    color: '#E63946',
  },
  labelError: {
    color: '#E63946',
  },
  container: {
    height: 54,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  containerFocused: {
    backgroundColor: '#1E1E1E',
    shadowColor: '#E63946',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 0,
  },
  containerError: {
    borderColor: '#E63946',
  },
  iconLeft: {
    marginRight: 10,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
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
    color: '#E63946',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 2,
  },
});
