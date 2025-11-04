import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "AIzaSyBwaz6zmTW6_XXAjCHoHMVgHF898X-7vSI",
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "expense-tracker-f25a1.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || "expense-tracker-f25a1",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "expense-tracker-f25a1.firebasestorage.app",
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "849578950027",
  appId: Constants.expoConfig?.extra?.firebaseAppId || "1:849578950027:web:3073ce612551d68f7ac38e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);