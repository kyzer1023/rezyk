export type QuizWorkspaceView = "sync" | "analysis" | "insights" | "students";
export type CourseDetailView = "quizzes" | "course-analysis" | "quiz-analysis";

interface QuizWorkspaceOptions {
  view?: QuizWorkspaceView;
  studentId?: string;
}

interface CourseDetailOptions {
  view?: CourseDetailView;
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

function buildCoursePath(courseId: string, options?: CourseDetailOptions): string {
  const params = new URLSearchParams();
  if (options?.view && options.view !== "quizzes") {
    params.set("view", options.view);
  }
  const query = params.toString();
  return `/dashboard/courses/${courseId}${query ? `?${query}` : ""}`;
}

export const routes = {
  landing: () => "/",
  authCallback: () => "/auth/callback",
  onboardingIntegrations: () => "/onboarding/integrations",
  dashboard: () => "/dashboard",
  courses: () => "/dashboard/courses",
  course: (courseId: string, options?: CourseDetailOptions) => buildCoursePath(courseId, options),
  quizzes: (courseId: string) => `/dashboard/courses/${courseId}/quizzes`,
  quizWorkspace: (
    courseId: string,
    quizId: string,
    options?: QuizWorkspaceOptions,
  ) => buildQuizWorkspacePath(courseId, quizId, options),
  sync: (courseId: string, quizId: string) =>
    buildQuizWorkspacePath(courseId, quizId, { view: "analysis" }),
  analysis: (courseId: string, quizId: string) =>
    buildQuizWorkspacePath(courseId, quizId, { view: "analysis" }),
  insights: (courseId: string, quizId: string) =>
    buildQuizWorkspacePath(courseId, quizId, { view: "insights" }),
  students: (courseId: string, quizId: string) =>
    buildQuizWorkspacePath(courseId, quizId, { view: "students" }),
  studentDetail: (courseId: string, quizId: string, studentId: string) =>
    buildQuizWorkspacePath(courseId, quizId, { view: "students", studentId }),
  history: (courseId: string) => buildCoursePath(courseId, { view: "quiz-analysis" }),
  courseAnalysis: (courseId: string) => buildCoursePath(courseId, { view: "course-analysis" }),
  settings: () => "/settings",
  error: () => "/error",
};
