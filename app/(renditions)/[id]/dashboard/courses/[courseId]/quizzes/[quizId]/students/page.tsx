import { Students as R1 } from "@/components/renditions/r1/Pages";
import { Students as R2 } from "@/components/renditions/r2/Pages";
import { Students as R3 } from "@/components/renditions/r3/Pages";
import { Students as R4 } from "@/components/renditions/r4/Pages";
import { Students as R5 } from "@/components/renditions/r5/Pages";

const map: Record<string, React.ComponentType<{ courseId: string; quizId: string }>> = { "1": R1, "2": R2, "3": R3, "4": R4, "5": R5 };

export default async function Page({ params }: { params: Promise<{ id: string; courseId: string; quizId: string }> }) {
  const { id, courseId, quizId } = await params;
  const C = map[id];
  return C ? <C courseId={courseId} quizId={quizId} /> : null;
}
