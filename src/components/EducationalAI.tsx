import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const EducationalAI: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis votre assistant éducatif basé sur le cadre référentiel marocain. Comment puis-je vous aider dans vos études aujourd\'hui ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.filter(m => m.role === 'user' || m.role === 'assistant')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la communication avec l\'assistant');
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      console.error('Error fetching AI response:', err);
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20 h-[calc(100vh-140px)] flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-moroccan-green/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-moroccan-green/10 flex items-center justify-center text-moroccan-green relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 zellij-pattern opacity-10"></div>
          <Bot size={28} className="relative z-10" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
            Assistant Pédagogique <Sparkles size={16} className="text-moroccan-yellow" />
          </h2>
          <p className="text-sm text-gray-500">Conforme au cadre référentiel marocain</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm ${msg.role === 'user' ? 'bg-moroccan-red text-white' : 'bg-white text-moroccan-green border border-gray-100'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-moroccan-red text-white rounded-tr-sm shadow-md shadow-moroccan-red/10' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex max-w-[80%] gap-3 flex-row">
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm bg-white text-moroccan-green border border-gray-100">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm flex items-center gap-2">
                <Loader2 size={18} className="animate-spin text-moroccan-green" />
                <span className="text-sm text-gray-500">L'assistant réfléchit...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative mt-auto">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question éducative ici..."
          className="w-full pl-6 pr-14 py-4 rounded-2xl bg-white border border-gray-200 focus:border-moroccan-green focus:ring-4 focus:ring-moroccan-green/10 outline-none transition-all shadow-sm text-gray-800 placeholder-gray-400"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-moroccan-green text-white rounded-xl hover:bg-moroccan-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-moroccan-green/20"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
