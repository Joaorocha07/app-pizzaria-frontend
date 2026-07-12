import React, { useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStackParamList } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AppStackParamList> };

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const SECTIONS: { label: string; descricao: string; icon: IoniconName; screen: keyof AppStackParamList }[] = [
  { label: 'Categorias',           descricao: 'Criar, editar e remover categorias',    icon: 'grid-outline',      screen: 'AdminCategories'  },
  { label: 'Bordas',               descricao: 'Gerenciar opções de borda recheada',    icon: 'pizza-outline',     screen: 'AdminCrusts'      },
  { label: 'Cupons',               descricao: 'Criar e gerenciar cupons de desconto',  icon: 'pricetag-outline',  screen: 'AdminCoupons'     },
  { label: 'Banners',              descricao: 'Banners promocionais da home',          icon: 'image-outline',     screen: 'AdminBanners'     },
  { label: 'Configurações da Loja',descricao: 'Parâmetros gerais do sistema',          icon: 'settings-outline',  screen: 'AdminStoreConfig' },
];

function SectionCard({ label, descricao, icon, onPress }: {
  label: string; descricao: string; icon: IoniconName; onPress: () => void;
}) {
  const scale   = useRef(new Animated.Value(1)).current;
  const overlay = useRef(new Animated.Value(0)).current;

  function pressIn() {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 0.98, useNativeDriver: true, speed: 60 }),
      Animated.timing(overlay, { toValue: 1,    useNativeDriver: true, duration: 80 }),
    ]).start();
  }

  function pressOut() {
    Animated.parallel([
      Animated.spring(scale,   { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }),
      Animated.timing(overlay, { toValue: 0, useNativeDriver: true, duration: 160 }),
    ]).start();
  }

  return (
    <Animated.View style={[s.card, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={s.cardInner}>
        {/* Light overlay on press */}
        <Animated.View style={[StyleSheet.absoluteFill, s.pressOverlay, { opacity: overlay }]} />

        <Ionicons name={icon} size={22} color="#F5F0E8" />

        <View style={s.textWrap}>
          <Text style={s.label}>{label}</Text>
          <Text style={s.description}>{descricao}</Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#888888" />
      </Pressable>
    </Animated.View>
  );
}

export function AdminMoreScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 20 }]}>
        <Text style={s.headerTitle}>Gerenciar</Text>
        <Text style={s.headerSub}>Configurações do restaurante</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map(sec => (
          <SectionCard
            key={sec.screen}
            label={sec.label}
            descricao={sec.descricao}
            icon={sec.icon}
            onPress={() => navigation.navigate(sec.screen as any)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0F0D0C' },

  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTitle: { color: '#F5F0E8', fontSize: 26, fontWeight: '800' },
  headerSub:   { color: '#888888', fontSize: 13, fontWeight: '500', marginTop: 4 },

  scroll:   { flex: 1 },
  content:  { paddingHorizontal: 16, paddingBottom: 32, gap: 10 },

  card: {
    backgroundColor: '#1A1614',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#322619',
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  pressOverlay: {
    backgroundColor: '#FFFFFF',
    opacity: 0,
    borderRadius: 18,
  },

  textWrap:    { flex: 1 },
  label:       { color: '#F5F0E8', fontSize: 16, fontWeight: '700' },
  description: { color: '#888888', fontSize: 12, marginTop: 3 },
});
