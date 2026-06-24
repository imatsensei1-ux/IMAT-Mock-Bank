import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, BookOpen, Trophy, ChevronRight, Dna, FlaskConical, Zap, Sigma, Globe, ChevronDown, ChevronUp, Play, BarChart3 } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { subjects } from '../data/subjects';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Dna, FlaskConical, Zap, Sigma, Brain, Globe,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { progress, getFilteredQuestions } = useAppContext();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subjects' | 'mock'>('subjects');

  const totalQuestions = 2050;
  const attempted = progress.quizAttempts.length;
  const totalMockExams = progress.mockExams.length;
  const correctCount = progress.quizAttempts.reduce((sum, a) => sum + a.correctAnswers, 0);
  const totalAttempted = progress.quizAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;

  const mockExamsList = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Full IMAT Mock ${i + 1}`,
    questions: 60,
    time: 100,
    completed: progress.mockExams.some(e => e.id === `mock-${i + 1}`),
  }));

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A1628]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-amber-400" />
            <span className="text-white font-bold text-lg">IMAT <span className="text-amber-400">Sensei</span></span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/progress')} className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </button>
            <button onClick={() => navigate('/settings')} className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Welcome & Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {progress.username || 'Student'}!</h1>
          <p className="text-slate-400 text-sm">Keep pushing toward your dream: {progress.dreamUniversity || 'Italian Medical School'}</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Questions', value: `${totalAttempted}/${totalQuestions}`, icon: BookOpen, color: 'text-blue-400' },
            { label: 'Accuracy', value: `${accuracy}%`, icon: Brain, color: 'text-emerald-400' },
            { label: 'Mocks Taken', value: `${totalMockExams}/10`, icon: Trophy, color: 'text-amber-400' },
            { label: 'Quizzes', value: `${attempted}`, icon: BarChart3, color: 'text-purple-400' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'subjects' ? 'bg-amber-500 text-[#0A1628]' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            Subjects & Chapters
          </button>
          <button
            onClick={() => setActiveTab('mock')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'mock' ? 'bg-amber-500 text-[#0A1628]' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
          >
            Full Mock Exams
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'subjects' ? (
            <motion.div
              key="subjects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {subjects.map((subject, si) => {
                const Icon = iconMap[subject.icon] || Brain;
                const isExpanded = expandedSubject === subject.name;
                const qCount = getFilteredQuestions(subject.name).length;
                const subjectAttempts = progress.quizAttempts.filter(a => a.subject === subject.name);
                const subjectCorrect = subjectAttempts.reduce((s, a) => s + a.correctAnswers, 0);
                const subjectTotal = subjectAttempts.reduce((s, a) => s + a.totalQuestions, 0);
                const subjectAcc = subjectTotal > 0 ? Math.round((subjectCorrect / subjectTotal) * 100) : 0;

                return (
                  <motion.div
                    key={si}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: si * 0.05 }}
                    className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedSubject(isExpanded ? null : subject.name)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: subject.color + '20' }}>
                          <div style={{ color: subject.color }}><Icon className="w-5 h-5" /></div>
                        </div>
                        <div className="text-left">
                          <div className="text-white font-semibold">{subject.name}</div>
                          <div className="text-slate-400 text-xs">{subject.chapters.length} chapters • {qCount} questions</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {subjectTotal > 0 && (
                          <div className="hidden sm:flex items-center gap-2">
                            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${subjectAcc}%`, backgroundColor: subject.color }} />
                            </div>
                            <span className="text-xs text-slate-400">{subjectAcc}%</span>
                          </div>
                        )}
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/10 p-3 grid gap-2">
                            {subject.chapters.map((ch, ci) => {
                              const chKey = `${subject.name}-${ch}`;
                              const chProg = progress.chapterProgress[chKey];
                              const chQCount = getFilteredQuestions(subject.name, ch).length;
                              return (
                                <div key={ci} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-slate-300 text-sm truncate">{ch}</div>
                                    {chProg && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(chProg.completed / chProg.total) * 100}%` }} />
                                        </div>
                                        <span className="text-xs text-slate-500">{chProg.completed}/{chProg.total}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 ml-2">
                                    <span className="text-xs text-slate-500 hidden sm:inline">{chQCount} Qs</span>
                                    <button
                                      onClick={() => navigate(`/quiz?subject=${encodeURIComponent(subject.name)}&chapter=${encodeURIComponent(ch)}`)}
                                      className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                                      style={{ backgroundColor: subject.color + '20', color: subject.color }}
                                    >
                                      <Play className="w-3 h-3" />
                                      Start
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="mock"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-3"
            >
              {mockExamsList.map((mock, i) => (
                <motion.div
                  key={mock.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white/5 border rounded-xl p-4 flex items-center justify-between ${mock.completed ? 'border-amber-500/30' : 'border-white/10'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mock.completed ? 'bg-amber-500/20' : 'bg-white/5'}`}>
                      <Trophy className={`w-5 h-5 ${mock.completed ? 'text-amber-400' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">{mock.name}</div>
                      <div className="text-slate-400 text-xs">{mock.questions} questions • {mock.time} minutes</div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/mock-exam?id=${mock.id}`)}
                    className={`flex items-center gap-1 text-xs font-medium px-4 py-2 rounded-lg transition-all hover:scale-105 ${mock.completed ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500 text-[#0A1628]'}`}
                  >
                    {mock.completed ? 'Retake' : 'Start'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
