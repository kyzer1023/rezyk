interface QuizSummary {
  quizId: string;
  quizTitle: string;
  averageScore: number;
  medianScore: number;
  completionRate: number;
  studentCount: number;
  riskDistribution: Array<{ riskLevel: string; count: number; percentage: number }>;
  conceptHeatmap: Array<{ concept: string; affectedStudentCount: number; dominantErrorType: string }>;
  errorTypeBreakdown: Array<{ errorType: string; count: number; percentage: number }>;
}

export interface CourseAnalysisPromptInput {
  courseName: string;
  courseId: string;
  quizSummaries: QuizSummary[];
}

export function buildCourseAnalysisPrompt(input: CourseAnalysisPromptInput): string {
  return [
    "You are a course-level education analyst. Analyze all available quiz data for this course and provide comprehensive course-wide insights.",
    "Return strict JSON only, no markdown fences.",
    "",
    "You must evaluate the following criteria:",
    "1. Content coverage: which key concepts are taught vs assessed",
    "2. Alignment: how well materials align with quiz concepts/outcomes",
    "3. Difficulty progression: sequence from foundational to advanced",
    "4. Misconception recurrence: concepts repeatedly weak across quizzes",
    "5. Assessment balance: conceptual vs procedural vs application emphasis",
    "6. Engagement/participation proxies: completion/submission patterns",
    "7. Gaps: under-covered and over-weighted concepts",
    "8. Intervention opportunities: what content should be reinforced",
    "",
    "Requirements:",
    "- topWeakConcepts: list concepts weak across multiple quizzes with affected counts",
    "- rootCauses: likely root causes at course level (2-4 items)",
    "- trendDirection: overall trend based on quiz sequence (improving/stable/declining/insufficient_data)",
    "- trendConfidence: low/medium/high",
    "- contentCoverage: taughtConcepts, assessedConcepts, gaps",
    "- alignmentScore: strong/moderate/weak/insufficient_data",
    "- difficultyProgression: well_sequenced/adequate/poorly_sequenced/insufficient_data",
    "- misconceptionRecurrence: concepts appearing in multiple quiz analyses",
    "- assessmentBalance: percentage split (conceptual/procedural/application, must sum to 100)",
    "- engagementProxies: averageCompletionRate across quizzes, submissionPattern description",
    "- underCoveredConcepts: concepts needing more attention",
    "- overWeightedConcepts: concepts over-assessed relative to importance",
    "- interventionOpportunities: specific content to reinforce next cycle (3-5 items)",
    "- prioritizedActions: 3-5 actionable teacher steps, short and practical",
    "- If data is insufficient for any area, include reasons in insufficientDataReasons",
    "",
    "Keep outputs teacher-readable, operational, and evidence-based.",
    "Do not claim strong causality; phrase as evidence-based hypotheses.",
    "",
    "Course Data:",
    JSON.stringify(input, null, 2),
  ].join("\n");
}
