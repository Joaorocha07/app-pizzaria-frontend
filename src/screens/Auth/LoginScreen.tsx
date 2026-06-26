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
  Switch,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppColors } from '../../theme/colors';
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});

  const pulse = useRef(new Animated.Value(1)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, useNativeDriver: true, speed: 12, bounciness: 6 }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.07, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand area ─── */}
        <View style={[styles.brandArea, { paddingTop: insets.top + 28 }]}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <View style={styles.blob3} />

          <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulse }] }]}>
            <LinearGradient colors={['#C0392B', '#7B241C']} style={styles.logoGradient}>
              <Ionicons name="pizza" size={52} color="rgba(255,255,255,0.92)" />
            </LinearGradient>
            <View style={styles.logoGlow} />
          </Animated.View>

          <Animated.View style={{ opacity: fadeIn, alignItems: 'center' }}>
            <Text style={styles.brandName}>Pizzaria</Text>
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={11} color="#C0392B" />
              <Text style={styles.brandSub}>UBERABA  •  MG</Text>
            </View>
          </Animated.View>
        </View>

        {/* ── Form card ─── */}
        <Animated.View
          style={[styles.formCard, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
        >
          <View style={styles.formHandle} />
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
            leftIcon={<Ionicons name="mail-outline" size={18} color="#4B5563" />}
          />

          <Input
            label="Senha"
            placeholder="Sua senha"
            isPassword
            value={senha}
            onChangeText={setSenha}
            error={errors.senha}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color="#4B5563" />}
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
                trackColor={{ false: '#1C1C1C', true: '#7B241C' }}
                thumbColor={rememberMe ? '#C0392B' : '#555'}
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

          {/* Google sign in */}
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

function createStyles(c: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    brandArea: { alignItems: 'center', paddingBottom: 52, overflow: 'hidden' },
    blob1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: c.bgCard, top: -80, right: -100 },
    blob2: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: c.bgCard, top: -10, left: -80 },
    blob3: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: c.bgCard, bottom: 0, right: 30 },
    logoContainer: { marginBottom: 20, position: 'relative' },
    logoGradient: { width: 112, height: 112, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    logoGlow: { position: 'absolute', width: 112, height: 112, borderRadius: 32, borderWidth: 2, borderColor: 'rgba(192,57,43,0.45)', top: 0, left: 0 },
    brandName: { color: c.text, fontSize: 38, fontWeight: '900', letterSpacing: 2 },
    locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: 'rgba(192,57,43,0.08)', borderWidth: 1, borderColor: 'rgba(192,57,43,0.18)' },
    brandSub: { color: c.textSecondary, fontSize: 10, letterSpacing: 4, fontWeight: '600' },
    formCard: { flex: 1, backgroundColor: c.bgElevated, borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40, marginTop: -28, borderTopWidth: 1, borderColor: c.border },
    formHandle: { width: 36, height: 3, borderRadius: 2, backgroundColor: c.border, alignSelf: 'center', marginBottom: 24 },
    formTitle: { color: c.text, fontSize: 24, fontWeight: '800', letterSpacing: 0.4, marginBottom: 4 },
    formSub: { color: c.textSecondary, fontSize: 14, letterSpacing: 0.3, marginBottom: 28 },
    rowOptions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: -4, marginBottom: 20 },
    rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rememberText: { color: c.textSecondary, fontSize: 13 },
    forgotText: { color: c.primary, fontSize: 13, fontWeight: '600' },
    loginBtn: { marginBottom: 14 },
    googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.bgCard, marginBottom: 20 },
    googleText: { color: c.textSecondary, fontSize: 14, fontWeight: '600', letterSpacing: 0.4 },
    registerRow: { flexDirection: 'row', justifyContent: 'center' },
    registerText: { color: c.textSecondary, fontSize: 14 },
    registerLink: { color: c.accent, fontWeight: '700', fontSize: 14 },
  });
}
