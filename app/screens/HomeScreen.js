import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme/theme';
import PanicButton from '../components/PanicButton';

const HomeScreen = ({ navigation }) => {
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [userName] = useState('Usuario');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEmergency = (emergencyId, location) => {
  navigation.navigate('EmergencyActive', { 
    emergencyId, 
    location 
  });
};


  const quickActions = [
    {
      id: 1,
      icon: 'people-outline',
      label: 'Contactos',
      color: THEME.colors.accent,
      onPress: () => console.log('Contactos'),
    },
    {
      id: 2,
      icon: 'location-outline',
      label: 'Ubicación',
      color: THEME.colors.success,
      onPress: () => console.log('Ubicación'),
    },
    {
      id: 3,
      icon: 'settings-outline',
      label: 'Ajustes',
      color: THEME.colors.secondary,
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.primary} />
      
      {/* Header con gradiente */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hola, {userName}</Text>
            <View style={styles.statusBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.statusText}>Protegido</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => console.log('Profile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileCircle}>
              <Ionicons name="person" size={24} color={THEME.colors.text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* GPS Status */}
        <View style={styles.gpsCard}>
          <View style={styles.gpsLeft}>
            <Ionicons
              name={gpsEnabled ? 'navigate-circle' : 'navigate-circle-outline'}
              size={28}
              color={gpsEnabled ? THEME.colors.success : THEME.colors.error}
            />
            <View style={styles.gpsText}>
              <Text style={styles.gpsTitle}>GPS</Text>
              <Text style={[
                styles.gpsStatus,
                { color: gpsEnabled ? THEME.colors.success : THEME.colors.error }
              ]}>
                {gpsEnabled ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
          
          <Ionicons 
            name="shield-checkmark" 
            size={24} 
            color={THEME.colors.success} 
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Panic Button Section */}
        <Animated.View style={[styles.panicSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Centro de Emergencia</Text>
          <PanicButton onEmergency={handleEmergency} />
          <View style={styles.instructionCard}>
            <Ionicons name="information-circle" size={20} color={THEME.colors.accent} />
            <Text style={styles.instructionText}>
              Mantén presionado 3 segundos para activar
            </Text>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Acceso Rápido</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View
                key={action.id}
                style={{
                  opacity: fadeAnim,
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  }],
                }}
              >
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={action.onPress}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}20` }]}>
                    <Ionicons name={action.icon} size={28} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Consejos de Seguridad</Text>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={24} color={THEME.colors.warning} />
              <Text style={styles.tipTitle}>¿Sabías que?</Text>
            </View>
            <Text style={styles.tipText}>
              Tus contactos de emergencia recibirán tu ubicación en tiempo real durante una alerta activa.
            </Text>
          </View>
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
  headerContainer: {
    backgroundColor: THEME.colors.primary,
    paddingTop: StatusBar.currentHeight || 0,
    paddingBottom: THEME.spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...THEME.shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.success,
  },
  profileButton: {
    marginLeft: THEME.spacing.md,
  },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.accent,
  },
  gpsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.secondary,
    marginHorizontal: THEME.spacing.lg,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    ...THEME.shadows.small,
  },
  gpsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsText: {
    marginLeft: THEME.spacing.md,
  },
  gpsTitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 2,
  },
  gpsStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  panicSection: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
    marginTop: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.lg,
    alignSelf: 'flex-start',
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 82, 149, 0.15)',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.borderRadius.md,
    marginTop: THEME.spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.accent,
  },
  instructionText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginLeft: THEME.spacing.sm,
    flex: 1,
  },
  quickActionsSection: {
    marginBottom: THEME.spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: 105,
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    alignItems: 'center',
    ...THEME.shadows.small,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.colors.text,
    textAlign: 'center',
  },
  tipsSection: {
    marginBottom: THEME.spacing.xl,
  },
  tipCard: {
    backgroundColor: THEME.colors.cardBackground,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.warning,
    ...THEME.shadows.small,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginLeft: THEME.spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
  },
});

export default HomeScreen;