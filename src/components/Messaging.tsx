import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, limit, or, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { UserProfile, Message, Chat } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Send, MessageCircle, User as UserIcon, X, Mail, BookOpen } from 'lucide-react';
import { formatDate } from '../lib/utils';

export const Messaging: React.FC<{ 
  targetEmail?: string | null; 
  onClearTarget?: () => void;
  onViewProfile?: (uid: string) => void;
}> = ({ targetEmail, onClearTarget, onViewProfile }) => {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeRecipient, setActiveRecipient] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userChats, setUserChats] = useState<(Chat & { recipientProfile?: UserProfile })[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      
      // Fetch recipient profiles for each chat
      const chatsWithProfiles = await Promise.all(chatsData.map(async (chat) => {
        const recipientUid = chat.participants.find(id => id !== user.uid);
        if (!recipientUid) return chat;

        const profileDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', recipientUid), limit(1)));
        if (!profileDoc.empty) {
          return { ...chat, recipientProfile: profileDoc.docs[0].data() as UserProfile };
        }
        return chat;
      }));
      
      setUserChats(chatsWithProfiles as any);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (targetEmail && user) {
      const startChatByEmail = async () => {
        try {
          const q = query(collection(db, 'users'), where('email', '==', targetEmail), limit(1));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const recipient = snapshot.docs[0].data() as UserProfile;
            if (recipient.uid !== user.uid) {
              await startChat(recipient);
            }
          }
        } catch (error) {
          console.error("Error starting chat by email:", error);
        } finally {
          onClearTarget?.();
        }
      };
      startChatByEmail();
    }
  }, [targetEmail, user]);

  useEffect(() => {
    if (!activeChat) return;
    const q = query(
      collection(db, `chats/${activeChat.id}/messages`),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
    });
    return () => unsubscribe();
  }, [activeChat]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const q = query(
        collection(db, 'users'),
        or(
          where('displayName', '>=', searchQuery),
          where('displayName', '<=', searchQuery + '\uf8ff'),
          where('firstName', '>=', searchQuery),
          where('firstName', '<=', searchQuery + '\uf8ff')
        ),
        limit(10)
      );
      const snapshot = await getDocs(q);
      setSearchResults(snapshot.docs.map(doc => doc.data() as UserProfile).filter(u => u.uid !== user?.uid));
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const startChat = async (recipient: UserProfile) => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);
      let existingChat = snapshot.docs.find(doc => {
        const data = doc.data() as Chat;
        return data.participants.includes(recipient.uid);
      });

      if (existingChat) {
        setActiveChat({ id: existingChat.id, ...existingChat.data() } as Chat);
      } else {
        const newChatRef = await addDoc(collection(db, 'chats'), {
          participants: [user.uid, recipient.uid],
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString() // Initialize to ensure it shows up in queries
        });
        setActiveChat({ id: newChatRef.id, participants: [user.uid, recipient.uid] } as Chat);
      }
      setActiveRecipient(recipient);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chats');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || !activeChat) return;
    const messageText = newMessage.trim();
    setNewMessage('');
    try {
      const timestamp = new Date().toISOString();
      await addDoc(collection(db, `chats/${activeChat.id}/messages`), {
        senderUid: user.uid,
        text: messageText,
        createdAt: timestamp
      });
      
      // Update parent chat for ordering and preview
      await updateDoc(doc(db, 'chats', activeChat.id), {
        lastMessage: messageText,
        lastMessageAt: timestamp
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${activeChat.id}/messages`);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col h-[700px]">
      <div className="maroccan-card overflow-hidden flex-1 flex flex-col md:flex-row bg-white">
        {/* Left column: Search and Conversations */}
        <div className="w-full md:w-96 border-r border-majorelle/5 flex flex-col p-6 bg-ivory/30">
          <div className="mb-8">
            <h2 className="text-2xl font-serif italic font-bold text-slate-900 mb-6">Messages</h2>
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-0 bg-moroccan-green/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Chercher un mentor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-moroccan-green/10 transition-all relative z-10"
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
            {isSearching && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-majorelle border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {searchResults.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-3">Explorateurs</p>
                {searchResults.map(u => (
                  <button 
                    key={u.uid}
                    onClick={() => startChat(u)}
                    className="w-full flex items-center gap-4 p-4 rounded-[24px] hover:bg-majorelle/5 transition-all text-left group border border-transparent hover:border-majorelle/10"
                  >
                    <img 
                      src={u.photoURL} 
                      className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-transparent group-hover:ring-majorelle/20 transition-all" 
                      alt="" 
                    />
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm font-serif italic font-bold text-slate-900 group-hover:text-majorelle truncate">{u.displayName || `${u.firstName} ${u.lastName}`}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest truncate">{u.role} • {u.level}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-12">
                <p className="text-sm font-serif italic text-slate-400">Aucun mentor trouv&eacute;.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-3">Discussions</p>
                {userChats.length > 0 ? (
                  userChats.map(chat => (
                    <button 
                      key={chat.id}
                      onClick={() => {
                        if (chat.recipientProfile) {
                          setActiveChat(chat);
                          setActiveRecipient(chat.recipientProfile);
                        }
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-[32px] transition-all duration-500 text-left group relative overflow-hidden ${activeChat?.id === chat.id ? 'bg-moroccan-green text-white shadow-2xl shadow-moroccan-green/20 scale-105' : 'bg-white border border-slate-50 hover:border-moroccan-green/10 text-slate-900 hover:shadow-xl hover:shadow-moroccan-green/5'}`}
                    >
                      {activeChat?.id === chat.id && <div className="absolute inset-0 zellij-pattern opacity-10 pointer-events-none"></div>}
                      <img 
                        src={chat.recipientProfile?.photoURL} 
                        className={`w-14 h-14 rounded-[20px] object-cover shadow-sm bg-white shrink-0 ${activeChat?.id === chat.id ? 'ring-4 ring-white/20' : 'ring-4 ring-slate-50 group-hover:ring-moroccan-green/5'}`} 
                        alt="" 
                      />
                      <div className="flex-1 overflow-hidden relative z-10">
                        <p className={`text-base font-serif italic font-bold truncate ${activeChat?.id === chat.id ? 'text-white' : 'text-slate-900'}`}>
                          {chat.recipientProfile?.displayName || `${chat.recipientProfile?.firstName} ${chat.recipientProfile?.lastName}`}
                        </p>
                        <p className={`text-xs truncate transition-opacity ${activeChat?.id === chat.id ? 'text-white/80' : 'text-slate-400 font-medium opacity-60 group-hover:opacity-100'}`}>
                          {chat.lastMessage || "Lancer la conversation..."}
                        </p>
                      </div>
                      {chat.lastMessageAt && (
                        <span className={`text-[9px] font-black uppercase tracking-tighter shrink-0 relative z-10 ${activeChat?.id === chat.id ? 'text-white/60' : 'text-slate-300'}`}>
                          {new Date(chat.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto text-slate-200">
                      <MessageCircle size={32} />
                    </div>
                    <p className="text-sm font-serif italic text-slate-400">Le silence est d&apos;or, mais l&apos;&eacute;change est pr&eacute;cieux.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Messages */}
        <div className="flex-1 flex flex-col bg-ivory/20 relative">
          <div className="absolute inset-0 zellij-pattern opacity-[0.02] pointer-events-none"></div>
          
          {activeChat && activeRecipient ? (
            <>
              <div className="bg-white/80 backdrop-blur-md p-6 border-b border-majorelle/5 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={activeRecipient.photoURL} className="w-12 h-12 rounded-2xl object-cover ring-4 ring-moroccan-green/5" alt="" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-moroccan-green border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-serif italic text-xl font-bold text-slate-900">{activeRecipient.firstName} {activeRecipient.lastName}</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-moroccan-green/60 italic">Mentor en ligne</p>
                  </div>
                </div>
                <button onClick={() => { setActiveChat(null); setActiveRecipient(null); }} className="p-3 bg-slate-50 rounded-2xl text-slate-300 hover:text-terracotta hover:bg-terracotta/5 transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 scrollbar-hide">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderUid === user.uid;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-500`} style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`p-5 rounded-[32px] text-base font-medium shadow-xl shadow-moroccan-green/5 ${isMe ? 'bg-moroccan-green text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-50'}`}>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-tight text-slate-300 mt-2 px-2">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={sendMessage} className="p-6 bg-white/80 backdrop-blur-md border-t border-majorelle/5 flex gap-4 relative z-10">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="&Eacute;crivez votre message avec sagesse..."
                  className="flex-1 bg-slate-50/50 rounded-[28px] px-8 py-5 text-base font-serif italic outline-none focus:bg-white focus:ring-4 focus:ring-moroccan-green/5 transition-all border border-transparent focus:border-moroccan-green/10"
                />
                <button 
                  disabled={!newMessage.trim()}
                  className="bg-moroccan-green text-white p-5 rounded-[24px] hover:bg-moroccan-green/90 disabled:opacity-50 transition-all shadow-2xl shadow-moroccan-green/20 active:scale-95 group"
                >
                  <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 relative z-10">
              <div className="relative mb-10">
                <div className="absolute inset-0 bg-majorelle/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="relative w-32 h-32 bg-majorelle rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-majorelle/30">
                  <div className="absolute inset-0 zellij-pattern opacity-20"></div>
                  <Mail size={56} className="relative z-10 animate-bounce" />
                </div>
              </div>
              <h3 className="text-4xl font-serif italic font-bold text-slate-900 mb-6 tracking-tight">Le Salon des Mentors</h3>
              <div className="w-16 h-1 bg-saffron mx-auto mb-8 rounded-full"></div>
              <p className="text-lg text-slate-500 max-w-sm font-serif italic leading-relaxed">
                "Celui qui pose une question est un ignorant pour cinq minutes, celui qui n&apos;en pose pas le reste toute sa vie."
              </p>
              <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-majorelle/40">S&eacute;lectionnez une &acirc;me pour commencer</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Contact Support Section */}
      <div className="mt-8 flex justify-center">
        <a 
          href="mailto:3alemot3alem@gmail.com" 
          className="group flex items-center gap-4 px-8 py-4 bg-white rounded-full shadow-xl shadow-majorelle/5 border border-slate-50 hover:bg-majorelle hover:text-white transition-all duration-500"
        >
          <div className="p-2 bg-majorelle/5 rounded-xl group-hover:bg-white/20 transition-colors">
            <BookOpen size={20} className="text-majorelle group-hover:text-white" />
          </div>
          <span className="text-sm font-serif italic font-bold">Un d&eacute;fi? Une question? Je suis &agrave; votre &eacute;coute</span>
        </a>
      </div>
    </div>
  );
};
