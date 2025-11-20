import AsyncStorage from '@react-native-async-storage/async-storage'
import { AxiosResponse, isAxiosError } from 'axios'
import { http } from './http'
const GROUPS_CACHE_KEY = '@cache/groups'
const TEACHERS_CACHE_KEY = '@cache/teachers'
const CABINETS_CACHE_KEY = '@cache/cabinets'
const extractGroupParts = (value: string) => {
  const letters = value.replace(/\d+/g, '').trim()
  const numbers = (value.match(/\d+/g) ?? []).map(Number)
  return { letters, numbers }
}

const compareGroupNames = (a: string, b: string) => {
  const aParts = extractGroupParts(a)
  const bParts = extractGroupParts(b)

  const letterDiff = aParts.letters.localeCompare(bParts.letters, 'ru-RU', {
    sensitivity: 'base',
  })
  if (letterDiff !== 0) {
    return letterDiff
  }

  const longestNumbers = Math.max(aParts.numbers.length, bParts.numbers.length)
  for (let i = 0; i < longestNumbers; i += 1) {
    const aNumber = aParts.numbers[i]
    const bNumber = bParts.numbers[i]

    if (aNumber === undefined && bNumber === undefined) {
      break
    }
    if (aNumber === undefined) {
      return -1
    }
    if (bNumber === undefined) {
      return 1
    }
    if (aNumber !== bNumber) {
      return aNumber - bNumber
    }
  }

  return a.localeCompare(b, 'ru-RU', { sensitivity: 'base', numeric: true })
}

const sortGroups = (groups: string[]) => [...groups].sort(compareGroupNames)
const sortNames = (names: string[]) =>
  [...names].sort((a, b) => a.localeCompare(b, 'ru-RU', { sensitivity: 'base' }))
const sortCabinets = (cabinets: string[]) =>
  [...cabinets].sort((a, b) =>
    a.localeCompare(b, 'ru-RU', { sensitivity: 'base', numeric: true })
  )


export class BackendError extends Error {
  status: number
  payload?: unknown

  constructor(message: string, status: number, payload?: unknown) {
    super(message)
    this.name = 'BackendError'
    this.status = status
    this.payload = payload
  }
}

const isSuccessful = (status: number) => status >= 200 && status < 300

const extractErrorMessage = (payload: unknown): string | undefined => {
  if (!payload) return undefined

  if (typeof payload === 'string') {
    return payload
  }

  if (typeof payload === 'object') {
    const maybeRecord = payload as Record<string, unknown>

    if (typeof maybeRecord.message === 'string') {
      return maybeRecord.message
    }

    if (Array.isArray(maybeRecord.errors)) {
      const firstError = maybeRecord.errors[0]
      if (typeof firstError === 'string') {
        return firstError
      }
    }
  }

  return undefined
}

const ensureSuccess = <T>(response: AxiosResponse<T>) => {
  if (isSuccessful(response.status)) {
    return response.data
  }

  const message =
    extractErrorMessage(response.data) ??
    `Backend responded with status ${response.status}`

  throw new BackendError(message, response.status, response.data)
}

const normalizeAxiosError = (error: unknown): never => {
  if (isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const payload = error.response?.data
    const message =
      extractErrorMessage(payload) ??
      error.message ??
      'Unexpected backend error'

    throw new BackendError(message, status, payload)
  }

  throw error
}

export const fetchGroups = async () => {
  try {
    const response = await http.get<string[]>('/groups')
    return ensureSuccess(response)
  } catch (error) {
    normalizeAxiosError(error)
  }
}

export const fetchTeachers = async () => {
  try {
    const response = await http.get<string[]>('/prepods')
    return ensureSuccess(response)
  } catch (error) {
    normalizeAxiosError(error)
  }
}

export const fetchCabinets = async () => {
  try {
    const response = await http.get<string[]>('/cabs')
    return ensureSuccess(response)
  } catch (error) {
    normalizeAxiosError(error)
  }
}

const cacheGroups = async (groups: string[]) => {
  await AsyncStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(groups))
}

const cacheTeachers = async (teachers: string[]) => {
  await AsyncStorage.setItem(TEACHERS_CACHE_KEY, JSON.stringify(teachers))
}

const cacheCabinets = async (cabinets: string[]) => {
  await AsyncStorage.setItem(CABINETS_CACHE_KEY, JSON.stringify(cabinets))
}

export const getCachedGroups = async () => {
  const cached = await AsyncStorage.getItem(GROUPS_CACHE_KEY)
  if (!cached) return null

  try {
    return sortGroups(JSON.parse(cached) as string[])
  } catch {
    return null
  }
}

export const getCachedTeachers = async () => {
  const cached = await AsyncStorage.getItem(TEACHERS_CACHE_KEY)
  if (!cached) return null

  try {
    return sortNames(JSON.parse(cached) as string[])
  } catch {
    return null
  }
}

export const getCachedCabinets = async () => {
  const cached = await AsyncStorage.getItem(CABINETS_CACHE_KEY)
  if (!cached) return null

  try {
    return sortCabinets(JSON.parse(cached) as string[])
  } catch {
    return null
  }
}

export const getGroups = async () => {
  try {
    const groups = sortGroups(await fetchGroups())
    await cacheGroups(groups)
    return groups
  } catch (error) {
    const cached = await getCachedGroups()
    if (cached) {
      console.warn('Using cached groups due to backend error', error)
      return cached
    }
    throw error
  }
}

export const getTeachers = async () => {
  try {
    const teachers = sortNames(await fetchTeachers())
    await cacheTeachers(teachers)
    return teachers
  } catch (error) {
    const cached = await getCachedTeachers()
    if (cached) {
      console.warn('Using cached teachers due to backend error', error)
      return cached
    }
    throw error
  }
}

export const getCabinets = async () => {
  try {
    const cabinets = sortCabinets(await fetchCabinets())
    await cacheCabinets(cabinets)
    return cabinets
  } catch (error) {
    const cached = await getCachedCabinets()
    if (cached) {
      console.warn('Using cached cabinets due to backend error', error)
      return cached
    }
    throw error
  }
}

