import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Clock, Pause, Play, RotateCcw, Home, AlertTriangle, ChevronRight, Flag } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { allQuestions } from '../data/questions';
import { mockExamStructure } from '../data/subjects';

export default function MockExam() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { saveMockExam } = useAppContext();
  const mockId = searchParams.get('id') || '1';

  const [questions, setQuestions] = useState<typeof allQuestions>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(mockExamStructure.timeMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const startTimeRef = useRef<number>(0);
  const qStartTimeRef = useRef<number>(0);

  useEffect(() => {
    // Build a mock exam with proper subject distribution
    const bioQs = shuffle(allQuestions.filter(q => q.subject === 'Biology')).slice(0, mockExamStructure.biology);
    const chemQs = shuffle(allQuestions.filter(q => q.subject === 'Chemistry')).slice(0, mockExamStructure.chemistry);
    const physQs = shuffle(allQuestions.filter(q => q.subject === 'Physics')).slice(0, mockExamStructure.physics);
    const mathQs = shuffle(allQuestions.filter(q => q.subject === 'Mathematics')).slice(0, mockExamStructure.mathematics);
    const logicQs = shuffle(allQuestions.filter(q => q.subject === 'Logical Reasoning')).slice(0, mockExamStructure.logicalReasoning);
    const gkQs = shuffle(allQuestions.filter(q => q.subject === 'General Knowledge')).slice(0, mockExamStructure.generalKnowledge);
    const allMockQs = shuffle([...bioQs, ...chemQs, ...physQs, ...mathQs, ...logicQs, ...gkQs]);
    setQuestions(allMockQs);
  }, [mockId]);

  useEffect(() => {
    if (!examStarted || examFinished || isPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { finishExam(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, examFinished, isPaused]);

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const startExam = () => {
    setExamStarted(true);
    startTimeRef.current = Date.now();
    qStartTimeRef.current = Date.now();
  };

  const selectAnswer = (optionIndex: number) => {
    if (showExplanation || examFinished) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    setShowExplanation(true);
  };

  const goToQuestion = (idx: number) => {
    setCurrentIndex(idx);
    setShowExplanation(false);
    setShowNavigator(false);
    qStartTimeRef.current = Date.now();
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) goToQuestion(currentIndex - 1);
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  const finishExam = useCallback(() => {
    if (examFinished) return;
    setExamFinished(true);
    const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);

    let correct = 0, wrong = 0, blank = 0;
    const subjectBreakdown: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q, i) => {
      const selected = selectedAnswers[i];
      const isCorrect = selected === q.correct_index;
      if (!subjectBreakdown[q.subject]) subjectBreakdown[q.subject] = { correct: 0, total: 0 };
      subjectBreakdown[q.subject].total++;
      if (selected === undefined) blank++;
      else if (isCorrect) { correct++; subjectBreakdown[q.subject].correct++; }
      else wrong++;
    });

    const score = (correct * 1.5) - (wrong * 0.4);
    saveMockExam({
      id: `mock-${mockId}`,
      date: new Date().toISOString(),
      score: Math.max(0, score),
      totalQuestions: questions.length,
      correctAnswers: correct,
      wrongAnswers: wrong,
      blankAnswers: blank,
      timeTaken: totalTime,
      subjectBreakdown: Object.entries(subjectBreakdown).map(([subject, data]) => ({ subject, ...data })),
    });
  }, [examFinished, questions, selectedAnswers, mockId, saveMockExam]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="text-slate-400">Preparing mock exam...</div>
      </div>
    );
  }

  // Start screen
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-lg w-full">
          <div className="flex items-center gap-2 mb-4">
            <Flag className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white">Full IMAT Mock {mockId}</h2>
          </div>
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-slate-400">Total Questions</span><span className="text-white font-medium">{questions.length}</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-slate-400">Time Limit</span><span className="text-white font-medium">{mockExamStructure.timeMinutes} minutes</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-slate-400">Scoring</span><span className="text-amber-400 font-medium">+1.5 / -0.4 / 0</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-slate-400">Biology</span><span className="text-emerald-400 font-medium">23 Qs (35 min)</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-slate-400">Chemistry</span><span className="text-blue-400 font-medium">15 Qs (25 min)</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-slate-400">Physics</span><span className="text-orange-400 font-medium">6 Qs (8 min)</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-slate-400">Mathematics</span><span className="text-purple-400 font-medium">7 Qs (10 min)</span></div>
            <div className="flex justify-between py-2 border-b border-white/10"><span className="text-slate-400">Logical Reasoning</span><span className="text-teal-400 font-medium">5 Qs (12 min)</span></div>
            <div className="flex justify-between py-2"><span className="text-slate-400">General Knowledge</span><span className="text-indigo-400 font-medium">4 Qs (10 min)</span></div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
            <p className="text-amber-300 text-xs flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> Wrong answers cost 0.4 marks. Leave blank if unsure!</p>
          </div>
          <button onClick={startExam} className="w-full bg-amber-500 hover:bg-amber-400 text-[#0A1628] font-bold py-3 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> Start Mock Exam
          </button>
          <button onClick={() => navigate('/dashboard')} className="w-full mt-3 text-slate-400 hover:text-white text-sm py-2 flex items-center justify-center gap-1">
            <Home className="w-4 h-4" /> Back
          </button>
        </motion.div>
      </div>
    );
  }

  // Results
  if (examFinished) {
    const correct = questions.filter((q, i) => selectedAnswers[i] === q.correct_index).length;
    const wrong = questions.filter((q, i) => selectedAnswers[i] !== undefined && selectedAnswers[i] !== q.correct_index).length;
    const blank = questions.length - correct - wrong;
    const score = (correct * 1.5) - (wrong * 0.4);

    // Subject breakdown
    const subjectStats: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      if (!subjectStats[q.subject]) subjectStats[q.subject] = { correct: 0, total: 0 };
      subjectStats[q.subject].total++;
      if (selectedAnswers[i] === q.correct_index) subjectStats[q.subject].correct++;
    });

    return (
      <div className="min-h-screen bg-[#0A1628] px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Mock Exam {mockId} Complete!</h2>
            <p className="text-slate-400 text-center text-sm mb-6">Full IMAT Simulation (60 questions, 100 minutes)</p>
            
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-amber-500/10 border-4 border-amber-500/30 mb-2">
                <div>
                  <div className="text-3xl font-bold text-amber-400">{score.toFixed(1)}</div>
                  <div className="text-xs text-amber-300">/90</div>
                </div>
              </div>
              <div className="text-slate-400 text-sm">Predicted IMAT Score</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <Check className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-emerald-400">{correct}</div>
                <div className="text-xs text-slate-400">Correct (+{correct * 1.5})</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                <X className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-red-400">{wrong}</div>
                <div className="text-xs text-slate-400">Wrong (-{(wrong * 0.4).toFixed(1)})</div>
              </div>
              <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-slate-400">{blank}</div>
                <div className="text-xs text-slate-400">Blank (0)</div>
              </div>
            </div>

            {/* Subject breakdown */}
            <h3 className="text-white font-semibold mb-3">Subject Breakdown</h3>
            <div className="space-y-2 mb-6">
              {Object.entries(subjectStats).map(([sub, stats]) => {
                const pct = Math.round((stats.correct / stats.total) * 100);
                const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={sub} className="flex items-center gap-3">
                    <span className="text-slate-300 text-sm w-36 truncate">{sub}</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-slate-400 text-xs w-16 text-right">{stats.correct}/{stats.total}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate('/dashboard')} className="flex-1 bg-white/10 hover:bg-white/15 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2">
                <Home className="w-4 h-4" /> Dashboard
              </button>
              <button onClick={() => window.location.reload()} className="flex-1 bg-amber-500 hover:bg-amber-400 text-[#0A1628] font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Retake
              </button>
            </div>
          </motion.div>

          {/* Answer review */}
          <h3 className="text-white font-bold mb-3">Review Answers</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {questions.map((q, i) => {
              const selected = selectedAnswers[i];
              const isCorrect = selected === q.correct_index;
              const status = selected === undefined ? 'blank' : isCorrect ? 'correct' : 'wrong';
              return (
                <button key={i} onClick={() => goToQuestion(i)} className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/8 transition-colors text-left">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${status === 'correct' ? 'bg-emerald-500 text-white' : status === 'wrong' ? 'bg-red-500 text-white' : 'bg-slate-600 text-white'}`}>
                    {i + 1}
                  </div>
                  <span className="text-slate-300 text-xs flex-1 truncate">{q.question.split('\n')[0].substring(0, 60)}...</span>
                  <span className={`text-xs ${status === 'correct' ? 'text-emerald-400' : status === 'wrong' ? 'text-red-400' : 'text-slate-500'}`}>
                    {status === 'correct' ? '+1.5' : status === 'wrong' ? '-0.4' : '0'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Exam in progress
  const currentQ = questions[currentIndex];
  const selected = selectedAnswers[currentIndex];
  const isAnswered = selected !== undefined;
  const isCorrect = selected === currentQ.correct_index;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#0A1628]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <button onClick={() => { if (window.confirm('Quit exam? Progress will be lost.')) navigate('/dashboard'); }} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Quit
            </button>
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowNavigator(!showNavigator)} className="text-xs text-slate-400 hover:text-white bg-white/5 px-2 py-1 rounded">
                {answeredCount}/{questions.length}
              </button>
              <button onClick={() => setIsPaused(!isPaused)} className="text-slate-400 hover:text-white">
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Question navigator */}
      <AnimatePresence>
        {showNavigator && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#0D1E36] border-b border-white/10 overflow-hidden">
            <div className="max-w-5xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm font-medium">Question Navigator</span>
                <button onClick={() => setShowNavigator(false)} className="text-slate-400 hover:text-white text-xs">Close</button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {questions.map((q, i) => {
                  const ans = selectedAnswers[i];
                  const isFlagged = flaggedQuestions.has(i);
                  let bg = 'bg-white/5 text-slate-400';
                  if (ans !== undefined) bg = ans === q.correct_index ? 'bg-emerald-500/30 text-emerald-300' : 'bg-red-500/30 text-red-300';
                  return (
                    <button key={i} onClick={() => goToQuestion(i)} className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center ${bg} hover:scale-110 transition-transform relative`}>
                      {i + 1}
                      {isFlagged && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause overlay */}
      <AnimatePresence>
        {isPaused && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
            <div className="bg-[#0D1E36] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
              <Pause className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Exam Paused</h3>
              <p className="text-slate-400 text-sm mb-6">Take your time. Stay focused!</p>
              <button onClick={() => setIsPaused(false)} className="w-full bg-amber-500 hover:bg-amber-400 text-[#0A1628] font-bold py-3 rounded-xl mb-3">Resume</button>
              <button onClick={() => { if (window.confirm('Finish exam now?')) finishExam(); }} className="w-full bg-white/10 hover:bg-white/15 text-white py-2 rounded-xl text-sm mb-2">Finish Early</button>
              <button onClick={() => { if (window.confirm('Quit? All progress lost!')) navigate('/dashboard'); }} className="w-full text-red-400 hover:text-red-300 py-2 text-xs">Quit</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded-full">Q{currentIndex + 1}/{questions.length}</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">{currentQ.subject}</span>
              </div>
              <button onClick={toggleFlag} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${flaggedQuestions.has(currentIndex) ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                <Flag className="w-3 h-3" /> {flaggedQuestions.has(currentIndex) ? 'Flagged' : 'Flag'}
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">{currentQ.difficulty}</span>
                <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded-full">{currentQ.year_style}</span>
              </div>
              <h3 className="text-white text-base font-medium whitespace-pre-line leading-relaxed">{currentQ.question}</h3>
            </div>

            <div className="space-y-1.5 mb-3">
              {currentQ.options.map((opt, oi) => {
                let btnClass = 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10';
                if (showExplanation || isAnswered) {
                  if (oi === currentQ.correct_index) btnClass = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
                  else if (oi === selected && oi !== currentQ.correct_index) btnClass = 'bg-red-500/20 border-red-500/40 text-red-300';
                  else btnClass = 'bg-white/3 border-white/5 text-slate-500';
                }
                return (
                  <button key={oi} onClick={() => selectAnswer(oi)} disabled={showExplanation || isAnswered}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border transition-all text-sm flex items-center gap-3 ${btnClass}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${oi === selected ? (isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white') : 'bg-white/10 text-slate-400'}`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span>{opt}</span>
                    {(showExplanation || isAnswered) && oi === currentQ.correct_index && <Check className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />}
                    {(showExplanation || isAnswered) && oi === selected && !isCorrect && <X className="w-4 h-4 text-red-400 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {(showExplanation || isAnswered) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className="mb-3">
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                    <p className="text-amber-300 text-xs font-medium mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Trap: {currentQ.common_trap}</p>
                    <p className="text-slate-400 text-xs">{currentQ.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-2">
              <button onClick={prevQuestion} disabled={currentIndex === 0} className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 px-3 py-2 text-sm">
                <ArrowLeft className="w-4 h-4" /> Prev
              </button>
              {currentIndex === questions.length - 1 ? (
                <button onClick={finishExam} className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-5 py-2 rounded-xl text-sm">
                  Finish <Check className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={nextQuestion} className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-[#0A1628] font-bold px-5 py-2 rounded-xl text-sm">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
