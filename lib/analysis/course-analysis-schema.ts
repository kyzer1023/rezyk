import type { JsonSchemaObject } from "@/lib/gemini";

export interface CourseAnalysisResult {
  topWeakConcepts: { concept: string; frequency: number; quizIds: string[] }[];
  rootCauses: string[];
  contentCoverage: { taught: string[]; assessed: string[]; gaps: string[] };
  difficultyProgression: string;
  misconceptionRecurrence: { concept: string; quizCount: number }[];
  assessmentBalance: { conceptual: number; procedural: number; application: number };
  interventionOpportunities: string[];
  overallAssessment: string;
}

export const CourseAnalysisGenerationSchema: JsonSchemaObject = {
  type: "object",
  required: [
    "topWeakConcepts", "rootCauses", "contentCoverage",
    "difficultyProgression", "misconceptionRecurrence",
    "assessmentBalance", "interventionOpportunities", "overallAssessment",
  ],
  properties: {
    topWeakConcepts: {
      type: "array",
      items: {
        type: "object",
        required: ["concept", "frequency"],
        properties: {
          concept: { type: "string" },
          frequency: { type: "number", description: "Number of quizzes where this concept appeared as weak." },
        },
      },
      description: "Top 3-7 weak concepts across all quizzes in the course.",
    },
    rootCauses: {
      type: "array",
      items: { type: "string" },
      description: "2-4 likely root causes at the course level for recurring gaps.",
    },
    contentCoverage: {
      type: "object",
      required: ["taught", "assessed", "gaps"],
      properties: {
        taught: { type: "array", items: { type: "string" }, description: "Concepts covered in quiz materials." },
        assessed: { type: "array", items: { type: "string" }, description: "Concepts actually tested in quizzes." },
        gaps: { type: "array", items: { type: "string" }, description: "Concepts under-covered or not assessed." },
      },
    },
    difficultyProgression: {
      type: "string",
      description: "Assessment of how quiz difficulty progresses across the course sequence.",
    },
    misconceptionRecurrence: {
      type: "array",
      items: {
        type: "object",
        required: ["concept", "quizCount"],
        properties: {
          concept: { type: "string" },
          quizCount: { type: "number" },
        },
      },
      description: "Concepts that recur as weak across multiple quizzes.",
    },
    assessmentBalance: {
      type: "object",
      required: ["conceptual", "procedural", "application"],
      properties: {
        conceptual: { type: "number", description: "Percentage of questions testing conceptual understanding." },
        procedural: { type: "number", description: "Percentage testing procedural skills." },
        application: { type: "number", description: "Percentage testing real-world application." },
      },
    },
    interventionOpportunities: {
      type: "array",
      items: { type: "string" },
      description: "3-5 specific content areas to reinforce in the next teaching cycle.",
    },
    overallAssessment: {
      type: "string",
      description: "2-3 sentence overall assessment of the course's material effectiveness.",
    },
  },
};

export function buildCourseAnalysisPrompt(courseData: {
  courseName: string;
  quizzes: {
    title: string;
    questions: { title: string; questionType: string }[];
    analysisConceptHeatmap?: { concept: string; affectedStudentCount: number; dominantErrorType: string }[];
    analysisErrorBreakdown?: { errorType: string; percentage: number }[];
    scoreMetrics?: { averageScore: number; medianScore: number };
  }[];
}): string {
  return [
    "You are a curriculum analyst evaluating course-wide material effectiveness for a teacher.",
    "Return strict JSON only, no markdown fences.",
    "",
    "Analyze all quiz data for this course and evaluate:",
    "1. Content coverage: which concepts are taught vs assessed, what gaps exist",
    "2. Difficulty progression: how quiz complexity evolves across the sequence",
    "3. Misconception recurrence: concepts repeatedly weak across quizzes",
    "4. Assessment balance: conceptual vs procedural vs application emphasis",
    "5. Intervention opportunities: what content to reinforce next cycle",
    "",
    "Be specific, reference actual concept names from the data.",
    "Keep outputs teacher-readable and actionable.",
    "",
    "Course data:",
    JSON.stringify(courseData, null, 2),
  ].join("\n");
}
