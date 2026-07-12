import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../theme/theme';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';

const { width: SW } = Dimensions.get('window');
const CIRCLE_SIZE = SW * 0.58;
const CREAM = '#F4EDE1';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, 'PizzaSize'>;
};

const SIZES = [
  { name: 'Gigante', label: 'GIG', desc: '50cm · 16 fatias' },
  { name: 'Grande', label: 'GRD', desc: '40cm · 12 fatias' },
  { name: 'Média', label: 'MÉD', desc: '35cm · 8 fatias' },
];

export function PizzaSizeScreen({ navigation, route }: Props) {
  const { categoryId, categoryName, categoryIcon } = route.params;
  const { colors } = useTheme();
  const s = React.useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  /* Entrance animations */
  const circleScale = useRef(new Animated.Value(0.7)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(40)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  /* Per-pill scale animations */
  const pillScales = useRef(SIZES.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(circleScale, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 8 }),
      Animated.timing(circleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 420, delay: 160, useNativeDriver: true }),
      Animated.spring(contentY, { toValue: 0, delay: 160, useNativeDriver: true, speed: 14, bounciness: 5 }),
    ]).start();
  }, []);

  function selectSize(sizeName: string, idx: number) {
    setSelected(sizeName);

    /* Bounce the selected pill */
    Animated.sequence([
      Animated.spring(pillScales[idx], { toValue: 0.88, useNativeDriver: true, speed: 60 }),
      Animated.spring(pillScales[idx], { toValue: 1.08, useNativeDriver: true, speed: 30, bounciness: 14 }),
      Animated.spring(pillScales[idx], { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 5 }),
    ]).start();

    /* Auto-navigate after brief pause */
    setTimeout(() => {
      navigation.navigate('PizzaFlavor', { categoryId, categoryName, sizeName });
    }, 520);
  }


  return (
    <View style={s.root}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.categoryLabel}>{categoryName}</Text>
          <Text style={s.headerTitle}>Selecione o tamanho</Text>
        </View>
      </View>

      {/* Pizza icon + hint */}
      <Animated.View style={[s.iconWrap, { opacity: circleOpacity, transform: [{ scale: circleScale }] }]}>
        <Ionicons name="pizza-outline" size={72} color={colors.primary} style={{ marginBottom: 14 }} />
        <Text style={s.circleHint}>Escolha o tamanho</Text>
      </Animated.View>

      {/* Size pills */}
      <Animated.View style={[s.pillsSection, { opacity: contentOpacity, transform: [{ translateY: contentY }] }]}>
        <Text style={s.pickLabel}>Tamanhos disponíveis</Text>
        <View style={s.pillsRow}>
          {SIZES.map((sz, idx) => {
            const isActive = selected === sz.name;
            return (
              <Animated.View key={sz.name} style={{ transform: [{ scale: pillScales[idx] }] }}>
                <TouchableOpacity
                  onPress={() => selectSize(sz.name, idx)}
                  activeOpacity={0.85}
                  style={[s.pill, isActive && s.pillActive]}
                >
                  <Text style={[s.pillLabel, isActive && s.pillLabelActive]}>{sz.name}</Text>
                  <Text style={[s.pillDesc, isActive && s.pillDescActive]}>{sz.desc}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Tip */}
        <View style={s.tip}>
          <Ionicons name="information-circle-outline" size={15} color={colors.accent} />
          <Text style={s.tipText}>Todas as pizzas são meias a meias</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, gap: 14 },
    backBtn: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    headerText: { flex: 1 },
    categoryLabel: { color: c.accent, fontFamily: fontFamily.bodySemiBold, fontSize: 10, letterSpacing: letterSpacing.caps, textTransform: 'uppercase', marginBottom: 2 },
    headerTitle: { color: c.text, fontFamily: fontFamily.headingBold, fontSize: 22 },
    iconWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    circleHint: { color: c.textSecondary, fontFamily: fontFamily.headingItalic, fontSize: 17, textAlign: 'center' },
    pillsSection: { flex: 1, paddingHorizontal: 20 },
    pickLabel: { color: c.textSecondary, fontFamily: fontFamily.bodySemiBold, fontSize: 10, letterSpacing: letterSpacing.capsWide, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' },
    pillsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
    pill: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: radius.md, backgroundColor: c.bgCard, borderWidth: 1, borderColor: c.border, alignItems: 'center', minWidth: 96 },
    pillActive: { backgroundColor: c.primary, borderColor: c.accent },
    pillLabel: { color: c.textSecondary, fontFamily: fontFamily.bodySemiBold, fontSize: 13, letterSpacing: letterSpacing.caps, textTransform: 'uppercase', marginBottom: 3 },
    pillLabelActive: { color: CREAM },
    pillDesc: { color: c.textMuted, fontFamily: fontFamily.bodyMedium, fontSize: 10, textAlign: 'center' },
    pillDescActive: { color: 'rgba(244,237,225,0.8)' },
    tip: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 28 },
    tipText: { color: c.accent, fontFamily: fontFamily.headingItalic, fontSize: 13 },
  });
}
