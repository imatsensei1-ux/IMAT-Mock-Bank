import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './hooks/useAppContext';
import Landing from './sections/Landing';
import Dashboard from './sections/Dashboard';
import Quiz from './sections/Quiz';
import MockExam from './sections/MockExam';
import Progress from './sections/Progress';
import Settings from './sections/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/mock-exam" element={<MockExam />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
