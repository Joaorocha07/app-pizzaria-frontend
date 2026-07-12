import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { AppColors } from '../../theme/theme';
import { fontFamily, radius } from '../../theme/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'transparent';
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    solid: {
      backgroundColor: c.bg,
    },
    transparent: {
      backgroundColor: 'transparent',
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    side: {
      width: 44,
      alignItems: 'flex-start',
    },
    center: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      color: c.text,
      fontFamily: fontFamily.headingBold,
      fontSize: 19,
      letterSpacing: 0.3,
    },
    subtitle: {
      color: c.textMuted,
      fontFamily: fontFamily.bodyRegular,
      fontSize: 12,
      marginTop: 1,
    },
    backBtn: {
      padding: 2,
    },
    backCircle: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholder: {
      width: 36,
      height: 36,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
      marginTop: 12,
      marginHorizontal: -16,
    },
  });
}

export function Header({ title, subtitle, onBack, rightElement, variant = 'default' }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const paddingTop = insets.top + 12;
  const isTransparent = variant === 'transparent';

  return (
    <View
      style={[
        styles.container,
        { paddingTop },
        isTransparent ? styles.transparent : styles.solid,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.side}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <View style={styles.backCircle}>
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        <View style={styles.side}>
          {rightElement ?? (onBack ? <View style={styles.placeholder} /> : null)}
        </View>
      </View>

      {!isTransparent && <View style={styles.divider} />}
    </View>
  );
}
