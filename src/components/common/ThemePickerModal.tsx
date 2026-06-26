import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - 48 - 12) / 2;
const PRIMARY = '#C0392B';
const ACCENT = '#B8860B';

type ThemeMode = 'dark' | 'light';

interface ThemeCard {
  mode: ThemeMode;
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
  textColor: string;
  subColor: string;
  circleColor: string;
}

const CARDS: ThemeCard[] = [
  {
    mode: 'dark',
    label: 'Escuro',
    desc: 'Elegante e confortável no período noturno',
    icon: 'moon',
    colors: ['#1A1A1A', '#0A0A0A'],
    textColor: '#F5F0E8',
    subColor: 'rgba(245,240,232,0.4)',
    circleColor: PRIMARY,
  },
  {
    mode: 'light',
    label: 'Claro',
    desc: 'Nítido e confortável durante o dia',
    icon: 'sunny',
    colors: ['#FFFFFF', '#F0EBE3'],
    textColor: '#1A1414',
    subColor: 'rgba(26,20,20,0.4)',
    circleColor: ACCENT,
  },
];

export function ThemePickerModal() {
  const { confirmTheme, needsThemePick } = useTheme();
  const [selected, setSelected] = React.useState<ThemeMode | null>(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!needsThemePick) return;
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 420, delay: 80, useNativeDriver: true }),
      Animated.spring(cardY, { toValue: 0, delay: 80, useNativeDriver: true, speed: 12, bounciness: 5 }),
    ]).start();
  }, [needsThemePick]);

  function handleConfirm() {
    if (!selected) return;
    confirmTheme(selected);
  }

  return (
    <Modal visible={needsThemePick} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, mp.overlay, { opacity: overlayOpacity }]}>
        <Animated.View
          style={[mp.sheet, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}
        >
          {/* Icon top */}
          <View style={mp.iconWrap}>
            <LinearGradient colors={[PRIMARY, '#7B1A12']} style={mp.iconCircle}>
              <Ionicons name="color-palette-outline" size={28} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <Text style={mp.title}>Escolha um tema</Text>
          <Text style={mp.subtitle}>Você pode mudar isso a qualquer momento em Perfil</Text>

          {/* Theme cards */}
          <View style={mp.cardsRow}>
            {CARDS.map((card) => {
              const active = selected === card.mode;
              return (
                <TouchableOpacity
                  key={card.mode}
                  onPress={() => setSelected(card.mode)}
                  activeOpacity={0.85}
                  style={[mp.card, { width: CARD_W }, active && mp.cardActive]}
                >
                  <LinearGradient colors={card.colors} style={mp.cardGradient}>
                    {/* Preview mockup */}
                    <View style={[mp.mockBar, { backgroundColor: card.colors[0] }]}>
                      <View style={[mp.mockDot, { backgroundColor: card.circleColor }]} />
                      <View style={[mp.mockLine, { backgroundColor: card.textColor, opacity: 0.2 }]} />
                    </View>
                    <View style={mp.mockBody}>
                      <View style={[mp.mockBlock, { backgroundColor: card.circleColor, opacity: 0.15 }]} />
                      <View style={[mp.mockBlockSmall, { backgroundColor: card.textColor, opacity: 0.1 }]} />
                    </View>
                  </LinearGradient>

                  <View style={mp.cardFooter}>
                    <Ionicons name={card.icon} size={16} color={card.circleColor} />
                    <Text style={[mp.cardLabel, { color: '#1A1414' }]}>{card.label}</Text>
                  </View>

                  {active && (
                    <View style={[mp.checkBadge, { backgroundColor: card.circleColor }]}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Confirm button */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={!selected}
            style={[mp.confirmBtn, !selected && mp.confirmBtnDisabled]}
          >
            <Text style={mp.confirmBtnText}>Confirmar</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const mp = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: SW,
    backgroundColor: '#F5F2EE',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconWrap: { marginBottom: 16, marginTop: 8 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#1A1414',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(26,20,20,0.5)',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E8E3DC',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: { borderColor: PRIMARY },
  cardGradient: { height: 120, padding: 10 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
    paddingTop: 10,
    backgroundColor: '#E8E3DC',
  },
  cardLabel: { fontSize: 14, fontWeight: '800' },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F5F2EE',
    zIndex: 10,
  },
  /* Preview mockup elements */
  mockBar: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, padding: 6, marginBottom: 8 },
  mockDot: { width: 10, height: 10, borderRadius: 5 },
  mockLine: { flex: 1, height: 4, borderRadius: 2 },
  mockBody: { gap: 6 },
  mockBlock: { height: 32, borderRadius: 8 },
  mockBlockSmall: { height: 16, borderRadius: 6, width: '60%' },
  /* Button */
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    width: '100%',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
