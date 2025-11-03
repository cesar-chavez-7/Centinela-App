import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { THEME } from '../theme/theme';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../firebase.config';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      console.log('Intentando iniciar sesión con:', data.email);

      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      console.log('Sesión iniciada con éxito:', user.email);
      setLoading(false);

      // Navegar a la pantalla principal
      navigation.replace('Home');
    } catch (error) {
      setLoading(false);
      console.error('Error al iniciar sesión:', error);

      let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
      // Manejo de errores específicos
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'El formato del email es inválido.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No se encontró una cuenta con este email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'La contraseña es incorrecta.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Por favor, intenta más tarde.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de red. Por favor, verifica tu conexión.';
          break;
        default:
          errorMessage = error.message || 'Error desconocido';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  // Función para recuperar contraseña 
  const handleForgotPassword = () => {
    Alert.prompt(
      'Recuperar Contraseña',
      'Ingresa tu correo para enviarte un enlace de recuperación:',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Enviar',
          onPress: async (email) => {
            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              try {
                Alert.alert('Éxito', `Enlace enviado a: ${email}`);
              } catch (error) {
                Alert.alert('Error', 'No se pudo enviar el email');
              }
            } else {
              Alert.alert('Error', 'Ingresa un email válido');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo y título */}
          <View style={styles.header}>
            <Text style={styles.logo}>🛡️</Text>
            <Text style={styles.title}>Centinela</Text>
            <Text style={styles.subtitle}>Tu guardián personal</Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>

            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  placeholder="tu@email.com"
                  icon="mail-outline"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'La contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Contraseña"
                  placeholder="••••••••"
                  icon="lock-closed-outline"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  secureTextEntry
                  editable={!loading}
                />
              )}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={[styles.forgotPasswordText, loading && styles.disabledText]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title={loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.loginButton}
              disabled={loading}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿No tienes cuenta? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Register')}
                disabled={loading}
              >
                <Text style={[styles.registerLink, loading && styles.disabledText]}>
                  Regístrate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: StatusBar.currentHeight || 0,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: THEME.spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: THEME.spacing.xxl,
    paddingBottom: THEME.spacing.xl,
  },
  logo: {
    fontSize: 80,
    marginBottom: THEME.spacing.md,
  },
  title: {
    ...THEME.typography.h1,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  subtitle: {
    ...THEME.typography.body,
    color: THEME.colors.textSecondary,
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    ...THEME.typography.h2,
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xl,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: THEME.spacing.lg,
    marginTop: -THEME.spacing.sm,
  },
  forgotPasswordText: {
    ...THEME.typography.body,
    color: THEME.colors.accent,
  },
  loginButton: {
    marginBottom: THEME.spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: THEME.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    ...THEME.typography.body,
    color: THEME.colors.textSecondary,
    marginHorizontal: THEME.spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: THEME.spacing.xl,
  },
  registerText: {
    ...THEME.typography.body,
    color: THEME.colors.textSecondary,
  },
  registerLink: {
    ...THEME.typography.body,
    color: THEME.colors.accent,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default LoginScreen;