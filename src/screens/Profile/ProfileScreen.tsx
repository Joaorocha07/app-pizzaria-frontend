import React, { useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../theme/colors';
import { AppStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList> };
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  label: string;
  description: string;
  icon: IoniconName;
  iconColor: string;
  onPress: () => void;
}

const PAPEL_CONFIG: Record<string, { label: string; color: string }> = {
  CLIENTE:     { label: 'Cliente',       color: '#B8860B' },
  FUNCIONARIO: { label: 'Funcionário',   color: '#3B82F6' },
  ADMIN:       { label: 'Administrador', color: '#9B5DE5' },
};

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: c.bg,
    },
    decorTop: {
      position: 'absolute',
      width: 320,
      height: 320,
      borderRadius: 160,
      backgroundColor: 'rgba(192,57,43,0.04)',
      top: -100,
      right: -120,
    },
    decorBottom: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'rgba(184,134,11,0.03)',
      bottom: 80,
      left: -80,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 48,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 28,
    },
    screenTitle: {
      color: c.text,
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: 0.4,
    },
    themeToggleBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* ── Profile Card ── */
    profileCard: {
      backgroundColor: c.bgCard,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: c.border,
      padding: 24,
      alignItems: 'center',
      marginBottom: 32,
      shadowColor: '#C0392B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 6,
    },
    avatarWrapper: {
      marginBottom: 16,
      shadowColor: '#C0392B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 10,
    },
    avatarGradient: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarRing: {
      position: 'absolute',
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 2,
      borderColor: 'rgba(192,57,43,0.4)',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 30,
      fontWeight: '900',
      letterSpacing: 1,
    },
    userName: {
      color: c.text,
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: 0.2,
      textAlign: 'center',
      marginBottom: 4,
    },
    userEmail: {
      color: c.textSecondary,
      fontSize: 13,
      letterSpacing: 0.3,
      textAlign: 'center',
      marginBottom: 14,
    },
    badgesRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.4,
    },
    phoneBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
    },
    phoneBadgeText: {
      color: c.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },

    /* ── Section ── */
    sectionLabel: {
      color: c.textMuted,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.8,
      textTransform: 'uppercase',
      marginBottom: 12,
      marginLeft: 4,
    },
    menu: {
      gap: 10,
    },

    /* ── Pill button ── */
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bgCard,
      borderRadius: 30,
      paddingVertical: 18,
      paddingHorizontal: 22,
      borderWidth: 1,
      borderColor: c.border,
      gap: 16,
    },
    pillText: {
      flex: 1,
    },
    pillLabel: {
      color: c.text,
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    pillDesc: {
      color: c.textMuted,
      fontSize: 12,
      marginTop: 2,
      letterSpacing: 0.2,
    },
    pillChevron: {
      opacity: 0.4,
    },

    /* ── Logout pill ── */
    logoutPill: {
      backgroundColor: 'rgba(192,57,43,0.05)',
      borderColor: 'rgba(192,57,43,0.15)',
      marginTop: 6,
    },
  });
}

export function ProfileScreen({ navigation }: Props) {
  const { usuario, logout, isCliente } = useAuth();
  const { colors, toggleTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function handleLogout() {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  const initials = usuario?.nome
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() ?? '?';

  const papelConfig = usuario
    ? (PAPEL_CONFIG[usuario.papel] ?? PAPEL_CONFIG.CLIENTE)
    : null;

  const menuItems: MenuItem[] = [
    {
      label: 'Editar perfil',
      description: 'Nome, telefone e dados da conta',
      icon: 'create-outline',
      iconColor: '#C0392B',
      onPress: () => navigation.navigate('EditProfile'),
    },
    ...(isCliente
      ? [{
          label: 'Meus endereços',
          description: 'Locais de entrega salvos',
          icon: 'location-outline' as IoniconName,
          iconColor: '#C05020',
          onPress: () => navigation.navigate('Addresses'),
        }]
      : []),
    {
      label: 'Alterar senha',
      description: 'Mantenha o acesso protegido',
      icon: 'key-outline',
      iconColor: '#B8730B',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      label: 'Notificações',
      description: 'Alertas de pedidos e promoções',
      icon: 'notifications-outline',
      iconColor: '#B8860B',
      onPress: () => navigation.navigate('Notificacoes'),
    },
  ];

  return (
    <View style={styles.root}>
      {/* Decorações de fundo */}
      <View style={styles.decorTop} />
      <View style={styles.decorBottom} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      >
        {/* Barra superior: título + toggle de tema */}
        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>Conta</Text>
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.themeToggleBtn}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Card do perfil */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <LinearGradient colors={['#C0392B', '#7B241C']} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <View style={styles.avatarRing} />
          </View>

          <Text style={styles.userName}>{usuario?.nome}</Text>
          <Text style={styles.userEmail}>{usuario?.email}</Text>

          <View style={styles.badgesRow}>
            {papelConfig && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: `${papelConfig.color}14`,
                    borderColor: `${papelConfig.color}30`,
                  },
                ]}
              >
                <Ionicons name="shield-checkmark-outline" size={12} color={papelConfig.color} />
                <Text style={[styles.badgeText, { color: papelConfig.color }]}>
                  {papelConfig.label}
                </Text>
              </View>
            )}
            {usuario?.telefone ? (
              <View style={styles.phoneBadge}>
                <Ionicons name="call-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.phoneBadgeText}>{usuario.telefone}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Menu de preferências */}
        <Text style={styles.sectionLabel}>Preferências</Text>

        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={styles.pill}
              activeOpacity={0.76}
            >
              <Ionicons name={item.icon} size={24} color={item.iconColor} />
              <View style={styles.pillText}>
                <Text style={styles.pillLabel}>{item.label}</Text>
                <Text style={styles.pillDesc}>{item.description}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={15}
                color={colors.text}
                style={styles.pillChevron}
              />
            </TouchableOpacity>
          ))}

          {/* Sair da conta — diferenciado em vermelho */}
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.pill, styles.logoutPill]}
            activeOpacity={0.76}
          >
            <Ionicons name="log-out-outline" size={24} color="#C0392B" />
            <View style={styles.pillText}>
              <Text style={[styles.pillLabel, { color: '#C0392B' }]}>Sair da conta</Text>
              <Text style={[styles.pillDesc, { color: 'rgba(192,57,43,0.5)' }]}>
                Encerrar sessão neste aparelho
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={15}
              color="#C0392B"
              style={styles.pillChevron}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
