import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { AppStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList> };
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  label: string;
  description: string;
  icon: IoniconName;
  accent: string;
  onPress: () => void;
}

const PAPEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CLIENTE: { label: 'Cliente', color: '#C8943C', bg: '#2A1F08' },
  FUNCIONARIO: { label: 'Funcionário', color: '#3B82F6', bg: '#0A1830' },
  ADMIN: { label: 'Administrador', color: '#8B5CF6', bg: '#1A1030' },
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
      description: 'Nome, telefone e dados da conta',
      icon: 'create-outline',
      accent: '#C8943C',
      onPress: () => navigation.navigate('EditProfile'),
    },
    ...(isCliente
      ? [{
          label: 'Meus endereços',
          description: 'Locais de entrega salvos',
          icon: 'location-outline' as IoniconName,
          accent: '#3B82F6',
          onPress: () => navigation.navigate('Addresses'),
        }]
      : []),
    {
      label: 'Alterar senha',
      description: 'Mantenha o acesso protegido',
      icon: 'lock-closed-outline',
      accent: '#8B5CF6',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      label: 'Notificações',
      description: 'Alertas de pedidos e promoções',
      icon: 'notifications-outline',
      accent: '#22C55E',
      onPress: () => navigation.navigate('Notificacoes'),
    },
  ];

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarWrapper}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.kicker}>Minha conta</Text>
              <Text style={styles.userName} numberOfLines={1}>{usuario?.nome}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{usuario?.email}</Text>
            </View>
          </View>

          <View style={styles.badges}>
            {papelConfig && (
              <View style={[styles.badge, { backgroundColor: papelConfig.bg }]}>
                <Ionicons name="shield-checkmark-outline" size={13} color={papelConfig.color} />
                <Text style={[styles.badgeText, { color: papelConfig.color }]}>
                  {papelConfig.label}
                </Text>
              </View>
            )}
            {usuario?.telefone ? (
              <View style={styles.phoneBadge}>
                <Ionicons name="call-outline" size={13} color="#9CA3AF" />
                <Text style={styles.phoneBadgeText}>{usuario.telefone}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          <Text style={styles.sectionHint}>Ajustes rápidos da conta</Text>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={styles.menuItem}
              activeOpacity={0.82}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.accent}1F` }]}>
                <Ionicons name={item.icon} size={20} color={item.accent} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#555B66" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.logoutBtn}
            activeOpacity={0.82}
          >
            <View style={styles.logoutIcon}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.logoutLabel}>Sair da conta</Text>
              <Text style={styles.logoutDescription}>Encerrar sessão neste aparelho</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6F3434" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  profileCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: '#242424',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#9F1717',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#C62A2A',
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  kicker: {
    color: '#C8943C',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  userName: {
    color: '#F5F0E8',
    fontSize: 23,
    fontWeight: '900',
  },
  userEmail: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 3,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#1E1E1E',
  },
  phoneBadgeText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#F5F0E8',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionHint: {
    color: '#7B8190',
    fontSize: 13,
    marginTop: 2,
  },
  menu: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#171717',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#242424',
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    color: '#F5F0E8',
    fontSize: 15,
    fontWeight: '800',
  },
  menuDescription: {
    color: '#7B8190',
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#200D0D',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#4A1616',
    marginTop: 4,
  },
  logoutIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#351414',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutLabel: {
    color: '#FF5A5A',
    fontSize: 15,
    fontWeight: '900',
  },
  logoutDescription: {
    color: '#B16B6B',
    fontSize: 12,
    marginTop: 2,
  },
});
