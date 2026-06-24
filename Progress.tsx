import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, TrendingUp, Award, Clock, Target, BookOpen } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

export default function Progress() {
  const navigate = useNavigate();
  const { progress } = useAppContext();

  const totalAttempts = progress.quizAttempts.length;
  const totalMocks = progress.mockExams.length;
  const totalCorrect = progress.quizAttempts.reduce((s, a) => s + a.correctAnswers, 0);
  const totalQ = progress.quizAttempts.reduce((s, a) => s + a.totalQuestions, 0);
  const accuracy = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

  const recentAttempts = progress.quizAttempts.slice(0, 20);
  const recentMocks = progress.mockExams.slice(0, 10);

  // Subject stats
  const subjectStats: Record<string, { correct: number; total: number; attempts: number }> = {};
  progress.quizAttempts.forEach(a => {
    if (!subjectStats[a.subject]) subjectStats[a.subject] = { correct: 0, total: 0, attempts: 0 };
    subjectStats[a.subject].correct += a.correctAnswers;
    subjectStats[a.subject].total += a.totalQuestions;
    subjectStats[a.subject].attempts += 1;
  });

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <header className="sticky top-0 z-50 bg-[#0A1628]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Progress Analytics</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: BookOpen, label: 'Quizzes', value: totalAttempts, color: 'text-blue-400' },
            { icon: Target, label: 'Accuracy', value: `${accuracy}%`, color: 'text-emerald-400' },
            { icon: Award, label: 'Mocks', value: totalMocks, color: 'text-amber-400' },
            { icon: BarChart3, label: 'Questions', value: totalQ, color: 'text-purple-400' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Subject Performance */}
        <h2 className="text-white font-bold mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-amber-400" /> Subject Performance</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
          {Object.keys(subjectStats).length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No quiz attempts yet. Start practicing!</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(subjectStats).map(([sub, stats]) => {
                const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                const color = pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={sub}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{sub}</span>
                      <span className="text-slate-400">{stats.correct}/{stats.total} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className={`h-full ${color} rounded-full`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <h2 className="text-white font-bold mb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-400" /> Recent Quizzes</h2>
        <div className="space-y-2 mb-8">
          {recentAttempts.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4 bg-white/5 border border-white/10 rounded-xl">No quizzes attempted yet.</p>
          ) : (
            recentAttempts.map((a, i) => {
              const acc = a.totalQuestions > 0 ? Math.round((a.correctAnswers / a.totalQuestions) * 100) : 0;
              const color = acc >= 70 ? 'text-emerald-400' : acc >= 50 ? 'text-amber-400' : 'text-red-400';
              return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-white text-sm font-medium">{a.subject} - {a.chapter}</div>
                    <div className="text-slate-500 text-xs">{new Date(a.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${color}`}>{acc}%</div>
                    <div className="text-slate-500 text-xs">{a.correctAnswers}/{a.totalQuestions}</div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Recent Mocks */}
        <h2 className="text-white font-bold mb-3 flex items-center gap-2"><Award className="w-5 h-5 text-amber-400" /> Recent Mock Exams</h2>
        <div className="space-y-2">
          {recentMocks.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4 bg-white/5 border border-white/10 rounded-xl">No mock exams taken yet.</p>
          ) : (
            recentMocks.map((m, i) => {
              const acc = m.totalQuestions > 0 ? Math.round((m.correctAnswers / m.totalQuestions) * 100) : 0;
              return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-medium">Mock Exam - Score: {m.score.toFixed(1)}/90</div>
                    <div className={`text-sm font-bold ${acc >= 60 ? 'text-emerald-400' : acc >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{acc}%</div>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span className="text-emerald-400">{m.correctAnswers} correct</span>
                    <span className="text-red-400">{m.wrongAnswers} wrong</span>
                    <span>{m.blankAnswers} blank</span>
                    <span>{Math.floor(m.timeTaken / 60)}min used</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
