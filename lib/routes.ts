export type QuizWorkspaceView = "sync" | "analysis" | "insights" | "students";

interface QuizWorkspaceOptions {
  view?: QuizWorkspaceView;
  studentId?: string;
}

function buildQuizWorkspacePath(
  courseId: string,
  quizId: string,
  options?: QuizWorkspaceOptions,
): string {
  const params = new URLSearchParams();
  if (options?.view) {
    params.set("view", options.view);
  }
  if (options?.view === "students" && options.studentId) {
    params.set("studentId", options.studentId);
  }

  const query = params.toString();
  return `/dashboard/courses/${courseId}/quizzes/${quizId}${query ? `?${query}` : ""}`;
}

export const routes = {
  landing: () => "/",
  authCallback: () => "/auth/callback",
  onboardingIntegrations: () => "/onboarding/integrations",
  dashboard: () => "/dashboard",
  courses: () => "/dashboard/courses",
  course: (courseId: string) => `/dashboard/courses/${courseId}`,
  quizzes: (courseId: string) => `/dashboard/courses/${courseId}/quizzes`,
  quizWorkspace: (
    courseId: string,
    quizId: string,
    options?: QuizWorkspaceOptions,
  ) => buildQuizWorkspacePath(courseId, quizId, options),
  sync: (courseId: string, quizId: string) =>
    buildQuizWorkspacePath(courseId, quizId, { view: "sync" }),
  analysis: (courseId: string, quizId: string) =>
    buildQuizWorkspacePath(courseId, quizId, { view: "analysis" }),
  insights: (courseId: string, quizId: string) =>
    buildQuizWorkspacePath(courseId, quizId, { view: "insights" }),
  students: (courseId: string, quizId: string) =>
    buildQuizWorkspacePath(courseId, quizId, { view: "students" }),
  studentDetail: (courseId: string, quizId: string, studentId: string) =>
    buildQuizWorkspacePath(courseId, quizId, { view: "students", studentId }),
  history: (courseId: string) => `/dashboard/courses/${courseId}/history`,
  settings: () => "/settings",
  error: () => "/error",
};
