import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
};

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
          <Text className="text-gray-400 text-sm">{usuario?.email}</Text>
          {usuario?.telefone && (
            <Text className="text-gray-400 text-sm">{usuario.telefone}</Text>
          )}
        </View>

        <View className="px-4">
          {[
            { label: 'Editar perfil', emoji: '✏️', onPress: () => navigation.navigate('EditProfile') },
            { label: 'Meus endereços', emoji: '📍', onPress: () => navigation.navigate('Addresses') },
            { label: 'Alterar senha', emoji: '🔒', onPress: () => navigation.navigate('ChangePassword') },
            { label: 'Notificações', emoji: '🔔', onPress: () => navigation.navigate('Notificacoes') },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              className="bg-dark-card rounded-2xl p-4 mb-3 flex-row items-center"
              activeOpacity={0.8}
            >
              <Text className="text-2xl mr-3">{item.emoji}</Text>
              <Text className="text-offwhite font-semibold flex-1">{item.label}</Text>
              <Text className="text-gray-500 text-lg">›</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-900/30 border border-danger rounded-2xl p-4 flex-row items-center mt-2 mb-8"
            activeOpacity={0.8}
          >
            <Text className="text-2xl mr-3">🚪</Text>
            <Text className="text-danger font-bold flex-1">Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
