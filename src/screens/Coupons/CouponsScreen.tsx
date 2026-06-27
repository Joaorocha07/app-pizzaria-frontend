import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#C0392B';
const ACCENT = '#B8860B';
const BG = '#0A0A0A';

/* ─── Types ─────────────────────────────────────────────────── */
interface CouponCardProps {
  code: string;
  description: string;
  discount: string;
  validUntil: string;
  color: string;
}

/* ─── CouponCard ─────────────────────────────────────────────── */
function CouponCard({ code, description, discount, validUntil, color }: CouponCardProps) {
  function copyCode() {
    Clipboard.setString(code);
  }

  return (
    <View style={styles.couponCard}>
      <LinearGradient
        colors={[`${color}22`, `${color}08`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.couponGradient}
      />

      {/* Notch decorations */}
      <View style={[styles.notchLeft, { backgroundColor: BG }]} />
      <View style={[styles.notchRight, { backgroundColor: BG }]} />
      <View style={[styles.dashedLine, { borderColor: `${color}30` }]} />

      {/* Left: discount badge */}
      <View style={[styles.couponLeft, { borderRightColor: `${color}25` }]}>
        <Text style={[styles.discountValue, { color }]}>{discount}</Text>
        <Text style={styles.discountLabel}>de desconto</Text>
      </View>

      {/* Right: details + copy */}
      <View style={styles.couponRight}>
        <Text style={styles.couponDescription}>{description}</Text>
        <View style={styles.couponCodeRow}>
          <View style={[styles.codeBox, { borderColor: `${color}40` }]}>
            <Text style={[styles.codeText, { color }]}>{code}</Text>
          </View>
          <TouchableOpacity onPress={copyCode} style={[styles.copyBtn, { backgroundColor: color }]} activeOpacity={0.8}>
            <Ionicons name="copy-outline" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.couponValidity}>Válido até {validUntil}</Text>
      </View>
    </View>
  );
}

/* ─── CouponsScreen ─────────────────────────────────────────── */
export function CouponsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meus Cupons</Text>
          <Text style={styles.headerSubtitle}>Descontos exclusivos para você</Text>
        </View>
        <View style={styles.headerIconWrap}>
          <Ionicons name="ticket-outline" size={22} color={ACCENT} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* How to use banner */}
        <LinearGradient
          colors={['#1A0D00', '#0F0800']}
          style={styles.tipBanner}
        >
          <Ionicons name="information-circle-outline" size={18} color={ACCENT} style={{ marginRight: 10 }} />
          <Text style={styles.tipText}>
            Copie o código e insira no carrinho antes de finalizar o pedido.
          </Text>
        </LinearGradient>

        {/* Empty state */}
        <View style={styles.emptySection}>
          <View style={styles.emptyIconWrap}>
            <LinearGradient
              colors={['#1A0A0A', '#0D0505']}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="ticket-outline" size={44} color={`${ACCENT}80`} />
          </View>
          <Text style={styles.emptyTitle}>Nenhum cupom disponível</Text>
          <Text style={styles.emptyText}>
            Fique de olho! Em breve novos cupons{'\n'}de desconto aparecerão aqui.
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>EXEMPLOS</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Example coupon cards (preview) */}
        <CouponCard
          code="PIZZA10"
          description="10% de desconto em qualquer pizza"
          discount="10%"
          validUntil="31/12/2025"
          color={PRIMARY}
        />
        <CouponCard
          code="FRETEGRATIS"
          description="Frete grátis no próximo pedido"
          discount="R$ 0"
          validUntil="30/11/2025"
          color={ACCENT}
        />

        <Text style={styles.exampleNote}>
          * Estes são exemplos do formato dos cupons. Cupons reais serão divulgados em breve.
        </Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    color: '#F5F0E8',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: `${ACCENT}15`,
    borderWidth: 1,
    borderColor: `${ACCENT}30`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${ACCENT}25`,
    marginBottom: 28,
  },
  tipText: {
    flex: 1,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    lineHeight: 18,
  },

  /* Empty */
  emptySection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 28,
  },
  emptyIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${ACCENT}25`,
    marginBottom: 18,
  },
  emptyTitle: {
    color: '#F5F0E8',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.32)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  /* Divider */
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  dividerLabel: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  /* Coupon card */
  couponCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
    height: 100,
    position: 'relative',
  },
  couponGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  notchLeft: {
    position: 'absolute',
    left: 94,
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    zIndex: 2,
  },
  notchRight: {
    position: 'absolute',
    left: 94,
    bottom: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    zIndex: 2,
  },
  dashedLine: {
    position: 'absolute',
    left: 104,
    top: 12,
    bottom: 12,
    width: 0,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  couponLeft: {
    width: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    gap: 2,
  },
  discountValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  discountLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
  },
  couponRight: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  couponDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 16,
  },
  couponCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeBox: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  codeText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  copyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponValidity: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 10,
    fontWeight: '600',
  },

  exampleNote: {
    color: 'rgba(255,255,255,0.18)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
  },
});
