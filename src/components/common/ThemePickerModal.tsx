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
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - 48 - 12) / 2;

/* Tons fixos do preview de cada tema (amostras, não reagem ao tema atual) */
const LIGHT_PREVIEW = { bg: '#F4EDE1', card: '#FBF6EB', text: '#2C2118', primary: '#7E3B3B', accent: '#B3924C' };
const DARK_PREVIEW = { bg: '#1A140F', card: '#241C14', text: '#F1E7D4', primary: '#9A5252', accent: '#C9A45C' };

type ThemeMode = 'dark' | 'light';

interface ThemeCard {
  mode: ThemeMode;
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  preview: typeof LIGHT_PREVIEW;
}

const CARDS: ThemeCard[] = [
  {
    mode: 'light',
    label: 'Pergaminho',
    desc: 'Claro pastel, papel de cardápio antigo',
    icon: 'sunny',
    preview: LIGHT_PREVIEW,
  },
  {
    mode: 'dark',
    label: 'Speakeasy',
    desc: 'Espresso à luz de vela',
    icon: 'moon',
    preview: DARK_PREVIEW,
  },
];

export function ThemePickerModal() {
  const { confirmTheme, needsThemePick, colors } = useTheme();
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
          style={[
            mp.sheet,
            { backgroundColor: colors.bgElevated, borderColor: colors.border },
            { opacity: cardOpacity, transform: [{ translateY: cardY }] },
          ]}
        >
          <Text style={[mp.title, { color: colors.text }]}>Escolha um tema</Text>
          <Text style={[mp.subtitle, { color: colors.textSecondary }]}>
            Você pode mudar a qualquer momento em Conta
          </Text>

          {/* Theme cards */}
          <View style={mp.cardsRow}>
            {CARDS.map((card) => {
              const active = selected === card.mode;
              const p = card.preview;
              return (
                <TouchableOpacity
                  key={card.mode}
                  onPress={() => setSelected(card.mode)}
                  activeOpacity={0.85}
                  style={[
                    mp.card,
                    { width: CARD_W, borderColor: active ? colors.accent : colors.border },
                  ]}
                >
                  {/* Preview mockup no estilo do tema */}
                  <View style={[mp.preview, { backgroundColor: p.bg }]}>
                    <View style={[mp.mockCard, { backgroundColor: p.card, borderColor: p.accent }]}>
                      <View style={[mp.mockDiamond, { backgroundColor: p.accent }]} />
                      <View style={[mp.mockLine, { backgroundColor: p.text, opacity: 0.35 }]} />
                    </View>
                    <View style={[mp.mockBtn, { backgroundColor: p.primary }]} />
                  </View>

                  <View style={[mp.cardFooter, { borderTopColor: colors.border }]}>
                    <Ionicons name={card.icon} size={14} color={p.primary} />
                    <Text style={[mp.cardLabel, { color: colors.text }]}>{card.label.toUpperCase()}</Text>
                  </View>

                  {active && (
                    <View style={[mp.checkBadge, { backgroundColor: colors.accent, borderColor: colors.bgElevated }]}>
                      <Ionicons name="checkmark" size={12} color="#FFFDF6" />
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
            style={[
              mp.confirmBtn,
              { backgroundColor: colors.primary },
              !selected && mp.confirmBtnDisabled,
            ]}
          >
            <Text style={mp.confirmBtnText}>CONFIRMAR</Text>
            <Ionicons name="arrow-forward" size={16} color="#F4EDE1" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const mp = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(26,20,15,0.82)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: SW,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamily.headingBold,
    fontSize: 24,
    marginBottom: 6,
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  card: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  preview: { height: 116, padding: 12, gap: 8 },
  mockCard: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: 8,
    gap: 6,
    justifyContent: 'center',
  },
  mockDiamond: { width: 7, height: 7, transform: [{ rotate: '45deg' }], alignSelf: 'center' },
  mockLine: { height: 3, borderRadius: 2, width: '70%', alignSelf: 'center' },
  mockBtn: { height: 16, borderRadius: 3 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  cardLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: 10, letterSpacing: letterSpacing.caps },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: radius.md,
    width: '100%',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: {
    color: '#F4EDE1',
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13,
    letterSpacing: letterSpacing.caps,
  },
});
