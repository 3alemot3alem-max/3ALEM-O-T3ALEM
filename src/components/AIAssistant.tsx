import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Bot, User, Loader2, Paperclip, Sparkles, History, Plus, MessageSquare, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getGeminiResponse, ChatMessage } from '../services/geminiService';
import { useAuth } from '../AuthContext';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ChatSession {
  id: string;
  title: string;
  createdAt: any;
}

interface AIAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  isFullPage?: boolean;
  mode?: 'academic' | 'service';
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  isOpen = true, 
  onClose, 
  isFullPage = false,
  mode = 'academic'
}) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState<{ data: string; mimeType: string } | undefined>();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isFullPage && ! (mode === 'service'));

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sessionCollection = mode === 'academic' ? 'ai_sessions' : 'support_sessions';
  const messageCollection = mode === 'academic' ? 'ai_messages' : 'support_messages';

  // Load chat sessions
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, sessionCollection),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeSessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatSession[];
      setSessions(activeSessions);
      
      if (!currentSessionId && activeSessions.length > 0) {
        // setCurrentSessionId(activeSessions[0].id); // Don't auto-load to allow fresh start
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Load current session messages
  useEffect(() => {
    if (!currentSessionId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, messageCollection),
      where('sessionId', '==', currentSessionId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          role: data.role,
          parts: [{ text: data.text }]
        };
      }) as ChatMessage[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentSessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const startNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!input.trim() && !fileData) return;
    if (!user) return;

    const userMessage = input.trim();
    let sessionId = currentSessionId;

    setIsLoading(true);
    setInput('');

    try {
      // Create session if it doesn't exist
      if (!sessionId) {
        const sessionDoc = await addDoc(collection(db, sessionCollection), {
          userId: user.uid,
          title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : ''),
          createdAt: serverTimestamp()
        });
        sessionId = sessionDoc.id;
        setCurrentSessionId(sessionId);
      }

      // 1. Save user message to Firestore
      await addDoc(collection(db, messageCollection), {
        sessionId,
        userId: user.uid,
        role: 'user',
        text: userMessage,
        createdAt: serverTimestamp()
      });

      // 2. Get AI Response
      const response = await getGeminiResponse(userMessage, messages, profile, mode);
      
      // 3. Save AI response to Firestore
      await addDoc(collection(db, messageCollection), {
        sessionId,
        userId: user.uid,
        role: 'model',
        text: response || '',
        createdAt: serverTimestamp()
      });

    } catch (error) {
      console.error('AI Assistant Error:', error);
      // Fallback for UI if firestore fails or something
    } finally {
      setIsLoading(false);
      setFileData(undefined);
    }
  };

  const deleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Voulez-vous supprimer cette conversation ?')) {
      await deleteDoc(doc(db, sessionCollection, id));
      if (currentSessionId === id) {
        startNewSession();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData({
          data: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const AIArea = (
    <div className={`relative flex flex-col bg-white overflow-hidden ${isFullPage ? 'h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)] rounded-[32px] shadow-2xl border border-white/50' : 'h-full'}`}>
      {/* Header for small screens in full page or standard header for modal */}
      {(!isFullPage || !isSidebarOpen) && (
        <div className={`${mode === 'academic' ? 'bg-moroccan-green' : 'bg-orange-500'} p-4 md:p-6 text-white flex items-center justify-between relative overflow-hidden flex-shrink-0`}>
          <div className="absolute inset-0 zellij-pattern opacity-10"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
              <Bot className="text-white" size={isFullPage ? 24 : 28} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-serif italic font-bold">
                {mode === 'academic' ? '3alem o t3alem' : 'Support 3oT'}
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-white/70">
                  {mode === 'academic' ? 'Assistant IA Éducatif' : 'Support & Guide'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            {isFullPage && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors md:hidden"
              >
                <History size={20} />
              </button>
            )}
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar for History */}
        {(isSidebarOpen || isFullPage) && (
          <motion.div 
            initial={isFullPage ? { width: 0, opacity: 0 } : false}
            animate={{ width: isFullPage ? (isSidebarOpen ? 280 : 0) : 0, opacity: 1 }}
            className={`bg-slate-50 border-r border-slate-100 flex flex-col overflow-hidden absolute inset-y-0 left-0 z-30 md:relative ${isSidebarOpen ? 'w-full md:w-[280px]' : 'w-0'}`}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <button 
                onClick={() => {
                  startNewSession();
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className="flex-1 bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
              >
                <Plus size={18} className="text-moroccan-green" />
                Nouveau Chat
              </button>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-slate-400 md:hidden"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Conversations récentes</div>
              {sessions.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentSessionId(s.id);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className={`w-full p-3 rounded-xl flex items-center justify-between group transition-all text-left ${currentSessionId === s.id ? 'bg-moroccan-green/10 text-moroccan-green' : 'hover:bg-slate-200 text-slate-600'}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <MessageSquare size={16} className={currentSessionId === s.id ? 'text-moroccan-green' : 'text-slate-400'} />
                    <span className="text-sm truncate font-medium">{s.title}</span>
                  </div>
                  <Trash2 
                    size={14} 
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-moroccan-red transition-all ml-2 flex-shrink-0" 
                    onClick={(e) => deleteSession(e, s.id)}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col min-w-0 bg-ivory/10 relative">
          {/* Toggle Sidebar Button for Desktop */}
          {isFullPage && !isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="absolute left-4 top-4 z-20 p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-moroccan-green shadow-sm transition-all hidden md:flex"
            >
              <History size={20} />
            </button>
          )}

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-24 h-24 ${mode === 'academic' ? 'bg-moroccan-green/10 text-moroccan-green' : 'bg-orange-500/10 text-orange-500'} rounded-[40px] flex items-center justify-center`}
                >
                  <Bot size={48} className="animate-pulse" />
                </motion.div>
                <div className="max-w-md space-y-4">
                  <h3 className="font-serif italic font-bold text-slate-800 text-3xl">Salam, {profile?.firstName} !</h3>
                  <p className="text-slate-500 leading-relaxed font-medium"> 
                    {mode === 'academic' 
                      ? <>Je suis <span className="text-moroccan-green font-bold">3alem o t3alem</span>, votre mentor IA dédié à la réussite au Maroc.</>
                      : <>Je suis l&apos;assistant de <span className="text-orange-500 font-bold">Support 3oT</span>. Comment puis-je vous aider avec l&apos;application ?</>
                    }
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                    {(mode === 'academic' ? [
                      "Explique-moi la fonction exponentielle",
                      "Quelles sont les conditions de l'UM6P ?",
                      "Aide-moi à organiser mes révisions",
                      "Résume ce chapitre de physique"
                    ] : [
                      "Comment utiliser la Communauté ?",
                      "Où trouver l'annuaire des écoles ?",
                      "Comment contacter un mentor ?",
                      "Comment marche l'Assistant IA ?"
                    ]).map((hint, i) => (
                      <button 
                        key={i}
                        onClick={() => setInput(hint)}
                        className={`p-3 bg-white border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 hover:border-${mode === 'academic' ? 'moroccan-green' : 'orange-500'}/30 hover:shadow-lg transition-all`}
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-moroccan-red text-white' : 'bg-moroccan-green text-white'}`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-white border border-slate-100 text-slate-800 rounded-tr-none' : 'bg-white border border-emerald-50 text-slate-800 rounded-tl-none shadow-md overflow-x-auto'}`}>
                  <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:italic markdown-body">
                    <ReactMarkdown 
                      remarkPlugins={[remarkMath]} 
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.parts[0].text}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-moroccan-green rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Bot size={20} />
                </div>
                <div className="bg-white border border-emerald-50 p-5 rounded-3xl rounded-tl-none shadow-md">
                  <div className="flex gap-1.5 min-w-[40px] justify-center">
                    <div className="w-2 h-2 bg-moroccan-green rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-moroccan-green/60 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                    <div className="w-2 h-2 bg-moroccan-green/30 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-50">
            {fileData && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm">
                <Paperclip size={16} className="text-moroccan-green" />
                <span className="text-xs font-bold text-slate-600 truncate flex-1">Fichier attaché</span>
                <button onClick={() => setFileData(undefined)} className="p-1 hover:bg-slate-200 rounded-lg">
                  <X size={14} />
                </button>
              </div>
            )}
            <div className={`flex items-center gap-4 max-w-4xl mx-auto`}>
              <div className="flex-1 relative flex items-center">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute left-2 p-3 text-slate-400 hover:text-moroccan-green hover:bg-moroccan-green/5 rounded-2xl transition-all"
                >
                  <Paperclip size={20} />
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                />
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Posez votre question académique ou scientifique..."
                  className="w-full bg-slate-100 pl-14 pr-6 py-4 rounded-[24px] border border-transparent focus:bg-white focus:border-moroccan-green/30 focus:shadow-xl focus:shadow-moroccan-green/5 outline-none transition-all font-medium"
                />
              </div>
              <button 
                onClick={handleSend}
                disabled={(!input.trim() && !fileData) || isLoading}
                className="bg-moroccan-green text-white h-[56px] px-8 rounded-[24px] shadow-xl shadow-moroccan-green/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 font-bold flex items-center gap-2"
              >
                {!isLoading ? (
                  <>
                    <span className="hidden md:block">Envoyer</span>
                    <Send size={18} />
                  </>
                ) : (
                  <Loader2 className="animate-spin" size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullPage) return AIArea;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full max-w-4xl h-[85vh] overflow-hidden rounded-[32px] shadow-2xl"
        >
          {AIArea}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
