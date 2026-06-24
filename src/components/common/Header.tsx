import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'transparent';
}

export function Header({ title, subtitle, onBack, rightElement, variant = 'default' }: HeaderProps) {
  const insets = useSafeAreaInsets();
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
        {/* Left — back button or spacer */}
        <View style={styles.side}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <View style={styles.backCircle}>
                <Ionicons name="arrow-back" size={20} color="#F5F0E8" />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Center — title */}
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
        </View>

        {/* Right — action or spacer */}
        <View style={styles.side}>
          {rightElement ?? (onBack ? <View style={styles.placeholder} /> : null)}
        </View>
      </View>

      {!isTransparent && <View style={styles.divider} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  solid: {
    backgroundColor: '#0D0D0D',
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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 1,
  },
  backBtn: {
    padding: 2,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 36,
    height: 36,
  },
  divider: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginTop: 12,
    marginHorizontal: -16,
  },
});
