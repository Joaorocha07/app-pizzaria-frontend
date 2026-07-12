import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors, fontFamily, letterSpacing, radius } from '../../theme/theme';
import { useAuth } from '../../contexts/AuthContext';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { AuthStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 5 }),
    ]).start();
  }, []);

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
      style={styles.root}
    >
      <Header title="Criar conta" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
          <Text style={styles.title}>Bem-vindo à família</Text>
          <Text style={styles.subtitle}>Crie sua conta para pedir suas pizzas favoritas</Text>

          <Input
            label="Nome completo"
            placeholder="Seu nome"
            autoCapitalize="words"
            value={nome}
            onChangeText={setNome}
            error={errors.nome}
            leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
          />

          <Input
            label="E-mail"
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
          />

          <Input
            label="Telefone (opcional)"
            placeholder="(34) 99999-0000"
            keyboardType="phone-pad"
            value={telefone}
            onChangeText={setTelefone}
            leftIcon={<Ionicons name="call-outline" size={18} color={colors.textMuted} />}
          />

          <Input
            label="Senha"
            placeholder="Mínimo 6 caracteres"
            isPassword
            value={senha}
            onChangeText={setSenha}
            error={errors.senha}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
          />

          <Input
            label="Confirmar senha"
            placeholder="Repita a senha"
            isPassword
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            error={errors.confirmarSenha}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
          />

          <Button
            title="Criar conta"
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.registerBtn}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>OU CADASTRE-SE COM</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social sign up — visual apenas, sem funcionalidade ainda */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={18} color={colors.text} />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Ionicons name="logo-apple" size={20} color={colors.text} />
              <Text style={styles.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    content: { paddingHorizontal: 24, paddingBottom: 40 },
    title: { color: c.text, fontFamily: fontFamily.headingBold, fontSize: 24, letterSpacing: 0.2, marginTop: 8, marginBottom: 4 },
    subtitle: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 14, letterSpacing: 0.3, marginBottom: 28 },
    registerBtn: { marginTop: 8, marginBottom: 20 },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    dividerLine: { flex: 1, height: StyleSheet.hairlineWidth * 2, backgroundColor: c.border },
    dividerLabel: { color: c.textMuted, fontFamily: fontFamily.bodySemiBold, fontSize: 9, letterSpacing: letterSpacing.caps },
    socialRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.bgCard },
    socialText: { color: c.textSecondary, fontFamily: fontFamily.bodySemiBold, fontSize: 14, letterSpacing: 0.2 },
    loginRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 8 },
    loginText: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 14 },
    loginLink: { color: c.primary, fontFamily: fontFamily.bodyBold, fontSize: 14 },
  });
}
