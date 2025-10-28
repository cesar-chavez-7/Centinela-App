import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { THEME } from '../theme/theme';
import Input from '../components/common/Input';
import PhoneInput from '../components/common/PhoneInput';
import Button from '../components/common/Button';

const RegisterScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [phoneConfig, setPhoneConfig] = useState({
    code: '+503',
    minDigits: 8,
    maxDigits: 8,
  });
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    
    setTimeout(() => {
      console.log('Register data:', data);
      setLoading(false);
      navigation.replace('Home');
    }, 1500);
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.logo}>🛡️</Text>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a Centinela hoy</Text>
          </View>

          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="name"
              rules={{
                required: 'El nombre es requerido',
                minLength: {
                  value: 3,
                  message: 'El nombre debe tener al menos 3 caracteres',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Nombre completo"
                  placeholder="Juan Pérez"
                  icon="person-outline"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  autoCapitalize="words"
                />
              )}
            />

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
                />
              )}
            />

            <Controller
              control={control}
              name="phone"
              rules={{
                required: 'El teléfono es requerido',
                minLength: {
                  value: phoneConfig.minDigits,
                  message: `El teléfono debe tener ${phoneConfig.minDigits} dígitos`,
                },
                maxLength: {
                  value: phoneConfig.maxDigits,
                  message: `El teléfono debe tener máximo ${phoneConfig.maxDigits} dígitos`,
                },
                pattern: {
                  value: /^[0-9]+$/,
                  message: 'Solo números permitidos',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  label="Teléfono"
                  value={value}
                  onChangeText={onChange}
                  onCountryChange={(countryCode, config) => {
                    setPhoneConfig(config);
                    setValue('phone', '');
                  }}
                  error={errors.phone?.message}
                />
              )}
            />

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
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Debes confirmar la contraseña',
                validate: (value) =>
                  value === password || 'Las contraseñas no coinciden',
              }}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Confirmar contraseña"
                  placeholder="••••••••"
                  icon="lock-closed-outline"
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                  secureTextEntry
                />
              )}
            />

            <Button
              title="Crear Cuenta"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.registerButton}
            />

            <Text style={styles.termsText}>
              Al registrarte, aceptas nuestros{' '}
              <Text style={styles.termsLink}>Términos de Servicio</Text> y{' '}
              <Text style={styles.termsLink}>Política de Privacidad</Text>
            </Text>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>Inicia Sesión</Text>
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
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xl,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: THEME.spacing.lg,
    padding: THEME.spacing.sm,
    zIndex: 10,
  },
  backIcon: {
    fontSize: 32,
    color: THEME.colors.text,
  },
  logo: {
    fontSize: 60,
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
  registerButton: {
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  termsText: {
    ...THEME.typography.small,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
    lineHeight: 18,
  },
  termsLink: {
    color: THEME.colors.accent,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: THEME.spacing.xl,
  },
  loginText: {
    ...THEME.typography.body,
    color: THEME.colors.textSecondary,
  },
  loginLink: {
    ...THEME.typography.body,
    color: THEME.colors.accent,
    fontWeight: '600',
  },
});

export default RegisterScreen;