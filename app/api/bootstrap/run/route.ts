import { NextResponse } from "next/server";
import { getUserProfile, updateBootstrapState } from "@/lib/auth/token-store";
import { requireAuth } from "@/lib/requireAuth";

export const runtime = "nodejs";

type BootstrapMode = "initial" | "refresh";

interface BootstrapRunBody {
  mode?: BootstrapMode;
  analyzeLimit?: number;
}

interface SyncCourse {
  courseId: string;
  name: string;
  studentCount: number;
}

interface SyncCoursesResponse {
  success?: boolean;
  courses?: SyncCourse[];
  error?: string;
}

interface SyncQuizResponse {
  success?: boolean;
  quizzes?: Array<{
    title: string;
    formId: string;
    questionCount: number;
    responseCount: number;
  }>;
  error?: string;
}

interface DashboardQuiz {
  id: string;
  courseId: string;
  title: string;
  responseCount: number;
  analysisStatus: "not_started" | "running" | "completed" | "error";
}

interface DashboardQuizzesResponse {
  quizzes?: DashboardQuiz[];
  error?: string;
}

interface AnalyzeResponse {
  success?: boolean;
  error?: string;
}

function parseRunBody(payload: unknown): BootstrapRunBody {
  if (!payload || typeof payload !== "object") {
    return {};
  }
  const result = payload as BootstrapRunBody;
  return {
    mode: result.mode === "refresh" ? "refresh" : "initial",
    analyzeLimit:
      typeof result.analyzeLimit === "number" ? result.analyzeLimit : undefined,
  };
}

function resolveAnalyzeLimit(
  mode: BootstrapMode,
  requestedLimit: number | undefined,
): number {
  if (typeof requestedLimit === "number" && requestedLimit >= 0) {
    return Math.floor(requestedLimit);
  }
  return mode === "initial" ? 1 : 0;
}

function getAuthHeaders(req: Request): HeadersInit {
  const cookie = req.headers.get("cookie");
  if (!cookie) {
    return {};
  }
  return { cookie };
}

function getJsonAuthHeaders(req: Request): HeadersInit {
  const base = getAuthHeaders(req);
  return {
    ...base,
    "Content-Type": "application/json",
  };
}

async function readJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { session } = await requireAuth();
    const profile = await getUserProfile(session.sub);

    if (!profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    if (profile.bootstrapStatus === "syncing") {
      return NextResponse.json(
        {
          success: false,
          message: "Bootstrap is already running",
        },
        { status: 409 },
      );
    }

    const parsedBody = parseRunBody(await req.json().catch(() => ({})));
    const mode: BootstrapMode = parsedBody.mode ?? "initial";
    const analyzeLimit = resolveAnalyzeLimit(mode, parsedBody.analyzeLimit);
    const origin = new URL(req.url).origin;
    const authHeaders = getAuthHeaders(req);
    const jsonHeaders = getJsonAuthHeaders(req);

    await updateBootstrapState(session.sub, {
      bootstrapStatus: "syncing",
      lastBootstrapError: null,
    });

    const courseSyncRes = await fetch(`${origin}/api/sync/courses`, {
      method: "POST",
      headers: authHeaders,
      cache: "no-store",
    });
    const courseSyncPayload = await readJson<SyncCoursesResponse>(courseSyncRes);

    if (!courseSyncRes.ok) {
      throw new Error(courseSyncPayload?.error ?? "Failed to sync courses");
    }

    const courses = courseSyncPayload?.courses ?? [];
    const courseErrors: string[] = [];
    let syncedQuizCount = 0;

    for (const course of courses) {
      const quizSyncRes = await fetch(`${origin}/api/sync/quiz`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ courseId: course.courseId }),
        cache: "no-store",
      });
      const quizSyncPayload = await readJson<SyncQuizResponse>(quizSyncRes);

      if (!quizSyncRes.ok) {
        courseErrors.push(
          `${course.name}: ${quizSyncPayload?.error ?? "Quiz sync failed"}`,
        );
        continue;
      }

      syncedQuizCount += quizSyncPayload?.quizzes?.length ?? 0;
    }

    let analysisTriggered = 0;
    let analysisFailed = 0;

    if (analyzeLimit > 0) {
      const quizzesRes = await fetch(`${origin}/api/dashboard/quizzes`, {
        method: "GET",
        headers: authHeaders,
        cache: "no-store",
      });
      const quizzesPayload = await readJson<DashboardQuizzesResponse>(quizzesRes);
      const allQuizzes = quizzesPayload?.quizzes ?? [];

      if (quizzesRes.ok && allQuizzes.length > 0) {
        const analysisCandidates = allQuizzes
          .filter(
            (quiz) =>
              quiz.analysisStatus !== "completed" && quiz.responseCount > 0,
          )
          .sort((a, b) => b.responseCount - a.responseCount)
          .slice(0, analyzeLimit);

        for (const candidate of analysisCandidates) {
          const analysisRes = await fetch(`${origin}/api/analyze/run`, {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify({
              courseId: candidate.courseId,
              quizId: candidate.id,
            }),
            cache: "no-store",
          });
          const analysisPayload = await readJson<AnalyzeResponse>(analysisRes);

          if (analysisRes.ok && analysisPayload?.success) {
            analysisTriggered += 1;
          } else {
            analysisFailed += 1;
          }
        }
      }
    }

    const now = Date.now();
    const hadExistingData = profile.hasInitialSync ?? false;
    const hasSyncedData =
      hadExistingData || courses.length > 0 || syncedQuizCount > 0;

    if (courseErrors.length > 0) {
      await updateBootstrapState(session.sub, {
        bootstrapStatus: "error",
        hasInitialSync: hasSyncedData,
        lastAutoSyncAt: now,
        lastBootstrapError: `Some courses failed to sync: ${courseErrors.join(" | ")}`,
      });

      return NextResponse.json({
        success: false,
        partial: true,
        mode,
        summary: {
          coursesSynced: courses.length,
          quizzesSynced: syncedQuizCount,
          analysisTriggered,
          analysisFailed,
        },
        errors: courseErrors,
      });
    }

    await updateBootstrapState(session.sub, {
      bootstrapStatus: "completed",
      hasInitialSync: true,
      lastAutoSyncAt: now,
      lastBootstrapError:
        analysisFailed > 0
          ? `${analysisFailed} seed analysis run(s) failed`
          : "",
    });

    return NextResponse.json({
      success: true,
      mode,
      summary: {
        coursesSynced: courses.length,
        quizzesSynced: syncedQuizCount,
        analysisTriggered,
        analysisFailed,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    try {
      const { session } = await requireAuth();
      await updateBootstrapState(session.sub, {
        bootstrapStatus: "error",
        lastBootstrapError: msg,
      });
    } catch {
      // no-op
    }
    const status = msg === "MISSING_AUTH" || msg === "RECONNECT_REQUIRED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
