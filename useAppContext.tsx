import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserProgress, QuizAttempt, MockExam } from '../types';
import { allQuestions } from '../data/questions';

interface AppContextType {
  progress: UserProgress;
  saveQuizAttempt: (attempt: QuizAttempt) => void;
  saveMockExam: (exam: MockExam) => void;
  updateChapterProgress: (subject: string, chapter: string, completed: number, total: number, correct: number) => void;
  updateSettings: (settings: Partial<UserProgress>) => void;
  resetProgress: () => void;
  getFilteredQuestions: (subject?: string, chapter?: string, limit?: number) => typeof allQuestions;
}

const defaultProgress: UserProgress = {
  username: 'IMAT Student',
  email: '',
  targetYear: '2026',
  dreamUniversity: 'University of Milan',
  dailyGoal: 20,
  quizAttempts: [],
  mockExams: [],
  chapterProgress: {},
};

function loadProgress(): UserProgress {
  try {
    const saved = localStorage.getItem('imat-progress');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { ...defaultProgress };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    localStorage.setItem('imat-progress', JSON.stringify(progress));
  }, [progress]);

  const saveQuizAttempt = useCallback((attempt: QuizAttempt) => {
    setProgress(prev => ({
      ...prev,
      quizAttempts: [attempt, ...prev.quizAttempts].slice(0, 500),
    }));
  }, []);

  const saveMockExam = useCallback((exam: MockExam) => {
    setProgress(prev => ({
      ...prev,
      mockExams: [exam, ...prev.mockExams].slice(0, 100),
    }));
  }, []);

  const updateChapterProgress = useCallback((subject: string, chapter: string, completed: number, total: number, correct: number) => {
    const key = `${subject}-${chapter}`;
    setProgress(prev => ({
      ...prev,
      chapterProgress: {
        ...prev.chapterProgress,
        [key]: { completed, total, correct },
      },
    }));
  }, []);

  const updateSettings = useCallback((settings: Partial<UserProgress>) => {
    setProgress(prev => ({ ...prev, ...settings }));
  }, []);

  const resetProgress = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      setProgress({ ...defaultProgress });
      localStorage.removeItem('imat-progress');
    }
  }, []);

  const getFilteredQuestions = useCallback((subject?: string, chapter?: string, limit?: number) => {
    let filtered = [...allQuestions];
    if (subject) filtered = filtered.filter(q => q.subject === subject);
    if (chapter) filtered = filtered.filter(q => q.chapter === chapter);
    if (limit && limit > 0) filtered = filtered.slice(0, limit);
    return filtered;
  }, []);

  return (
    <AppContext.Provider value={{
      progress, saveQuizAttempt, saveMockExam,
      updateChapterProgress, updateSettings, resetProgress, getFilteredQuestions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
