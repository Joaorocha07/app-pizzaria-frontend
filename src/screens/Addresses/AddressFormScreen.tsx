import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../services/userService';
import { searchCep } from '../../services/cepService';
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
  const [cidade, setCidade] = useState(existing?.cidade ?? '');
  const [estado, setEstado] = useState(existing?.estado ?? '');
  const [cep, setCep] = useState(existing?.cep ?? '');
  const [padrao, setPadrao] = useState(existing?.padrao ?? false);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function formatCepInput(value: string) {
    const clean = value.replace(/\D/g, '').slice(0, 8);
    const formatted = clean.length > 5 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : clean;
    setCep(formatted);
    if (clean.length === 8) handleCepSearch(clean);
  }

  async function handleCepSearch(cleanCep: string) {
    setCepLoading(true);
    setErrors((prev) => ({ ...prev, cep: '' }));
    try {
      const data = await searchCep(cleanCep);
      setRua(data.rua);
      setBairro(data.bairro);
      setCidade(data.cidade);
      setEstado(data.estado);
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, cep: e.message }));
    } finally {
      setCepLoading(false);
    }
  }

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-dark"
    >
      <View className="px-4 pt-14 pb-4 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8B1A1A" />
        </TouchableOpacity>
        <Text className="text-offwhite text-xl font-bold">
          {existing ? 'Editar' : 'Novo'} endereço
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        <View className="mb-4">
          <Text className="text-offwhite text-sm mb-1 font-semibold">CEP</Text>
          <View
            className={`flex-row items-center bg-dark-card border rounded-xl px-4 ${
              errors.cep ? 'border-danger' : 'border-dark-border'
            }`}
          >
            <Ionicons name="location-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
            <Input
              placeholder="00000-000"
              keyboardType="numeric"
              value={cep}
              onChangeText={formatCepInput}
              className="flex-1 border-0 mb-0 px-0"
            />
            {cepLoading && <ActivityIndicator size="small" color="#8B1A1A" />}
            {!cepLoading && cep.replace(/\D/g, '').length === 8 && !errors.cep && (
              <Ionicons name="checkmark-circle" size={18} color="#22C55E" />
            )}
          </View>
          {errors.cep ? (
            <Text className="text-danger text-xs mt-1">{errors.cep}</Text>
          ) : (
            <Text className="text-gray-500 text-xs mt-1">Preenchimento automático ao digitar</Text>
          )}
        </View>

        <Input
          label="Rua"
          placeholder="Preenchido automaticamente"
          value={rua}
          onChangeText={setRua}
          error={errors.rua}
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Número"
              placeholder="123"
              keyboardType="numeric"
              value={numero}
              onChangeText={setNumero}
              error={errors.numero}
            />
          </View>
          <View className="flex-1">
            <Input
              label="Complemento"
              placeholder="Apto, casa..."
              value={complemento}
              onChangeText={setComplemento}
            />
          </View>
        </View>

        <Input
          label="Bairro"
          placeholder="Preenchido automaticamente"
          value={bairro}
          onChangeText={setBairro}
          error={errors.bairro}
        />

        <View className="flex-row gap-3">
          <View className="flex-[2]">
            <Input
              label="Cidade"
              placeholder="Preenchido automaticamente"
              value={cidade}
              onChangeText={setCidade}
              error={errors.cidade}
            />
          </View>
          <View className="flex-1">
            <Input
              label="UF"
              placeholder="MG"
              maxLength={2}
              autoCapitalize="characters"
              value={estado}
              onChangeText={setEstado}
              error={errors.estado}
            />
          </View>
        </View>

        <View className="flex-row items-center justify-between bg-dark-card border border-dark-border rounded-xl px-4 py-3 mb-6">
          <View className="flex-row items-center gap-3">
            <Ionicons name="star-outline" size={18} color="#C8943C" />
            <Text className="text-offwhite font-semibold">Endereço padrão</Text>
          </View>
          <Switch
            value={padrao}
            onValueChange={setPadrao}
            trackColor={{ true: '#8B1A1A', false: '#2A2A2A' }}
            thumbColor={padrao ? '#F5F0E8' : '#6B7280'}
          />
        </View>

        <Button
          title="Salvar endereço"
          onPress={handleSave}
          loading={loading}
          size="lg"
          className="mb-8"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
