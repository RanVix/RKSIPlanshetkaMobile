import { Feather } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import { useCallback, useMemo, useRef, useState } from "react";
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

const WEEK_DAYS = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"];

export default function Index() {
  const { colors } = useTheme();
  const { targetName } = useScheduleContext();
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

  const unlockAnimation = useCallback(() => {
    isAnimatingRef.current = false;
  }, []);

  const startEntranceAnimation = useCallback(
    (targetX: number) => {
      translateX.value = targetX;
      opacity.value = 0;

      translateX.value = withTiming(0, { duration: 180 });
      opacity.value = withTiming(1, { duration: 180 }, (finished) => {
        if (finished) {
          runOnJS(unlockAnimation)();
        }
      });
    },
    [translateX, opacity, unlockAnimation],
  );

  const updateSelectedDate = useCallback((newDateKey: string) => {
    setSelectedDate(newDateKey);
  }, []);

  const prepareAndAnimateDateChange = useCallback(
    (newDateKey: string, direction: "left" | "right") => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

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

  // Обработка клика по кнопке дня
  const handleSelectDay = (day: DayItem) => {
    if (day.id === activeDateKey || isAnimatingRef.current) return;

    const currentIndex = days.findIndex((d) => d.id === activeDateKey);
    const newIndex = days.findIndex((d) => d.id === day.id);

    const direction = newIndex > currentIndex ? "left" : "right";
    prepareAndAnimateDateChange(day.id, direction);
  };

  // Переход к следующему дню
  const goToNextDay = useCallback(() => {
    if (!activeDateKey || days.length === 0 || isAnimatingRef.current) return;
    const currentIndex = days.findIndex((d) => d.id === activeDateKey);
    if (currentIndex < days.length - 1) {
      prepareAndAnimateDateChange(days[currentIndex + 1].id, "left");
    }
  }, [activeDateKey, days, prepareAndAnimateDateChange]);

  // Переход к предыдущему дню
  const goToPrevDay = useCallback(() => {
    if (!activeDateKey || days.length === 0 || isAnimatingRef.current) return;
    const currentIndex = days.findIndex((d) => d.id === activeDateKey);
    if (currentIndex > 0) {
      prepareAndAnimateDateChange(days[currentIndex - 1].id, "right");
    }
  }, [activeDateKey, days, prepareAndAnimateDateChange]);

  // Свайп жесты
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
    if (!scheduleData || !activeDateKey) return [];
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
        text:
          dayData.time_type === "normal"
            ? "Обычные пары"
            : dayData.time_type === "shortened"
              ? "Сокращенные пары"
              : dayData.time_type,
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
  }, [scheduleData, activeDateKey]);

  const currentLessons = useMemo(() => {
    if (!scheduleData || !activeDateKey) return [];
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
  }, [scheduleData, activeDateKey]);

  return (
    <GestureHandlerRootView style={styles.flex}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Header groupName={targetName} />

          {/* Баннер оффлайн-режима */}
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

          {days.length > 0 && (
            <DaySelector
              days={days}
              selectedId={activeDateKey || undefined}
              onSelectDay={handleSelectDay}
            />
          )}

          {/* Анимированная область свайпов для списка пар */}
          <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[styles.lessonsContainer, animatedStyle]}>
              {filters.length > 0 && <FilterBadges filters={filters} />}

              {isLoading && (
                <View style={styles.centerBlock}>
                  <ActivityIndicator size="large" color={colors.textPrimary} />
                </View>
              )}

              {isError && (
                <View style={styles.centerBlock}>
                  <Text style={{ color: colors.textPrimary }}>
                    {error?.message || "Не удалось загрузить расписание"}
                  </Text>
                </View>
              )}

              {!isLoading && !isError && currentLessons.length === 0 && (
                <View style={styles.centerBlock}>
                  <Text style={{ color: colors.textMuted }}>
                    Расписание отсутствует
                  </Text>
                </View>
              )}

              {!isLoading &&
                !isError &&
                currentLessons.map((lesson, index) => (
                  <LessonCard
                    key={`${lesson.subject}-${lesson.time}-${index}`}
                    lesson={lesson}
                    fallbackNumber={index + 1}
                  />
                ))}
            </Animated.View>
          </GestureDetector>
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
  lessonsContainer: {
    flex: 1,
    minHeight: 300,
  },
  centerBlock: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
