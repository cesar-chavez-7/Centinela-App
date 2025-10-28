export const COLORS = {
  primary: '#0A2647',
  secondary: '#144272',
  accent: '#205295',
  emergency: '#DC143C',
  emergencyDark: '#8B0000',
  success: '#2ECC71',
  warning: '#F39C12',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  background: '#0A2647',
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
};

export const EMERGENCY_CONFIG = {
  COUNTDOWN_SECONDS: 3,
  LOCATION_UPDATE_INTERVAL: 30000, // 30 segundos
  MAX_CONTACTS: 5,
  VIBRATION_PATTERN: [0, 500, 200, 500, 200, 500], // Patrón SOS
};

export const MESSAGES = {
  EMERGENCY_SMS: (userName, trackingUrl) => 
    `🚨 EMERGENCIA - ${userName} necesita ayuda urgente!\n\n📍 Ver ubicación en tiempo real:\n${trackingUrl}\n\n🕐 ${new Date().toLocaleString()}\n\nEnviado desde Centinela`,
  
  LOCATION_PERMISSION_DENIED: 
    'Centinela necesita acceso a tu ubicación para funcionar correctamente. Por favor, habilita los permisos en Configuración.',
  
  NO_CONTACTS_ERROR:
    'Debes agregar al menos un contacto de emergencia antes de activar la alerta.',
};