import React, { useRef } from 'react';
import {
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';
import { AppStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList> };
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

/* ─── Row card (ícone + label, sem seta) ──────────── */
function MenuItem({
  icon,
  label,
  onPress,
  labelColor,
  iconColor,
}: {
  icon: IoniconName;
  label: string;
  onPress: () => void;
  labelColor?: string;
  iconColor?: string;
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[s.card, { backgroundColor: colors.bgCard }]}
        activeOpacity={0.85}
      >
        <Ionicons name={icon} size={22} color={iconColor ?? colors.text} />
        <Text style={[s.cardLabel, { color: labelColor ?? colors.text }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ─── ProfileScreen ────────────────────────────────── */
export function ProfileScreen({ navigation }: Props) {
  const { usuario, logout } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  const initials =
    usuario?.nome
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() ?? '?';

  return (
    <View style={[s.root, { backgroundColor: colors.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.content, { paddingTop: insets.top + 28 }]}
      >
        {/* ── Header ─────────────────────────────── */}
        <View style={s.header}>
          <View style={[s.avatar, { backgroundColor: colors.primary }]}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.headerText}>
            <Text style={[s.welcome, { color: colors.textSecondary }]}>Bem vindo,</Text>
            <Text style={[s.userName, { color: colors.text }]}>{usuario?.nome}</Text>
          </View>
        </View>

        {/* ── Seção 1 (sem título) ────────────────── */}
        <View style={s.section}>
          <MenuItem
            icon="create-outline"
            label="Editar perfil"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <MenuItem
            icon="lock-closed-outline"
            label="Informações de acesso"
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <MenuItem
            icon="notifications-outline"
            label="Notificações"
            onPress={() => navigation.navigate('Notificacoes')}
          />
        </View>

        {/* ── Seção 2 ─────────────────────────────── */}
        <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>Pagamentos e Benefícios</Text>
        <View style={s.section}>
          <MenuItem
            icon="card-outline"
            label="Pagamentos"
            onPress={() => navigation.navigate('Pagamentos')}
          />
          <MenuItem
            icon="receipt-outline"
            label="Meus pedidos"
            onPress={() =>
              (navigation as any).navigate('MainTabs', { screen: 'Pedidos' })
            }
          />
          <MenuItem
            icon="pricetag-outline"
            label="Cupons"
            onPress={() => navigation.navigate('Cupons')}
          />
          <MenuItem
            icon="star-outline"
            label="Fidelidade"
            onPress={() => navigation.navigate('Fidelidade')}
          />
          <MenuItem
            icon="people-outline"
            label="Indique um amigo"
            onPress={() => navigation.navigate('IndiqueAmigo')}
          />
        </View>

        {/* ── Seção 3 (sem título) ────────────────── */}
        <View style={s.section}>
          {/* Tema — toque na linha inteira ou no switch, ambos togglem */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={[s.card, { backgroundColor: colors.bgCard }]}
            activeOpacity={0.74}
          >
            <Ionicons
              name={isDark ? 'moon-outline' : 'sunny-outline'}
              size={22}
              color={colors.text}
            />
            <Text style={[s.cardLabel, { flex: 1, color: colors.text }]}>Tema</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primaryDark }}
              thumbColor={isDark ? colors.text : colors.primary}
              pointerEvents="none"
            />
          </TouchableOpacity>

          {/* Sair */}
          <MenuItem
            icon="log-out-outline"
            label="Sair da conta"
            onPress={handleLogout}
            labelColor={colors.primary}
            iconColor={colors.primary}
          />
        </View>

        {/* ── Footer SaasAds ──────────────────────── */}
        <View style={s.footer}>
          <Text style={[s.footerBrand, { color: colors.text }]}>SaasAds</Text>
          <Text style={[s.footerBy, { color: colors.textSecondary }]}>
            Desenvolvido por SaasAds
          </Text>
          <Text style={[s.footerVersion, { color: colors.textMuted }]}>Versão 1.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 48 },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 36,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    color: '#F4EDE1',
    fontFamily: fontFamily.headingBold,
    fontSize: 22,
    letterSpacing: 1,
  },
  headerText: {
    flexDirection: 'column',
    gap: 2,
  },
  welcome: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
  },
  userName: {
    fontFamily: fontFamily.headingBold,
    fontSize: 24,
    letterSpacing: 0.1,
  },

  /* Sections */
  sectionTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: letterSpacing.capsWide,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 2,
  },
  section: {
    gap: 10,
    marginBottom: 24,
  },

  /* Card row — backgroundColor e color aplicados inline via colors.* */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },
  cardLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 15,
    letterSpacing: 0.1,
  },

  /* Footer */
  footer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    gap: 5,
  },
  footerBrand: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  footerBy: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
  },
  footerVersion: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 10,
  },
});
