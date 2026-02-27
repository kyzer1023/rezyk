import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  redirect(routes.course(courseId, { view: "quiz-analysis" }));
}
