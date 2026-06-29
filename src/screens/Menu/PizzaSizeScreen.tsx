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
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStackParamList } from '../../navigation/types';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../theme/colors';

const { width: SW } = Dimensions.get('window');
const CIRCLE_SIZE = SW * 0.58;
const PRIMARY = '#C0392B';
const ACCENT = '#B8860B';
const BG = '#0A0A0A';

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
  const circleScale = useRef(new Animated.Value(0.6)).current;
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

  /* Circle pulse for the empty placeholder */
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={22} color="#F5F0E8" />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.categoryLabel}>{categoryName}</Text>
          <Text style={s.headerTitle}>Selecione o tamanho</Text>
        </View>
      </View>

      {/* Pizza circle placeholder */}
      <View style={s.circleWrap}>
        <Animated.View style={[s.circleOuter, { transform: [{ scale: Animated.multiply(circleScale, pulse) }], opacity: circleOpacity }]}>
          <LinearGradient
            colors={['#1C1C1C', '#0D0D0D']}
            style={s.circleInner}
          >
            {/* Decorative rings */}
            <View style={s.ring1} />
            <View style={s.ring2} />
            <Ionicons name="pizza-outline" size={52} color="rgba(255,255,255,0.12)" style={{ marginBottom: 8 }} />
            <Text style={s.circleHint}>Escolha o{'\n'}tamanho</Text>
          </LinearGradient>
        </Animated.View>
      </View>

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
          <Ionicons name="information-circle-outline" size={15} color={`${ACCENT}90`} />
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
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.bgCard, alignItems: 'center', justifyContent: 'center' },
    headerText: { flex: 1 },
    categoryLabel: { color: c.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 2 },
    headerTitle: { color: c.text, fontSize: 22, fontWeight: '900' },
    circleWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
    circleOuter: { width: CIRCLE_SIZE + 12, height: CIRCLE_SIZE + 12, borderRadius: (CIRCLE_SIZE + 12) / 2, borderWidth: 1.5, borderColor: `${PRIMARY}30`, alignItems: 'center', justifyContent: 'center', shadowColor: PRIMARY, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 12 },
    circleInner: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    ring1: { position: 'absolute', width: CIRCLE_SIZE * 0.75, height: CIRCLE_SIZE * 0.75, borderRadius: (CIRCLE_SIZE * 0.75) / 2, borderWidth: 1, borderColor: c.border },
    ring2: { position: 'absolute', width: CIRCLE_SIZE * 0.5, height: CIRCLE_SIZE * 0.5, borderRadius: (CIRCLE_SIZE * 0.5) / 2, borderWidth: 1, borderColor: c.border },
    circleHint: { color: c.textMuted, fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
    pillsSection: { flex: 1, paddingHorizontal: 20 },
    pickLabel: { color: c.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' },
    pillsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
    pill: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 22, backgroundColor: c.bgElevated, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', minWidth: 96 },
    pillActive: { backgroundColor: PRIMARY, borderColor: PRIMARY, shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.55, shadowRadius: 10, elevation: 8 },
    pillLabel: { color: c.textSecondary, fontSize: 15, fontWeight: '800', marginBottom: 3 },
    pillLabelActive: { color: '#FFFFFF' },
    pillDesc: { color: c.textMuted, fontSize: 10, fontWeight: '600', textAlign: 'center' },
    pillDescActive: { color: 'rgba(255,255,255,0.75)' },
    tip: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 28 },
    tipText: { color: `${ACCENT}80`, fontSize: 12, fontWeight: '600' },
  });
}
