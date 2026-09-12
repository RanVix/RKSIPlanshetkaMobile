import { COLORS } from "@/constants/theme";
import { BottomNav } from "@/features/schedule/components/BottomNav";
import { Header } from "@/features/schedule/components/Header";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BellCard } from "../features/bells/components/BellCard";
import { BELL_SCHEDULES } from "../features/bells/mock/bellsData";
import { BellScheduleType } from "../features/bells/types/bells";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.65;
const CARD_GAP = 12;
const ITEM_SIZE = CARD_WIDTH + CARD_GAP;

export const BellsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(1);
  const flatListRef = useRef<FlatList<BellScheduleType>>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / ITEM_SIZE);
    if (index >= 0 && index < BELL_SCHEDULES.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerPadding}>
        <Header groupName="Расписание звонков" />
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={BELL_SCHEDULES}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={ITEM_SIZE}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          initialScrollIndex={1}
          getItemLayout={(_, index) => ({
            length: ITEM_SIZE,
            offset: ITEM_SIZE * index,
            index,
          })}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <BellCard
              schedule={item}
              width={CARD_WIDTH}
              gap={CARD_GAP}
              isActive={index === activeIndex}
            />
          )}
        />

        <View style={styles.pagination}>
          {BELL_SCHEDULES.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, activeIndex === idx && styles.activeDot]}
            />
          ))}
        </View>
      </View>

      <BottomNav activeTab="bells" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerPadding: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  contentContainer: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    alignItems: "flex-start",
    paddingTop: 8,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#30363D",
  },
  activeDot: {
    backgroundColor: "#58A6FF",
    width: 20,
  },
});
