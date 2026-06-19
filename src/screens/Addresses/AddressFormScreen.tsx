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
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../services/userService';
import { searchCep } from '../../services/cepService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Header } from '../../components/common/Header';
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
  const [cepError, setCepError] = useState('');
  const [cepOk, setCepOk] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleCepChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);
    setCepOk(false);
    setCepError('');

    if (digits.length === 8) {
      setCepLoading(true);
      try {
        const data = await searchCep(digits);
        setRua(data.rua);
        setBairro(data.bairro);
        setCidade(data.cidade);
        setEstado(data.estado);
        setCepOk(true);
      } catch (e: any) {
        setCepError(e.message);
        setRua('');
        setBairro('');
        setCidade('');
        setEstado('');
      } finally {
        setCepLoading(false);
      }
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!cep.trim()) e.cep = 'CEP obrigatório';
    if (!rua.trim()) e.rua = 'Rua obrigatória';
    if (!numero.trim()) e.numero = 'Número obrigatório';
    if (!bairro.trim()) e.bairro = 'Bairro obrigatório';
    if (!cidade.trim()) e.cidade = 'Cidade obrigatória';
    if (!estado.trim()) e.estado = 'Estado obrigatório';
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
      style={{ flex: 1, backgroundColor: '#0D0D0D' }}
    >
      <Header
        title={existing ? 'Editar endereço' : 'Novo endereço'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* CEP */}
        <Text style={{ color: '#F5F0E8', fontSize: 14, fontWeight: '600', marginBottom: 6 }}>CEP</Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#1A1A1A',
          borderWidth: 1,
          borderColor: cepError ? '#EF4444' : cepOk ? '#22C55E' : '#2A2A2A',
          borderRadius: 12,
          paddingHorizontal: 14,
          marginBottom: 4,
        }}>
          <Ionicons name="location-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, color: '#F5F0E8', fontSize: 15, paddingVertical: 14 }}
            placeholder="00000-000"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
            value={cep}
            onChangeText={handleCepChange}
            maxLength={9}
          />
          {cepLoading && <ActivityIndicator size="small" color="#8B1A1A" />}
          {!cepLoading && cepOk && <Ionicons name="checkmark-circle" size={20} color="#22C55E" />}
          {!cepLoading && !!cepError && <Ionicons name="close-circle" size={20} color="#EF4444" />}
        </View>
        {cepError ? (
          <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 14 }}>{cepError}</Text>
        ) : (
          <Text style={{ color: '#6B7280', fontSize: 12, marginBottom: 14 }}>
            Preenche os campos automaticamente
          </Text>
        )}

        <Input
          label="Rua"
          placeholder="Preenchido automaticamente"
          value={rua}
          onChangeText={setRua}
          error={errors.rua}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Input
              label="Número"
              placeholder="123"
              keyboardType="numeric"
              value={numero}
              onChangeText={setNumero}
              error={errors.numero}
            />
          </View>
          <View style={{ flex: 1 }}>
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

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 2 }}>
            <Input
              label="Cidade"
              placeholder="Preenchido automaticamente"
              value={cidade}
              onChangeText={setCidade}
              error={errors.cidade}
            />
          </View>
          <View style={{ flex: 1 }}>
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

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#1A1A1A',
          borderWidth: 1,
          borderColor: '#2A2A2A',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          marginBottom: 24,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="star-outline" size={18} color="#C8943C" />
            <Text style={{ color: '#F5F0E8', fontWeight: '600' }}>Endereço padrão</Text>
          </View>
          <Switch
            value={padrao}
            onValueChange={setPadrao}
            trackColor={{ true: '#8B1A1A', false: '#2A2A2A' }}
            thumbColor={padrao ? '#F5F0E8' : '#6B7280'}
          />
        </View>

        <Button title="Salvar endereço" onPress={handleSave} loading={loading} size="lg" />
        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
