import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { isValidEmail } from '../../utils/validation';
import { AuthStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'E-mail obrigatório';
    else if (!isValidEmail(email)) newErrors.email = 'E-mail inválido';
    if (!senha) newErrors.senha = 'Senha obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), senha);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Credenciais inválidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

        {/* ── Área da marca ─────────────────────────────────── */}
        <View style={[styles.brandArea, { paddingTop: insets.top + 32 }]}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />

          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🍕</Text>
          </View>
          <Text style={styles.brandName}>Pizzaria</Text>
          <Text style={styles.brandSub}>UBERABA  •  MG</Text>
        </View>

        {/* ── Card do formulário ────────────────────────────── */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Bem-vindo de volta!</Text>
          <Text style={styles.formSub}>Entre na sua conta para continuar</Text>

          <Input
            label="E-mail"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={18} color="#6B7280" />}
          />

          <Input
            label="Senha"
            placeholder="Sua senha"
            isPassword
            value={senha}
            onChangeText={setSenha}
            error={errors.senha}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#6B7280" />}
          />

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.loginBtn}
          />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  brandArea: {
    alignItems: 'center',
    paddingBottom: 56,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#1C0808',
    top: -80,
    right: -90,
  },
  circle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#150606',
    top: 0,
    left: -80,
  },
  circle3: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#240A0A',
    bottom: 10,
    right: 30,
  },
  logoContainer: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: '#8B1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 14,
    borderWidth: 2,
    borderColor: '#A52020',
  },
  logoEmoji: { fontSize: 50 },
  brandName: {
    color: '#F5F0E8',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  brandSub: {
    color: '#6B7280',
    fontSize: 11,
    letterSpacing: 5,
    marginTop: 6,
    fontWeight: '600',
  },
  formCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
    marginTop: -28,
    borderTopWidth: 1,
    borderColor: '#1E1E1E',
  },
  formTitle: {
    color: '#F5F0E8',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSub: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 28,
  },
  loginBtn: {
    marginTop: 8,
    shadowColor: '#8B1A1A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  registerText: { color: '#6B7280', fontSize: 14 },
  registerLink: { color: '#8B1A1A', fontWeight: '700', fontSize: 14 },
});
