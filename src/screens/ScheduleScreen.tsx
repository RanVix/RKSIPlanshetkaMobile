import { useScheduleContext } from "@/context/ScheduleContext";
import { useTheme } from "@/context/ThemeContext";
import {
  DayItem,
  DaySelector,
} from "@/features/schedule/components/DaySelector";
import { FilterBadges } from "@/features/schedule/components/FilterBadges";
import { Header } from "@/features/schedule/components/Header";
import {
  GroupedLesson,
  LessonCard,
} from "@/features/schedule/components/LessonCard";
import { useScheduleData } from "@/hooks/useScheduleData";
import { Feather } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { EmptySchedule } from "../features/schedule/components/EmptyScedule";

const WEEK_DAYS = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];

const DAY_SWITCH_LOCK_MS = 250;

const TIME_TYPE_LABELS: Record<string, string> = {
  normal: "Обычные пары",
  shortened: "Сокращенные пары",
  class_hour: "Классный час",
};

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const cleanStr = timeStr.trim().replace(/[^\d:]/g, "");
  const [hoursStr, minutesStr] = cleanStr.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours)) return 0;
  return hours * 60 + (isNaN(minutes) ? 0 : minutes);
};

const getLessonNumber = (
  timeStr?: string,
  timeType?: string,
  fallback: number = 1,
): number | string => {
  if (!timeStr) return fallback;

  const startTimeRaw = timeStr.split(/[-–—]/)[0].trim();
  const startMins = timeToMinutes(startTimeRaw);

  if (startMins === 0) return fallback;

  if (timeType === "class_hour") {
    if (startMins >= 450 && startMins < 550) return 1;
    if (startMins >= 550 && startMins < 650) return 2;
    if (startMins >= 650 && startMins < 750) return 3;
    if (startMins >= 750 && startMins < 820) return "К";
    if (startMins >= 820 && startMins < 920) return 4;
    if (startMins >= 920 && startMins < 1020) return 5;
    if (startMins >= 1020) return 6;
  }

  if (timeType === "shortened") {
    if (startMins >= 450 && startMins < 510) return 1;
    if (startMins >= 510 && startMins < 570) return 2;
    if (startMins >= 570 && startMins < 630) return 3;
    if (startMins >= 630 && startMins < 690) return 4;
    if (startMins >= 690 && startMins < 750) return 5;
    if (startMins >= 750 && startMins < 810) return 6;
    if (startMins >= 810) return 7;
  }

  if (startMins >= 450 && startMins < 540) return 1;
  if (startMins >= 540 && startMins < 640) return 2;
  if (startMins >= 640 && startMins < 740) return 3;
  if (startMins >= 740 && startMins < 845) return 4;
  if (startMins >= 845 && startMins < 950) return 5;
  if (startMins >= 950 && startMins < 1050) return 6;
  if (startMins >= 1050) return 7;

  return fallback;
};

export function ScheduleScreen() {
  const { colors } = useTheme();
  const { targetName, targetCategory } = useScheduleContext();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const isAnimatingRef = useRef(false);

  const { isConnected } = useNetInfo();

  const {
    data: scheduleData,
    isLoading,
    isError,
    error,
  } = useScheduleData(targetName);

  const days: DayItem[] = useMemo(() => {
    if (!scheduleData) return [];
    const dates = Object.keys(scheduleData);

    return dates.map((dateStr, index) => {
      const dateObj = new Date(dateStr);
      const dayOfWeek = WEEK_DAYS[dateObj.getDay()] || "";

      const [, month, day] = dateStr.split("-");
      const formattedDate = `${day}.${month}`;

      return {
        id: dateStr,
        dayOfWeek,
        date: formattedDate,
        isToday: index === 0,
      };
    });
  }, [scheduleData]);

  const activeDateKey = useMemo(() => {
    if (selectedDate && scheduleData?.[selectedDate]) {
      return selectedDate;
    }
    const dates = Object.keys(scheduleData || {});
    return dates.length > 0 ? dates[0] : null;
  }, [scheduleData, selectedDate]);

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const lockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
    };
  }, []);

  const updateSelectedDate = useCallback((newDateKey: string) => {
    setSelectedDate(newDateKey);
  }, []);

  const startEntranceAnimation = useCallback(
    (targetX: number) => {
      translateX.value = targetX;
      opacity.value = 0;

      translateX.value = withTiming(0, { duration: 180 });
      opacity.value = withTiming(1, { duration: 180 });
    },
    [translateX, opacity],
  );

  const prepareAndAnimateDateChange = useCallback(
    (newDateKey: string, direction: "left" | "right") => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
      lockTimeoutRef.current = setTimeout(() => {
        isAnimatingRef.current = false;
      }, DAY_SWITCH_LOCK_MS);

      const exitX = direction === "left" ? -30 : 30;
      const enterX = direction === "left" ? 30 : -30;

      translateX.value = withTiming(exitX, { duration: 100 });
      opacity.value = withTiming(0, { duration: 100 }, (finished) => {
        if (finished) {
          runOnJS(updateSelectedDate)(newDateKey);
          runOnJS(startEntranceAnimation)(enterX);
        }
      });
    },
    [translateX, opacity, updateSelectedDate, startEntranceAnimation],
  );

  const handleSelectDay = (day: DayItem) => {
    if (day.id === activeDateKey || isAnimatingRef.current) return;

    const currentIndex = days.findIndex((d) => d.id === activeDateKey);
    const newIndex = days.findIndex((d) => d.id === day.id);

    const direction = newIndex > currentIndex ? "left" : "right";
    prepareAndAnimateDateChange(day.id, direction);
  };

  const goToNextDay = useCallback(() => {
    if (!activeDateKey || days.length === 0 || isAnimatingRef.current) return;
    const currentIndex = days.findIndex((d) => d.id === activeDateKey);
    if (currentIndex < days.length - 1) {
      prepareAndAnimateDateChange(days[currentIndex + 1].id, "left");
    }
  }, [activeDateKey, days, prepareAndAnimateDateChange]);

  const goToPrevDay = useCallback(() => {
    if (!activeDateKey || days.length === 0 || isAnimatingRef.current) return;
    const currentIndex = days.findIndex((d) => d.id === activeDateKey);
    if (currentIndex > 0) {
      prepareAndAnimateDateChange(days[currentIndex - 1].id, "right");
    }
  }, [activeDateKey, days, prepareAndAnimateDateChange]);

  const flingRight = Gesture.Fling()
    .direction(1)
    .onEnd(() => {
      runOnJS(goToPrevDay)();
    });

  const flingLeft = Gesture.Fling()
    .direction(2)
    .onEnd(() => {
      runOnJS(goToNextDay)();
    });

  const combinedGesture = Gesture.Simultaneous(flingLeft, flingRight);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const filters = useMemo(() => {
    if (!targetName || !scheduleData || !activeDateKey) return [];
    const dayData = scheduleData[activeDateKey];
    if (!dayData) return [];

    const result = [];

    if (dayData.corpus) {
      result.push({
        id: "corpus",
        icon: "map-pin" as const,
        text: `${dayData.corpus} корпус`,
      });
    }

    if (dayData.time_type) {
      result.push({
        id: "time_type",
        icon: "clock" as const,
        text: TIME_TYPE_LABELS[dayData.time_type] || dayData.time_type,
      });
    }

    if (dayData.source) {
      result.push({
        id: "source",
        icon: "check-square" as const,
        text: dayData.source === "planshetka" ? "Планшетка" : "Сайт",
      });
    }

    return result;
  }, [targetName, scheduleData, activeDateKey]);

  const currentLessons = useMemo(() => {
    if (!targetName || !scheduleData || !activeDateKey) return [];
    const rawItems = scheduleData[activeDateKey]?.items || [];

    const grouped: GroupedLesson[] = [];

    rawItems.forEach((item) => {
      const existing = grouped.find(
        (g) => g.time === item.time && g.subject === item.subject,
      );

      if (existing) {
        if (!existing.subItems) {
          existing.subItems = [{ ...existing }];
        }
        existing.subItems.push(item);
      } else {
        grouped.push({ ...item });
      }
    });

    return grouped;
  }, [targetName, scheduleData, activeDateKey]);

  const currentTimeType = activeDateKey
    ? scheduleData?.[activeDateKey]?.time_type
    : undefined;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header groupName={targetName} />

          {isConnected === false && (
            <View
              style={[
                styles.offlineBanner,
                {
                  backgroundColor: colors.cardBg,
                  borderColor: colors.cardBgBorder,
                },
              ]}
            >
              <Feather
                name="wifi-off"
                size={16}
                color={colors.accentBlue}
                style={styles.offlineIcon}
              />
              <Text
                style={[styles.offlineText, { color: colors.textSecondary }]}
              >
                Нет сети. Отображаются сохраненные данные.
              </Text>
            </View>
          )}

          {targetName && days.length > 0 && (
            <DaySelector
              days={days}
              selectedId={activeDateKey || undefined}
              onSelectDay={handleSelectDay}
            />
          )}

          {!targetName ? (
            <View style={styles.emptyStateContainer}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: colors.cardBg,
                    borderColor: colors.cardBgBorder,
                  },
                ]}
              >
                <Feather name="calendar" size={40} color={colors.accentBlue} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                Выберите группу
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                Укажите группу или преподавателя в шапке, чтобы отобразить
                расписание
              </Text>
            </View>
          ) : (
            <GestureDetector gesture={combinedGesture}>
              {/*
                needsOffscreenAlphaCompositing — критично для Android:
                без него elevation/shadow дочерних карточек не всегда
                корректно подчиняется анимируемому opacity этого контейнера,
                из-за чего тень на миг "проступает" непрозрачной поверх
                ещё не отрисованного контента (баг заметен только на
                светлой теме, т.к. на тёмной тень сливается с фоном).
              */}
              <Animated.View
                style={[styles.swipeArea, animatedStyle]}
                needsOffscreenAlphaCompositing
              >
                {filters.length > 0 && <FilterBadges filters={filters} />}

                {currentLessons.length > 0 ? (
                  currentLessons.map((lesson, index) => (
                    <LessonCard
                      key={`lesson-slot-${index}`}
                      lesson={lesson}
                      targetCategory={targetCategory}
                      fallbackNumber={
                        getLessonNumber(
                          lesson.time,
                          currentTimeType,
                          index + 1,
                        ) as number
                      }
                    />
                  ))
                ) : isLoading ? (
                  <View style={styles.centerBlock}>
                    <ActivityIndicator
                      size="large"
                      color={colors.textPrimary}
                    />
                  </View>
                ) : isError ? (
                  <View style={styles.centerBlock}>
                    <Text style={{ color: colors.textPrimary }}>
                      {error?.message || "Не удалось загрузить расписание"}
                    </Text>
                  </View>
                ) : (
                  <EmptySchedule />
                )}
              </Animated.View>
            </GestureDetector>
          )}
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 100,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  offlineIcon: {
    marginRight: 8,
  },
  offlineText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  swipeArea: {
    flex: 1,
    minHeight: 400,
  },
  centerBlock: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateContainer: {
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
