export type ThemeType = "dark" | "light";

export const THEMES = {
  dark: {
    background: "#0F1216",
    cardBg: "#1C2128",
    cardBgBorder: "#2D333B",

    primary: "#1C2027",
    primaryActive: "#353D4A",
    accentBlue: "#007AFF",
    accentRed: "#FF453A",
    redDot: "#FF7878",

    infoText: "#FFFFFF",
    LessonCardBackground: "#FFFFFF",
    white: "#FFFFFF",
    Card: "#3D4A5D",

    textPrimary: "#FFFFFF",
    textSecondary: "#8B949E",
    textMuted: "#6E7681",
    textFilter: "#AEAEB2",
    textDark: "#000000",
    textWhite: "#FFFFFF",

    // Цвет цифры на обычной (не акцентной) плашке
    badgeTextColor: "#000000",
    // Цвет иконок для тёмной темы
    iconColor: "#8B949E",

    badgeBg: "#161B22",
    badgeBorder: "#30363D",
  },
  light: {
    background: "#F6F8FA",
    cardBg: "#FFFFFF",
    cardBgBorder: "#D0D7DE",

    primary: "#F2F2F7",
    primaryActive: "#D0D7DE",
    accentBlue: "#007AFF",
    accentRed: "#FF3B30",
    redDot: "#FF7878",

    infoText: "#FFFFFF",
    LessonCardBackground: "#000000",
    white: "#FFFFFF",
    Card: "#3D4A5D",

    textPrimary: "#000000",
    textSecondary: "#57606A",
    textMuted: "#8C959F",
    textFilter: "#8E8E93",
    textDark: "#000000",
    textWhite: "#FFFFFF",

    badgeTextColor: "#FFFFFF",
    iconColor: "#000000",

    badgeBg: "#F3F4F6",
    badgeBorder: "#D0D7DE",
  },
};

export const COLORS = THEMES.dark;
