import { ScrollView, StyleSheet, View } from "react-native";

import { useTheme } from "@/context/ThemeContext";
import { DaySelector } from "@/features/schedule/components/DaySelector";
import { FilterBadges } from "@/features/schedule/components/FilterBadges";
import { Header } from "@/features/schedule/components/Header";
import { LessonCard } from "@/features/schedule/components/LessonCard";
import {
  MOCK_DAYS,
  MOCK_FILTERS,
  MOCK_LESSONS,
} from "@/features/schedule/mock/mockSchedule";

export default function ScheduleScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header groupName="ИС-21" />
        <DaySelector days={MOCK_DAYS} />
        <FilterBadges filters={MOCK_FILTERS} />

        {MOCK_LESSONS.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
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
});
