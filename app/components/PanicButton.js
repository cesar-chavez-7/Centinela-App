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
    // Patrón SOS en código Morse: ... --- ... (3 cortos, 3 largos, 3 cortos)
    const sosPattern = [
      0,    // Espera inicial
      200,  // .
      100,  // pausa
      200,  // .
      100,  // pausa
      200,  // .
      300,  // pausa entre letras
      600,  // -
      100,  // pausa
      600,  // -
      100,  // pausa
      600,  // -
      300,  // pausa entre letras
      200,  // .
      100,  // pausa
      200,  // .
      100,  // pausa
      200,  // .
    ];
    
    Vibration.vibrate(sosPattern);
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
  progressCircle: {
  position: 'absolute',
  borderWidth: 0,
  borderColor: 'transparent',
  borderTopColor: THEME.colors.emergency,
  borderRightColor: THEME.colors.emergency,
  // Agrega estas propiedades:
  //width: 170, // 10px más que el botón (170 + 10)
  //height: 170, // 10px más que el botón (170 + 10)
  //borderRadius: 30, // la mitad de width/height
  top: '20%', // Centra verticalmente
  left: '-5%', // Centra horizontalmente
  //marginLeft: -90, // Compensa la mitad del width (180/2 = 90)
  //marginTop: -90, // Compensa la mitad del height (180/2 = 90)
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