import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { AuthStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = 'Nome obrigatório';
    if (!email) e.email = 'E-mail obrigatório';
    else if (!isValidEmail(email)) e.email = 'E-mail inválido';
    if (!senha) e.senha = 'Senha obrigatória';
    else if (!isValidPassword(senha)) e.senha = 'Mínimo 6 caracteres';
    if (senha !== confirmarSenha) e.confirmarSenha = 'As senhas não conferem';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(nome.trim(), email.trim().toLowerCase(), senha, telefone || undefined);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-dark"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="px-6 py-12"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
          <Text className="text-primary font-bold text-base">← Voltar</Text>
        </TouchableOpacity>

        <Text className="text-offwhite text-2xl font-bold mb-6">Criar conta</Text>

        <Input
          label="Nome completo"
          placeholder="Seu nome"
          autoCapitalize="words"
          value={nome}
          onChangeText={setNome}
          error={errors.nome}
        />

        <Input
          label="E-mail"
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />

        <Input
          label="Telefone (opcional)"
          placeholder="(34) 99999-0000"
          keyboardType="phone-pad"
          value={telefone}
          onChangeText={setTelefone}
        />

        <Input
          label="Senha"
          placeholder="Mínimo 6 caracteres"
          isPassword
          value={senha}
          onChangeText={setSenha}
          error={errors.senha}
        />

        <Input
          label="Confirmar senha"
          placeholder="Repita a senha"
          isPassword
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          error={errors.confirmarSenha}
        />

        <Button
          title="Criar conta"
          onPress={handleRegister}
          loading={loading}
          size="lg"
          className="mt-2"
        />

        <View className="flex-row justify-center mt-6 pb-8">
          <Text className="text-gray-400">Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-primary font-bold">Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
