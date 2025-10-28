import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tu configuración de Firebase
// (La obtendrás de Firebase Console después)
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "centinela-app.firebaseapp.com",
  databaseURL: "https://centinela-app-default-rtdb.firebaseio.com",
  projectId: "centinela-app",
  storageBucket: "centinela-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:android:abcdef"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };