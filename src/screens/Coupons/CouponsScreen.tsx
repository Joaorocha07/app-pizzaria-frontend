import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors, fontFamily, letterSpacing, radius } from '../../theme/theme';
import { SectionHeading } from '../../components/common/SectionHeading';

/* ─── Types ─────────────────────────────────────────────────── */
interface CouponCardProps {
  code: string;
  description: string;
  discount: string;
  validUntil: string;
  color: string;
}

/* ─── CouponCard — bilhete de impresso com picote ───────────── */
function CouponCard({ code, description, discount, validUntil, color }: CouponCardProps) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);

  function copyCode() {
    Clipboard.setString(code);
  }

  return (
    <View style={[s.couponCard, { borderColor: `${color}55` }]}>
      {/* Notches — picote do bilhete */}
      <View style={[s.notchLeft, { backgroundColor: colors.bg, borderColor: `${color}55` }]} />
      <View style={[s.notchRight, { backgroundColor: colors.bg, borderColor: `${color}55` }]} />
      <View style={[s.dashedLine, { borderColor: `${color}45` }]} />

      {/* Left: discount badge */}
      <View style={[s.couponLeft, { borderRightColor: 'transparent' }]}>
        <Text style={[s.discountValue, { color }]}>{discount}</Text>
        <Text style={s.discountLabel}>DE DESCONTO</Text>
      </View>

      {/* Right: details + copy */}
      <View style={s.couponRight}>
        <Text style={s.couponDescription}>{description}</Text>
        <View style={s.couponCodeRow}>
          <View style={[s.codeBox, { borderColor: `${color}55` }]}>
            <Text style={[s.codeText, { color }]}>{code}</Text>
          </View>
          <TouchableOpacity onPress={copyCode} style={[s.copyBtn, { backgroundColor: color }]} activeOpacity={0.8}>
            <Ionicons name="copy-outline" size={14} color="#F4EDE1" />
          </TouchableOpacity>
        </View>
        <Text style={s.couponValidity}>Válido até {validUntil}</Text>
      </View>
    </View>
  );
}

/* ─── CouponsScreen ─────────────────────────────────────────── */
export function CouponsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[s.root, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={s.headerTitle}>Meus Cupons</Text>
          <Text style={s.headerSubtitle}>Descontos exclusivos para você</Text>
        </View>
        <View style={s.headerIconWrap}>
          <Ionicons name="ticket-outline" size={22} color={colors.accent} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {/* How to use banner */}
        <View style={s.tipBanner}>
          <Ionicons name="information-circle-outline" size={18} color={colors.accent} style={{ marginRight: 10 }} />
          <Text style={s.tipText}>
            Copie o código e insira no carrinho antes de finalizar o pedido.
          </Text>
        </View>

        {/* Empty state */}
        <View style={s.emptySection}>
          <View style={s.emptyIconWrap}>
            <Ionicons name="ticket-outline" size={44} color={colors.accent} />
          </View>
          <Text style={s.emptyTitle}>Nenhum cupom disponível</Text>
          <Text style={s.emptyText}>
            Fique de olho! Em breve novos cupons{'\n'}de desconto aparecerão aqui.
          </Text>
        </View>

        {/* Divider */}
        <SectionHeading title="Exemplos" style={{ marginBottom: 16 }} />

        {/* Example coupon cards (preview) */}
        <CouponCard
          code="PIZZA10"
          description="10% de desconto em qualquer pizza"
          discount="10%"
          validUntil="31/12/2025"
          color={colors.primary}
        />
        <CouponCard
          code="FRETEGRATIS"
          description="Frete grátis no próximo pedido"
          discount="R$ 0"
          validUntil="30/11/2025"
          color={colors.accent}
        />

        <Text style={s.exampleNote}>
          * Estes são exemplos do formato dos cupons. Cupons reais serão divulgados em breve.
        </Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────────── */
function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
    },
    headerTitle: {
      color: c.text,
      fontFamily: fontFamily.headingBold,
      fontSize: 22,
      letterSpacing: 0.1,
    },
    headerSubtitle: {
      color: c.textSecondary,
      fontFamily: fontFamily.headingItalic,
      fontSize: 13,
      marginTop: 2,
    },
    headerIconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
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
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      marginBottom: 28,
    },
    tipText: {
      flex: 1,
      color: c.textSecondary,
      fontFamily: fontFamily.bodyRegular,
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
      borderRadius: radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 18,
    },
    emptyTitle: {
      color: c.text,
      fontFamily: fontFamily.headingBold,
      fontSize: 17,
      marginBottom: 8,
    },
    emptyText: {
      color: c.textSecondary,
      fontFamily: fontFamily.bodyRegular,
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 20,
    },

    /* Coupon card — bilhete */
    couponCard: {
      flexDirection: 'row',
      borderRadius: radius.md,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      marginBottom: 12,
      height: 100,
      position: 'relative',
    },
    notchLeft: {
      position: 'absolute',
      left: 94,
      top: -11,
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
      zIndex: 2,
    },
    notchRight: {
      position: 'absolute',
      left: 94,
      bottom: -11,
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
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
      fontFamily: fontFamily.headingBold,
      fontSize: 22,
    },
    discountLabel: {
      color: c.textMuted,
      fontFamily: fontFamily.bodySemiBold,
      fontSize: 8,
      letterSpacing: letterSpacing.caps,
    },
    couponRight: {
      flex: 1,
      padding: 12,
      paddingLeft: 20,
      justifyContent: 'space-between',
    },
    couponDescription: {
      color: c.textSecondary,
      fontFamily: fontFamily.bodyRegular,
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
      borderRadius: radius.sm,
      borderWidth: 1,
      backgroundColor: c.bgInput,
    },
    codeText: {
      fontFamily: fontFamily.bodyBold,
      fontSize: 12,
      letterSpacing: letterSpacing.caps,
    },
    copyBtn: {
      width: 28,
      height: 28,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    couponValidity: {
      color: c.textMuted,
      fontFamily: fontFamily.bodyMedium,
      fontSize: 10,
    },

    exampleNote: {
      color: c.textMuted,
      fontFamily: fontFamily.headingItalic,
      fontSize: 12,
      textAlign: 'center',
      lineHeight: 17,
      marginTop: 8,
    },
  });
}
