import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/adminService';
import { TipoDesconto } from '../../types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList>;
  route: RouteProp<AppStackParamList, 'AdminCouponForm'>;
};

function toInputDate(iso: string) {
  return iso.split('T')[0];
}

function toIsoDatetime(date: string) {
  return `${date}T00:00:00.000Z`;
}

export function AdminCouponFormScreen({ navigation, route }: Props) {
  const { couponId } = route.params ?? {};
  const isEditing = !!couponId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [valorDesconto, setValorDesconto] = useState('');
  const [tipoDesconto, setTipoDesconto] = useState<TipoDesconto>('PERCENTUAL');
  const [validoDe, setValidoDe] = useState('');
  const [validoAte, setValidoAte] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [limiteUso, setLimiteUso] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    adminService
      .getCoupons()
      .then((cupons) => {
        const c = cupons.find((x) => x.id === couponId);
        if (c) {
          setCodigo(c.codigo);
          setValorDesconto(String(c.valorDesconto));
          setTipoDesconto(c.tipoDesconto);
          setValidoDe(toInputDate(c.validoDe));
          setValidoAte(toInputDate(c.validoAte));
          setAtivo(c.ativo);
          setLimiteUso(c.limiteUso ? String(c.limiteUso) : '');
        }
      })
      .catch((e: any) => Alert.alert('Erro', e.message))
      .finally(() => setLoading(false));
  }, [isEditing, couponId]);

  async function handleSave() {
    if (!codigo.trim()) return Alert.alert('Atenção', 'Código é obrigatório.');
    const valor = parseFloat(valorDesconto.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) return Alert.alert('Atenção', 'Informe um valor de desconto válido.');
    if (!validoDe || !validoAte) return Alert.alert('Atenção', 'Informe as datas de validade (AAAA-MM-DD).');

    setSaving(true);
    try {
      const payload = {
        codigo: codigo.trim().toUpperCase(),
        valorDesconto: valor,
        tipoDesconto,
        validoDe: toIsoDatetime(validoDe),
        validoAte: toIsoDatetime(validoAte),
        ativo,
        limiteUso: limiteUso ? parseInt(limiteUso, 10) : undefined,
      };
      if (isEditing) {
        await adminService.updateCoupon(couponId!, payload);
      } else {
        await adminService.createCoupon(payload);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View className="flex-1 bg-dark">
      <Header
        title={isEditing ? 'Editar cupom' : 'Novo cupom'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Código *"
          placeholder="Ex: PIZZA10"
          value={codigo}
          onChangeText={(t) => setCodigo(t.toUpperCase())}
          autoCapitalize="characters"
        />

        <Text className="text-offwhite text-sm mb-2 font-semibold">Tipo de desconto *</Text>
        <View className="flex-row gap-3 mb-4">
          {(['PERCENTUAL', 'FIXO'] as TipoDesconto[]).map((tipo) => (
            <TouchableOpacity
              key={tipo}
              onPress={() => setTipoDesconto(tipo)}
              className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border ${
                tipoDesconto === tipo ? 'bg-primary border-primary' : 'bg-dark-card border-dark-border'
              }`}
            >
              <Ionicons
                name={tipo === 'PERCENTUAL' ? 'percent-outline' : 'cash-outline'}
                size={16}
                color={tipoDesconto === tipo ? '#F5F0E8' : '#6B7280'}
              />
              <Text className={`font-semibold text-sm ${tipoDesconto === tipo ? 'text-offwhite' : 'text-gray-400'}`}>
                {tipo === 'PERCENTUAL' ? 'Percentual' : 'Valor fixo'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label={`Valor de desconto * ${tipoDesconto === 'PERCENTUAL' ? '(%)' : '(R$)'}`}
          placeholder={tipoDesconto === 'PERCENTUAL' ? '10' : '5,00'}
          value={valorDesconto}
          onChangeText={setValorDesconto}
          keyboardType="decimal-pad"
        />

        <Input
          label="Válido de * (AAAA-MM-DD)"
          placeholder="2024-01-01"
          value={validoDe}
          onChangeText={setValidoDe}
          keyboardType="numbers-and-punctuation"
        />
        <Input
          label="Válido até * (AAAA-MM-DD)"
          placeholder="2024-12-31"
          value={validoAte}
          onChangeText={setValidoAte}
          keyboardType="numbers-and-punctuation"
        />
        <Input
          label="Limite de usos (opcional)"
          placeholder="Ilimitado"
          value={limiteUso}
          onChangeText={setLimiteUso}
          keyboardType="number-pad"
        />

        <View className="flex-row items-center justify-between bg-dark-card rounded-xl p-4 mb-6">
          <Text className="text-offwhite font-semibold">Cupom ativo</Text>
          <Switch
            value={ativo}
            onValueChange={setAtivo}
            trackColor={{ false: '#374151', true: '#7F1212' }}
            thumbColor={ativo ? '#8B1A1A' : '#6B7280'}
          />
        </View>

        <Button
          title={isEditing ? 'Salvar alterações' : 'Criar cupom'}
          onPress={handleSave}
          loading={saving}
          size="lg"
        />
      </ScrollView>
    </View>
  );
}
