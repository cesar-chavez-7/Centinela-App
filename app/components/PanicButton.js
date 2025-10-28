import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Vibration,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { THEME } from '../theme/theme';

const PanicButton = ({ onEmergency }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de pulso suave y constante
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de brillo
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let timer;
    if (isPressed && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }, 1000);
    } else if (isPressed && countdown === 0) {
      activateEmergency();
    }
    return () => clearTimeout(timer);
  }, [isPressed, countdown]);

  useEffect(() => {
    if (isPressed) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(0);
    }
  }, [isPressed]);

  const handlePressIn = () => {
    setIsPressed(true);
    setCountdown(3);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (countdown > 0) {
      setIsPressed(false);
      setCountdown(3);
      
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  };

  const activateEmergency = () => {
    Vibration.vibrate([0, 500, 200, 500]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    if (onEmergency) {
      onEmergency();
    }
  };

  const progressRotation = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  // Constantes para tamaños (para que siempre coincidan)
  const BUTTON_SIZE = 170;
  const BORDER_WIDTH = 5;
  const PROGRESS_SPACING = 8; // Espacio entre botón y círculo de progreso
  const PROGRESS_SIZE = BUTTON_SIZE + (BORDER_WIDTH * 2) + (PROGRESS_SPACING * 2);

  return (
    <View style={styles.container}>
      {/* Círculo de brillo */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            opacity: glowOpacity,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Círculo de progreso */}
      {isPressed && (
        <Animated.View
          style={[
            styles.progressCircle,
            {
              width: PROGRESS_SIZE,
              height: PROGRESS_SIZE,
              borderRadius: PROGRESS_SIZE / 2,
              transform: [{ rotate: progressRotation }],
            },
          ]}
        >
          <View style={styles.progressSegment} />
        </Animated.View>
      )}

      {/* Botón principal */}
      <Animated.View
        style={[
          styles.buttonShadow,
          {
            transform: [
              { scale: isPressed ? scaleAnim : pulseAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            isPressed && styles.buttonPressed,
          ]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={styles.buttonContent}>
            {isPressed ? (
              <>
                <Text style={styles.countdownText}>{countdown}</Text>
                <Text style={styles.countdownLabel}>segundos</Text>
              </>
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>🚨</Text>
                </View>
                <Text style={styles.buttonText}>SOS</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Texto inferior */}
      <Text style={styles.instructions}>
        {isPressed ? 'Suelta para cancelar' : 'Mantén presionado'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.xxl,
    minHeight: 300,
  },
  glowCircle: {
    position: 'absolute',
    width: 170,
    height:150,
    borderRadius: 120,
    backgroundColor: 'rgba(220, 20, 60, 0.15)',
  },
  progressCircle: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: THEME.colors.emergency,
    borderRightColor: THEME.colors.emergency,
  },
  progressSegment: {
    width: '10%',
    height: '10%',
  },
  buttonShadow: {
    shadowColor: THEME.colors.emergency,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 8,
  },
  button: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: THEME.colors.emergency,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: THEME.colors.emergencyDark,
  },
  buttonPressed: {
    backgroundColor: THEME.colors.emergencyDark,
    borderColor: '#8B0000',
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: THEME.spacing.xs,
  },
  icon: {
    fontSize: 42,
  },
  buttonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.colors.text,
    letterSpacing: 3,
  },
  countdownText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: THEME.colors.text,
    lineHeight: 64,
  },
  countdownLabel: {
    fontSize: 13,
    color: THEME.colors.text,
    opacity: 0.9,
    marginTop: THEME.spacing.xs,
  },
  instructions: {
    marginTop: THEME.spacing.lg,
    fontSize: 14,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
});

export default PanicButton;