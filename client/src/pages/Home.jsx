import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Code, Users, Play, Settings2, BarChart2, Mic, Brain, TrendingUp, CheckCircle2, MessageSquare } from 'lucide-react';
import { playSound } from '../utils/audio';

export default function Home() {
  const [role, setRole] = useState('Frontend Developer');
  const [difficulty, setDifficulty] = useState('medium');
  const [hasHistory, setHasHistory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('mockInterviews_history') || '[]');
    setHasHistory(history.length > 0);
  }, []);

  const roles = [
    { id: 'Frontend Developer', icon: Code, label: 'Frontend Dev' },
    { id: 'Backend Developer', icon: Settings2, label: 'Backend Dev' },
    { id: 'HR Professional', icon: Users, label: 'HR Role' },
    { id: 'Full Stack Developer', icon: Briefcase, label: 'Full Stack Dev' }
  ];

  const difficulties = ['easy', 'medium', 'hard'];

  const startInterview = () => {
    playSound('success');
    navigate('/interview', { state: { role, difficulty } });
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 flex flex-col items-center space-y-32 animate-in fade-in duration-700">
      
      {/* 1. HERO SECTION & INTERVIEW SETUP */}
      <section className="w-full max-w-3xl flex flex-col items-center justify-center pt-8">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Master Your Next <span className="text-accent-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">Interview</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Practice with our state-of-the-art AI interviewer. Choose your role, set your difficulty, and get real-time voice and text feedback to land your dream job.
          </p>
        </div>

        <div className="glass-panel p-8 w-full relative z-10">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-4">Select Target Role</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border ${
                    role === r.id 
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-105' 
                      : 'border-dark-border bg-dark-surface/50 text-gray-400 hover:border-primary-500/50 hover:text-gray-200 hover:-translate-y-1'
                  } transition-all duration-300`}
                >
                  <r.icon className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium text-center">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-sm font-medium text-gray-300 mb-4">Select Difficulty</label>
            <div className="flex gap-4">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 capitalize py-3 rounded-xl border font-medium ${
                    difficulty === d
                      ? 'border-primary-500 bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 scale-105'
                      : 'border-dark-border bg-dark-surface/50 text-gray-400 hover:border-primary-500/50 hover:text-gray-200 hover:-translate-y-1'
                  } transition-all duration-300`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startInterview}
            className="glass-button w-full py-4 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary-500/30"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Mock Interview
          </button>

          {hasHistory && (
            <button
              onClick={() => navigate('/dashboard')}
              className="glass-button w-full mt-4 py-3 rounded-xl border border-dark-border bg-dark-bg text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <BarChart2 className="w-4 h-4" />
              View Past Performance
            </button>
          )}
        </div>
      </section>

      {/* 2. KEY FEATURES GRID */}
      <section className="w-full">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-4">Why use MockInterviews.ai?</h3>
          <p className="text-gray-400 max-w-xl mx-auto">Our platform uses cutting-edge AI to simulate real-world technical and behavioral interviews.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 hover:-translate-y-2 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-6 border border-primary-500/20">
              <Mic className="w-6 h-6 text-primary-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Two-Way Voice AI</h4>
            <p className="text-gray-400 leading-relaxed">Experience a true conversation. The AI speaks its questions aloud, and you can answer hands-free using your microphone.</p>
          </div>
          <div className="glass-panel p-8 hover:-translate-y-2 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center mb-6 border border-accent-500/20">
              <Brain className="w-6 h-6 text-accent-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Powered by Gemini</h4>
            <p className="text-gray-400 leading-relaxed">Backed by Google's incredibly fast Gemini Flash model, ensuring you get accurate, industry-standard technical questions.</p>
          </div>
          <div className="glass-panel p-8 hover:-translate-y-2 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Deep Analytics</h4>
            <p className="text-gray-400 leading-relaxed">Track your interview scores over time, unlock rank badges, and pinpoint exactly which roles you need to practice more.</p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="w-full max-w-4xl glass-panel p-10 md:p-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full filter blur-3xl"></div>
        <h3 className="text-3xl font-bold text-white mb-12 text-center">How It Works</h3>
        
        <div className="space-y-8">
          <div className="flex items-start gap-6">
            <div className="shrink-0 w-12 h-12 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center z-10 text-xl font-bold text-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">1</div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">Choose Your Path <Settings2 className="w-5 h-5 text-gray-500" /></h4>
              <p className="text-gray-400">Select the specific role you are applying for and set the difficulty level. The AI will instantly generate an appropriate curriculum for your session.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-6 relative">
            <div className="absolute left-6 top-[-40px] bottom-[-40px] w-px bg-gradient-to-b from-dark-border via-primary-500/20 to-dark-border -z-10"></div>
            <div className="shrink-0 w-12 h-12 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center z-10 text-xl font-bold text-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">2</div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">Answer Naturally <MessageSquare className="w-5 h-5 text-gray-500" /></h4>
              <p className="text-gray-400">The AI will ask you a unique technical or behavioral question. You can type your response or simply hit the microphone icon to speak your answer.</p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="shrink-0 w-12 h-12 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center z-10 text-xl font-bold text-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">3</div>
            <div>
              <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2">Get Scored <CheckCircle2 className="w-5 h-5 text-gray-500" /></h4>
              <p className="text-gray-400">Instantly receive a score out of 10 along with constructive feedback. Complete all 5 questions to save your session to your personal dashboard!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="w-full text-center py-8 border-t border-dark-border text-gray-500 flex flex-col items-center justify-center gap-2">
        <p>© {new Date().getFullYear()} MockInterviews.ai. Built for the future of hiring.</p>
        <p className="text-sm">Powered by React, Tailwind CSS, and Google Gemini.</p>
      </footer>
    </div>
  );
}
