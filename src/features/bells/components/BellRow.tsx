import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { BellItem } from "../types/bells";

interface BellRowProps {
  item: BellItem;
}

export const BellRow: React.FC<BellRowProps> = ({ item }) => {
  return (
    <View style={styles.row}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{item.number}</Text>
      </View>
      <Text style={styles.timeText}>{item.time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    color: "#0D1117",
    fontSize: 20,
    fontWeight: "700",
  },
  timeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});
