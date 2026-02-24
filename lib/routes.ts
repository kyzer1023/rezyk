export const routes = {
  landing: () => "/",
  authCallback: () => "/auth/callback",
  onboardingIntegrations: () => "/onboarding/integrations",
  dashboard: () => "/dashboard",
  courses: () => "/dashboard/courses",
  course: (courseId: string) => `/dashboard/courses/${courseId}`,
  quizzes: (courseId: string) => `/dashboard/courses/${courseId}/quizzes`,
  sync: (courseId: string, quizId: string) =>
    `/dashboard/courses/${courseId}/quizzes/${quizId}/sync`,
  analysis: (courseId: string, quizId: string) =>
    `/dashboard/courses/${courseId}/quizzes/${quizId}/analysis`,
  insights: (courseId: string, quizId: string) =>
    `/dashboard/courses/${courseId}/quizzes/${quizId}/insights`,
  students: (courseId: string, quizId: string) =>
    `/dashboard/courses/${courseId}/quizzes/${quizId}/students`,
  studentDetail: (courseId: string, quizId: string, studentId: string) =>
    `/dashboard/courses/${courseId}/quizzes/${quizId}/students/${studentId}`,
  history: (courseId: string) => `/dashboard/courses/${courseId}/history`,
  settings: () => "/settings",
  error: () => "/error",
};
