import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Trophy, Target, Calendar } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('mockInterviews_history') || '[]');
    setHistory(data);
  }, []);

  const totalInterviews = history.length;
  const averageScore = totalInterviews > 0 
    ? Math.round(history.reduce((acc, curr) => acc + (curr.score / curr.maxScore * 100), 0) / totalInterviews)
    : 0;
  
  // Find most frequent role
  const rolesCount = history.reduce((acc, curr) => {
    acc[curr.role] = (acc[curr.role] || 0) + 1;
    return acc;
  }, {});
  const bestRole = Object.keys(rolesCount).length > 0 
    ? Object.keys(rolesCount).reduce((a, b) => rolesCount[a] > rolesCount[b] ? a : b)
    : 'None yet';

  // Chart data formatting (oldest first)
  const chartData = [...history].sort((a, b) => new Date(a.date) - new Date(b.date)).map((item, index) => ({
    name: `Int ${index + 1}`,
    score: Math.round((item.score / item.maxScore) * 100)
  }));

  const getRankBadge = (score) => {
    if (score >= 90) return { name: 'Diamond', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-t-cyan-500' };
    if (score >= 80) return { name: 'Platinum', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-t-purple-500' };
    if (score >= 70) return { name: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-t-yellow-500' };
    if (score >= 50) return { name: 'Silver', color: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-t-gray-500' };
    return { name: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-t-orange-500' };
  };
  const rank = getRankBadge(averageScore);

  return (
    <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-3xl font-bold text-white">Your Performance Dashboard</h2>
      </div>

      {totalInterviews === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center">
          <Trophy className="w-16 h-16 text-gray-500 mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Interviews Yet</h3>
          <p className="text-gray-500 mb-6">Complete your first mock interview to start tracking your performance!</p>
          <button
            onClick={() => navigate('/')}
            className="glass-button bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium"
          >
            Start an Interview
          </button>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-6 border-t-4 border-t-primary-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-primary-500/10 hover:shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-500/10 rounded-lg">
                  <Target className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">Total Interviews</p>
                  <p className="text-2xl font-bold text-white">{totalInterviews}</p>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 border-t-4 border-t-green-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-green-500/10 hover:shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">Average Score</p>
                  <p className="text-2xl font-bold text-white">{averageScore}%</p>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 border-t-4 border-t-purple-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-500/10 hover:shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">Top Role</p>
                  <p className="text-xl font-bold text-white truncate max-w-[120px]">{bestRole}</p>
                </div>
              </div>
            </div>
            <div className={`glass-panel p-6 border-t-4 ${rank.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 ${rank.bg} rounded-lg`}>
                  <Trophy className={`w-6 h-6 ${rank.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">Rank Tier</p>
                  <p className={`text-2xl font-bold ${rank.color}`}>{rank.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-panel p-6 h-[400px]">
            <h3 className="text-lg font-semibold text-white mb-6">Score Progression</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  activeDot={{ r: 8, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* History List */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Recent Interviews</h3>
            <div className="space-y-4">
              {[...history].sort((a, b) => new Date(b.date) - new Date(a.date)).map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-dark-bg/50 border border-dark-border hover:border-gray-600 transition-colors">
                  <div className="mb-4 sm:mb-0">
                    <h4 className="font-semibold text-white">{item.role}</h4>
                    <p className="text-sm text-gray-400">
                      {new Date(item.date).toLocaleDateString()} • {item.difficulty}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Score</p>
                      <p className={`font-bold ${
                        (item.score / item.maxScore) >= 0.8 ? 'text-green-400' :
                        (item.score / item.maxScore) >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {item.score}/{item.maxScore}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
