import type { RiskLevel } from "./types";

export interface RenditionTheme {
  id: string;
  name: string;
  tagline: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  text: string;
  textSecondary: string;
  muted: string;
  headingFont: string;
  navBg: string;
  navText: string;
  navActive: string;
  risk: Record<RiskLevel, { bg: string; text: string }>;
}

export const themes: Record<string, RenditionTheme> = {
  "1": {
    id: "1",
    name: "Warm Parchment",
    tagline: "Serif headings, earth tones, left sidebar",
    bg: "#FAF6F0",
    cardBg: "#FFFFFF",
    cardBorder: "#E8DFD4",
    accent: "#C17A56",
    accentHover: "#A96842",
    accentLight: "rgba(193,122,86,0.08)",
    text: "#3D3229",
    textSecondary: "#8A7D6F",
    muted: "#B5AA9C",
    headingFont: "Georgia, serif",
    navBg: "#FFFFFF",
    navText: "#8A7D6F",
    navActive: "#C17A56",
    risk: {
      critical: { bg: "#FBEAE5", text: "#A63D2E" },
      high: { bg: "#FDF0E1", text: "#A25E1A" },
      medium: { bg: "#FEF8E7", text: "#8B6914" },
      low: { bg: "#E9F3E5", text: "#3D7A2E" },
    },
  },
  "2": {
    id: "2",
    name: "Ocean Clarity",
    tagline: "Top nav bar, cool blues, clean grid layouts",
    bg: "#F0F5FA",
    cardBg: "#FFFFFF",
    cardBorder: "#D6E4F0",
    accent: "#2563EB",
    accentHover: "#1D4ED8",
    accentLight: "rgba(37,99,235,0.06)",
    text: "#1E293B",
    textSecondary: "#64748B",
    muted: "#94A3B8",
    headingFont: "'Segoe UI', system-ui, sans-serif",
    navBg: "#1B3A5C",
    navText: "#CBD5E1",
    navActive: "#FFFFFF",
    risk: {
      critical: { bg: "#FEE2E2", text: "#B91C1C" },
      high: { bg: "#FEF3C7", text: "#B45309" },
      medium: { bg: "#FEF9C3", text: "#A16207" },
      low: { bg: "#DCFCE7", text: "#15803D" },
    },
  },
  "3": {
    id: "3",
    name: "Forest Calm",
    tagline: "Icon sidebar, green palette, split panels",
    bg: "#F2F5F0",
    cardBg: "#FFFFFF",
    cardBorder: "#D5DDD0",
    accent: "#2D6A4F",
    accentHover: "#1B4332",
    accentLight: "rgba(45,106,79,0.07)",
    text: "#2D3B2D",
    textSecondary: "#5C6B5C",
    muted: "#8A9A8A",
    headingFont: "'Segoe UI', system-ui, sans-serif",
    navBg: "#1B3830",
    navText: "#A7C4A0",
    navActive: "#FFFFFF",
    risk: {
      critical: { bg: "#FCE4EC", text: "#C62828" },
      high: { bg: "#FFF3E0", text: "#E65100" },
      medium: { bg: "#FFFDE7", text: "#F57F17" },
      low: { bg: "#E8F5E9", text: "#2E7D32" },
    },
  },
  "4": {
    id: "4",
    name: "Sunset Glow",
    tagline: "Bottom tabs, warm gradients, mobile-first feel",
    bg: "#FFF8F0",
    cardBg: "#FFFFFF",
    cardBorder: "#F0E0D0",
    accent: "#E8725C",
    accentHover: "#D4604C",
    accentLight: "rgba(232,114,92,0.08)",
    text: "#4A3728",
    textSecondary: "#8B7355",
    muted: "#BCA78E",
    headingFont: "'Nunito', 'Segoe UI', system-ui, sans-serif",
    navBg: "#FFFFFF",
    navText: "#BCA78E",
    navActive: "#E8725C",
    risk: {
      critical: { bg: "#FFE0DB", text: "#C0392B" },
      high: { bg: "#FFE8CC", text: "#D35400" },
      medium: { bg: "#FFF5D6", text: "#C78C06" },
      low: { bg: "#DFF5E3", text: "#27AE60" },
    },
  },
  "5": {
    id: "5",
    name: "Slate Professional",
    tagline: "Dark header, indigo accents, dense data tables",
    bg: "#F8F9FB",
    cardBg: "#FFFFFF",
    cardBorder: "#E2E5EA",
    accent: "#6366F1",
    accentHover: "#4F46E5",
    accentLight: "rgba(99,102,241,0.06)",
    text: "#111827",
    textSecondary: "#6B7280",
    muted: "#9CA3AF",
    headingFont: "'Inter', system-ui, sans-serif",
    navBg: "#1F2937",
    navText: "#9CA3AF",
    navActive: "#FFFFFF",
    risk: {
      critical: { bg: "#FEE2E2", text: "#991B1B" },
      high: { bg: "#FFEDD5", text: "#9A3412" },
      medium: { bg: "#FEF3C7", text: "#92400E" },
      low: { bg: "#D1FAE5", text: "#065F46" },
    },
  },
};

export const VALID_IDS = ["1", "2", "3", "4", "5"] as const;

export function renditionRoutes(id: string) {
  const p = `/${id}`;
  return {
    landing: () => p,
    onboarding: () => `${p}/onboarding`,
    dashboard: () => `${p}/dashboard`,
    courses: () => `${p}/dashboard/courses`,
    course: (courseId: string) => `${p}/dashboard/courses/${courseId}`,
    quizzes: (courseId: string) => `${p}/dashboard/courses/${courseId}/quizzes`,
    sync: (courseId: string, quizId: string) =>
      `${p}/dashboard/courses/${courseId}/quizzes/${quizId}/sync`,
    analysis: (courseId: string, quizId: string) =>
      `${p}/dashboard/courses/${courseId}/quizzes/${quizId}/analysis`,
    insights: (courseId: string, quizId: string) =>
      `${p}/dashboard/courses/${courseId}/quizzes/${quizId}/insights`,
    students: (courseId: string, quizId: string) =>
      `${p}/dashboard/courses/${courseId}/quizzes/${quizId}/students`,
    studentDetail: (courseId: string, quizId: string, studentId: string) =>
      `${p}/dashboard/courses/${courseId}/quizzes/${quizId}/students/${studentId}`,
    history: (courseId: string) => `${p}/dashboard/courses/${courseId}/history`,
    settings: () => `${p}/settings`,
    error: () => `${p}/error`,
    hub: () => "/",
  };
}
