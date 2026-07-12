/**
 * Design system "Nobile" — vintage italiano anos 30–50 em tons pastéis.
 * Linguagem de impresso antigo: cantos quase retos, molduras de filete,
 * caixa alta espaçada, ouro antigo. Nada de neon, glow ou sombra colorida.
 * Única fonte de verdade para cor, tipografia e espaçamento no app.
 */

/* ─── Cores ──────────────────────────────────────────────────── */

/** Light "Pergaminho" — o padrão do app */
export const lightColors = {
  bg:            '#F4EDE1', // pergaminho creme
  bgCard:        '#FBF6EB', // papel claro
  bgElevated:    '#FFFDF6', // papel novo
  bgInput:       '#EDE3D2', // papel prensado
  border:        '#D9CBB5', // filete envelhecido
  borderStrong:  '#C0AC8E',
  text:          '#2C2118', // tinta espresso
  textSecondary: '#7A6A58', // tinta desbotada
  textMuted:     '#A5947E',
  tabBar:        '#FBF6EB',
  tabBarBorder:  '#D9CBB5',
  tabActive:     '#7E3B3B',
  tabInactive:   '#A5947E',
  skeleton:      '#EDE3D2',
  primary:       '#7E3B3B', // borgonha suave
  primaryDark:   '#5E2B2B',
  primaryLight:  '#9A5252',
  primaryGlow:   'rgba(126,59,59,0.14)',
  accent:        '#B3924C', // ouro antigo
  accentLight:   '#CDB279',
  sage:          '#9BAA8D', // sálvia pastel
  sageLight:     '#C8D2BC',
  rose:          '#C99B8E', // terracota/rosa pastel
  leather:       '#6B5138',
  success:       '#6E8B6A',
  warning:       '#C0913F',
  danger:        '#A65546',
  info:          '#7A8CA3',
  statusBar:     'dark-content' as const,
};

/** Dark "Speakeasy" — espresso à luz de vela, secundário */
export const darkColors = {
  bg:            '#1A140F',
  bgCard:        '#241C14',
  bgElevated:    '#2B2118',
  bgInput:       '#2B2118',
  border:        '#3D3123',
  borderStrong:  '#54452F',
  text:          '#F1E7D4',
  textSecondary: '#A99578',
  textMuted:     '#7D6C55',
  tabBar:        '#211913',
  tabBarBorder:  '#3D3123',
  tabActive:     '#F1E7D4',
  tabInactive:   '#7D6C55',
  skeleton:      '#2B2118',
  primary:       '#9A5252',
  primaryDark:   '#7E3B3B',
  primaryLight:  '#B06A6A',
  primaryGlow:   'rgba(154,82,82,0.30)',
  accent:        '#C9A45C',
  accentLight:   '#DDBE84',
  sage:          '#8B9B7E',
  sageLight:     '#A9B89C',
  rose:          '#B98D80',
  leather:       '#8A6D4B',
  success:       '#7E9B79',
  warning:       '#C9A45C',
  danger:        '#B4685A',
  info:          '#8B9DB3',
  statusBar:     'light-content' as const,
};

export type AppColors = Omit<typeof lightColors, 'statusBar'> & {
  statusBar: 'light-content' | 'dark-content';
};

/* ─── Tipografia ─────────────────────────────────────────────── */
/**
 * Cinzel (capitulares romanas) para marca e display — a "fonte Trajan" do
 * cinema de máfia. Playfair para títulos secundários e itálicos de floreio.
 * Inter para corpo; labels em CAPS com letterSpacing generoso.
 */
export const fontFamily = {
  displayRegular:  'Cinzel_400Regular',
  displayBold:     'Cinzel_700Bold',
  headingRegular:  'PlayfairDisplay_400Regular',
  headingItalic:   'PlayfairDisplay_400Regular_Italic',
  headingMedium:   'PlayfairDisplay_500Medium',
  headingBold:     'PlayfairDisplay_700Bold',
  bodyRegular:     'Inter_400Regular',
  bodyMedium:      'Inter_500Medium',
  bodySemiBold:    'Inter_600SemiBold',
  bodyBold:        'Inter_700Bold',
};

export const fontSize = {
  xs:      11,
  sm:      13,
  base:    15,
  md:      17,
  lg:      20,
  xl:      24,
  xxl:     30,
  display: 38,
};

/** Espaçamento de letras para labels em CAPS (linguagem letterpress) */
export const letterSpacing = {
  caps:     1.5,
  capsWide: 2.5,
};

export type FontFamily = typeof fontFamily;

/* ─── Espaçamento ────────────────────────────────────────────── */
export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

/** Cantos quase retos — impresso vintage, não app-template */
export const radius = {
  sm:   4,
  md:   6,
  lg:   10,
  xl:   14,
  full: 999,
};
