import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { userService } from '../../services/userService';
import { useTheme } from '../../contexts/ThemeContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Header } from '../../components/common/Header';
import { isValidPassword } from '../../utils/validation';
import { AppStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'ChangePassword'>;
};

export function ChangePasswordScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!senhaAtual || !novaSenha || !confirmar) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }
    if (!isValidPassword(novaSenha)) {
      Alert.alert('Atenção', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (novaSenha !== confirmar) {
      Alert.alert('Atenção', 'As senhas não conferem');
      return;
    }
    setLoading(true);
    try {
      await userService.changePassword(senhaAtual, novaSenha);
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
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
      <Header title="Alterar senha" onBack={() => navigation.goBack()} />
      <ScrollView className="flex-1 px-4" keyboardShouldPersistTaps="handled">
        <Input label="Senha atual" isPassword value={senhaAtual} onChangeText={setSenhaAtual} />
        <Input label="Nova senha" isPassword value={novaSenha} onChangeText={setNovaSenha} />
        <Input label="Confirmar nova senha" isPassword value={confirmar} onChangeText={setConfirmar} />
        <Button title="Alterar senha" onPress={handleSave} loading={loading} size="lg" className="mt-2" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
