// Planshetka - A convenient schedule viewing app
// Copyright (C) 2025  RanVix & Yarovich

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

// lib/deviceTokenCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

const DEVICE_TOKEN_KEY = 'device_token_v1';

export const getCachedDeviceToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(DEVICE_TOKEN_KEY);
  } catch (e) {
    console.warn('Failed to read cached device token', e);
    return null;
  }
};

export const writeCachedDeviceToken = async (token: string | null) => {
  try {
    if (token == null) {
      await AsyncStorage.removeItem(DEVICE_TOKEN_KEY);
    } else {
      await AsyncStorage.setItem(DEVICE_TOKEN_KEY, token);
    }
  } catch (e) {
    console.warn('Failed to write cached device token', e);
  }
};

/**
 * Проверка — доступен ли нативный модуль RNFBAppModule.
 * Это безопасно — мы не трогаем @react-native-firebase на уровне модуля.
 */
const isNativeRNFBAvailable = (): boolean => {
  if (Platform.OS === 'web') return false;
  try {
    const { RNFBAppModule } = NativeModules as any;
    return !!RNFBAppModule;
  } catch {
    return false;
  }
};

const tryResolveNativeMessaging = () => {
  if (!isNativeRNFBAvailable()) {
    console.warn('react-native-firebase native app module not available — skipping native messaging.');
    return null;
  }

  try {
    // require динамически и безопасно
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const messenger = require('@react-native-firebase/messaging');

    // messenger может быть undefined/null — проверяем перед доступом к .default
    if (!messenger) return null;

    // если пакет использует default export — вернём его, иначе сам объект
    return (messenger && (messenger.default ?? messenger)) || null;
  } catch (e: any) {
    // ловим любые ошибки (включая ошибки инициализации нативного модуля)
    console.warn('react-native-firebase/messaging is not available at runtime:', e?.message ?? e);
    return null;
  }
};

/**
 * Получить токен устройства (native). Возвращает null если native messaging недоступен.
 */
export const getDeviceToken = async (): Promise<string | null> => {
  if (Platform.OS === 'web') {
    console.warn('getDeviceToken(): running on web — use getWebDeviceToken() if needed.');
    return null;
  }

  const messaging = tryResolveNativeMessaging();
  if (!messaging) return null;

  try {
    const messagingClient = typeof messaging === 'function' ? messaging() : messaging;

    if (typeof messagingClient.requestPermission === 'function') {
      try {
        await messagingClient.requestPermission();
      } catch (err) {
        console.warn('FCM permission request failed or was denied:', err);
      }
    }

    if (typeof messagingClient.getToken === 'function') {
      const token = await messagingClient.getToken();
      if (token) await writeCachedDeviceToken(token);
      return token ?? null;
    }

    console.warn('messaging client does not expose getToken()');
    return null;
  } catch (e) {
    console.error('Failed to obtain device token from native messaging:', e);
    return null;
  }
};

export const getWebDeviceToken = async (): Promise<string | null> => {
  console.warn('getWebDeviceToken(): not implemented. Implement using Firebase Web SDK if needed.');
  return null;
};
