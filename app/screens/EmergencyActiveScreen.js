import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme/theme';
import Button from '../components/common/Button';

const EmergencyActiveScreen = ({ navigation }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [alarmActive, setAlarmActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <View style={styles.pulsingDot} />
          <Text style={styles.statusText}>EMERGENCIA ACTIVA</Text>
        </View>
        <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Emergency Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="alert-circle" size={100} color={THEME.colors.emergency} />
        </View>

        <Text style={styles.title}>Alerta Enviada</Text>
        <Text style={styles.subtitle}>
          Tus contactos de emergencia han sido notificados y están recibiendo tu ubicación en tiempo real.
        </Text>

        {/* Info Cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Ionicons name="people" size={24} color={THEME.colors.accent} />
            <Text style={styles.infoLabel}>Contactos notificados</Text>
            <Text style={styles.infoValue}>3</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="location" size={24} color={THEME.colors.success} />
            <Text style={styles.infoLabel}>GPS activo</Text>
            <Text style={styles.infoValue}>En vivo</Text>
          </View>
        </View>

        {/* Alarm Toggle */}
        <TouchableOpacity
          style={styles.alarmToggle}
          onPress={() => setAlarmActive(!alarmActive)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={alarmActive ? 'volume-high' : 'volume-mute'}
            size={24}
            color={THEME.colors.text}
          />
          <Text style={styles.alarmText}>
            Alarma sonora {alarmActive ? 'activada' : 'desactivada'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Cancelar Emergencia"
          variant="outline"
          onPress={handleCancel}
        />
        
        <Text style={styles.helpText}>
          Si estás en peligro, NO canceles la alerta
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
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
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
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: THEME.spacing.xl,
  },
  infoCards: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: THEME.spacing.xl,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginTop: THEME.spacing.xs,
  },
  alarmToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.cardBackground,
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    ...THEME.shadows.small,
  },
  alarmText: {
    fontSize: 16,
    color: THEME.colors.text,
    marginLeft: THEME.spacing.sm,
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