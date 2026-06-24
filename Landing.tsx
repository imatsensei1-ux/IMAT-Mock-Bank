import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Trophy, Clock, BarChart3, ChevronRight, Dna, FlaskConical, Zap, Sigma, Globe, Sparkles } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: BookOpen, title: '2,050+ MUR-Aligned MCQs', desc: 'The largest IMAT question bank with fresh questions matching 2023-2025 exam patterns' },
    { icon: Brain, title: 'Detailed Explanations', desc: 'Every question includes full pedagogical explanations with common traps and misconceptions' },
    { icon: Trophy, title: '10 Full Mock Exams', desc: 'Simulate the real 60-question, 100-minute IMAT with predicted scoring' },
    { icon: Clock, title: 'Timed Practice', desc: 'Subject-specific timing: Biology 35min, Chemistry 25min, Physics 8min, Math 10min' },
    { icon: BarChart3, title: 'Progress Analytics', desc: 'Track accuracy trends, time per question, and topic-level weakness identification' },
    { icon: Sparkles, title: 'Chapter-wise Quizzes', desc: '16 Biology chapters, 9 Chemistry chapters, 6 Physics, 6 Math, 4 Logic, 4 GK chapters' },
  ];

  const stats = [
    { label: 'MCQs', value: '2,050+' },
    { label: 'Subjects', value: '6' },
    { label: 'Chapters', value: '45+' },
    { label: 'Mock Exams', value: '10' },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0F2240] to-[#0A1628]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">#1 IMAT Mock Bank in the World</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              IMAT <span className="text-amber-400">Sensei</span>
            </h1>
            <p className="text-xl text-slate-300 mb-2 font-medium">Your Path to Italian Medical School</p>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8">
              The most comprehensive IMAT practice platform with 2,050+ MUR-era questions, 
              full mock exams, and detailed explanations. Better than any competitor.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#0A1628] font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105"
            >
              <Brain className="w-5 h-5" />
              Launch Mock Bank
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/dashboard?tab=mock')}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all border border-white/10"
            >
              <Trophy className="w-5 h-5" />
              Take Full Mock
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {stats.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-2xl font-bold text-amber-400">{s.value}</div>
                <div className="text-sm text-slate-400">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Subjects */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-[#0D1E36]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Complete Subject Coverage</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Biology', count: '800', icon: Dna, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { name: 'Chemistry', count: '450', icon: FlaskConical, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { name: 'Physics', count: '300', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
              { name: 'Mathematics', count: '300', icon: Sigma, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
              { name: 'Logic', count: '100', icon: Brain, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
              { name: 'GK', count: '100', icon: Globe, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
            ].map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => navigate('/dashboard')}
                className={`${s.bg} ${s.border} border rounded-xl p-4 text-center hover:scale-105 transition-transform`}
              >
                <s.icon className={`w-8 h-8 ${s.color} mx-auto mb-2`} />
                <div className="text-white font-semibold text-sm">{s.name}</div>
                <div className={`${s.color} text-xs`}>{s.count} Qs</div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Why IMAT Sensei is #1</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-colors"
              >
                <f.icon className="w-8 h-8 text-amber-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-gradient-to-r from-amber-500/10 to-blue-500/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Dominate the IMAT?</h2>
          <p className="text-slate-300 mb-8">
            Start practicing with 2,050+ MUR-aligned questions. Track your progress, 
            identify weaknesses, and watch your score improve.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#0A1628] font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105"
          >
            <Brain className="w-5 h-5" />
            Start Practicing Now
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-white/10 text-center">
        <p className="text-slate-500 text-sm">
          IMAT Sensei - Your Path to Italian Medical School. Not affiliated with the Italian Ministry of University.
        </p>
      </footer>
    </div>
  );
}
