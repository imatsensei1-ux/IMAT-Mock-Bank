export interface Question {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  year_style: string;
  question_type: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  concepts_tested: string[];
  formulas_used: string[];
  common_trap: string;
  image_required: boolean;
  image_description: string;
  time_estimate_seconds: number;
  marks: number;
  negative_marks: number;
  source_reference: string;
  mur_aligned: boolean;
}

export interface QuizAttempt {
  id: string;
  date: string;
  subject: string;
  chapter: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  blankAnswers: number;
  timeTaken: number;
  questions: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
    timeSpent: number;
  }[];
}

export interface MockExam {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  blankAnswers: number;
  timeTaken: number;
  subjectBreakdown: {
    subject: string;
    correct: number;
    total: number;
  }[];
}

export interface UserProgress {
  username: string;
  email: string;
  targetYear: string;
  dreamUniversity: string;
  dailyGoal: number;
  quizAttempts: QuizAttempt[];
  mockExams: MockExam[];
  chapterProgress: Record<string, {
    completed: number;
    total: number;
    correct: number;
  }>;
}

export interface SubjectInfo {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  chapters: string[];
}
