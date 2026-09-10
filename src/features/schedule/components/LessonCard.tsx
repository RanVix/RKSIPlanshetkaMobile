import { COLORS } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Lesson } from "../types/schedule";

import CabinetIcon from "@/assets/svgs/CabinetIcon.svg";
import CombinedIcon from "@/assets/svgs/CombinedIcon.svg";
import UserIcon from "@/assets/svgs/UserIcon.svg";

interface LessonCardProps {
  lesson: Lesson;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson }) => {
  const isAccentBadge = lesson.number === 6;

  return (
    <View style={styles.card}>
      <View style={styles.timeBlock}>
        <Text style={styles.startTime}>{lesson.startTime}</Text>
        <Text style={styles.endTime}>{lesson.endTime}</Text>
      </View>

      <View style={styles.contentBlock}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.subjectTitle}>{lesson.subject}</Text>
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
                    <UserIcon width={15} height={15} color="#E1E4E8" />
                  </View>
                  <Text style={styles.infoText}>{teacher.name}</Text>
                </View>
              )}

              {/* Кабинет */}
              {teacher.room && (
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <CabinetIcon width={15} height={15} color="#E1E4E8" />
                  </View>
                  <Text style={styles.infoText}>{teacher.room}</Text>
                </View>
              )}

              {/* Группа / Подгруппа */}
              {teacher.group && (
                <View style={styles.infoRow}>
                  <View style={styles.iconContainer}>
                    <CombinedIcon width={15} height={15} color="#E1E4E8" />
                  </View>
                  <Text style={styles.infoText}>{teacher.group}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.badge,
          isAccentBadge ? styles.badgeBlue : styles.badgeWhite,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            isAccentBadge ? styles.textWhite : styles.textDark,
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
    overflow: "hidden",
  },
  timeBlock: {
    width: 65,
  },
  startTime: {
    fontSize: 21,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  endTime: {
    fontSize: 18,
    color: "#8B949E",
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
    color: "#FFFFFF",
  },
  redDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#FF7878",
    marginLeft: 6,
  },
  titleDivider: {
    height: 1,
    backgroundColor: "#3D4A5D",
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
    backgroundColor: "#3D4A5D",
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
    color: "#FFFFFF",
  },

  badge: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 32,
    height: 30,
    borderTopRightRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeWhite: {
    backgroundColor: "#FFFFFF",
  },
  badgeBlue: {
    backgroundColor: "#2F80ED",
  },
  badgeText: {
    fontSize: 18,
    fontWeight: "700",
  },
  textDark: {
    color: "#000000",
  },
  textWhite: {
    color: "#FFFFFF",
  },
});
