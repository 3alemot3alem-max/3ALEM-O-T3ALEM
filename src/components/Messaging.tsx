import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, limit, or } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { UserProfile, Message, Chat } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Send, MessageCircle, User as UserIcon, X, Mail, BookOpen } from 'lucide-react';
import { formatDate } from '../lib/utils';

export const Messaging: React.FC<{ targetEmail?: string | null; onClearTarget?: () => void }> = ({ targetEmail, onClearTarget }) => {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeRecipient, setActiveRecipient] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);

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
      // Simple search by firstName or lastName (needs better implementation for real projects, but fits current structure)
      const q = query(
        collection(db, 'users'),
        where('firstName', '>=', searchQuery),
        where('firstName', '<=', searchQuery + '\uf8ff'),
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
      // Check if chat already exists
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
          createdAt: new Date().toISOString()
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
    try {
      await addDoc(collection(db, `chats/${activeChat.id}/messages`), {
        senderUid: user.uid,
        text: newMessage,
        createdAt: new Date().toISOString()
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${activeChat.id}/messages`);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 flex flex-col h-[600px]">
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex-1 flex flex-col md:flex-row">
        {/* Left column: Search and Recipient List (Simplified) */}
        <div className="w-full md:w-80 border-r border-gray-100 flex flex-col p-4">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Chercher un mentor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl outline-none text-sm focus:ring-2 focus:ring-blue-500/10"
            />
          </form>

          <div className="flex-1 overflow-y-auto space-y-2">
            {isSearching && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {searchResults.length > 0 ? (
              searchResults.map(u => (
                <button 
                  key={u.uid}
                  onClick={() => startChat(u)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50 transition-colors text-left group"
                >
                  <img src={u.photoURL} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600">{u.firstName} {u.lastName}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-black">{u.level}</p>
                  </div>
                </button>
              ))
            ) : searchQuery && !isSearching ? (
              <p className="text-center text-xs text-gray-400 py-4">Aucun utilisateur trouvé</p>
            ) : !activeRecipient ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <MessageCircle size={32} className="mb-2 opacity-20" />
                <p className="text-xs">Cherchez un membre pour démarrer la discussion.</p>
              </div>
            ) : (
                <div className="p-3 bg-blue-50 rounded-2xl">
                    <p className="text-xs font-bold text-blue-600 mb-1 leading-none">Conversation active</p>
                    <div className="flex items-center gap-3">
                        <img src={activeRecipient.photoURL} className="w-10 h-10 rounded-full object-cover" alt="" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{activeRecipient.firstName} {activeRecipient.lastName}</p>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Right column: Messages */}
        <div className="flex-1 flex flex-col bg-gray-50/50">
          {activeChat && activeRecipient ? (
            <>
              <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={activeRecipient.photoURL} className="w-8 h-8 rounded-full" alt="" />
                  <h4 className="font-bold text-gray-900">{activeRecipient.firstName} {activeRecipient.lastName}</h4>
                </div>
                <button onClick={() => { setActiveChat(null); setActiveRecipient(null); }} className="text-gray-400 hover:text-red-500">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderUid === user.uid ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${msg.senderUid === user.uid ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                      <p>{msg.text}</p>
                      <span className={`block text-[10px] mt-1 opacity-60 ${msg.senderUid === user.uid ? 'text-right' : 'text-left'}`}>
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 bg-gray-50 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
                />
                <button 
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 animate-bounce">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">3ALEM Messagerie</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Contactez les mentors pour poser vos questions en privé et obtenir des réponses sur mesure.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Contact Support Section */}
      <div className="mt-6 flex justify-center">
        <a 
          href="mailto:3alemot3alem@gmail.com" 
          className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all"
        >
          <BookOpen size={16} />
          Une question d'orientation ? Contactez-moi
        </a>
      </div>
    </div>
  );
};
