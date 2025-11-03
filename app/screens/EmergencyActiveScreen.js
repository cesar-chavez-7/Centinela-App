import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  Linking,
  BackHandler,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import { THEME } from '../theme/theme';
import Button from '../components/common/Button';

const EmergencyActiveScreen = ({ navigation, route }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [alarmActive, setAlarmActive] = useState(true);
  const [vibrationActive, setVibrationActive] = useState(true);
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  
  // Referencias para evitar duplicados
  const soundRef = useRef(null);
  const locationSubscriptionRef = useRef(null);
  const timerRef = useRef(null);

  const { emergencyId, location: initialLocation } = route.params || {};

  // UN SOLO useEffect que hace TODO
  useEffect(() => {
    console.log('🚀 Componente montado - Iniciando emergencia');

    // 1. Bloquear botón atrás
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        Alert.alert(
          '⚠️ Emergencia Activa',
          'No puedes salir durante una emergencia activa. Debes cancelar la alerta primero.',
          [{ text: 'Entendido' }]
        );
        return true;
      }
    );

    // 2. Timer
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // 3. Iniciar tracking
    initializeTracking();

    // 4. Iniciar sonido
    initializeSound();

    // 5. Iniciar vibración continua
    const vibrationPattern = [0, 1000, 500]; // Vibra 1 seg, pausa 0.5 seg
    Vibration.vibrate(vibrationPattern, true); // true = repetir infinitamente

    // Cleanup cuando se desmonte el componente
    return () => {
      console.log('🧹 Componente desmontado - Limpiando todo');
      
      backHandler.remove();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      cleanupSound();
      cleanupLocation();
      Vibration.cancel(); // Detener vibración
    };
  }, []);

  // useEffect SEPARADO solo para el toggle de alarma
  useEffect(() => {
    if (soundRef.current) {
      if (alarmActive) {
        soundRef.current.playAsync();
      } else {
        soundRef.current.pauseAsync();
      }
    }
  }, [alarmActive]);

  // useEffect SEPARADO para el toggle de vibración
  useEffect(() => {
    if (vibrationActive) {
      const vibrationPattern = [0, 1000, 500];
      Vibration.vibrate(vibrationPattern, true);
    } else {
      Vibration.cancel();
    }
  }, [vibrationActive]);

  // Inicializar sonido
  const initializeSound = async () => {
    try {
      console.log('🔊 Configurando sonido...');
      
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/alarm_retro.mp3'),
        { 
          isLooping: true,
          volume: 1.0,
        }
      );
      
      soundRef.current = sound;
      await sound.playAsync();
      
      console.log('✅ Sonido iniciado');
    } catch (error) {
      console.error('❌ Error con sonido:', error);
    }
  };

  // Limpiar sonido
  const cleanupSound = async () => {
    try {
      if (soundRef.current) {
        console.log('🔇 Deteniendo sonido...');
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        console.log('✅ Sonido detenido');
      }
    } catch (error) {
      console.error('❌ Error limpiando sonido:', error);
    }
  };

  // Inicializar tracking
  const initializeTracking = async () => {
    try {
      console.log('📍 Iniciando tracking...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permiso de ubicación denegado');
        return;
      }

      setIsTracking(true);

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          });
        }
      );

      locationSubscriptionRef.current = subscription;
      console.log('✅ Tracking iniciado');
    } catch (error) {
      console.error('❌ Error en tracking:', error);
    }
  };

  // Limpiar tracking
  const cleanupLocation = () => {
    if (locationSubscriptionRef.current) {
      console.log('🛑 Deteniendo tracking...');
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
      setIsTracking(false);
      console.log('✅ Tracking detenido');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const openInMaps = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Emergencia',
      '¿Estás seguro de que quieres cancelar la alerta de emergencia?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => {
            console.log('🚫 Usuario canceló emergencia');
            Vibration.cancel(); // Cancelar vibración antes de salir
            navigation.replace('Home');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.emergency} />
      
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <View style={styles.pulsingDot} />
          <Text style={styles.statusText}>EMERGENCIA ACTIVA</Text>
        </View>
        <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={100} color={THEME.colors.emergency} />
        </View>

        <Text style={styles.title}>🚨 Alerta Activada</Text>
        <Text style={styles.subtitle}>
          Alguien escuchara tu peticion de ayuda.
        </Text>

        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="people" size={24} color={THEME.colors.accent} />
            <Text style={styles.infoLabel}>Contactos</Text>
            <Text style={styles.infoValue}>Notificados</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons 
              name={isTracking ? "location" : "location-outline"} 
              size={24} 
              color={isTracking ? THEME.colors.success : THEME.colors.error} 
            />
            <Text style={styles.infoLabel}>GPS</Text>
            <Text style={styles.infoValue}>
              {isTracking ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>

        {location && (
          <TouchableOpacity 
            style={styles.locationCard}
            onPress={openInMaps}
            activeOpacity={0.7}
          >
            <Ionicons name="map-outline" size={24} color={THEME.colors.accent} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Tu ubicación actual</Text>
              <Text style={styles.locationCoords}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        )}

        

      </View>

      <View style={styles.actions}>
        <Button
          title="Cancelar Emergencia"
          variant="outline"
          onPress={handleCancel}
        />
        
        <Text style={styles.helpText}>
          ⚠️ Si estás en peligro, NO canceles la alerta
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    padding: THEME.spacing.lg,
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...THEME.shadows.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.emergency,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.full,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.text,
    marginRight: THEME.spacing.sm,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.text,
    letterSpacing: 1,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginTop: THEME.spacing.md,
  },
  content: {
    flex: 1,
    padding: THEME.spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: THEME.spacing.xl,
    marginBottom: THEME.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: THEME.spacing.xl,
    paddingHorizontal: THEME.spacing.md,
  },
  infoCards: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: THEME.spacing.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    marginHorizontal: THEME.spacing.xs,
    ...THEME.shadows.small,
  },
  infoLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.sm,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginTop: THEME.spacing.xs,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    width: '100%',
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.small,
  },
  locationInfo: {
    flex: 1,
    marginLeft: THEME.spacing.md,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontFamily: 'monospace',
  },
  alarmToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBackground,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginTop: THEME.spacing.sm,
    width: '100%',
    ...THEME.shadows.small,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  alarmToggleActive: {
    borderColor: THEME.colors.emergency,
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
  },
  alarmText: {
    fontSize: 16,
    color: THEME.colors.text,
    marginLeft: THEME.spacing.sm,
    fontWeight: '500',
  },
  actions: {
    padding: THEME.spacing.lg,
  },
  helpText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: THEME.spacing.md,
  },
});

export default EmergencyActiveScreen;