import { COLORS } from "@/constants/theme";
import React, { useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { DaySchedule } from "../types/schedule";

interface DaySelectorProps {
  days: DaySchedule[];
}

export const DaySelector: React.FC<DaySelectorProps> = ({ days }) => {
  const [selectedId, setSelectedId] = useState(days[0]?.id);
  const [cardLayouts, setCardLayouts] = useState<
    Record<string, { x: number; width: number }>
  >({});

  const handleLayout = (id: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setCardLayouts((prev) => ({ ...prev, [id]: { x, width } }));
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const currentLayout = cardLayouts[selectedId];

    if (!currentLayout) {
      return { opacity: 0 };
    }

    const duration = 200;
    const easing = Easing.out(Easing.quad);

    return {
      opacity: withTiming(1, { duration }),
      width: withTiming(currentLayout.width, { duration, easing }),
      transform: [
        {
          translateX: withTiming(currentLayout.x, { duration, easing }),
        },
      ],
    };
  }, [selectedId, cardLayouts]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.activeIndicator, animatedIndicatorStyle]} />

      {days.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <TouchableOpacity
            key={item.id}
            onLayout={(e) => handleLayout(item.id, e)}
            style={styles.dayCard}
            onPress={() => setSelectedId(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dayOfWeek, isSelected && styles.activeText]}>
              {item.dayOfWeek}
            </Text>
            <Text style={[styles.date, isSelected && styles.activeText]}>
              {item.date}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
    gap: 8,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  dayCard: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  dayOfWeek: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMuted,
  },
  date: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activeText: {
    color: COLORS.textPrimary,
  },
});
