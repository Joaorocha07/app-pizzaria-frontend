import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, 'Pagamentos'>;
};

const TITLES: Record<string, string> = {
  Pagamentos: 'Pagamentos',
};

export function PlaceholderScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const title = TITLES[route.name] ?? route.name;

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.title, { color: colors.text }]}>{title}</Text>
      </View>

      {/* Content */}
      <View style={s.body}>
        <Ionicons name="time-outline" size={52} color={colors.textMuted} />
        <Text style={[s.label, { color: colors.textMuted }]}>Em breve</Text>
        <Text style={[s.sub, { color: colors.textMuted }]}>
          Esta funcionalidade estará disponível em breve.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  label: { fontSize: 22, fontWeight: '800' },
  sub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
