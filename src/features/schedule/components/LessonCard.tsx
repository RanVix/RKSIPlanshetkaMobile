import React from "react";
import { StyleSheet, Text, View } from "react-native";

import CabinetIcon from "@/assets/svgs/CabinetIcon.svg";
import CabinetIconBlack from "@/assets/svgs/CabinetIconBlack.svg";
import CombinedIcon from "@/assets/svgs/CombinedIcon.svg";
import CombinedIconBlack from "@/assets/svgs/CombinedIconBlack.svg";
import UserIcon from "@/assets/svgs/UserIcon.svg";
import UserIconBlack from "@/assets/svgs/UserIconBlack.svg";
import { COLORS } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { ScheduleLessonItem } from "../types/schedule";

// Расширяем интерфейс для поддержки сгруппированных преподавателей и совмещенок
export interface GroupedLesson extends ScheduleLessonItem {
  subItems?: ScheduleLessonItem[];
  pairNumber?: number;
}

interface LessonCardProps {
  lesson: GroupedLesson;
  fallbackNumber: number;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  fallbackNumber,
}) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";

  // Разбиваем время по длинному или обычному тире
  const timeParts = lesson.time
    ? lesson.time.split(/\s*—\s*|\s*-\s*/)
    : ["", ""];
  const startTime = timeParts[0]?.trim() || "";
  const endTime = timeParts[1]?.trim() || "";

  // Определяем номер пары
  const parsedNumber = lesson.name
    ? parseInt(lesson.name.replace(/\D/g, ""), 10)
    : NaN;
  const pairNumber =
    lesson.pairNumber || (!isNaN(parsedNumber) ? parsedNumber : fallbackNumber);

  // Собираем все блоки подгрупп/преподавателей
  const teacherBlocks =
    lesson.subItems && lesson.subItems.length > 0 ? lesson.subItems : [lesson];

  const isAccentBadge = teacherBlocks.some((item) => item.is_now);
  const hasWarning = teacherBlocks.some((item) => item.subject_warning);

  const SelectedUserIcon = isDark ? UserIcon : UserIconBlack;
  const SelectedCabinetIcon = isDark ? CabinetIcon : CabinetIconBlack;
  const SelectedCombinedIcon = isDark ? CombinedIcon : CombinedIconBlack;

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
      {/* Время */}
      <View style={styles.timeBlock}>
        <Text style={[styles.startTime, { color: colors.textPrimary }]}>
          {startTime}
        </Text>
        {endTime ? (
          <Text style={[styles.endTime, { color: colors.textSecondary }]}>
            {endTime}
          </Text>
        ) : null}
      </View>

      {/* Контентная часть */}
      <View style={styles.contentBlock}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            {/* Берем название предмета из subject */}
            <Text style={[styles.subjectTitle, { color: colors.textPrimary }]}>
              {lesson.subject || lesson.name}
            </Text>
            {hasWarning && <View style={styles.redDot} />}
          </View>
          <View style={styles.titleDivider} />
        </View>

        {/* Список подгрупп/преподавателей */}
        <View style={styles.teachersList}>
          {teacherBlocks.map((item, idx) => {
            // Фильтруем совмещенку: берем элементы из combined
            const combinedList = item.combined || [];

            return (
              <View key={idx} style={styles.teacherContainer}>
                {idx > 0 && <View style={styles.teacherDivider} />}

                {/* Преподаватель */}
                {Boolean(item.teacher) && (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <SelectedUserIcon width={15} height={15} />
                    </View>
                    <Text
                      style={[styles.infoText, { color: colors.textPrimary }]}
                    >
                      {item.teacher}
                    </Text>
                  </View>
                )}

                {/* Кабинет */}
                {Boolean(item.audience) && (
                  <View style={styles.infoRow}>
                    <View style={styles.iconContainer}>
                      <SelectedCabinetIcon width={15} height={15} />
                    </View>
                    <Text
                      style={[styles.infoText, { color: colors.textPrimary }]}
                    >
                      {item.audience}
                    </Text>
                  </View>
                )}

                {/* Блок совмещенных групп из массива combined */}
                {combinedList.length > 0 &&
                  combinedList.map((comb, cIdx) => {
                    // Формируем детальную подпись совмещенки
                    const details = [
                      comb.group,
                      comb.teacher && comb.teacher !== item.teacher
                        ? comb.teacher
                        : null,
                      comb.audience && comb.audience !== item.audience
                        ? comb.audience
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" • ");

                    if (!details) return null;

                    return (
                      <View key={`comb-${cIdx}`} style={styles.infoRow}>
                        <View style={styles.iconContainer}>
                          <SelectedCombinedIcon width={15} height={15} />
                        </View>
                        <Text
                          style={[
                            styles.infoText,
                            { color: colors.textPrimary },
                          ]}
                        >
                          {details}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            );
          })}
        </View>
      </View>

      {/* Номер пары */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: isAccentBadge
              ? colors.accentBlue
              : colors.LessonCardBackground,
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              color: isAccentBadge ? colors.textWhite : colors.badgeTextColor,
            },
          ]}
        >
          {pairNumber}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    paddingBottom: 18,
    marginBottom: 12,
    flexDirection: "row",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeBlock: {
    width: 65,
  },
  startTime: {
    fontSize: 21,
    fontWeight: "700",
    color: COLORS.textWhite,
    letterSpacing: -0.5,
  },
  endTime: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  contentBlock: {
    flex: 1,
    paddingLeft: 6,
  },
  headerContainer: {
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 6,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.white,
    flexShrink: 1,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.redDot,
    marginLeft: 6,
  },
  titleDivider: {
    height: 1,
    backgroundColor: COLORS.Card,
    width: "70%",
  },
  teachersList: {
    gap: 6,
  },
  teacherContainer: {
    gap: 6,
  },
  teacherDivider: {
    height: 1,
    backgroundColor: COLORS.Card,
    marginVertical: 4,
    width: "70%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 15,
    color: COLORS.infoText,
  },
  badge: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 32,
    height: 30,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
