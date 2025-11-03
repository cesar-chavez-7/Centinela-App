import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tu configuración de Firebase
// (La obtendrás de Firebase Console después)

export const firebaseConfig = {
  apiKey: "AIzaSyDbmCD7JD1WHNUsp4Q0YJ2XxpHF74Qib_c",
  authDomain: "centinela-45356.firebaseapp.com",
  projectId: "centinela-45356",
  storageBucket: "centinela-45356.firebasestorage.app",
  messagingSenderId: "885679268493",
  appId: "1:885679268493:web:b78779db6b273e3f7ff8c4"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };