import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Target, Trash2, GraduationCap, Save } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

export default function Settings() {
  const navigate = useNavigate();
  const { progress, updateSettings, resetProgress } = useAppContext();
  const [username, setUsername] = useState(progress.username);
  const [email, setEmail] = useState(progress.email);
  const [targetYear, setTargetYear] = useState(progress.targetYear);
  const [dreamUniversity, setDreamUniversity] = useState(progress.dreamUniversity);
  const [dailyGoal, setDailyGoal] = useState(progress.dailyGoal);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({ username, email, targetYear, dreamUniversity, dailyGoal });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <header className="sticky top-0 z-50 bg-[#0A1628]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-white">Settings</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-blue-400" /> Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Display Name</label>
              <input value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="Your name" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500" placeholder="optional@email.com" />
            </div>
          </div>
        </motion.div>

        {/* Study Goals */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-emerald-400" /> Study Goals</h2>
          <div className="space-y-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Target IMAT Year</label>
              <select value={targetYear} onChange={e => setTargetYear(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500">
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Dream University</label>
              <select value={dreamUniversity} onChange={e => setDreamUniversity(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500">
                <option value="University of Milan">University of Milan</option>
                <option value="University of Pavia">University of Pavia</option>
                <option value="University of Bologna">University of Bologna</option>
                <option value="Sapienza Rome">Sapienza University of Rome</option>
                <option value="University of Padua">University of Padua</option>
                <option value="University of Turin">University of Turin</option>
                <option value="University of Naples">University of Naples Federico II</option>
                <option value="University of Bari">University of Bari</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Daily Question Goal</label>
              <select value={dailyGoal} onChange={e => setDailyGoal(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500">
                <option value={10}>10 questions</option>
                <option value={20}>20 questions</option>
                <option value={50}>50 questions</option>
                <option value={100}>100 questions</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Save */}
        <button onClick={handleSave} className="w-full bg-amber-500 hover:bg-amber-400 text-[#0A1628] font-bold py-3 rounded-xl mb-4 transition-all flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}
        </button>

        {/* Danger */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
          <h2 className="text-red-400 font-semibold mb-3 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Danger Zone</h2>
          <p className="text-slate-400 text-sm mb-3">Resetting will delete all quiz attempts, mock exam history, and progress tracking. This cannot be undone.</p>
          <button onClick={resetProgress} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> Reset All Progress
          </button>
        </motion.div>

        {/* About */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span className="text-white font-bold">IMAT <span className="text-amber-400">Sensei</span></span>
          </div>
          <p className="text-slate-500 text-xs mb-1">Your Path to Italian Medical School</p>
          <p className="text-slate-600 text-xs">2,050+ MUR-aligned MCQs • 10 Full Mocks • 45+ Chapters</p>
          <p className="text-slate-700 text-xs mt-2">Not affiliated with the Italian Ministry of University.</p>
        </div>
      </div>
    </div>
  );
}
