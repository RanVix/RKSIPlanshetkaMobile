import AsyncStorage from '@react-native-async-storage/async-storage'
import messaging from '@react-native-firebase/messaging'

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
  await messaging().registerDeviceForRemoteMessages()
  const currentStatus = await messaging().hasPermission()

  if (isAuthorized(currentStatus)) {
    return currentStatus
  }

  const requestedStatus = await messaging().requestPermission()

  if (!isAuthorized(requestedStatus)) {
    throw new Error('Push notification permission was not granted')
  }

  return requestedStatus
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
