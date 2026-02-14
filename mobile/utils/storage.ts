import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage wrapper that uses expo-secure-store on native
 * and AsyncStorage as fallback (web / environments where native module is unavailable).
 */

let SecureStore: typeof import('expo-secure-store') | null = null;
let secureStoreAvailable = false;

// Eagerly attempt to load SecureStore on native platforms
if (Platform.OS !== 'web') {
  try {
    SecureStore = require('expo-secure-store');
    secureStoreAvailable = true;
  } catch {
    secureStoreAvailable = false;
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  if (secureStoreAvailable && SecureStore) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      // Fallback to AsyncStorage if native module fails
      return AsyncStorage.getItem(key);
    }
  }
  return AsyncStorage.getItem(key);
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (secureStoreAvailable && SecureStore) {
    try {
      await SecureStore.setItemAsync(key, value);
      return;
    } catch {
      // Fallback
    }
  }
  await AsyncStorage.setItem(key, value);
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (secureStoreAvailable && SecureStore) {
    try {
      await SecureStore.deleteItemAsync(key);
      return;
    } catch {
      // Fallback
    }
  }
  await AsyncStorage.removeItem(key);
}
