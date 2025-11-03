import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { THEME } from '../theme/theme';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    vibration: true,
    gps: true,
    darkMode: false,
    autoCall: false,
  });

  const [loading, setLoading] = useState(true);
  const [permissionsStatus, setPermissionsStatus] = useState({
    location: 'unknown',
    notifications: 'unknown',
  });

  // Cargar settings al montar
  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  // Guardar settings cuando cambien
  useEffect(() => {
    if (!loading) {
      saveSettings();
    }
  }, [settings]);

  // Cargar configuraciones guardadas
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error cargando settings:', error);
      setLoading(false);
    }
  };

  // Guardar configuraciones
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
      console.log('✅ Settings guardados');
    } catch (error) {
      console.error('❌ Error guardando settings:', error);
    }
  };

  // Verificar permisos
  const checkPermissions = async () => {
    try {
      // Verificar ubicación
      const locationStatus = await Location.getForegroundPermissionsAsync();
      
      // Verificar notificaciones
      const notificationStatus = await Notifications.getPermissionsAsync();

      setPermissionsStatus({
        location: locationStatus.status,
        notifications: notificationStatus.status,
      });
    } catch (error) {
      console.error('Error verificando permisos:', error);
    }
  };

  // Toggle con lógica especial
  const toggleSetting = async (key) => {
    // GPS - Solicitar permisos si se activa
    if (key === 'gps' && !settings.gps) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitas permitir el acceso a la ubicación para usar esta función.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir ajustes', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
      
      setPermissionsStatus({ ...permissionsStatus, location: status });
    }

    // Notificaciones - Solicitar permisos si se activa
    if (key === 'notifications' && !settings.notifications) {
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitas permitir las notificaciones para recibir alertas.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir ajustes', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
      
      setPermissionsStatus({ ...permissionsStatus, notifications: status });
    }

    // Modo oscuro
    if (key === 'darkMode') {
      Alert.alert(
        'Próximamente',
        'El modo oscuro estará disponible en una próxima actualización.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Actualizar setting
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const settingsSections = [
    {
      title: 'Emergencia',
      items: [
        {
          id: 'autoCall',
          icon: 'call-outline',
          label: 'Llamada automática',
          description: 'Llamar al primer contacto automáticamente',
          type: 'switch',
          value: settings.autoCall,
        },
        {
          id: 'sound',
          icon: 'volume-high-outline',
          label: 'Alarma sonora',
          description: 'Reproducir alarma al activar emergencia',
          type: 'switch',
          value: settings.sound,
        },
        {
          id: 'vibration',
          icon: 'phone-portrait-outline',
          label: 'Vibración',
          description: 'Vibrar durante emergencia activa',
          type: 'switch',
          value: settings.vibration,
        },
      ],
    },
    {
      title: 'Ubicación',
      items: [
        {
          id: 'gps',
          icon: 'navigate-outline',
          label: 'GPS siempre activo',
          description: permissionsStatus.location === 'granted' 
            ? 'GPS autorizado' 
            : 'Necesita permiso',
          type: 'switch',
          value: settings.gps,
        },
        {
          id: 'location',
          icon: 'location-outline',
          label: 'Preferencias de ubicación',
          description: 'Configurar precisión y frecuencia',
          type: 'navigate',
          onPress: () => handleLocationSettings(),
        },
      ],
    },
    {
      title: 'Notificaciones',
      items: [
        {
          id: 'notifications',
          icon: 'notifications-outline',
          label: 'Notificaciones push',
          description: permissionsStatus.notifications === 'granted'
            ? 'Notificaciones autorizadas'
            : 'Necesita permiso',
          type: 'switch',
          value: settings.notifications,
        },
      ],
    },
    {
      title: 'General',
      items: [
        {
          id: 'contacts',
          icon: 'people-outline',
          label: 'Contactos de emergencia',
          description: 'Administrar contactos',
          type: 'navigate',
          onPress: () => handleEmergencyContacts(),
        },
        {
          id: 'privacy',
          icon: 'shield-checkmark-outline',
          label: 'Privacidad y seguridad',
          description: 'Permisos y datos',
          type: 'navigate',
          onPress: () => handlePrivacy(),
        },
        {
          id: 'about',
          icon: 'information-circle-outline',
          label: 'Acerca de',
          description: 'Versión 1.0.0',
          type: 'navigate',
          onPress: () => handleAbout(),
        },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        {
          id: 'profile',
          icon: 'person-outline',
          label: 'Editar perfil',
          description: 'Nombre, foto y datos personales',
          type: 'navigate',
          onPress: () => handleEditProfile(),
        },
        {
          id: 'logout',
          icon: 'log-out-outline',
          label: 'Cerrar sesión',
          description: '',
          type: 'navigate',
          color: THEME.colors.error,
          onPress: () => handleLogout(),
        },
      ],
    },
  ];

  // Handlers para navegación
  const handleLocationSettings = () => {
    Alert.alert(
      'Preferencias de ubicación',
      'Aquí podrás configurar:\n\n• Precisión del GPS (Alta/Media/Baja)\n• Frecuencia de actualización\n• Uso de batería',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Configurar', onPress: () => console.log('Location settings') }
      ]
    );
  };

  const handleEmergencyContacts = () => {
    Alert.alert(
      'Contactos de emergencia',
      'Funcionalidad próximamente:\n\n• Agregar contactos\n• Editar contactos\n• Orden de prioridad\n• Mensaje personalizado',
      [{ text: 'Entendido' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacidad y Seguridad',
      'Estado de permisos:\n\n' +
      `📍 Ubicación: ${permissionsStatus.location === 'granted' ? '✅ Autorizado' : '❌ No autorizado'}\n` +
      `🔔 Notificaciones: ${permissionsStatus.notifications === 'granted' ? '✅ Autorizado' : '❌ No autorizado'}\n\n` +
      'Todos tus datos están protegidos y encriptados.',
      [
        { text: 'Cerrar', style: 'cancel' },
        { text: 'Ver política', onPress: () => console.log('Privacy policy') }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      '🛡️ Centinela v1.0.0',
      'Tu guardián personal\n\n' +
      'Desarrollado por:\n' +
      '• Steven Alberto Campos Recinos\n' +
      '• César Francisco Ramírez Chávez\n\n' +
      'ESFE AGAPE - 2025\n\n' +
      'Centinela es una aplicación de emergencia personal que te permite alertar a tus contactos de confianza con tu ubicación en tiempo real.',
      [
        { text: 'Cerrar', style: 'cancel' },
        { text: 'Más info', onPress: () => console.log('More info') }
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Editar perfil',
      'Funcionalidad próximamente:\n\n• Cambiar nombre\n• Foto de perfil\n• Información de contacto\n• Configuración de cuenta',
      [{ text: 'Entendido' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            // Limpiar datos de sesión si los hay
            try {
              await AsyncStorage.removeItem('user_session');
              console.log('✅ Sesión cerrada');
            } catch (error) {
              console.error('Error cerrando sesión:', error);
            }
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: THEME.colors.text }}>Cargando ajustes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajustes</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, itemIndex) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.settingItem}
                    onPress={item.type === 'navigate' ? item.onPress : null}
                    activeOpacity={item.type === 'navigate' ? 0.7 : 1}
                    disabled={item.type === 'switch'}
                  >
                    <View style={styles.settingLeft}>
                      <View style={[
                        styles.iconContainer,
                        { backgroundColor: item.color ? `${item.color}20` : `${THEME.colors.accent}20` }
                      ]}>
                        <Ionicons
                          name={item.icon}
                          size={22}
                          color={item.color || THEME.colors.accent}
                        />
                      </View>
                      <View style={styles.settingText}>
                        <Text style={[
                          styles.settingLabel,
                          item.color && { color: item.color }
                        ]}>
                          {item.label}
                        </Text>
                        {item.description ? (
                          <Text style={styles.settingDescription}>
                            {item.description}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.settingRight}>
                      {item.type === 'switch' ? (
                        <Switch
                          value={item.value}
                          onValueChange={() => toggleSetting(item.id)}
                          trackColor={{
                            false: THEME.colors.border,
                            true: THEME.colors.accent,
                          }}
                          thumbColor={THEME.colors.text}
                        />
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={THEME.colors.textSecondary}
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>🛡️ Centinela</Text>
          <Text style={styles.appVersion}>Versión 1.0.0 (Beta)</Text>
          <Text style={styles.appCopyright}>
            © 2025 ESFE AGAPE{'\n'}
            Todos los derechos reservados
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 0,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...THEME.shadows.small,
  },
  backButton: {
    padding: THEME.spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  section: {
    marginBottom: THEME.spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
    marginLeft: THEME.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    ...THEME.shadows.small,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  settingRight: {
    marginLeft: THEME.spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginLeft: 72,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xl,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  appVersion: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
  },
  appCopyright: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SettingsScreen;