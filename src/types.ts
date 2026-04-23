export interface UserProfile {
  uid: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string;
  bannerURL?: string;
  role: 'student' | 'mentor';
  level: string;
  bio?: string;
  institution?: string;
  major?: string;
  city?: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  likedBy?: string[];
  commentsCount: number;
  tags: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: Record<string, number>;
}

export interface Message {
  id: string;
  senderUid: string;
  text: string;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  type: string;
  city: string;
  description: string;
  logoUrl: string;
  whatsappNumber: string;
}
