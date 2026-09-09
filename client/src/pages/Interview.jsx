import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Award, AlertCircle, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateQuestion, evaluateAnswer } from '../services/api';
import aiAvatar from '../assets/ai-avatar.png';
import Typewriter from '../components/Typewriter';
import { playSound } from '../utils/audio';

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, difficulty } = location.state || { role: 'Frontend Developer', difficulty: 'medium' };

  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [error, setError] = useState(null);
  
  // Audio state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const MAX_QUESTIONS = 5;
  const messagesEndRef = useRef(null);
  const askedQuestions = useRef([]);
  const synth = window.speechSynthesis;
  const recognitionRef = useRef(null);
  const initialized = useRef(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input is not supported in this browser. Please use Chrome or Edge.', { icon: '🚫' });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast('Microphone off', { icon: '🎤' });
    } else {
      setInput(''); // Clear input before speaking a new answer
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Listening... Start speaking!', { icon: '🎙️' });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      startNewQuestion();
    }
    return () => {
      if (synth) synth.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speakText = (text, onEndCallback = null) => {
    if (isMuted || !synth) {
      if (onEndCallback) setTimeout(onEndCallback, 3000); // Delay if muted
      return;
    }
    
    synth.cancel(); // stop previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const voice = voices.find(v => v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Samantha') || v.lang.includes('en-US'));
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    synth.speak(utterance);
  };

  const startNewQuestion = async () => {
    if (questionCount >= MAX_QUESTIONS) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await generateQuestion(role, difficulty, askedQuestions.current);
      askedQuestions.current.push(data.question);
      setCurrentQuestion(data.question);
      setMessages(prev => [...prev, { type: 'ai', content: data.question }]);
      setQuestionCount(prev => prev + 1);
      playSound('receive');
      speakText(data.question);
    } catch (err) {
      console.error(err);
      const errorMsg = err.message || "Failed to generate question. Please ensure the backend is running and API key is set.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (synth) synth.cancel(); // Stop talking when user replies
    setIsSpeaking(false);
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userAnswer = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userAnswer }]);
    setLoading(true);
    setError(null);
    playSound('send');

    try {
      const data = await evaluateAnswer(role, currentQuestion, userAnswer);
      
      setMessages(prev => [
        ...prev, 
        { 
          type: 'ai-feedback', 
          content: data.feedback,
          score: data.score 
        }
      ]);
      
      setTotalScore(prev => prev + data.score);
      playSound('receive');

      // Wait for feedback to finish reading before asking next question
      speakText(data.feedback, () => {
        if (questionCount < MAX_QUESTIONS) {
          startNewQuestion();
        } else {
          const finalScoreValue = totalScore + data.score;
          const finalMessage = `Interview Complete! Your final score is ${finalScoreValue} out of ${MAX_QUESTIONS * 10}.`;
          setMessages(prev => [...prev, { 
            type: 'ai-summary', 
            content: finalMessage
          }]);
          speakText(finalMessage);

          // Save to localStorage
          const history = JSON.parse(localStorage.getItem('mockInterviews_history') || '[]');
          history.push({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            role,
            difficulty,
            score: finalScoreValue,
            maxScore: MAX_QUESTIONS * 10
          });
          localStorage.setItem('mockInterviews_history', JSON.stringify(history));
          toast.success('Interview Saved to Dashboard!', { icon: '🏆' });
          playSound('success');
        }
      });

    } catch (err) {
      console.error(err);
      const errorMsg = err.message || "Failed to evaluate answer. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMute = () => {
    if (!isMuted && synth) {
      synth.cancel();
      setIsSpeaking(false);
      toast('Audio Muted', { icon: '🔇' });
    } else {
      toast('Audio Enabled', { icon: '🔊' });
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] relative">
      <div className="flex items-center justify-between mb-4 bg-dark-surface p-4 rounded-xl border border-dark-border">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-dark-bg rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-semibold text-white">{role} Interview</h2>
            <p className="text-xs text-gray-400 capitalize">{difficulty} Level</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium text-white">Question {questionCount}/{MAX_QUESTIONS}</div>
            <div className="text-xs text-primary-400">Score: {totalScore}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-dark-bg border border-primary-500/30 flex items-center justify-center">
            <Award className="w-5 h-5 text-primary-500" />
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-dark-surface rounded-full mb-4 overflow-hidden shadow-inner relative">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-600 to-accent-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          style={{ width: `${(Math.min(questionCount, MAX_QUESTIONS) / MAX_QUESTIONS) * 100}%` }}
        />
      </div>

      <div className="flex-1 glass-panel overflow-hidden flex flex-col">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center p-6 border-b border-dark-border bg-dark-bg/30 relative overflow-hidden shrink-0">
          {/* Subtle background glow when speaking */}
          {isSpeaking && <div className="absolute inset-0 bg-primary-500/5 animate-pulse"></div>}
          
          <div className={`relative w-24 h-24 rounded-full p-1 border-2 transition-all duration-300 ${isSpeaking ? 'border-primary-500 animate-pulse-glow shadow-lg shadow-primary-500/20' : 'border-dark-border'}`}>
            <img src={aiAvatar} alt="AI Interviewer" className="w-full h-full rounded-full object-cover" />
            
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-500 border-2 border-dark-surface"></span>
              </span>
            )}
          </div>
          
          <div className="mt-4 flex items-center gap-3 relative z-10">
            <button
              onClick={toggleMute}
              className={`p-2.5 rounded-full border transition-all duration-200 ${isMuted ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20' : 'bg-dark-surface border-dark-border text-gray-400 hover:text-white hover:border-gray-500'}`}
              title={isMuted ? "Unmute Voice" : "Mute Voice"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className={`text-sm font-medium ${isSpeaking ? 'text-primary-400' : 'text-gray-400'}`}>
              {isSpeaking ? "Interviewer is speaking..." : "Interviewer is listening..."}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.length === 0 && loading && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <span className="ml-3">Preparing your interview...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 shadow-lg ${
                  msg.type === 'user' 
                    ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-br-sm shadow-primary-500/20' 
                    : msg.type === 'ai-feedback'
                      ? 'bg-dark-surface/80 backdrop-blur-md border border-primary-500/30 rounded-bl-sm'
                      : msg.type === 'ai-summary'
                        ? 'bg-gradient-to-r from-primary-900/80 to-dark-surface/80 backdrop-blur-md border border-primary-500 text-white w-full text-center py-6'
                        : 'bg-dark-surface/80 backdrop-blur-md border border-dark-border rounded-bl-sm text-gray-200'
                }`}
              >
                {msg.type === 'ai-feedback' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dark-border">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary-400">Feedback</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      msg.score >= 8 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                      msg.score >= 5 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      Score: {msg.score}/10
                    </span>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.type !== 'user' ? (
                    <Typewriter text={msg.content} animate={index === messages.length - 1 && !loading} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {loading && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-dark-surface border border-dark-border rounded-2xl rounded-bl-sm p-4 flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-dark-bg/50 border-t border-dark-border shrink-0">
          <div className="relative flex items-end gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
                isListening 
                  ? 'bg-red-500/20 text-red-500 border border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'bg-dark-bg text-gray-400 border border-dark-border hover:bg-dark-surface hover:text-white'
              }`}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Type your answer here..."}
              disabled={loading || questionCount > MAX_QUESTIONS}
              className="w-full bg-dark-surface border border-dark-border focus:border-primary-500 text-white rounded-xl py-3 px-4 resize-none min-h-[56px] max-h-32 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 transition-colors"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || questionCount > MAX_QUESTIONS}
              className="glass-button bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 disabled:cursor-not-allowed text-white p-3 rounded-xl flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">Press Enter to send, Shift + Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
