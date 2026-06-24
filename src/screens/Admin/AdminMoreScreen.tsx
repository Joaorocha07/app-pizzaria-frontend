import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
    color: '#F4A261',
  },
  {
    label: 'Bordas',
    descricao: 'Gerenciar opções de borda recheada',
    icon: 'pizza-outline',
    screen: 'AdminCrusts',
    color: '#9B5DE5',
  },
  {
    label: 'Cupons',
    descricao: 'Criar e gerenciar cupons de desconto',
    icon: 'pricetag-outline',
    screen: 'AdminCoupons',
    color: '#2A9D8F',
  },
  {
    label: 'Banners',
    descricao: 'Banners promocionais da home',
    icon: 'image-outline',
    screen: 'AdminBanners',
    color: '#457B9D',
  },
  {
    label: 'Configurações da Loja',
    descricao: 'Parâmetros gerais do sistema',
    icon: 'settings-outline',
    screen: 'AdminStoreConfig',
    color: '#A0A0A0',
  },
];

export function AdminMoreScreen({ navigation }: Props) {
  return (
    <View style={s.root}>
      <Header title="Gerenciar" subtitle="Configurações do restaurante" />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.screen}
            onPress={() => navigation.navigate(section.screen as any)}
            style={s.card}
            activeOpacity={0.75}
          >
            <View style={[s.iconWrap, { backgroundColor: `${section.color}18` }]}>
              <Ionicons name={section.icon} size={22} color={section.color} />
            </View>
            <View style={s.textWrap}>
              <Text style={s.label}>{section.label}</Text>
              <Text style={s.description}>{section.descricao}</Text>
            </View>
            <View style={s.arrowWrap}>
              <Ionicons name="chevron-forward" size={18} color="#444444" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 14,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 2,
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
