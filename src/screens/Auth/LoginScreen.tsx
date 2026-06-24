import React, { useEffect, useRef, useState } from 'react';
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
  Switch,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});

  const pulse = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Brand area ─────────────────────────────────── */}
        <View style={[styles.brandArea, { paddingTop: insets.top + 28 }]}>
          {/* Decorative blobs */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <View style={styles.blob3} />

          <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulse }] }]}>
            <LinearGradient
              colors={['#E63946', '#B5222E']}
              style={styles.logoGradient}
            >
              <Text style={styles.logoEmoji}>🍕</Text>
            </LinearGradient>
            {/* Glow ring */}
            <View style={styles.logoGlow} />
          </Animated.View>

          <Animated.View style={{ opacity: fadeIn, alignItems: 'center' }}>
            <Text style={styles.brandName}>Pizzaria</Text>
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={11} color="#E63946" />
              <Text style={styles.brandSub}>UBERABA  •  MG</Text>
            </View>
          </Animated.View>
        </View>

        {/* ── Form card ────────────────────────────────── */}
        <Animated.View style={[styles.formCard, { opacity: fadeIn }]}>
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
            leftIcon={<Ionicons name="mail-outline" size={18} color="#666666" />}
          />

          <Input
            label="Senha"
            placeholder="Sua senha"
            isPassword
            value={senha}
            onChangeText={setSenha}
            error={errors.senha}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#666666" />}
          />

          {/* Remember & Forgot */}
          <View style={styles.rowOptions}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe((v) => !v)}
              activeOpacity={0.8}
            >
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: '#2A2A2A', true: '#2A9D8F' }}
                thumbColor="#FFFFFF"
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
              <Text style={styles.rememberText}>Lembrar de mim</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.loginBtn}
          />

          {/* Google signin button */}
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8}>
            <Ionicons name="logo-google" size={18} color="#FFFFFF" />
            <Text style={styles.googleText}>Entrar com Google</Text>
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  brandArea: {
    alignItems: 'center',
    paddingBottom: 52,
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#1C0506',
    top: -100,
    right: -110,
  },
  blob2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#140404',
    top: -20,
    left: -90,
  },
  blob3: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1A0707',
    bottom: 0,
    right: 20,
  },
  logoContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  logoGradient: {
    width: 112,
    height: 112,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(230,57,70,0.5)',
    top: 0,
    left: 0,
  },
  logoEmoji: { fontSize: 52 },
  brandName: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 1,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(230,57,70,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.2)',
  },
  brandSub: {
    color: '#A0A0A0',
    fontSize: 11,
    letterSpacing: 3.5,
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
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSub: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 28,
  },
  rowOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    color: '#A0A0A0',
    fontSize: 13,
  },
  forgotText: {
    color: '#E63946',
    fontSize: 13,
    fontWeight: '600',
  },
  loginBtn: {
    marginBottom: 14,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  googleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: { color: '#A0A0A0', fontSize: 14 },
  registerLink: { color: '#F4A261', fontWeight: '700', fontSize: 14 },
});
