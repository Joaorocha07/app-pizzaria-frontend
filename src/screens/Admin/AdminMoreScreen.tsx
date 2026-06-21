import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { AppStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList> };

const SECTIONS: {
  label: string;
  descricao: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  screen: keyof AppStackParamList;
  color: string;
}[] = [
  {
    label: 'Categorias',
    descricao: 'Criar, editar e remover categorias',
    icon: 'grid-outline',
    screen: 'AdminCategories',
    color: '#C8943C',
  },
  {
    label: 'Bordas',
    descricao: 'Gerenciar opções de borda',
    icon: 'pizza-outline',
    screen: 'AdminCrusts',
    color: '#8B5CF6',
  },
  {
    label: 'Cupons',
    descricao: 'Criar e gerenciar cupons de desconto',
    icon: 'pricetag-outline',
    screen: 'AdminCoupons',
    color: '#22C55E',
  },
  {
    label: 'Banners',
    descricao: 'Banners promocionais da home',
    icon: 'image-outline',
    screen: 'AdminBanners',
    color: '#3B82F6',
  },
  {
    label: 'Configurações da Loja',
    descricao: 'Parâmetros gerais do sistema',
    icon: 'settings-outline',
    screen: 'AdminStoreConfig',
    color: '#6B7280',
  },
];

export function AdminMoreScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-dark">
      <Header title="Gerenciar" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.screen}
            onPress={() => navigation.navigate(section.screen as any)}
            className="bg-dark-card rounded-2xl p-4 mb-3 flex-row items-center"
            activeOpacity={0.7}
          >
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: `${section.color}22` }}
            >
              <Ionicons name={section.icon} size={24} color={section.color} />
            </View>
            <View className="flex-1">
              <Text className="text-offwhite font-bold text-base">{section.label}</Text>
              <Text className="text-gray-400 text-sm mt-0.5">{section.descricao}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
