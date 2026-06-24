import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Clock, Pause, Play, RotateCcw, Home, AlertTriangle, ChevronRight } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

export default function Quiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getFilteredQuestions, saveQuizAttempt, updateChapterProgress } = useAppContext();

  const subject = searchParams.get('subject') || '';
  const chapter = searchParams.get('chapter') || '';
  const isMock = searchParams.get('mock') === 'true';
  const mockId = searchParams.get('mockId') || '';

  const [questions, setQuestions] = useState<ReturnType<typeof getFilteredQuestions>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const startTimeRef = useRef<number>(0);
  const qStartTimeRef = useRef<number>(0);

  useEffect(() => {
    let qs = getFilteredQuestions(subject || undefined, chapter || undefined);
    if (qs.length === 0) qs = getFilteredQuestions();
    // Shuffle for variety
    qs = [...qs].sort(() => Math.random() - 0.5);
    // Limit to reasonable number for chapter quiz
    if (!isMock) qs = qs.slice(0, Math.min(50, qs.length));
    setQuestions(qs);
    setTimeLeft(qs.length * 90); // 90s per question default
  }, [subject, chapter, isMock, mockId, getFilteredQuestions]);

  useEffect(() => {
    if (!quizStarted || quizFinished || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { finishQuiz(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizStarted, quizFinished, isPaused]);

  const startQuiz = () => {
    setQuizStarted(true);
    startTimeRef.current = Date.now();
    qStartTimeRef.current = Date.now();
  };

  const selectAnswer = (optionIndex: number) => {
    if (showExplanation || quizFinished) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    setShowExplanation(true);
    const elapsed = Math.round((Date.now() - qStartTimeRef.current) / 1000);
    setQuestionTimes(prev => ({ ...prev, [currentIndex]: elapsed }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExplanation(false);
      qStartTimeRef.current = Date.now();
    } else {
      finishQuiz();
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const finishQuiz = useCallback(() => {
    if (quizFinished) return;
    setQuizFinished(true);
    const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);

    let correct = 0, wrong = 0, blank = 0;
    const attemptQuestions = questions.map((q, i) => {
      const selected = selectedAnswers[i];
      const isCorrect = selected === q.correct_index;
      if (selected === undefined) blank++;
      else if (isCorrect) correct++;
      else wrong++;
      return {
        questionId: q.id,
        selectedOption: selected ?? -1,
        isCorrect: isCorrect,
        timeSpent: questionTimes[i] || 0,
      };
    });

    const score = (correct * 1.5) - (wrong * 0.4);
    const attempt = {
      id: `quiz-${Date.now()}`,
      date: new Date().toISOString(),
      subject: subject || 'Mixed',
      chapter: chapter || 'Mixed',
      score: Math.max(0, score),
      totalQuestions: questions.length,
      correctAnswers: correct,
      wrongAnswers: wrong,
      blankAnswers: blank,
      timeTaken: totalTime,
      questions: attemptQuestions,
    };
    saveQuizAttempt(attempt);
    if (subject && chapter) {
      updateChapterProgress(subject, chapter, correct + wrong, questions.length, correct);
    }
  }, [quizFinished, questions, selectedAnswers, questionTimes, subject, chapter, saveQuizAttempt, updateChapterProgress]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="text-slate-400">Loading questions...</div>
      </div>
    );
  }

  // Start screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-2">{subject || 'Mixed Subject'}</h2>
          {chapter && <p className="text-amber-400 text-sm mb-4">{chapter}</p>}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Questions</span><span className="text-white">{questions.length}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Time Limit</span><span className="text-white">{formatTime(questions.length * 90)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Scoring</span><span className="text-white">+1.5 / -0.4 / 0</span></div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
            <p className="text-amber-300 text-xs flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Each wrong answer costs 0.4 marks. Skip if unsure!</p>
          </div>
          <button onClick={startQuiz} className="w-full bg-amber-500 hover:bg-amber-400 text-[#0A1628] font-bold py-3 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> Start Quiz
          </button>
          <button onClick={() => navigate('/dashboard')} className="w-full mt-3 text-slate-400 hover:text-white text-sm py-2 transition-colors flex items-center justify-center gap-1">
            <Home className="w-4 h-4" /> Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Results screen
  if (quizFinished) {
    const correct = questions.filter((q, i) => selectedAnswers[i] === q.correct_index).length;
    const wrong = questions.filter((q, i) => selectedAnswers[i] !== undefined && selectedAnswers[i] !== q.correct_index).length;
    const blank = questions.length - correct - wrong;
    const score = (correct * 1.5) - (wrong * 0.4);
    const percentage = Math.round((correct / questions.length) * 100);

    return (
      <div className="min-h-screen bg-[#0A1628] px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Quiz Complete!</h2>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-amber-400 mb-1">{score.toFixed(1)}</div>
              <div className="text-slate-400 text-sm">Predicted IMAT Score</div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <Check className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-emerald-400">{correct}</div>
                <div className="text-xs text-slate-400">Correct</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <X className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-red-400">{wrong}</div>
                <div className="text-xs text-slate-400">Wrong</div>
              </div>
              <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-slate-400">{blank}</div>
                <div className="text-xs text-slate-400">Blank</div>
              </div>
            </div>
            <div className="text-center text-sm text-slate-400 mb-6">Accuracy: {percentage}%</div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/dashboard')} className="flex-1 bg-white/10 hover:bg-white/15 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                <Home className="w-4 h-4" /> Dashboard
              </button>
              <button onClick={() => window.location.reload()} className="flex-1 bg-amber-500 hover:bg-amber-400 text-[#0A1628] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Retry
              </button>
            </div>
          </motion.div>

          {/* Question review */}
          <h3 className="text-white font-bold mb-3">Review Answers</h3>
          <div className="space-y-3">
            {questions.map((q, i) => {
              const selected = selectedAnswers[i];
              const isCorrect = selected === q.correct_index;
              const status = selected === undefined ? 'blank' : isCorrect ? 'correct' : 'wrong';
              return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${status === 'correct' ? 'bg-emerald-500 text-white' : status === 'wrong' ? 'bg-red-500 text-white' : 'bg-slate-600 text-white'}`}>
                      {status === 'correct' ? <Check className="w-3 h-3" /> : status === 'wrong' ? <X className="w-3 h-3" /> : '?'}
                    </div>
                    <div className="text-white text-sm">{q.question}</div>
                  </div>
                  <div className="ml-9 space-y-1">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className={`text-sm px-3 py-1.5 rounded-lg ${oi === q.correct_index ? 'bg-emerald-500/20 text-emerald-300' : oi === selected && !isCorrect ? 'bg-red-500/20 text-red-300' : 'text-slate-400'}`}>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="ml-9 mt-3 text-xs text-slate-400 bg-white/5 rounded-lg p-3">
                    <strong className="text-amber-400">Explanation:</strong> {q.explanation}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const currentQ = questions[currentIndex];
  const selected = selectedAnswers[currentIndex];
  const isAnswered = selected !== undefined;
  const isCorrect = selected === currentQ.correct_index;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-[#0A1628]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => { if (window.confirm('Quit quiz? Progress will be lost.')) navigate('/dashboard'); }} className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Quit
            </button>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className={`font-mono font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>{formatTime(timeLeft)}</span>
            </div>
            <button onClick={() => setIsPaused(!isPaused)} className="text-slate-400 hover:text-white">
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Q{currentIndex + 1}/{questions.length}</span>
            <span>{subject || 'Mixed'}</span>
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
            <div className="bg-[#0D1E36] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
              <Pause className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Quiz Paused</h3>
              <p className="text-slate-400 text-sm mb-6">Take a breather. You got this!</p>
              <button onClick={() => setIsPaused(false)} className="w-full bg-amber-500 hover:bg-amber-400 text-[#0A1628] font-bold py-3 rounded-xl mb-3">Resume</button>
              <button onClick={() => { if (window.confirm('Quit? Progress will be lost.')) navigate('/dashboard'); }} className="w-full text-red-400 hover:text-red-300 py-2 text-sm">Quit Quiz</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">{currentQ.difficulty}</span>
                <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded-full">{currentQ.question_type.replace('_', ' ')}</span>
                <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded-full">{currentQ.year_style}</span>
              </div>
              <h3 className="text-white text-lg font-medium whitespace-pre-line leading-relaxed">{currentQ.question}</h3>
            </div>

            <div className="space-y-2 mb-4">
              {currentQ.options.map((opt, oi) => {
                let btnClass = 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20';
                if (showExplanation || isAnswered) {
                  if (oi === currentQ.correct_index) btnClass = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
                  else if (oi === selected && oi !== currentQ.correct_index) btnClass = 'bg-red-500/20 border-red-500/40 text-red-300';
                  else btnClass = 'bg-white/3 border-white/5 text-slate-500';
                }
                return (
                  <button
                    key={oi}
                    onClick={() => selectAnswer(oi)}
                    disabled={showExplanation || isAnswered}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${btnClass} flex items-center gap-3`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${oi === selected ? (isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-white/10 text-slate-400'}`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="text-sm">{opt}</span>
                    {(showExplanation || isAnswered) && oi === currentQ.correct_index && <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />}
                    {(showExplanation || isAnswered) && oi === selected && oi !== currentQ.correct_index && <X className="w-4 h-4 text-red-400 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {(showExplanation || isAnswered) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mb-4">
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-amber-300 text-xs font-medium">Common Trap</p>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{currentQ.common_trap}</p>
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-emerald-400 text-xs font-medium mb-1">Explanation</p>
                      <p className="text-slate-300 text-sm">{currentQ.explanation}</p>
                    </div>
                    {currentQ.formulas_used.length > 0 && (
                      <div className="border-t border-white/10 pt-3 mt-3">
                        <p className="text-blue-400 text-xs font-medium mb-1">Formulas</p>
                        <div className="flex flex-wrap gap-2">
                          {currentQ.formulas_used.map((f, fi) => (
                            <span key={fi} className="bg-blue-500/10 text-blue-300 text-xs px-2 py-1 rounded">{f}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={nextQuestion}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-[#0A1628] font-bold px-6 py-2.5 rounded-xl text-sm transition-all hover:scale-105"
              >
                {currentIndex === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
