import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import * as Notifications from 'expo-notifications';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Configurar notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class EmergencyService {
  constructor() {
    this.watchId = null;
    this.emergencyId = null;
  }

  // Solicitar permisos de ubicación
  async requestLocationPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Permisos de ubicación denegados' };
      }
      return { success: true };
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener ubicación actual
  async getCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      return {
        success: true,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        },
      };
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      return { success: false, error: error.message };
    }
  }

  // Generar enlace de Google Maps
  generateMapLink(latitude, longitude) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }

  // Enviar SMS a contactos de emergencia
  async sendEmergencySMS(contacts, location) {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        return { success: false, error: 'SMS no disponible en este dispositivo' };
      }

      const mapLink = this.generateMapLink(location.latitude, location.longitude);
      const message = `🚨 ALERTA DE EMERGENCIA 🚨\n\nNecesito ayuda urgente!\n\nMi ubicación en tiempo real:\n${mapLink}\n\nEnviado desde Centinela`;

      const phoneNumbers = contacts.map(contact => contact.phone);

      const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
      
      return { success: result === 'sent', result };
    } catch (error) {
      console.error('Error enviando SMS:', error);
      return { success: false, error: error.message };
    }
  }

  // Iniciar seguimiento de ubicación en tiempo real
  async startLocationTracking(userId, emergencyId) {
    try {
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Actualizar cada 10 segundos
          distanceInterval: 10, // O cuando se mueva 10 metros
        },
        async (location) => {
          // Actualizar ubicación en Firestore
          await this.updateEmergencyLocation(emergencyId, {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        }
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error iniciando tracking:', error);
      return { success: false, error: error.message };
    }
  }

  // Detener seguimiento de ubicación
  stopLocationTracking() {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  // Crear registro de emergencia en Firebase
  async createEmergency(userId, userData, location) {
    try {
      const emergencyData = {
        userId,
        userName: userData.name,
        userEmail: userData.email,
        userPhone: userData.phone,
        status: 'active',
        startTime: new Date().toISOString(),
        initialLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        },
        lastLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date().toISOString(),
        },
        contactsNotified: userData.emergencyContacts || [],
      };

      const docRef = await addDoc(collection(db, 'emergencies'), emergencyData);
      this.emergencyId = docRef.id;
      
      return { success: true, emergencyId: docRef.id };
    } catch (error) {
      console.error('Error creando emergencia:', error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar ubicación de emergencia
  async updateEmergencyLocation(emergencyId, location) {
    try {
      const emergencyRef = doc(db, 'emergencies', emergencyId);
      await updateDoc(emergencyRef, {
        lastLocation: location,
        lastUpdate: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      return { success: false, error: error.message };
    }
  }

  // Finalizar emergencia
  async endEmergency(emergencyId) {
    try {
      this.stopLocationTracking();
      
      const emergencyRef = doc(db, 'emergencies', emergencyId);
      await updateDoc(emergencyRef, {
        status: 'resolved',
        endTime: new Date().toISOString(),
      });
      
      this.emergencyId = null;
      return { success: true };
    } catch (error) {
      console.error('Error finalizando emergencia:', error);
      return { success: false, error: error.message };
    }
  }

  // Activar emergencia completa
  async activateEmergency(userId, userData) {
    try {
      // 1. Verificar permisos de ubicación
      const permissionResult = await this.requestLocationPermissions();
      if (!permissionResult.success) {
        return permissionResult;
      }

      // 2. Obtener ubicación actual
      const locationResult = await this.getCurrentLocation();
      if (!locationResult.success) {
        return locationResult;
      }

      // 3. Crear registro de emergencia en Firebase
      const emergencyResult = await this.createEmergency(
        userId,
        userData,
        locationResult.location
      );
      if (!emergencyResult.success) {
        return emergencyResult;
      }

      // 4. Enviar SMS a contactos de emergencia
      if (userData.emergencyContacts && userData.emergencyContacts.length > 0) {
        await this.sendEmergencySMS(
          userData.emergencyContacts,
          locationResult.location
        );
      }

      // 5. Iniciar seguimiento en tiempo real
      await this.startLocationTracking(userId, emergencyResult.emergencyId);

      // 6. Mostrar notificación local
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Emergencia Activada',
          body: 'Tus contactos han sido notificados',
          sound: true,
        },
        trigger: null,
      });

      return {
        success: true,
        emergencyId: emergencyResult.emergencyId,
        location: locationResult.location,
      };
    } catch (error) {
      console.error('Error activando emergencia:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmergencyService();