import { COLORS } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SubjectWarningBadgeProps {
  message?: string;
}

const DEFAULT_MESSAGE =
  "Название пары может быть указано неточно - перепроверьте.";

const TOOLTIP_WIDTH = 230;
const SCREEN_PADDING = 12;
const ARROW_SIZE = 6;

export const SubjectWarningBadge: React.FC<SubjectWarningBadgeProps> = ({
  message = DEFAULT_MESSAGE,
}) => {
  const { colors } = useTheme();
  const dotRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const [visible, setVisible] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handlePress = () => {
    dotRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setVisible(true);
    });
  };

  const screenWidth = Dimensions.get("window").width;

  let tooltipLeft = anchor.x + anchor.width / 2 - TOOLTIP_WIDTH / 2;
  tooltipLeft = Math.max(
    SCREEN_PADDING,
    Math.min(tooltipLeft, screenWidth - TOOLTIP_WIDTH - SCREEN_PADDING),
  );

  const tooltipTop = anchor.y + anchor.height + 10;
  const arrowLeft = anchor.x + anchor.width / 2 - tooltipLeft - ARROW_SIZE;

  return (
    <>
      <TouchableOpacity
        ref={dotRef}
        onPress={handlePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.6}
      >
        <View style={styles.dot} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View
            style={[
              styles.tooltip,
              {
                left: tooltipLeft,
                top: tooltipTop,
                width: TOOLTIP_WIDTH,
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBgBorder,
              },
            ]}
          >
            <View
              style={[
                styles.arrow,
                {
                  left: arrowLeft,
                  borderBottomColor: colors.cardBg,
                },
              ]}
            />
            <Text style={[styles.text, { color: colors.textPrimary }]}>
              {message}
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.redDot,
  },
  overlay: {
    flex: 1,
  },
  tooltip: {
    position: "absolute",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  arrow: {
    position: "absolute",
    top: -ARROW_SIZE,
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderBottomWidth: ARROW_SIZE,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
  },
});
