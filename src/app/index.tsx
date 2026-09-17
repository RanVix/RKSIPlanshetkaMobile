import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

  const {
    data: scheduleData,
    isLoading,
    isError,
    error,
  } = useScheduleData(targetName);

  // Динамический список дней на основе ключей API
  const days: DayItem[] = useMemo(() => {
    if (!scheduleData) return [];
    const dates = Object.keys(scheduleData);

    return dates.map((dateStr, index) => {
      const dateObj = new Date(dateStr);
      const dayOfWeek = WEEK_DAYS[dateObj.getDay()] || "";

      // YYYY-MM-DD -> DD.MM
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

  // Активный ключ даты
  const activeDateKey = useMemo(() => {
    if (selectedDate && scheduleData?.[selectedDate]) {
      return selectedDate;
    }
    const dates = Object.keys(scheduleData || {});
    return dates.length > 0 ? dates[0] : null;
  }, [scheduleData, selectedDate]);

  // Фильтры (корпус, тип пар, источник)
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

  // Группировка подгрупп
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header groupName={targetName} />

        {days.length > 0 && (
          <DaySelector
            days={days}
            selectedId={activeDateKey || undefined}
            onSelectDay={(day) => setSelectedDate(day.id)}
          />
        )}

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 100,
  },
  centerBlock: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
