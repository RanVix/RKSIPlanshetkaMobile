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

import {
  BackendError,
  deleteSubscription,
  getCabinets,
  getCachedCabinets,
  getCachedGroups,
  getCachedTeachers,
  getCouples,
  getGroups,
  getNotifications,
  getSubscribers,
  getTeachers,
  NotificationResponse,
  subscribe,
} from '@/lib/backend';
import { getCachedDeviceToken, getDeviceToken } from '@/lib/deviceTokenCache';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, BackHandler, Dimensions, Easing, FlatList, Image, Linking, PanResponder, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BurgerMenuIcon from '../../assets/BurgerMenu.svg';
import CabinetIcon from '../../assets/Cabinet.svg';
import CabinetBlackIcon from '../../assets/CabinetBlack.svg';
import CombinedIcon from '../../assets/Combined.svg';
import CombinedIconBlackIcon from '../../assets/CombinedBlack.svg';
import FavoriteIcon from '../../assets/Favorite.svg';
import SearchIcon from '../../assets/SearchIcon.svg';
import ThemeIcon from '../../assets/ThemeIcon.svg';
import UserIcon from '../../assets/User.svg';
import UserIconBlackIcon from '../../assets/UserIconBlack.svg';
import BellIcon from '../../assets/WhiteBell.svg';
import CalendarIcon from '../../assets/calendarik.svg';
import TrashIcon from '../../assets/trash.svg';

type Lesson = {
  id: string;
  startTime: string;
  endTime?: string;
  title: string;
  teacher?: string;
  room?: string;
  group?: string;
  number: number | string;
  combined?: string | null;
};

type LessonCard = Lesson & {
  groupedLessons: Lesson[];
};

const WEB_DEVICE_TOKEN_KEY = '@cache/web-device-token';

type FavoriteItem = {
  id: string;
  type: 'group' | 'cabinet' | 'teacher';
  name: string;
};

type SearchTab = 'group' | 'cabinet' | 'teacher';

type ScheduleDay = {
  date: string;
  fromType: number;
  corpus: number;
  couples: Lesson[];
};

type ScheduleTarget = {
  type: SearchTab;
  name: string;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isTomorrow = (date: Date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);
  return isSameDay(dateToCheck, tomorrow);
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  const today = new Date();
  let dayLabel: string;
  
  if (isSameDay(date, today)) {
    dayLabel = 'Сегодня';
  } else if (isTomorrow(date)) {
    dayLabel = 'Завтра';
  } else {
    dayLabel = capitalize(
      date.toLocaleDateString('ru-RU', {
        weekday: 'long',
      })
    );
  }
  
  const datePart = date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });
  return `${dayLabel}, ${datePart}`;
};

const getScheduleTargetLabel = (target?: ScheduleTarget | null) => {
  if (!target) {
    return '';
  }
  const prefix = target.type === 'group' ? 'Группа' : target.type === 'cabinet' ? 'Кабинет' : 'Преподаватель';
  return `${prefix}: ${target.name}`;
};

const getDateValue = (value: string) => {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const SCHEDULE_CACHE_KEY = '@cache/schedule-couples';
const SCHEDULE_TARGET_CACHE_KEY = '@cache/schedule-target';
const NOTIFICATIONS_CACHE_KEY = '@cache/notifications';

type CachedNotification = NotificationResponse & {
  cachedAt: number; // когда было закэшировано
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const readNotificationsCache = async (): Promise<Notification[]> => {
  try {
    const rawValue = await AsyncStorage.getItem(NOTIFICATIONS_CACHE_KEY);
    if (!rawValue) {
      return [];
    }
    const cached: CachedNotification[] = JSON.parse(rawValue);
    if (!Array.isArray(cached)) {
      return [];
    }
    
    const now = Date.now();
    // Фильтруем уведомления старше недели
    const validNotifications = cached.filter(item => {
      const age = now - item.cachedAt;
      return age < ONE_WEEK_MS;
    });
    
    // Если были удалены старые уведомления, обновляем кэш
    if (validNotifications.length !== cached.length) {
      await writeNotificationsCache(validNotifications);
    }
    
    return validNotifications.map(({ cachedAt, ...notification }) => notification);
  } catch (error) {
    console.error('Failed to read notifications cache', error);
    return [];
  }
};

const writeNotificationsCache = async (notifications: Notification[]) => {
  try {
    const now = Date.now();
    const cached: CachedNotification[] = notifications.map(notification => ({
      ...notification,
      cachedAt: now,
    }));
    const serialized = JSON.stringify(cached);
    await AsyncStorage.setItem(NOTIFICATIONS_CACHE_KEY, serialized);
  } catch (error) {
    console.error('Failed to write notifications cache', error);
  }
};

type ScheduleCacheStore = Record<string, ScheduleDay[]>;

const isNetworkError = (error: unknown): boolean => {
  if (error instanceof BackendError) {
    return error.status === 0;
  }
  
  if (error && typeof error === 'object' && 'name' in error && error.name === 'BackendError' && 'status' in error) {
    return (error as { status: number }).status === 0;
  }
  
  // Проверяем AxiosError
  if (isAxiosError(error)) {
    if (!error.response) {
      return true;
    }

    const code = error.code;
    if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'ENOTFOUND' || code === 'ERR_NETWORK' || code === 'ERR_NAME_NOT_RESOLVED') {
      return true;
    }
  }
  
  return false;
};

const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

const filterFutureScheduleDays = (days: ScheduleDay[]) => {
  const todayStart = getTodayStart();
  return days.filter(day => {
    const dayTime = getDateValue(day.date);
    return dayTime === 0 ? true : dayTime >= todayStart;
  });
};

const readScheduleCache = async (): Promise<ScheduleCacheStore> => {
  try {
    const rawValue = await AsyncStorage.getItem(SCHEDULE_CACHE_KEY);
    if (!rawValue) {
      return {};
    }
    const parsed = JSON.parse(rawValue);
    if (parsed && typeof parsed === 'object') {
      return parsed as ScheduleCacheStore;
    }
    return {};
  } catch (error) {
    console.error('Failed to read schedule cache', error);
    return {};
  }
};

const writeScheduleCache = async (cache: ScheduleCacheStore) => {
  try {
    const serialized = JSON.stringify(cache);
    await AsyncStorage.setItem(SCHEDULE_CACHE_KEY, serialized);
  } catch (error) {
    console.error('Failed to write schedule cache', error);
  }
};

const getCachedScheduleForTarget = async (targetKey: string): Promise<ScheduleDay[]> => {
  const cache = await readScheduleCache();
  const storedDays = cache[targetKey];
  if (!storedDays) {
    return [];
  }
  const filtered = filterFutureScheduleDays(storedDays);
  if (filtered.length !== storedDays.length) {
    if (filtered.length > 0) {
      cache[targetKey] = filtered;
    } else {
      delete cache[targetKey];
    }
    await writeScheduleCache(cache);
  }
  return filtered;
};

const persistScheduleForTarget = async (targetKey: string, days: ScheduleDay[]): Promise<void> => {
  const cache = await readScheduleCache();
  const filteredDays = filterFutureScheduleDays(days);
  if (filteredDays.length > 0) {
    cache[targetKey] = filteredDays;
  } else {
    delete cache[targetKey];
  }
  await writeScheduleCache(cache);
};

const mapSearchTabToSubscriptionType = (type: SearchTab): 'cab' | 'group' | 'prepod' => {
  if (type === 'cabinet') {
    return 'cab';
  }
  if (type === 'teacher') {
    return 'prepod';
  }
  return 'group';
};
type SubscriptionItem = { id: string; title: string; type?: SearchTab };

type Notification = NotificationResponse;

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'bell'>('calendar');
  const [currentPage, setCurrentPage] = useState<'home' | 'subscriptions' | 'bells' | 'themes'>('home');
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [bellsListReady, setBellsListReady] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTab, setSearchTab] = useState<SearchTab>('group');
  const [searchText, setSearchText] = useState('');
  const [subscriptionPickerOpen, setSubscriptionPickerOpen] = useState(false);
  const [subscriptionPickerTab, setSubscriptionPickerTab] = useState<SearchTab>('group');
  const [subscriptionPickerSearch, setSubscriptionPickerSearch] = useState('');
  const [subscriptionCooldown, setSubscriptionCooldown] = useState(0);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cabinets, setCabinets] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [currentScheduleTarget, setCurrentScheduleTarget] = useState<ScheduleTarget | null>(null);
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);
  const currentSchedule = useMemo(
    () => scheduleDays[selectedScheduleIndex] ?? null,
    [scheduleDays, selectedScheduleIndex]
  );
  const scheduleTargetLabel = getScheduleTargetLabel(currentScheduleTarget);
  const canGoPrevDay = selectedScheduleIndex > 0;
  const canGoNextDay = selectedScheduleIndex < scheduleDays.length - 1;
  const currentScheduleFooterLabel =
    currentSchedule?.fromType === 0 ? 'расписание' : currentSchedule ? 'планшетка' : null;
  const currentScheduleList = useMemo<LessonCard[]>(() => {
    if (!currentSchedule) {
      return [];
    }

    const groups: LessonCard[] = [];
    const map = new Map<string, LessonCard>();

    currentSchedule.couples.forEach(lesson => {
      const numberKey = `${lesson.number}`.trim();
      const titleKey = (lesson.title ?? '').trim().toLowerCase();
      const groupKey = `${numberKey}__${titleKey}`;

      const existing = map.get(groupKey);
      if (existing) {
        existing.groupedLessons.push(lesson);
        if (!existing.combined && lesson.combined) {
          existing.combined = lesson.combined;
        }
        return;
      }

      const groupLesson: LessonCard = {
        ...lesson,
        groupedLessons: [lesson],
      };

      map.set(groupKey, groupLesson);
      groups.push(groupLesson);
    });

    // Сортировка пар в порядке: 1, 2, 3, К, 4, 5, 6
    const getSortOrder = (lesson: LessonCard): number => {
      const isClassHour = lesson.number === 'К' || lesson.room === 'К' || lesson.title === 'Классный час';
      if (isClassHour) {
        return 3.5;
      }
      const num = typeof lesson.number === 'number' 
        ? lesson.number 
        : (typeof lesson.number === 'string' && /^\d+$/.test(lesson.number) 
          ? parseInt(lesson.number, 10) 
          : 999);
      return num;
    };
    
    groups.sort((a, b) => {
      const orderA = getSortOrder(a);
      const orderB = getSortOrder(b);
      return orderA - orderB;
    });

    return groups;
  }, [currentSchedule]);
  const currentDateLabel = currentSchedule
    ? `${formatDateLabel(currentSchedule.date)}${
        currentSchedule.corpus ? ` | ${currentSchedule.corpus} корпус` : ''
      }`
    : 'Расписание не выбрано';
  const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').width * 0.6)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const searchSlideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const subscriptionPickerAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const bellsFlatListRef = useRef<FlatList>(null);
  const hasScrolledToInitial = useRef(false);
  const togglePosition = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);
  const menuAnimating = useRef(false);
  const scheduleRequestKeyRef = useRef<string | null>(null);
  const [showScheduleTargetHint, setShowScheduleTargetHint] = useState(false);

  const allNotifications = notifications;

  useEffect(() => {
    let isMounted = true;

    const loadGroups = async () => {
      try {
        const cached = await getCachedGroups();
        if (cached && isMounted) {
          setGroups(cached);
        }

        const fresh = await getGroups();
        if (isMounted) {
          setGroups(fresh);
        }
      } catch (error) {
        console.error('Failed to load groups list:', error);
      }
    };

    loadGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydrateScheduleTarget = async () => {
      try {
        const cachedTargetRaw = await AsyncStorage.getItem(SCHEDULE_TARGET_CACHE_KEY);
        if (!isMounted) {
          return;
        }
        if (cachedTargetRaw) {
          const parsed = JSON.parse(cachedTargetRaw);
          if (parsed?.name && parsed?.type) {
            setCurrentScheduleTarget(parsed);
            setShowScheduleTargetHint(false);
            return;
          }
        }
        setShowScheduleTargetHint(true);
      } catch (error) {
        console.error('Failed to load cached schedule target', error);
        if (isMounted) {
          setShowScheduleTargetHint(true);
        }
      }
    };

    hydrateScheduleTarget();

    return () => {
      isMounted = false;
    };
  }, []);

  const getWebDeviceToken = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(WEB_DEVICE_TOKEN_KEY);
      if (cached) {
        return cached;
      }
      const fresh = `web-${Date.now()}`;
      await AsyncStorage.setItem(WEB_DEVICE_TOKEN_KEY, fresh);
      return fresh;
    } catch (error) {
      console.error('Failed to cache web device token', error);
      return `web-${Date.now()}`;
    }
  }, []);

  const loadSchedule = useCallback(
    async (target: ScheduleTarget) => {
      const targetKey = `${target.type}:${target.name}`;
      scheduleRequestKeyRef.current = targetKey;
      setScheduleLoading(true);
      setScheduleError(null);

      let cacheApplied = false;

      try {
        const cachedDays = await getCachedScheduleForTarget(targetKey);
        if (cachedDays.length > 0 && scheduleRequestKeyRef.current === targetKey) {
          cacheApplied = true;
          setScheduleDays(cachedDays);
          setSelectedScheduleIndex(0);
        }
      } catch (error) {
        console.error('Failed to hydrate schedule from cache', error);
      }

      try {
        const response = await getCouples(target.name);
        const normalized: ScheduleDay[] = Object.entries(response ?? {}).map(([dateKey, payload]) => ({
          date: dateKey,
          fromType: payload.from_type,
          corpus: payload.corpus,
          couples: (payload.couples ?? []).map((couple, index) => {
            const coupleRaw = `${couple.couple ?? ''}`.trim();
            const coupleMatch = coupleRaw.match(/\d+/);
            const pairNumber = coupleMatch ? Number(coupleMatch[0]) : coupleRaw || index + 1;
            const cabinetRaw = couple.cabinet?.trim() ?? '';
            const normalizedCabinet = cabinetRaw === 'К' ? 'К' : cabinetRaw;
            const normalizedTitle = normalizedCabinet === 'К' ? 'Классный час' : couple.lesson?.trim() || '—';
            const coupleIdSuffix = coupleRaw || `slot-${index}`;

            return {
              id: `${dateKey}-${coupleIdSuffix}-${index}`,
              number: pairNumber,
              startTime: couple.time?.start ?? '',
              endTime: couple.time?.end ?? '',
              title: normalizedTitle,
              teacher: couple.teacher ?? '',
              room: normalizedCabinet,
              group: couple.group ?? '',
              combined: couple.combined ?? null,
            };
          }),
        }));

        normalized.sort((a, b) => getDateValue(a.date) - getDateValue(b.date));

        if (scheduleRequestKeyRef.current === targetKey) {
          setScheduleDays(normalized);
          setSelectedScheduleIndex(0);
          setScheduleError(normalized.length === 0 ? 'Расписание отсутствует' : null);
        }

        await persistScheduleForTarget(targetKey, normalized);
      } catch (error) {
        console.error('Failed to load couples schedule', error);
        if (scheduleRequestKeyRef.current === targetKey) {
          if (cacheApplied) {
            setScheduleError('Не удалось обновить расписание. Показаны данные из кэша.');
          } else {
            setScheduleDays([]);
            setScheduleError('Не удалось загрузить расписание. Попробуйте позже.');
          }
        }
      } finally {
        if (scheduleRequestKeyRef.current === targetKey) {
          setScheduleLoading(false);
        }
      }
    },
    []
  );

  const handleChangeScheduleDay = useCallback(
    (direction: 'prev' | 'next') => {
      setSelectedScheduleIndex(prev => {
        if (direction === 'prev') {
          return Math.max(prev - 1, 0);
        }
        return Math.min(prev + 1, Math.max(scheduleDays.length - 1, 0));
      });
    },
    [scheduleDays.length]
  );

  const loadActiveSubscriptions = useCallback(async () => {
    try {
      let token = await getCachedDeviceToken();
      if (!token && Platform.OS === 'web') {
        token = await getWebDeviceToken();
      }
      if (!token) {
        return;
      }
      const activeSubscriptions = await getSubscribers(token);
      if (!activeSubscriptions) {
        return;
      }
      const newSubscriptions = activeSubscriptions.map(title => ({
        id: `remote-${title}`,
        title,
      }));
      setSubscriptions(newSubscriptions);
    } catch (error) {
      console.error('Failed to load active subscriptions from backend', error);
      if (isNetworkError(error)) {
        Alert.alert('Ошибка подключения к интернету', 'Не удалось загрузить подписки. Проверьте подключение к интернету.');
      } else {
        Alert.alert('Ошибка', 'Не удалось загрузить подписки. Попробуйте позже.');
      }
    }
  }, [getWebDeviceToken]);

  const loadNotifications = useCallback(async () => {
    // Сначала загружаем из кэша
    try {
      const cachedNotifications = await readNotificationsCache();
      if (cachedNotifications.length > 0) {
        setNotifications(cachedNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications from cache', error);
    }

    try {
      let token = await getCachedDeviceToken();
      if (!token && Platform.OS === 'web') {
        token = await getWebDeviceToken();
      }
      if (!token) {
        return;
      }
      const freshNotifications = await getNotifications(token);
      if (freshNotifications && Array.isArray(freshNotifications)) {
        setNotifications(freshNotifications);
        // Сохраняем в кэш после успешной загрузки
        await writeNotificationsCache(freshNotifications);
      }
    } catch (error) {
      console.error('Failed to load notifications from backend', error);
    }
  }, [getWebDeviceToken]);

  useEffect(() => {
    if (!currentScheduleTarget?.name) {
      return;
    }
    loadSchedule(currentScheduleTarget);
  }, [currentScheduleTarget, loadSchedule]);

  useEffect(() => {
    loadActiveSubscriptions();
  }, [loadActiveSubscriptions]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const toggleMenu = useCallback(() => {
    // Блокируем повторные вызовы во время анимации
    if (menuAnimating.current) {
      return;
    }

    if (menuOpen) {
      // Закрываем меню
      menuAnimating.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -Dimensions.get('window').width * 0.6,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMenuOpen(false);
        menuAnimating.current = false;
      });
    } else {
      // Открываем меню
      menuAnimating.current = true;
      setMenuOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ]).start(() => {
        menuAnimating.current = false;
      });
    }
  }, [menuOpen, slideAnim, overlayOpacity]);

  useEffect(() => {
    let isMounted = true;

    const loadCabinets = async () => {
      try {
        const cached = await getCachedCabinets();
        if (cached && isMounted) {
          setCabinets(cached);
        }

        const fresh = await getCabinets();
        if (isMounted) {
          setCabinets(fresh);
        }
      } catch (error) {
        console.error('Failed to load cabinets list:', error);
      }
    };

    loadCabinets();

    return () => {
      isMounted = false;
    };
  }, []);
  useEffect(() => {
    let isMounted = true;

    const loadTeachers = async () => {
      try {
        const cached = await getCachedTeachers();
        if (cached && isMounted) {
          setTeachers(cached);
        }

        const fresh = await getTeachers();
        if (isMounted) {
          setTeachers(fresh);
        }
      } catch (error) {
        console.error('Failed to load teachers list:', error);
      }
    };

    loadTeachers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Фильтрация данных по тексту поиска
  const filteredData = useMemo(() => {
    const data = searchTab === 'group' ? groups : searchTab === 'cabinet' ? cabinets : teachers;
    if (!searchText.trim()) {
      return data;
    }
    const lowerSearch = searchText.toLowerCase();
    return data.filter(item => item.toLowerCase().includes(lowerSearch));
  }, [searchTab, searchText, groups, cabinets, teachers]);

  const subscriptionPickerFilteredData = useMemo(() => {
    const data = subscriptionPickerTab === 'group' ? groups : subscriptionPickerTab === 'cabinet' ? cabinets : teachers;
    if (!subscriptionPickerSearch.trim()) {
      return data;
    }
    const lowerSearch = subscriptionPickerSearch.toLowerCase();
    return data.filter(item => item.toLowerCase().includes(lowerSearch));
  }, [subscriptionPickerTab, subscriptionPickerSearch, groups, cabinets, teachers]);
  const subscriptionLimitReached = subscriptions.length >= 10;

  // Загрузка избранного из кэша
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem('favorites');
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };
    loadFavorites();
  }, []);

  // Сохранение избранного в кэш
  const saveFavorites = async (newFavorites: FavoriteItem[]) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  // Добавление в избранное
  const addToFavorites = (type: SearchTab, name: string) => {
    const id = `${type}-${name}`;
    const exists = favorites.find(f => f.id === id);
    if (!exists) {
      const newFavorites = [...favorites, { id, type, name }];
      saveFavorites(newFavorites);
    }
  };

  // Удаление из избранного
  const removeFromFavorites = (id: string) => {
    const newFavorites = favorites.filter(f => f.id !== id);
    saveFavorites(newFavorites);
  };

  // Проверка, находится ли элемент в избранном
  const isFavorite = (type: SearchTab, name: string) => {
    const id = `${type}-${name}`;
    return favorites.some(f => f.id === id);
  };

  const isSubscribed = useCallback(
    (type: SearchTab, title: string) =>
      subscriptions.some(
        subscription =>
          subscription.title === title &&
          (subscription.type ? subscription.type === type : true)
      ),
    [subscriptions]
  );

  const handleAddSubscription = useCallback(
    async (type: SearchTab, title: string) => {
      if (subscriptionCooldown > 0) {
        return;
      }

      let added = false;
      setSubscriptions(prev => {
        if (prev.length >= 10) {
          return prev;
        }
        const alreadyExists = prev.some(
          subscription =>
            subscription.title === title &&
            (subscription.type ? subscription.type === type : true)
        );
        if (alreadyExists) {
          return prev;
        }
        added = true;
        const id = `${type}-${title}`;
        const newSubscription = { id, type, title };
        return [...prev, newSubscription];
      });

      if (!added) {
        return;
      }

      setSubscriptionCooldown(5);

      try {
        let token = await getCachedDeviceToken();
        if (!token) {
          if (Platform.OS === 'web') {
            token = await getWebDeviceToken();
          } else {
            try {
              token = await getDeviceToken();
            } catch (error) {
              console.error('Failed to obtain device token', error);
              Alert.alert('Ошибка', 'Не удалось получить токен устройства для подписки.');
              return;
            }
          }
        }
        if (!token) {
          Alert.alert('Ошибка', 'Токен устройства недоступен. Попробуйте позже.');
          return;
        }
        const response = await subscribe({
          token,
          tracked_name: title,
          tracked_type: mapSearchTabToSubscriptionType(type),
        });
        if (!response?.success) {
          console.warn('Backend rejected subscription:', response?.message);
        }
      } catch (error) {
        console.error('Failed to send subscription to backend', error);
      }
    },
    [subscriptionCooldown, getWebDeviceToken]
  );

  const handleRemoveSubscription = useCallback(
    async (subscription: SubscriptionItem) => {
      setSubscriptions(prev => prev.filter(s => s.id !== subscription.id));

      try {
        let token = await getCachedDeviceToken();
        if (!token) {
          if (Platform.OS === 'web') {
            token = await getWebDeviceToken();
          } else {
            try {
              token = await getDeviceToken();
            } catch (error) {
              console.error('Failed to obtain device token for unsubscribe', error);
              Alert.alert('Ошибка', 'Не удалось получить токен устройства для удаления подписки.');
              return;
            }
          }
        }
        if (!token) {
          console.warn('Device token is unavailable while removing subscription');
          return;
        }
        const response = await deleteSubscription(token, subscription.title);
        if (!response?.success) {
          console.warn('Backend rejected subscription removal:', response?.message);
        }
      } catch (error) {
        console.error('Failed to delete subscription on backend', error);
        // Проверяем, является ли это сетевой ошибкой
        if (isNetworkError(error)) {
          Alert.alert('Нет интернета', 'Не удалось удалить подписку. Проверьте подключение к интернету.');
        }
      }
    },
    [getWebDeviceToken]
  );

  // Закрытие поиска
  const closeSearch = useCallback(() => {
    Animated.timing(searchSlideAnim, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSearchOpen(false);
      setSearchText('');
    });
  }, [searchSlideAnim]);

  const handleSelectScheduleTarget = useCallback(
    async (type: SearchTab, name: string) => {
      const nextTarget = { type, name };
      setCurrentScheduleTarget(nextTarget);
      setShowScheduleTargetHint(false);
      setScheduleDays([]);
      setSelectedScheduleIndex(0);
      setScheduleError(null);
      try {
        await AsyncStorage.setItem(SCHEDULE_TARGET_CACHE_KEY, JSON.stringify(nextTarget));
      } catch (error) {
        console.error('Failed to cache selected schedule target', error);
      }
      setSearchText('');
      setCurrentPage('home');
      setActiveTab('calendar');
      closeSearch();
    },
    [closeSearch]
  );

  const openSubscriptionPicker = useCallback(() => {
    setSubscriptionPickerOpen(true);
    Animated.timing(subscriptionPickerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [subscriptionPickerAnim]);

  const closeSubscriptionPicker = useCallback(() => {
    Animated.timing(subscriptionPickerAnim, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSubscriptionPickerOpen(false);
      setSubscriptionPickerSearch('');
    });
  }, [subscriptionPickerAnim]);

  // Закрытие поиска свайпом вниз
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          searchSlideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeSearch();
        } else {
          Animated.spring(searchSlideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const subscriptionPickerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          subscriptionPickerAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeSubscriptionPicker();
        } else {
          Animated.spring(subscriptionPickerAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Сбрасываем состояние при смене страницы
  useEffect(() => {
    if (currentPage === 'bells') {
      setBellsListReady(false);
      hasScrolledToInitial.current = false;
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== 'subscriptions' && subscriptionPickerOpen) {
      closeSubscriptionPicker();
    }
  }, [currentPage, subscriptionPickerOpen, closeSubscriptionPicker]);

  useEffect(() => {
    if (subscriptionCooldown <= 0) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setSubscriptionCooldown(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [subscriptionCooldown]);

  // Центрируем камеру на "Обычное расписание" после того, как список готов
  useEffect(() => {
    if (currentPage === 'bells' && bellsListReady && !hasScrolledToInitial.current && bellsFlatListRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (bellsFlatListRef.current) {
            const screen = Dimensions.get('window').width;
            const cardWidth = screen * 0.52;
            const itemSize = cardWidth + 12;
            const index = 1;
            const padding = 16;
            
            const elementStart = padding + itemSize * index;
            const offset = elementStart - (screen - cardWidth) / 2;
            
            bellsFlatListRef.current.scrollToOffset({
              offset: Math.max(0, offset),
              animated: false,
            });
            hasScrolledToInitial.current = true;
          }
        });
      });
    }
  }, [currentPage, bellsListReady]);

  // Анимация переключателя при изменении активной вкладки
  useEffect(() => {
    Animated.timing(togglePosition, {
      toValue: activeTab === 'calendar' ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeTab, togglePosition]);

  // Обработка кнопки "Назад" (только для Android)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Если поиск открыт - закрываем его
      if (subscriptionPickerOpen) {
        closeSubscriptionPicker();
        return true;
      }
      if (searchOpen) {
        closeSearch();
        return true;
      }
      
      // Если меню открыто - закрываем его
      if (menuOpen && !menuAnimating.current) {
        toggleMenu();
        return true;
      }
      
      // Если не на home-page - переключаем на home-page
      if (currentPage !== 'home') {
        setCurrentPage('home');
        setActiveTab('calendar');
        return true;
      }
      
      // Если уже на home-page - выход из приложения
      return false;
    });

    return () => backHandler.remove();
  }, [menuOpen, currentPage, searchOpen, toggleMenu, closeSearch, subscriptionPickerOpen, closeSubscriptionPicker]);

  return (
    <View style={styles.container}>
      {/* Оверлэй */}
      {menuOpen && (
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: overlayOpacity }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={toggleMenu}
          />
        </Animated.View>
      )}

      {/* Боковое меню */}
      <Animated.View 
        style={[
          styles.sideMenu,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* Лого и титульник */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.menuHeader}
          onPress={() => {
          if (searchOpen) {
            closeSearch();
          }
            setCurrentPage('home');
            setActiveTab('calendar');
            toggleMenu();
          }}
        >
          <Image 
            source={require('../../assets/logoburger.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>РКСИ Планшетка</Text>
        </TouchableOpacity>

        {/* Менюшка и кнопки */}
        <View style={styles.menuItems}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuItem}
            onPress={() => {
              if (searchOpen) {
                closeSearch();
              }
              setCurrentPage('subscriptions');
              toggleMenu();
            }}
          >
            <Image source={require('../../assets/BellIcon.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Подписки</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuItem}
            onPress={() => {
              if (searchOpen) {
                closeSearch();
              }
              setCurrentPage('bells');
              toggleMenu();
            }}
          >
            <Image source={require('../../assets/TimeIcon.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>
              Расписание звонков
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuItem}
            onPress={() => {
              if (searchOpen) {
                closeSearch();
              }
              setCurrentPage('themes');
              toggleMenu();
            }}
          >
            <Image source={require('../../assets/ThemeIcon.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Темы</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuItem}
            onPress={async () => {
              const url = 'https://drive.google.com/drive/folders/1kUYiSAafghhYR0ARyXwPW1HZPpHcFIag?usp=sharing';
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              }
              toggleMenu();
            }}
          >
            <Image source={require('../../assets/URLIcon.png')} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Файл планшетки</Text>
          </TouchableOpacity>
        </View>

        {/* Футер бокового меню */}
        <View style={styles.menuFooter}>
          <Text style={styles.footerText}>v0.1.0 by Yarovich, RanVix</Text>
        </View>
      </Animated.View>
      {/* Верхняя часть (иконка бургера и поиск) */}
      <View style={styles.topBar}>
        <View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleMenu}
            style={styles.burgerButton}
          >
            <BurgerMenuIcon width={18} height={18} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.searchBox}
          activeOpacity={0.7}
          onPress={() => {
            setSearchOpen(true);
            Animated.timing(searchSlideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }}
        >
          <TextInput
            placeholder="Выберите расписание"
            placeholderTextColor="#FFFFFF"
            value={scheduleTargetLabel}
            style={styles.searchInput}
            editable={false}
          />
          <SearchIcon width={16} height={16} />
        </TouchableOpacity>
      </View>

      {showScheduleTargetHint && !currentScheduleTarget && currentPage === 'home' && activeTab === 'calendar' && (
        <View style={styles.targetHint}>
          <Text style={styles.targetHintTitle}>Начните с выбора группы</Text>
          <Text style={styles.targetHintText}>
            Нажмите на строку выше, выберите группу и мы сохраним её, чтобы показывать пары даже без интернета.
          </Text>
        </View>
      )}

      {currentPage === 'home' ? (
        activeTab === 'calendar' ? (
          <>
            {/* Дата */}
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.dateArrowButton, !canGoPrevDay && styles.dateArrowButtonDisabled]}
                onPress={() => handleChangeScheduleDay('prev')}
                disabled={!canGoPrevDay}
              >
                <Text style={styles.dateArrowText}>‹</Text>
              </TouchableOpacity>
              <View style={styles.datePill}>
                <Text style={styles.dateText} numberOfLines={1}>{currentDateLabel}</Text>
              </View>
              <TouchableOpacity
                style={[styles.dateArrowButton, !canGoNextDay && styles.dateArrowButtonDisabled]}
                onPress={() => handleChangeScheduleDay('next')}
                disabled={!canGoNextDay}
              >
                <Text style={styles.dateArrowText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Список пар */}
            <FlatList
              data={currentScheduleList}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshing={scheduleLoading}
              onRefresh={() => {
                if (currentScheduleTarget?.name) {
                  loadSchedule(currentScheduleTarget);
                }
              }}
              ListFooterComponent={
                currentScheduleFooterLabel ? (
                  <View style={styles.footerInline}>
                    <Text style={styles.footerLinkText}>{currentScheduleFooterLabel}</Text>
                  </View>
                ) : null
              }
              ListEmptyComponent={(
                <View style={styles.scheduleEmpty}>
                  {scheduleLoading ? (
                    <ActivityIndicator color="#F3F4F6" />
                  ) : (
                    <Text style={styles.scheduleEmptyText}>
                      {scheduleError ?? 'Выберите группу, кабинет или преподавателя, чтобы увидеть пары.'}
                    </Text>
                  )}
                </View>
              )}
              renderItem={({ item }) => {
                const lessonVariants = item.groupedLessons;
                const primaryLesson = lessonVariants[0];
                const hasCombinedBadge = lessonVariants.some(lesson => Boolean(lesson.combined));

                return (
                  <View style={styles.card}>
                    <View style={styles.cardRow}>
                      {/* Время и номер */}
                      <View style={styles.timeCol}>
                        <Text style={styles.startTime}>{primaryLesson.startTime}</Text>
                        {primaryLesson.endTime ? (
                          <Text style={styles.endTime}>{primaryLesson.endTime}</Text>
                        ) : null}
                        <View style={styles.lessonNumberWrap}>
                          <Text style={styles.lessonNumber}>{primaryLesson.number}</Text>
                        </View>
                      </View>

                      {/* Контент пары */}
                      <View style={styles.cardContent}>
                        <View style={styles.titleBar}>
                          <View style={styles.titleBarInner}>
                            <Text style={styles.titleText} numberOfLines={2}>{primaryLesson.title}</Text>
                            {hasCombinedBadge && (
                              <View style={styles.badge}>
                                <Text style={styles.badgeText}>Совмещёнка</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {lessonVariants.map((lessonVariant, index) => {
                          // Находим кабинет совмещенной группы
                          const combinedGroupCabinet = lessonVariant.combined
                            ? lessonVariants.find(v => v.group === lessonVariant.combined)?.room || '—'
                            : null;
                          
                          // Показываем группу, если поиск не по группам
                          const shouldShowGroup = currentScheduleTarget?.type !== 'group';

                          return (
                            <View
                              key={lessonVariant.id}
                              style={index === 0 ? undefined : styles.lessonVariantDivider}
                            >
                              <View style={styles.infoLine}>
                                <UserIcon width={16} height={16} style={styles.icon} />
                                <Text style={styles.metaText} numberOfLines={1}>{lessonVariant.teacher || '—'}</Text>
                              </View>

                              <View style={styles.infoLine}>
                                <CabinetIcon width={16} height={16} style={styles.icon} />
                                <Text style={styles.metaText}>{lessonVariant.room || '—'}</Text>
                              </View>

                              {/* Группа показывается при поиске по преподавателям или кабинетам */}
                              {shouldShowGroup && lessonVariant.group && (
                                <View style={styles.infoLine}>
                                  <CombinedIcon width={16} height={16} style={styles.icon} />
                                  <Text style={styles.metaText} numberOfLines={1}>{lessonVariant.group}</Text>
                                </View>
                              )}

                              {/* Третья строка показывается только для совмещенки */}
                              {lessonVariant.combined && (
                                <View style={[styles.infoLine, styles.groupInfoLine]}>
                                  <CombinedIcon width={16} height={16} style={styles.icon} />
                                  <Text style={styles.metaText} numberOfLines={1}>
                                    {lessonVariant.combined}
                                    {combinedGroupCabinet && combinedGroupCabinet !== '—' ? ` · ${combinedGroupCabinet}` : ''}
                                  </Text>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </>
        ) : (
          <View style={styles.notificationsContainer}>
            <Text style={styles.notificationsTitle}>Уведомления</Text>
            {allNotifications.length === 0 ? (
              <View style={styles.notificationsEmpty}>
                <BellIcon width={24} height={24} style={styles.icon} />
                <Text style={styles.notificationsEmptyText}>Пока нет уведомлений</Text>
              </View>
            ) : (
              <FlatList
                data={allNotifications}
                keyExtractor={(item) => `notification-${item.id}`}
                contentContainerStyle={styles.notificationsList}
                renderItem={({ item }) => (
                  <View style={styles.notificationCard}>
                    <View style={styles.notificationCardRow}>
                      {/* Левая часть - время и номер пары */}
                      <View style={styles.notificationTimeCol}>
                        <Text style={styles.notificationStartTime}>{item.time_start}</Text>
                        <Text style={styles.notificationEndTime}>{item.time_end}</Text>
                        <View style={styles.notificationLessonNumberWrap}>
                          <Text style={styles.notificationLessonNumber}>{item.couple}</Text>
                        </View>
                      </View>

                      {/* Правая часть - информация */}
                      <View style={styles.notificationCardContent}>
                        {/* Иконка колокольчика с группой в правом верхнем углу */}
                        <View style={styles.notificationBellBadge}>
                          <BellIcon width={14} height={14} />
                          <Text style={styles.notificationBellText}>{item.group}</Text>
                        </View>

                        <View style={styles.notificationInfoLine}>
                          <UserIcon width={16} height={16} style={styles.icon} />
                          <Text style={styles.notificationMetaText} numberOfLines={1}>{item.teacher}</Text>
                        </View>

                        <View style={styles.notificationInfoLine}>
                          <CabinetIcon width={16} height={16} style={styles.icon} />
                          <Text style={styles.notificationMetaText}>{item.cabinet}</Text>
                        </View>

                        {item.combined && (
                          <View style={styles.notificationInfoLine}>
                            <CombinedIcon width={16} height={16} style={styles.icon} />
                            <Text style={styles.notificationMetaText} numberOfLines={1}>
                              {item.combined} {item.cabinet ? `(${item.cabinet})` : ''}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )
      ) : (
        currentPage === 'subscriptions' ? (
        <View style={styles.subscriptionsContainer}>
          <Text style={styles.subscriptionsTitle}>Подписки</Text>
          <FlatList
            data={subscriptions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.subscriptionsList}
            ListEmptyComponent={(
              <View style={styles.notificationsEmpty}>
                <Text style={styles.notificationsEmptyText}>Подписок пока нет</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.subscriptionCard}>
                <Text style={styles.subscriptionTitle} numberOfLines={1}>{item.title}</Text>
                <TouchableOpacity
                  style={styles.subscriptionDelete}
                onPress={() => handleRemoveSubscription(item)}
                >
                  <TrashIcon width={18} height={18} />
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.fabAdd,
              subscriptionLimitReached && !subscriptionPickerOpen && styles.fabAddDisabled,
            ]}
            onPress={() => {
              if (subscriptionPickerOpen) {
                closeSubscriptionPicker();
                return;
              }
              if (subscriptionLimitReached) {
                return;
              }
              openSubscriptionPicker();
            }}
            disabled={subscriptionLimitReached && !subscriptionPickerOpen}
          >
            <Text style={styles.fabAddText}>{subscriptionPickerOpen ? '−' : '+'}</Text>
          </TouchableOpacity>

          <View style={styles.subscriptionsFooter}>
            <Text style={styles.subscriptionsCounter}>{subscriptions.length}/10</Text>
          </View>
        </View>
        ) : currentPage === 'bells' ? (
          <View style={styles.bellsContainer}>
            <Text style={styles.bellsTitle}>Расписание звонков</Text>
            <FlatList
              ref={bellsFlatListRef}
              // Данные для расписания звонков (пока демка или нет хз)
              data={[
                {
                  id: 'short',
                  title: 'Сокращённые пары',
                  times: ['8:00 - 8:50','9:00 - 9:50','10:00 - 10:50','11:00 - 11:50','12:00 - 12:50','13:00 - 13:50','14:00 - 14:50'],
                },
                {
                  id: 'usual',
                  title: 'Обычное расписание',
                  times: ['8:00 - 9:30','9:40 - 11:10','11:30 - 13:00','13:10 - 14:40','15:00 - 16:30','16:40 - 18:10','18:20 - 19:50'],
                },
                {
                  id: 'withClass',
                  title: 'С классным часом',
                  times: ['8:00 - 9:30','9:40 - 11:10','11:30 - 13:00','13:05 - 14:05','14:10 - 15:40','16:00 - 17:30','17:40 - 19:10'],
                },
              ]}
              keyExtractor={(i) => i.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToAlignment="center"
              decelerationRate="fast"
              contentContainerStyle={styles.bellsList}
              renderItem={({ item, index }) => {
                const screen = Dimensions.get('window').width;
                const cardWidth = screen * 0.52;
                return (
                  <View style={[styles.bellCard, { width: cardWidth }]}>
                    <Text style={styles.bellCardTitle}>{item.title}</Text>
                    {item.times.map((t, idx) => {

                      let pairNumber: string;
                      if (item.id === 'withClass' && idx === 3) {
                        pairNumber = 'К';
                      } else if (item.id === 'withClass' && idx > 3) {
                        pairNumber = `${idx}`;
                      } else {
                        pairNumber = `${idx + 1}`;
                      }
                      return (
                        <View key={idx} style={styles.bellRow}>
                          <View style={styles.bellNum}><Text style={styles.bellNumText}>{pairNumber}</Text></View>
                          <Text style={styles.bellTime}>{t}</Text>
                        </View>
                      );
                    })}
                  </View>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              snapToInterval={Dimensions.get('window').width * 0.52 + 12}
              getItemLayout={(_, i) => {
                const size = Dimensions.get('window').width * 0.52 + 12;
                return { length: size, offset: size * i, index: i };
              }}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  bellsFlatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
              onLayout={() => {
                if (currentPage === 'bells' && !bellsListReady) {
                  setBellsListReady(true);
                }
              }}
            />
          </View>
        ) : (
          <View style={styles.themesContainer}>
            <Text style={styles.themesTitle}>Темы</Text>
            <View style={styles.themesEmpty}>
              <ThemeIcon width={48} height={48} style={styles.themesIcon} />
              <Text style={styles.themesEmptyText}>Пока в разработке...</Text>
            </View>
          </View>
        )
      )}

      {/* Поиск - выдвигается снизу */}
      {searchOpen && (
        <Animated.View
          style={[
            styles.searchOverlay,
            {
              transform: [{ translateY: searchSlideAnim }],
            },
          ]}
        >
          {/* Белая полоска для закрытия */}
          <TouchableOpacity
            style={styles.searchHandle}
            activeOpacity={0.7}
            onPress={closeSearch}
            {...panResponder.panHandlers}
          >
            <View style={styles.searchHandleBar} />
          </TouchableOpacity>

          {/* Верхняя панель с бургер меню и поиском */}
          <View style={styles.searchTopBar}>
            <View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleMenu}
                style={styles.burgerButton}
              >
                <BurgerMenuIcon width={18} height={18} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.searchBox}
              activeOpacity={1}
              onPress={() => searchInputRef.current?.focus()}
            >
              <TextInput
                ref={searchInputRef}
                placeholder="Поиск..."
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
              />
              <SearchIcon width={16} height={16} />
            </TouchableOpacity>
          </View>

          {/* Контент поиска */}
          <View style={styles.searchContent} {...panResponder.panHandlers}>
            {/* Секция Избранное */}
            <View style={styles.favoritesSection}>
              <View style={styles.favoritesHeader}>
                <FavoriteIcon width={19} height={22} />
                <Text style={styles.favoritesTitle}>Избранное</Text>
              </View>
              <Text style={styles.favoritesDescription}>
                Чтобы добавить в избранное - зажмите кнопку
              </Text>
              {favorites.length > 0 && (
                <View style={styles.favoritesList}>
                  {favorites.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.favoriteItem}
                  onPress={() => handleSelectScheduleTarget(item.type, item.name)}
                      onLongPress={() => removeFromFavorites(item.id)}
                    >
                      <Text style={styles.favoriteItemText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Секция с переключателем */}
            <View style={styles.searchSection}>
              <View style={styles.searchSectionHeader}>
                <View style={styles.searchSectionTitleRow}>
                  {searchTab === 'group' && (
                    <CombinedIcon
                      width={26}
                      height={26}
                      style={[styles.searchSectionIcon, styles.searchSectionIconGroup]}
                    />
                  )}
                  {searchTab === 'cabinet' && <CabinetIcon width={20} height={20} style={styles.searchSectionIcon} />}
                  {searchTab === 'teacher' && <UserIcon width={20} height={20} style={styles.searchSectionIcon} />}
                  <Text style={styles.searchSectionTitle}>
                    {searchTab === 'group' ? 'Группы' : searchTab === 'cabinet' ? 'Кабинеты' : 'Преподаватели'}
                  </Text>
                </View>
                <View style={styles.searchTabSwitcher}>
                  <TouchableOpacity
                    style={[
                      styles.searchTabButton,
                      styles.searchTabButtonLeft,
                      searchTab === 'group' && styles.searchTabButtonActive,
                    ]}
                    onPress={() => {
                      setSearchTab('group');
                      setSearchText('');
                    }}
                  >
                    {searchTab === 'group' ? (
                      <CombinedIcon width={24} height={24} style={{ marginTop: 6 }} />
                    ) : (
                      <CombinedIconBlackIcon width={24} height={24} style={{ marginTop: 6 }} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.searchTabButton,
                      styles.searchTabButtonCenter,
                      searchTab === 'cabinet' && styles.searchTabButtonActive,
                    ]}
                    onPress={() => {
                      setSearchTab('cabinet');
                      setSearchText('');
                    }}
                  >
                    {searchTab === 'cabinet' ? (
                      <CabinetIcon width={20} height={20} />
                    ) : (
                      <CabinetBlackIcon width={20} height={20} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.searchTabButton,
                      styles.searchTabButtonRight,
                      searchTab === 'teacher' && styles.searchTabButtonActive,
                    ]}
                    onPress={() => {
                      setSearchTab('teacher');
                      setSearchText('');
                    }}
                  >
                    {searchTab === 'teacher' ? (
                      <UserIcon width={20} height={20} />
                    ) : (
                      <UserIconBlackIcon width={20} height={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Список элементов */}
              <FlatList
                data={filteredData}
                keyExtractor={(item) => `${searchTab}-${item}`}
                numColumns={2}
                columnWrapperStyle={styles.searchListRow}
                contentContainerStyle={styles.searchList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchItem}
                    onPress={() => handleSelectScheduleTarget(searchTab, item)}
                    onLongPress={() => {
                      if (isFavorite(searchTab, item)) {
                        removeFromFavorites(`${searchTab}-${item}`);
                      } else {
                        addToFavorites(searchTab, item);
                      }
                    }}
                  >
                    <Text style={styles.searchItemText}>{item}</Text>
                    {isFavorite(searchTab, item) && (
                      <FavoriteIcon width={16} height={16} style={styles.searchItemFavorite} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Animated.View>
      )}

      {subscriptionPickerOpen && currentPage === 'subscriptions' && (
        <Animated.View
          style={[
            styles.subscriptionPickerOverlay,
            {
              transform: [{ translateY: subscriptionPickerAnim }],
            },
          ]}
          {...subscriptionPickerPanResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.subscriptionPickerHandle}
            activeOpacity={0.7}
            onPress={closeSubscriptionPicker}
            {...subscriptionPickerPanResponder.panHandlers}
          >
            <View style={styles.subscriptionPickerHandleBar} />
          </TouchableOpacity>

          <View style={styles.subscriptionPickerTop}>
            <Text style={styles.subscriptionPickerTitle}>Добавить подписку</Text>
            <Text style={styles.subscriptionPickerCounter}>{subscriptions.length}/10</Text>
          </View>

          <View style={styles.subscriptionPickerSearchBox}>
            <TextInput
              placeholder="Поиск..."
              placeholderTextColor="#9CA3AF"
              style={styles.subscriptionPickerSearchInput}
              value={subscriptionPickerSearch}
              onChangeText={setSubscriptionPickerSearch}
            />
          </View>

          {subscriptionCooldown > 0 && (
            <View style={styles.subscriptionPickerCooldown}>
              <Text style={styles.subscriptionPickerCooldownText}>
                Подождите ещё {subscriptionCooldown} c перед следующим добавлением
              </Text>
            </View>
          )}

          <View style={styles.subscriptionPickerTabRow}>
            <View style={styles.searchTabSwitcher}>
              <TouchableOpacity
                style={[
                  styles.searchTabButton,
                  styles.searchTabButtonLeft,
                  subscriptionPickerTab === 'group' && styles.searchTabButtonActive,
                ]}
                onPress={() => {
                  setSubscriptionPickerTab('group');
                  setSubscriptionPickerSearch('');
                }}
              >
                {subscriptionPickerTab === 'group' ? (
                  <CombinedIcon width={24} height={24} style={{ marginTop: 6 }} />
                ) : (
                  <CombinedIconBlackIcon width={24} height={24} style={{ marginTop: 6 }} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.searchTabButton,
                  styles.searchTabButtonCenter,
                  subscriptionPickerTab === 'cabinet' && styles.searchTabButtonActive,
                ]}
                onPress={() => {
                  setSubscriptionPickerTab('cabinet');
                  setSubscriptionPickerSearch('');
                }}
              >
                {subscriptionPickerTab === 'cabinet' ? (
                  <CabinetIcon width={20} height={20} />
                ) : (
                  <CabinetBlackIcon width={20} height={20} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.searchTabButton,
                  styles.searchTabButtonRight,
                  subscriptionPickerTab === 'teacher' && styles.searchTabButtonActive,
                ]}
                onPress={() => {
                  setSubscriptionPickerTab('teacher');
                  setSubscriptionPickerSearch('');
                }}
              >
                {subscriptionPickerTab === 'teacher' ? (
                  <UserIcon width={20} height={20} />
                ) : (
                  <UserIconBlackIcon width={20} height={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={subscriptionPickerFilteredData}
            keyExtractor={(item, index) => `${subscriptionPickerTab}-${item}-${index}`}
            numColumns={2}
            columnWrapperStyle={styles.subscriptionPickerListRow}
            contentContainerStyle={styles.subscriptionPickerList}
            ListEmptyComponent={(
              <View style={styles.subscriptionPickerEmpty}>
                <Text style={styles.subscriptionPickerEmptyText}>Ничего не нашлось</Text>
              </View>
            )}
            renderItem={({ item }) => {
              const selected = isSubscribed(subscriptionPickerTab, item);
              const disabled = (!selected && subscriptionLimitReached) || selected;

              return (
                <TouchableOpacity
                  style={[
                    styles.subscriptionPickerItem,
                    selected && styles.subscriptionPickerItemSelected,
                    !selected && subscriptionLimitReached && styles.subscriptionPickerItemDisabled,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!selected && !subscriptionLimitReached) {
                      handleAddSubscription(subscriptionPickerTab, item);
                    }
                  }}
                  disabled={disabled}
                >
                  <Text style={styles.subscriptionPickerItemText}>{item}</Text>
                  {selected && <Text style={styles.subscriptionPickerItemStatus}>В подписках</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>
      )}

      {currentPage === 'home' && (
        /* Снизу смена окон */
        <View style={styles.bottomTabs}>
          <View style={styles.toggleContainer}>
            <Animated.View
              style={[
                styles.toggleBackground,
                {
                  transform: [
                    {
                      translateX: togglePosition.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 56],
                      }),
                    },
                  ],
                },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab('calendar')}
              style={styles.toggleButton}
            >
              <CalendarIcon
                width={20}
                height={20}
                style={activeTab === 'calendar' ? undefined : styles.inactiveIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab('bell')}
              style={styles.toggleButton}
            >
              <BellIcon
                width={20}
                height={20}
                style={activeTab === 'bell' ? undefined : styles.inactiveIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// Тут уже CSS пошел
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1318',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  burgerButton: {
    height: 40,
    width: 40,
    borderRadius: 12,
    backgroundColor: '#1B2129',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  burgerIcon: { color: '#D1D5DB' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1001,
  },
  overlayTouchable: {
    flex: 1,
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: Dimensions.get('window').width * 0.6,
    backgroundColor: '#191C21',
    zIndex: 1002,
    paddingTop: 60,
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  appTitle: {
    color: '#F3F4F6',
    fontSize: 20,
    fontWeight: '600',
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  menuItemText: {
    color: '#F3F4F6',
    fontSize: 16,
  },
  menuFooter: {
    paddingBottom: 8,
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  searchBox: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1B2129',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { flex: 1, color: '#F3F4F6' },
  searchIcon: { color: '#9CA3AF' },
  targetHint: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1B2129',
  },
  targetHintTitle: {
    color: '#F3F4F6',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  targetHintText: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
  },
  dateRow: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateArrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateArrowButtonDisabled: {
    opacity: 0.3,
  },
  dateArrowText: {
    color: '#F3F4F6',
    fontSize: 20,
    fontWeight: '600',
  },
  datePill: {
    height: 32,
    borderRadius: 999,
    backgroundColor: '#191C21',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    alignSelf: 'center',
    maxWidth: '90%',
  },
  dateText: { color: '#E5E7EB', fontSize: 13, flexShrink: 1, marginRight: 6 },
  listContent: { padding: 16 },
  scheduleEmpty: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
  scheduleEmptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  footerLinkContainer: { alignItems: 'center', paddingVertical: 16 },
  footerInline: { alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  footerStatic: { alignItems: 'center', paddingVertical: 24 },
  footerLinkText: { color: '#BFBFBF', fontSize: 12, fontWeight: '400' },
  card: {
    borderRadius: 16,
    backgroundColor: '#171C22',
    padding: 12,
    marginBottom: 12,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timeCol: {
    width: 64,
    alignItems: 'flex-start',
    paddingBottom: 4,
    position: 'relative',
  },
  startTime: { color: '#F3F4F6', fontSize: 20, fontWeight: '600' },
  endTime: { color: '#9CA3AF', fontSize: 15, marginTop: 4 },
  lessonNumberWrap: {
    position: 'absolute',
    top: 64,
    left: 0,
    height: 26,
    width: 26,
    borderRadius: 14,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumber: { color: '#1B2129', fontSize: 16, fontWeight: 800 },
  cardContent: { flex: 1 },
  titleBar: { marginBottom: 8 },
  titleBarInner: {
    borderRadius: 12,
    backgroundColor: '#1B2129',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: { color: '#F3F4F6', fontSize: 13, fontWeight: '500', flex: 1 },
  badge: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#273244',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: { color: '#E5E7EB', fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaRowAlt: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  metaIcon: { color: '#9CA3AF' },
  metaText: { color: '#E5E7EB', fontSize: 13, maxWidth: '90%' },
  infoLine: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  groupInfoLine: { marginTop: 10 },
  lessonVariantDivider: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#232832',
  },
  icon: { marginRight: 8 },
  bottomTabs: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 60,
    marginBottom: 32,
    backgroundColor: '#0F1318',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1B2129',
    borderRadius: 28,
    padding: 6,
    width: 120,
    justifyContent: 'space-between',
    position: 'relative',
  },
  toggleBackground: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 24,
    backgroundColor: '#3D4A5D',
    top: 6,
    left: 6,
  },
  toggleButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  inactiveIcon: {
    opacity: 0.4,
  },
  notificationsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notificationsTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  notificationsList: {
    paddingBottom: 24,
  },
  notificationsEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  notificationsEmptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },
  notificationCard: {
    backgroundColor: '#171C22',
    borderRadius: 16,
    padding: 12,
    paddingBottom: 12,
    marginBottom: 12,
    position: 'relative',
    minHeight: 90,
  },
  notificationCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationTimeCol: {
    width: 64,
    alignItems: 'flex-start',
    paddingBottom: 32,
    position: 'relative',
    minHeight: 90,
  },
  notificationStartTime: {
    color: '#F3F4F6',
    fontSize: 20,
    fontWeight: '600',
  },
  notificationEndTime: {
    color: '#9CA3AF',
    fontSize: 15,
    marginTop: 4,
  },
  notificationLessonNumberWrap: {
    position: 'absolute',
    top: 64,
    left: 0,
    height: 26,
    width: 26,
    borderRadius: 14,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationLessonNumber: {
    color: '#1B2129',
    fontSize: 16,
    fontWeight: '800',
  },
  notificationCardContent: {
    flex: 1,
    position: 'relative',
  },
  notificationBellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B2129',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  notificationBellText: {
    color: '#F3F4F6',
    fontSize: 12,
    fontWeight: '500',
  },
  notificationInfoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  notificationMetaText: {
    color: '#E5E7EB',
    fontSize: 13,
    maxWidth: '90%',
  },
  subscriptionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  subscriptionsTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  subscriptionsList: {
    paddingBottom: 120,
  },
  subscriptionCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: '#171C22',
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 76,
    alignSelf: 'stretch',
  },
  subscriptionTitle: {
    flex: 1,
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 12,
  },
  subscriptionDelete: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: '#1B2129',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabAdd: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: '#3D4A5D',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fabAddDisabled: {
    backgroundColor: '#2A3443',
    opacity: 0.6,
  },
  fabAddText: {
    color: '#F3F4F6',
    fontSize: 28,
    lineHeight: 32,
    marginTop: -4,
  },
  subscriptionsFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionsCounter: {
    color: '#BFBFBF',
    fontSize: 14,
  },
  bellsContainer: {
    flex: 1,
    paddingTop: 8,
  },
  bellsTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  bellsList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  bellCard: {
    backgroundColor: '#171C22',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 200,
    maxHeight: 400,
  },
  bellCardTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
  },
  bellRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bellNum: {
    height: 30,
    width: 30,
    borderRadius: 15,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bellNumText: {
    color: '#1B2129',
    fontSize: 20,
    fontWeight: '800',
  },
  bellTime: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
  },
  themesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  themesTitle: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  themesEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themesIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  themesEmptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F1318',
    zIndex: 1000,
  },
  searchHandle: {
    position: 'absolute',
    top: 28,
    left: 0,
    right: 0,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  searchTopBar: {
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  searchContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  favoritesSection: {
    marginBottom: 24,
  },
  favoritesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoritesTitle: {
    color: '#F3F4F6',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
  },
  favoritesDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
  },
  favoritesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  favoriteItem: {
    backgroundColor: '#171C22',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  favoriteItemText: {
    color: '#F3F4F6',
    fontSize: 14,
  },
  searchSection: {
    flex: 1,
  },
  searchSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  searchSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchSectionIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  searchSectionIconGroup: {
    marginTop: 10,
  },
  searchSectionTitle: {
    color: '#F3F4F6',
    fontSize: 24,
    fontWeight: '700',
  },
  searchTabSwitcher: {
    flexDirection: 'row',
  },
  searchTabButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D9D9D9',
  },
  searchTabButtonLeft: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    marginRight: 6,
  },
  searchTabButtonCenter: {
    borderRadius: 4,
    marginRight: 6,
  },
  searchTabButtonRight: {
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  searchTabButtonActive: {
    backgroundColor: '#506681',
  },
  searchList: {
    paddingBottom: 24,
  },
  searchListRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  searchItem: {
    flex: 1,
    backgroundColor: '#171C22',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    position: 'relative',
  },
  searchItemText: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  searchItemFavorite: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  subscriptionPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F1318',
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: 44,
  },
  subscriptionPickerHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  subscriptionPickerHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  subscriptionPickerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionPickerTitle: {
    color: '#F3F4F6',
    fontSize: 24,
    fontWeight: '700',
  },
  subscriptionPickerCounter: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  subscriptionPickerSearchBox: {
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1B2129',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionPickerSearchInput: {
    flex: 1,
    color: '#F3F4F6',
  },
  subscriptionPickerCooldown: {
    marginTop: 12,
    backgroundColor: '#1F2531',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionPickerCooldownText: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '500',
  },
  subscriptionPickerTabRow: {
    marginTop: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  subscriptionPickerList: {
    paddingBottom: 48,
  },
  subscriptionPickerListRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subscriptionPickerItem: {
    flex: 1,
    backgroundColor: '#171C22',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  subscriptionPickerItemSelected: {
    borderWidth: 1,
    borderColor: '#506681',
  },
  subscriptionPickerItemDisabled: {
    opacity: 0.4,
  },
  subscriptionPickerItemText: {
    color: '#F3F4F6',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  subscriptionPickerItemStatus: {
    marginTop: 6,
    color: '#9CA3AF',
    fontSize: 12,
  },
  subscriptionPickerEmpty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  subscriptionPickerEmptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
