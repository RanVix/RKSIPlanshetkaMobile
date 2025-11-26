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

import AsyncStorage from '@react-native-async-storage/async-storage'
import firebase from '@react-native-firebase/app'
import messaging from '@react-native-firebase/messaging'
import { Platform } from 'react-native'

const DEVICE_TOKEN_CACHE_KEY = '@cache/device-token'

const AuthorizationStatus = messaging.AuthorizationStatus

const isAuthorized = (status: number) =>
  status === AuthorizationStatus.AUTHORIZED ||
  status === AuthorizationStatus.PROVISIONAL

const cacheToken = async (token: string | null) => {
  if (!token) return
  await AsyncStorage.setItem(DEVICE_TOKEN_CACHE_KEY, token)
}

export const getCachedDeviceToken = async () => {
  const token = await AsyncStorage.getItem(DEVICE_TOKEN_CACHE_KEY)
  return token
}

export const clearCachedDeviceToken = async () => {
  await AsyncStorage.removeItem(DEVICE_TOKEN_CACHE_KEY)
}

const ensurePermissions = async () => {
  try {
    // Инициализация Firebase(проверка)
    if (!firebase.apps.length) {
      throw new Error('Firebase app is not initialized')
    }

    // registerDeviceForRemoteMessages() на IOS
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages()
    }
    
    const currentStatus = await messaging().hasPermission()

    if (isAuthorized(currentStatus)) {
      return currentStatus
    }

    const requestedStatus = await messaging().requestPermission()

    if (!isAuthorized(requestedStatus)) {
      throw new Error('Push notification permission was not granted')
    }

    return requestedStatus
  } catch (error) {
    console.error('Firebase messaging error:', error)
    throw error
  }
}

export const getDeviceToken = async (forceRefresh = false) => {
  if (!forceRefresh) {
    const cached = await getCachedDeviceToken()
    if (cached) {
      return cached
    }
  }

  await ensurePermissions()
  const token = await messaging().getToken()
  await cacheToken(token)

  return token
}
