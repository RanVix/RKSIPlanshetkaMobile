import axios from 'axios'
import Constants from 'expo-constants'

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ??
  Constants.manifest2?.extra?.expoClient?.extra?.apiBaseUrl ??
  'http://localhost:8000/api/v1'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { Accept: 'application/json' },
  validateStatus: () => true,
})