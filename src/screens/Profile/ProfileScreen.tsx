import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
};

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuItem {
  label: string;
  icon: IoniconName;
  color: string;
  onPress: () => void;
}

export function ProfileScreen({ navigation }: Props) {
  const { usuario, logout } = useAuth();

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

  const menuItems: MenuItem[] = [
    {
      label: 'Editar perfil',
      icon: 'create-outline',
      color: '#F5F0E8',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      label: 'Meus endereços',
      icon: 'location-outline',
      color: '#F5F0E8',
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      label: 'Alterar senha',
      icon: 'lock-closed-outline',
      color: '#F5F0E8',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      label: 'Notificações',
      icon: 'notifications-outline',
      color: '#F5F0E8',
      onPress: () => navigation.navigate('Notificacoes'),
    },
  ];

  return (
    <View className="flex-1 bg-dark">
      <View className="px-4 pt-14 pb-4">
        <Text className="text-offwhite text-2xl font-bold">Perfil</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="items-center py-6 px-4">
          <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-3">
            <Text className="text-offwhite text-2xl font-bold">{initials}</Text>
          </View>
          <Text className="text-offwhite text-xl font-bold">{usuario?.nome}</Text>
          <Text className="text-gray-400 text-sm mt-1">{usuario?.email}</Text>
          {usuario?.telefone && (
            <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name="call-outline" size={12} color="#6B7280" />
              <Text className="text-gray-400 text-sm">{usuario.telefone}</Text>
            </View>
          )}
        </View>

        <View className="px-4">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              className="bg-dark-card rounded-2xl p-4 mb-3 flex-row items-center"
              activeOpacity={0.8}
            >
              <View className="w-9 h-9 bg-dark-border rounded-xl items-center justify-center mr-3">
                <Ionicons name={item.icon} size={20} color="#C8943C" />
              </View>
              <Text className="text-offwhite font-semibold flex-1">{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-900/20 border border-danger/40 rounded-2xl p-4 flex-row items-center mt-2 mb-8"
            activeOpacity={0.8}
          >
            <View className="w-9 h-9 bg-red-900/40 rounded-xl items-center justify-center mr-3">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text className="text-danger font-bold flex-1">Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
