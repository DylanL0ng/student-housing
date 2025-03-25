const TailwindColours = {
  // Background Colors
  background: {
    primary: "#111827", // Dark blue-gray (gray-900)
    secondary: "#1F2937", // Slightly lighter dark blue-gray (gray-800)
    tertiary: "#374151", // Even lighter dark blue-gray (gray-700)
  },

  // Text Colors
  text: {
    primary: "#F9FAFB", // Almost white (gray-50)
    secondary: "#D1D5DB", // Light gray (gray-300)
    muted: "#6B7280", // Muted gray (gray-500)
  },

  // Accent Colors
  accent: {
    // Blue Palette
    primary: {
      default: "#3B82F6", // Blue 500
      hover: "#2563EB", // Blue 600
      active: "#1D4ED8", // Blue 700
    },

    // Indigo Palette
    secondary: {
      default: "#6366F1", // Indigo 500
      hover: "#4F46E5", // Indigo 600
      active: "#4338CA", // Indigo 700
    },
  },

  // Semantic Colors
  semantic: {
    // Error Red
    error: {
      default: "#EF4444", // Red 500
      light: "#FCA5A5", // Red 400
      dark: "#B91C1C", // Red 700
    },

    // Success Green
    success: {
      default: "#22C55E", // Green 500
      light: "#4ADE80", // Green 400
      dark: "#15803D", // Green 700
    },

    // Warning Yellow
    warning: {
      default: "#EAB308", // Yellow 500
      light: "#FACC15", // Yellow 400
      dark: "#A16207", // Yellow 700
    },
  },

  // Surface and Overlay Colors
  surface: {
    elevated: "#1F2937", // Gray 800
    overlay: "#374151", // Gray 700
    border: "#4B5563", // Gray 600
  },

  // Gradient Colors
  gradients: {
    // Subtle gray gradient
    subtle: {
      from: "#1F2937", // Gray 800
      via: "#374151", // Gray 700
      to: "#4B5563", // Gray 600
    },

    // Blue gradient
    primary: {
      from: "#3B82F6", // Blue 500
      via: "#2563EB", // Blue 600
      to: "#1D4ED8", // Blue 700
    },

    // Indigo gradient
    secondary: {
      from: "#6366F1", // Indigo 500
      via: "#4F46E5", // Indigo 600
      to: "#4338CA", // Indigo 700
    },
  },
};

export default TailwindColours;
