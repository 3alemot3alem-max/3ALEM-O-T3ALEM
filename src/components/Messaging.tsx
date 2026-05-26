import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, limit, or, updateDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { UserProfile, Message, Chat } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Send, MessageCircle, User as UserIcon, X, Mail, BookOpen } from 'lucide-react';
import { formatDate, formatTime, formatChatDate } from '../lib/utils';

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
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  useEffect(() => {
    if (activeChat) {
      setMobileView('chat');
    }
  }, [activeChat]);

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

  useEffect(() => {
    const fetchSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const queryTerm = searchQuery.trim();
        const capitalizedTerm = queryTerm.charAt(0).toUpperCase() + queryTerm.slice(1);
        
        const q1 = query(collection(db, 'users'), where('firstName', '>=', capitalizedTerm), where('firstName', '<=', capitalizedTerm + '\uf8ff'), limit(10));
        const q2 = query(collection(db, 'users'), where('displayName', '>=', queryTerm), where('displayName', '<=', queryTerm + '\uf8ff'), limit(10));
        const q3 = query(collection(db, 'users'), where('firstName', '>=', queryTerm), where('firstName', '<=', queryTerm + '\uf8ff'), limit(10));
        
        // Wait for all queries to resolve
        const [snap1, snap2, snap3] = await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);
        
        const resultsMap = new Map<string, UserProfile>();
        snap1.docs.forEach(doc => resultsMap.set(doc.id, doc.data() as UserProfile));
        snap2.docs.forEach(doc => resultsMap.set(doc.id, doc.data() as UserProfile));
        snap3.docs.forEach(doc => resultsMap.set(doc.id, doc.data() as UserProfile));
        
        setSearchResults(Array.from(resultsMap.values()).filter(u => u.uid !== user?.uid));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };
    const timeoutId = setTimeout(() => fetchSearch(), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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

  useEffect(() => {
    if (activeChat && user) {
      const currentUnread = activeChat.unreadCount?.[user.uid];
      if (currentUnread && currentUnread > 0) {
        updateDoc(doc(db, 'chats', activeChat.id), {
          [`unreadCount.${user.uid}`]: 0
        }).catch(console.error);
      }
    }
  }, [activeChat?.id, activeChat?.unreadCount, user]);

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
      
      const recipientUid = activeChat.participants.find(p => p !== user.uid) || '';
      const currentUnread = activeChat.unreadCount?.[recipientUid] || 0;
      
      // Update parent chat for ordering and preview
      await updateDoc(doc(db, 'chats', activeChat.id), {
        lastMessage: messageText,
        lastMessageAt: timestamp,
        [`unreadCount.${recipientUid}`]: currentUnread + 1
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${activeChat.id}/messages`);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-[1600px] mx-auto py-2 md:py-4 px-0 md:px-2 flex flex-col h-[calc(100vh-6rem)] md:h-[90vh]">
      <div className="bg-[#f0f2f5] border border-slate-300 shadow-sm md:rounded-lg relative isolate overflow-hidden flex-1 flex flex-col md:flex-row">
        
        {/* Left column: Search and Conversations */}
        <div className={`relative z-20 w-full md:w-80 lg:w-[400px] border-r border-[#d1d7db] flex flex-col bg-white ${mobileView === 'chat' && activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-[#f0f2f5] px-4 py-3 border-b border-[#d1d7db] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={profile?.photoURL || user.photoURL || ''} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
              <h2 className="text-base font-semibold text-slate-800">Discussions</h2>
            </div>
            <div className="flex items-center gap-3 text-[#54656f]">
              <button className="p-1">
                <MessageCircle size={20} />
              </button>
              <button className="p-1">
                <svg viewBox="0 0 24 24" width="24" height="24" className=""><path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
              </button>
            </div>
          </div>
          
          <div className="p-2 border-b border-[#d1d7db] bg-white">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="absolute left-3 flex items-center justify-center text-[#54656f]">
                <Search size={18} />
              </div>
              <input 
                type="text"
                placeholder="Rechercher ou démarrer une discussion"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-[#f0f2f5] rounded-lg outline-none text-sm font-normal focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all text-slate-800 placeholder-[#54656f]"
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto bg-white scrollbar-hide">
            {isSearching && (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {searchResults.length > 0 ? (
              <div className="">
                
                {searchResults.map(u => (
                  <button 
                    key={u.uid}
                    onClick={() => startChat(u)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-[#f5f6f6] transition-none text-left group border-b border-[#f2f2f2]"
                  >
                    <img 
                      src={u.photoURL} 
                      className="w-12 h-12 rounded-full object-cover shrink-0" 
                      alt="" 
                    />
                    <div className="overflow-hidden flex-1 border-b-0 border-[#f2f2f2] pb-0">
                      <p className="text-base font-normal text-slate-900 truncate flex items-center gap-1">
                        {u.displayName || `${u.firstName} ${u.lastName}`}
                        {u.role === 'school' && (
                          <svg className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <title>Institution Vérifiée</title>
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-1.06 14.86l-4.14-4.13 1.41-1.42 2.73 2.72 6.03-6.02 1.41 1.41-7.44 7.44z" />
                          </svg>
                        )}
                      </p>
                      <p className="text-[13px] text-[#54656f] truncate">{u.role === 'school' ? "Institution d'Enseignement Supérieur" : u.role === 'mentor' ? 'Mentor' : 'Étudiant'}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-8">
                <p className="text-[14px] text-[#54656f]">Aucun utilisateur trouvé.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                
                {userChats.length > 0 ? (
                  userChats.map(chat => (
                    <button 
                      key={chat.id}
                      onClick={() => {
                        if (chat.recipientProfile) {
                          setActiveChat(chat);
                          setActiveRecipient(chat.recipientProfile);
                          setMobileView('chat');
                        }
                      }}
                      className={`w-full flex items-center gap-3 p-3 text-left group relative outline-none transition-none ${activeChat?.id === chat.id ? 'bg-[#f0f2f5]' : 'bg-white hover:bg-[#f5f6f6]'}`}
                    >
                      <img 
                        src={chat.recipientProfile?.photoURL} 
                        className={`w-12 h-12 rounded-full object-cover shrink-0 ml-1`} 
                        alt="" 
                      />
                      <div className="flex-1 overflow-hidden relative z-10 border-b border-[#f2f2f2] pb-3 pt-1 self-start h-full flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <p className={`text-base font-normal truncate flex items-center gap-1 text-slate-900`}>
                          {chat.recipientProfile?.displayName || `${chat.recipientProfile?.firstName} ${chat.recipientProfile?.lastName}`}
                          {chat.recipientProfile?.role === 'school' && (
                            <svg className="w-3.5 h-3.5 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <title>Institution Vérifiée</title>
                              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-1.06 14.86l-4.14-4.13 1.41-1.42 2.73 2.72 6.03-6.02 1.41 1.41-7.44 7.44z" />
                            </svg>
                          )}
                        </p>
                          <span className={`text-[12px] ${activeChat?.id === chat.id ? 'text-slate-800' : 'text-[#54656f]'}`}>{formatChatDate(chat.lastMessageAt || chat.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5 pr-4">
                          <p className={`text-[13px] md:text-[14px] truncate text-[#54656f]`}>
                            {chat.lastMessage || "Lancer la conversation..."}
                          </p>
                          {chat.unreadCount?.[user.uid] > 0 && activeChat?.id !== chat.id && (
                            <span className="bg-[#25D366] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                              {chat.unreadCount[user.uid]}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-16 h-16 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto text-[#54656f]">
                      <MessageCircle size={32} />
                    </div>
                    <p className="text-[14px] text-[#54656f] px-4 font-normal">Vos discussions apparaîtront ici.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Messages */}
        <div className={`relative z-20 flex-1 flex flex-col bg-[#efeae2] relative ${mobileView === 'list' && !activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="absolute inset-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-light_04fcacde53925e2d090efa8f56269f52.png")', backgroundRepeat: 'repeat', backgroundSize: '400px' }}></div>
          
          {activeChat && activeRecipient ? (
            <>
              {/* WhatsApp Header for Chat */}
              <div className="bg-[#f0f2f5] px-4 py-2.5 border-b border-[#d1d7db] flex items-center justify-between relative z-10 w-full">
                <div className="flex items-center gap-3 md:gap-4 flex-1 cursor-pointer">
                  <button 
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-2 text-[#54656f] ml-[-12px]"
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" className=""><path fill="currentColor" d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"></path></svg>
                  </button>
                  
                  <img src={activeRecipient.photoURL} className="w-10 h-10 rounded-full object-cover shrink-0" alt="" />
                  
                  <div className="overflow-hidden flex-1">
                    <h4 className="text-base font-normal text-slate-900 truncate flex items-center gap-1">
                      {activeRecipient.firstName} {activeRecipient.lastName}
                      {activeRecipient.role === 'school' && (
                        <svg className="w-4 h-4 text-blue-500 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <title>Institution Vérifiée</title>
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm-1.06 14.86l-4.14-4.13 1.41-1.42 2.73 2.72 6.03-6.02 1.41 1.41-7.44 7.44z" />
                        </svg>
                      )}
                    </h4>
                    <p className="text-[13px] text-[#54656f] truncate">{activeRecipient.role === 'school' ? "Institution d'Enseignement Supérieur" : activeRecipient.role === 'mentor' ? 'Mentor' : 'En ligne'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[#54656f]">
                  <button className="hidden md:block">
                    <Search size={20} />
                  </button>
                  <div className="relative group">
                    <button className="p-1 focus:outline-none">
                      <svg viewBox="0 0 24 24" width="24" height="24" className=""><path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
                    </button>
                    {/* Dropdown menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded shadow-lg py-2 opacity-0 pointer-events-none group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity z-50">
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700" onClick={() => { setActiveChat(null); setActiveRecipient(null); setMobileView('list'); }}>Fermer la discussion</button>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700">Effacer les messages</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-8 md:px-[8%] lg:px-[10%] space-y-2 relative z-10 scrollbar-hide">
                {messages.map((msg, idx) => {
                  const isMe = msg.senderUid === user.uid;
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                      <div className={`max-w-[75%] md:max-w-[65%] relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* WhatsApp Message Bubble */}
                        <div className={`px-2 py-1 pb-1.5 md:px-3 md:py-2 md:pb-2 text-[14px] md:text-[15px] font-normal shadow-sm rounded-lg relative ${isMe ? 'bg-[#d9fdd3] text-[#111B21] rounded-tr-none' : 'bg-white text-[#111B21] rounded-tl-none'}`}>
                           
                           {/* Bubble Tail */}
                           <svg viewBox="0 0 8 13" height="13" width="8" className={`absolute top-0 ${isMe ? '-right-[8px] text-[#d9fdd3]' : '-left-[8px] text-white'} fill-current`}>
                               {isMe ? (
                                   <path opacity=".13" fill="#0000000" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                               ) : (
                                   <path opacity=".13" fill="#0000000" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path>
                               )}
                               <path fill="currentColor" d={isMe ? "M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z" : "M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"}></path>
                           </svg>

                          <div className="flex flex-wrap items-end gap-2 pr-14">
                            <span className="leading-[20px] whitespace-pre-wrap break-words">{msg.text}</span>
                            <span className="text-[10px] md:text-[11px] font-normal text-[#667781] float-right absolute bottom-1 right-2 w-10 text-right">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={sendMessage} className="px-4 py-2 bg-[#f0f2f5] flex items-center gap-2 md:gap-4 relative z-10 w-full min-h-[62px]">
                <div className="flex-1 bg-white rounded-lg flex items-center mb-1">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Taper un message"
                    className="w-full bg-transparent px-4 py-2.5 text-[15px] font-normal text-slate-900 outline-none placeholder-[#8696a0]"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-2 mb-1 rounded-full transition-colors ${newMessage.trim() ? 'text-[#54656f] hover:bg-slate-200/50 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}
                >
                  <Send size={24} className={newMessage.trim() ? 'translate-x-0.5' : ''} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f0f2f5] border-b-[6px] border-[#25D366] text-[#41525d] relative z-10 w-full h-full">
              <div className="max-w-[80%] mx-auto space-y-6">
                <h3 className="text-3xl font-light text-[#41525d] mb-4">Chat 3alem o t3alem</h3>
                 <p className="text-[14px] text-[#667781] max-w-lg mx-auto leading-6">
                    Bienvenue sur le chat d'étudiants, mentors et établissements de l'enseignement supérieur. Explorez de nouvelles perspectives, partagez vos connaissances ou trouvez le bon accompagnement pour votre avenir.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Contact Support Section */}
      <div className="mt-4 flex justify-center hidden">
        <a 
          href="mailto:3alemot3alem@gmail.com" 
          className="group flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 bg-white rounded-full shadow-xl shadow-majorelle/5 border border-slate-50 hover:bg-majorelle hover:text-white transition-all duration-500 max-w-[90vw]"
        >
          <div className="p-1.5 md:p-2 bg-majorelle/5 rounded-lg md:rounded-xl group-hover:bg-white/20 transition-colors shrink-0">
            <BookOpen size={16} className="md:w-5 md:h-5 text-majorelle group-hover:text-white" />
          </div>
          <span className="text-[10px] md:text-sm font-serif italic font-bold truncate">3alemot3alem@gmail.com</span>
        </a>
      </div>
    </div>
  );
};
