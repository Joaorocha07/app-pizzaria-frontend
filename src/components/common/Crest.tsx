import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamily, letterSpacing } from '../../theme/theme';

interface CrestProps {
  /** Diâmetro total do selo (padrão 112) */
  size?: number;
  /** Cor principal do selo; padrão primary (borgonha) */
  color?: string;
  /** Cor do detalhe; padrão accent (ouro antigo) */
  accentColor?: string;
  /** Texto do monograma central (padrão "P") */
  monogram?: string;
  /** Legenda em CAPS abaixo do monograma dentro do selo (ex.: "PIZZARIA") */
  caption?: string;
}

/** Estrela de 5 pontas simples, path unitário escalado via transform do <G>. */
function Star({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  // path de estrela em coordenadas unitárias (raio 1, centro 0,0)
  const d =
    'M0,-1 L0.2245,-0.309 L0.9511,-0.309 L0.3633,0.118 L0.5878,0.809 L0,0.382 L-0.5878,0.809 L-0.3633,0.118 L-0.9511,-0.309 L-0.2245,-0.309 Z';
  return (
    <G transform={`translate(${cx}, ${cy}) scale(${r})`}>
      <Path d={d} fill={color} />
    </G>
  );
}

/**
 * Selo/brasão circular da casa — anel duplo, monograma em Cinzel e estrelas,
 * como um carimbo de cera ou rótulo de vinho antigo. Usado no splash e no login.
 */
export function Crest({ size = 112, color, accentColor, monogram = 'P', caption = 'PIZZARIA' }: CrestProps) {
  const { colors } = useTheme();
  const main = color ?? colors.primary;
  const gold = accentColor ?? colors.accent;

  const half = size / 2;
  const outerR = half - 2;
  const innerR = half - 9;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Anel externo grosso */}
        <Circle cx={half} cy={half} r={outerR} stroke={main} strokeWidth={2.5} fill="none" />
        {/* Anel interno fino */}
        <Circle cx={half} cy={half} r={innerR} stroke={gold} strokeWidth={1} fill="none" />
        {/* Estrelas laterais */}
        <Star cx={half - innerR + 7} cy={half} r={4} color={gold} />
        <Star cx={half + innerR - 7} cy={half} r={4} color={gold} />
      </Svg>

      <Text
        style={{
          fontFamily: fontFamily.displayBold,
          fontSize: size * 0.32,
          color: main,
          lineHeight: size * 0.38,
        }}
      >
        {monogram}
      </Text>
      {caption ? (
        <Text
          style={{
            fontFamily: fontFamily.bodySemiBold,
            fontSize: Math.max(7, size * 0.07),
            letterSpacing: letterSpacing.capsWide,
            color: gold,
            marginTop: 1,
          }}
        >
          {caption.toUpperCase()}
        </Text>
      ) : null}
    </View>
  );
}
