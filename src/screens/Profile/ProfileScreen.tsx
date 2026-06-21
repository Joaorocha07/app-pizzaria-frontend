import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { AppStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList> };
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  label: string;
  icon: IoniconName;
  accent: string;
  onPress: () => void;
}

const PAPEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CLIENTE:     { label: 'Cliente',        color: '#C8943C', bg: '#2A1F08' },
  FUNCIONARIO: { label: 'Funcionário',    color: '#3B82F6', bg: '#0A1830' },
  ADMIN:       { label: 'Administrador',  color: '#8B5CF6', bg: '#1A1030' },
};

export function ProfileScreen({ navigation }: Props) {
  const { usuario, logout, isCliente } = useAuth();
  const insets = useSafeAreaInsets();

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

  const papelConfig = usuario ? (PAPEL_CONFIG[usuario.papel] ?? PAPEL_CONFIG.CLIENTE) : null;

  const menuItems: MenuItem[] = [
    {
      label: 'Editar perfil',
      icon: 'create-outline',
      accent: '#C8943C',
      onPress: () => navigation.navigate('EditProfile'),
    },
    ...(isCliente
      ? [{
          label: 'Meus endereços',
          icon: 'location-outline' as IoniconName,
          accent: '#3B82F6',
          onPress: () => navigation.navigate('Addresses'),
        }]
      : []),
    {
      label: 'Alterar senha',
      icon: 'lock-closed-outline',
      accent: '#8B5CF6',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      label: 'Notificações',
      icon: 'notifications-outline',
      accent: '#22C55E',
      onPress: () => navigation.navigate('Notificacoes'),
    },
  ];

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── Cabeçalho ─────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          {/* Decoração */}
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.userName}>{usuario?.nome}</Text>
          <Text style={styles.userEmail}>{usuario?.email}</Text>

          <View style={styles.badges}>
            {papelConfig && (
              <View style={[styles.badge, { backgroundColor: papelConfig.bg }]}>
                <Ionicons name="shield-checkmark-outline" size={12} color={papelConfig.color} />
                <Text style={[styles.badgeText, { color: papelConfig.color }]}>
                  {papelConfig.label}
                </Text>
              </View>
            )}
            {usuario?.telefone && (
              <View style={[styles.badge, { backgroundColor: '#1A1A1A' }]}>
                <Ionicons name="call-outline" size={12} color="#6B7280" />
                <Text style={[styles.badgeText, { color: '#6B7280' }]}>
                  {usuario.telefone}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Menu ──────────────────────────────────────── */}
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={styles.menuItem}
              activeOpacity={0.8}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.accent}18` }]}>
                <Ionicons name={item.icon} size={20} color={item.accent} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#3A3A3A" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
            activeOpacity={0.8}
          >
            <View style={styles.logoutIcon}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.logoutLabel}>Sair da conta</Text>
            <Ionicons name="chevron-forward" size={18} color="#3A3A3A" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  header: {
    alignItems: 'center',
    paddingBottom: 36,
    overflow: 'hidden',
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  headerDecor1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1C0808',
    top: -60,
    right: -60,
  },
  headerDecor2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#150606',
    top: -20,
    left: -50,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#8B1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
    borderWidth: 3,
    borderColor: '#A52020',
  },
  avatarText: {
    color: '#F5F0E8',
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    color: '#F5F0E8',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  menu: {
    padding: 16,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#242424',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    color: '#F5F0E8',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A0808',
    borderRadius: 18,
    padding: 14,
    marginTop: 6,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3A1010',
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2D0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logoutLabel: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
});
