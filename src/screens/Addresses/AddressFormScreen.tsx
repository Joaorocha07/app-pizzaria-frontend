import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { userService } from '../../services/userService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'AddressForm'>;
  route: RouteProp<AppStackParamList, 'AddressForm'>;
};

export function AddressFormScreen({ navigation, route }: Props) {
  const existing = route.params?.address;
  const [rua, setRua] = useState(existing?.rua ?? '');
  const [numero, setNumero] = useState(existing?.numero ?? '');
  const [complemento, setComplemento] = useState(existing?.complemento ?? '');
  const [bairro, setBairro] = useState(existing?.bairro ?? '');
  const [cidade, setCidade] = useState(existing?.cidade ?? 'Uberaba');
  const [estado, setEstado] = useState(existing?.estado ?? 'MG');
  const [cep, setCep] = useState(existing?.cep ?? '');
  const [padrao, setPadrao] = useState(existing?.padrao ?? false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!rua.trim()) e.rua = 'Rua obrigatória';
    if (!numero.trim()) e.numero = 'Número obrigatório';
    if (!bairro.trim()) e.bairro = 'Bairro obrigatório';
    if (!cidade.trim()) e.cidade = 'Cidade obrigatória';
    if (!estado.trim()) e.estado = 'Estado obrigatório';
    if (!cep.trim()) e.cep = 'CEP obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setLoading(true);
    const payload = {
      rua: rua.trim(),
      numero: numero.trim(),
      complemento: complemento.trim() || undefined,
      bairro: bairro.trim(),
      cidade: cidade.trim(),
      estado: estado.trim().toUpperCase(),
      cep: cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'),
      padrao,
    };
    try {
      if (existing) {
        await userService.updateAddress(existing.id, payload);
      } else {
        await userService.createAddress(payload);
      }
      Alert.alert('Sucesso', existing ? 'Endereço atualizado!' : 'Endereço adicionado!');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-dark">
      <View className="px-4 pt-14 pb-4 flex-row items-center gap-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-primary font-bold text-base">←</Text>
        </TouchableOpacity>
        <Text className="text-offwhite text-xl font-bold">{existing ? 'Editar' : 'Novo'} endereço</Text>
      </View>
      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        <Input label="CEP" placeholder="00000-000" keyboardType="numeric" value={cep} onChangeText={setCep} error={errors.cep} />
        <Input label="Rua" placeholder="Nome da rua" value={rua} onChangeText={setRua} error={errors.rua} />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input label="Número" placeholder="123" keyboardType="numeric" value={numero} onChangeText={setNumero} error={errors.numero} />
          </View>
          <View className="flex-1">
            <Input label="Complemento" placeholder="Apto, casa..." value={complemento} onChangeText={setComplemento} />
          </View>
        </View>
        <Input label="Bairro" placeholder="Nome do bairro" value={bairro} onChangeText={setBairro} error={errors.bairro} />
        <View className="flex-row gap-3">
          <View className="flex-[2]">
            <Input label="Cidade" placeholder="Uberaba" value={cidade} onChangeText={setCidade} error={errors.cidade} />
          </View>
          <View className="flex-1">
            <Input label="Estado" placeholder="MG" maxLength={2} autoCapitalize="characters" value={estado} onChangeText={setEstado} error={errors.estado} />
          </View>
        </View>
        <View className="flex-row items-center justify-between bg-dark-card rounded-xl px-4 py-3 mb-4">
          <Text className="text-offwhite font-semibold">Endereço padrão</Text>
          <Switch value={padrao} onValueChange={setPadrao} trackColor={{ true: '#8B1A1A' }} />
        </View>
        <Button title="Salvar endereço" onPress={handleSave} loading={loading} size="lg" className="mb-8" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
