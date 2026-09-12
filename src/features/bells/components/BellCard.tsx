import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BellScheduleType } from "../types/bells";
import { BellRow } from "./BellRow";

interface BellCardProps {
  schedule: BellScheduleType;
  width: number;
  gap: number;
  isActive: boolean;
}

export const BellCard: React.FC<BellCardProps> = ({
  schedule,
  width,
  gap,
  isActive,
}) => {
  return (
    <View
      style={[
        styles.card,
        { width, marginRight: gap },
        !isActive && styles.inactiveCard,
      ]}
    >
      <Text style={styles.cardTitle}>{schedule.title}</Text>
      <View style={styles.itemList}>
        {schedule.items.map((item) => (
          <BellRow key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#161B22",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#21262D",
    opacity: 1,
  },
  inactiveCard: {
    opacity: 0.35,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  itemList: {
    gap: 14,
  },
});
