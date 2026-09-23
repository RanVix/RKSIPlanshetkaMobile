import { useTheme } from "@/context/ThemeContext";
import { useLastRelease } from "@/hooks/useLastRelease";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DOWNLOAD_URL =
  "https://github.com/RanVix/RKSIPlanshetkaMobile/releases/latest";

export const UpdateModal = () => {
  const { colors } = useTheme();
  const { hasUpdate, latestRelease } = useLastRelease();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!hasUpdate || !latestRelease || isDismissed) {
    return null;
  }

  const handleUpdate = () => {
    Linking.openURL(DOWNLOAD_URL);
  };

  const handleClose = () => {
    setIsDismissed(true);
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={hasUpdate && !isDismissed}
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBg,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colors.accentBlue + "10",
                borderColor: colors.accentBlue + "30",
              },
            ]}
          >
            <Feather
              name="download-cloud"
              size={32}
              color={colors.accentBlue}
            />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Доступно обновление!
          </Text>

          <Text style={[styles.versionText, { color: colors.textMuted }]}>
            Новая версия:{" "}
            <Text style={styles.versionBadge}>{latestRelease.version}</Text>
          </Text>

          {latestRelease.description && (
            <Text
              style={[styles.description, { color: colors.textSecondary }]}
              numberOfLines={4}
            >
              {latestRelease.description}
            </Text>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button, { backgroundColor: colors.accentBlue }]}
            onPress={handleUpdate}
          >
            <Text style={styles.buttonText}>Обновить</Text>
            <Feather
              name="arrow-right"
              size={18}
              color="#FFF"
              style={styles.buttonIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  versionText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  versionBadge: {
    fontWeight: "700",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
