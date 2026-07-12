import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { userService } from '../../services/userService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'EditProfile'>;
};

export function EditProfileScreen({ navigation }: Props) {
  const { usuario, refreshUser } = useAuth();
  const { colors } = useTheme();
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [telefone, setTelefone] = useState(usuario?.telefone ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome não pode ser vazio');
      return;
    }
    setLoading(true);
    try {
      await userService.updateMe({ nome: nome.trim(), telefone: telefone || undefined });
      await refreshUser();
      Alert.alert('Sucesso', 'Perfil atualizado!');
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
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <Header title="Editar perfil" onBack={() => navigation.goBack()} />
      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        <Input label="Nome completo" value={nome} onChangeText={setNome} autoCapitalize="words" />
        <Input label="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
        <Button title="Salvar alterações" onPress={handleSave} loading={loading} size="lg" className="mt-2" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
