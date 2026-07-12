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
import { AppColors } from '../../theme/theme';
import { fontFamily, letterSpacing, radius } from '../../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Crest } from '../../components/common/Crest';
import { Ornament } from '../../components/common/Ornament';
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
        <View style={[styles.brandArea, { paddingTop: insets.top + 32 }]}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Crest size={116} />
          </Animated.View>

          <Animated.View style={{ opacity: fadeIn, alignItems: 'center' }}>
            <Text style={styles.brandName}>PIZZARIA</Text>
            <Ornament width={150} color={colors.accent} style={{ marginTop: 10 }} />
            <Text style={styles.brandSub}>UBERABA — MG</Text>
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
            leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
          />

          <Input
            label="Senha"
            placeholder="Sua senha"
            isPassword
            value={senha}
            onChangeText={setSenha}
            error={errors.senha}
            leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
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
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor={rememberMe ? colors.primary : colors.textMuted}
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

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>OU CONTINUE COM</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social sign in — visual apenas, sem funcionalidade ainda */}
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
    brandArea: { alignItems: 'center', paddingBottom: 40, gap: 18 },
    brandName: { color: c.text, fontFamily: fontFamily.displayBold, fontSize: 30, letterSpacing: 4, marginTop: 4 },
    brandSub: { color: c.textSecondary, fontFamily: fontFamily.bodySemiBold, fontSize: 10, letterSpacing: letterSpacing.capsWide, marginTop: 10 },
    formCard: { flex: 1, backgroundColor: c.bgElevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: 24, paddingTop: 26, paddingBottom: 40, borderTopWidth: 1, borderColor: c.border },
    formHandle: { width: 36, height: 2, backgroundColor: c.borderStrong, alignSelf: 'center', marginBottom: 24 },
    formTitle: { color: c.text, fontFamily: fontFamily.headingBold, fontSize: 24, letterSpacing: 0.2, marginBottom: 4 },
    formSub: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 14, letterSpacing: 0.3, marginBottom: 28 },
    rowOptions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: -4, marginBottom: 20 },
    rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    rememberText: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 13 },
    forgotText: { color: c.primary, fontFamily: fontFamily.bodySemiBold, fontSize: 13 },
    loginBtn: { marginBottom: 20 },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    dividerLine: { flex: 1, height: StyleSheet.hairlineWidth * 2, backgroundColor: c.border },
    dividerLabel: { color: c.textMuted, fontFamily: fontFamily.bodySemiBold, fontSize: 9, letterSpacing: letterSpacing.caps },
    socialRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, backgroundColor: c.bgCard },
    socialText: { color: c.textSecondary, fontFamily: fontFamily.bodySemiBold, fontSize: 14, letterSpacing: 0.2 },
    registerRow: { flexDirection: 'row', justifyContent: 'center' },
    registerText: { color: c.textSecondary, fontFamily: fontFamily.bodyRegular, fontSize: 14 },
    registerLink: { color: c.primary, fontFamily: fontFamily.bodyBold, fontSize: 14 },
  });
}
