import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  courseState: string;
}

interface ClassroomStudent {
  userId: string;
  profile?: { name?: { fullName?: string }; emailAddress?: string };
}

export async function POST() {
  try {
    const { session, googleAccessToken } = await requireAuth();

    const coursesRes = await fetch(
      "https://classroom.googleapis.com/v1/courses?teacherId=me&courseStates=ACTIVE",
      { headers: { Authorization: `Bearer ${googleAccessToken}` } },
    );
    if (!coursesRes.ok) {
      const err = await coursesRes.json();
      return NextResponse.json({ error: err.error?.message ?? "Failed to fetch courses" }, { status: coursesRes.status });
    }

    const coursesData = await coursesRes.json();
    const courses: ClassroomCourse[] = coursesData.courses ?? [];
    const now = Date.now();
    const batch = adminDb.batch();
    const synced: { courseId: string; name: string; studentCount: number }[] = [];

    for (const course of courses) {
      let studentCount = 0;
      try {
        const studentsRes = await fetch(
          `https://classroom.googleapis.com/v1/courses/${course.id}/students`,
          { headers: { Authorization: `Bearer ${googleAccessToken}` } },
        );
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          const students: ClassroomStudent[] = studentsData.students ?? [];
          studentCount = students.length;
        }
      } catch {
        // roster read may fail for permissions; continue with count=0
      }

      const ref = adminDb.collection("courses").doc(course.id);
      batch.set(ref, {
        courseId: course.id,
        ownerId: session.sub,
        name: course.name,
        section: course.section ?? null,
        courseState: course.courseState,
        studentCount,
        lastSynced: now,
      }, { merge: true });

      synced.push({ courseId: course.id, name: course.name, studentCount });
    }

    await batch.commit();
    return NextResponse.json({ success: true, courses: synced });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = msg === "MISSING_AUTH" || msg === "RECONNECT_REQUIRED" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
