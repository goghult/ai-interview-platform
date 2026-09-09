import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Interview from './pages/Interview';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-accent-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="min-h-screen flex flex-col font-sans relative z-0">
        <Toaster position="bottom-center" toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
            borderRadius: '12px'
          }
        }} />
        <header className="py-4 px-6 border-b border-dark-border bg-dark-surface/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 via-accent-500 to-purple-600 p-[2px] shadow-lg shadow-primary-500/30 group-hover:shadow-accent-500/50 transition-all duration-300">
                <div className="w-full h-full bg-dark-surface rounded-[10px] flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20"></div>
                   <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-primary-100 font-black text-xl z-10 font-sans tracking-tighter">AI</span>
                </div>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">MockInterviews</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">.ai</span>
              </h1>
            </Link>
            <nav>
              <Link to="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-dark-bg transition-colors border border-transparent hover:border-dark-border">
                Dashboard
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
