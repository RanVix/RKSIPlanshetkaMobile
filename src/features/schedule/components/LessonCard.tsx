import { COLORS } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Lesson } from "../types/schedule";

import CabinetIcon from "@/assets/svgs/CabinetIcon.svg";
import CabinetIconBlack from "@/assets/svgs/CabinetIconBlack.svg";
import CombinedIcon from "@/assets/svgs/CombinedIcon.svg";
import CombinedIconBlack from "@/assets/svgs/CombinedIconBlack.svg";
import UserIcon from "@/assets/svgs/UserIcon.svg";
import UserIconBlack from "@/assets/svgs/UserIconBlack.svg";

interface LessonCardProps {
  lesson: Lesson;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  const { colors, theme } = useTheme();
  const isDark = theme === "dark";
  const isAccentBadge = lesson.number === 6;

  const SelectedUserIcon = isDark ? UserIcon : UserIconBlack;
  const SelectedCabinetIcon = isDark ? CabinetIcon : CabinetIconBlack;
  const SelectedCombinedIcon = isDark ? CombinedIcon : CombinedIconBlack;

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
      <View style={styles.timeBlock}>
        <Text style={[styles.startTime, { color: colors.textPrimary }]}>
          {lesson.startTime}
        </Text>
        <Text style={[styles.endTime, { color: colors.textSecondary }]}>
          {lesson.endTime}
        </Text>
      </View>

      <View style={styles.contentBlock}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.subjectTitle, { color: colors.textPrimary }]}>
              {lesson.subject}
            </Text>
            {lesson.hasIndicator && <View style={styles.redDot} />}
          </View>
          <View style={styles.titleDivider} />
        </View>

        <View style={styles.teachersList}>
          {lesson.teachers.map((teacher, index) => (
            <View key={teacher.id || index} style={styles.teacherContainer}>
              {index > 0 && <View style={styles.teacherDivider} />}

              {/* Преподаватель */}
              {teacher.name && (
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <SelectedUserIcon width={15} height={15} />
                  </View>
                  <Text
                    style={[styles.infoText, { color: colors.textPrimary }]}
                  >
                    {teacher.name}
                  </Text>
                </View>
              )}

              {/* Кабинет */}
              {teacher.room && (
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <SelectedCabinetIcon width={15} height={15} />
                  </View>
                  <Text
                    style={[styles.infoText, { color: colors.textPrimary }]}
                  >
                    {teacher.room}
                  </Text>
                </View>
              )}

              {/* Группа / Подгруппа */}
              {teacher.group && (
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <SelectedCombinedIcon width={15} height={15} />
                  </View>
                  <Text
                    style={[styles.infoText, { color: colors.textPrimary }]}
                  >
                    {teacher.group}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

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
          {lesson.number}
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
    fontSize: 18,
    fontWeight: "500",
    color: COLORS.white,
  },
  redDot: {
    width: 5,
    height: 5,
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
