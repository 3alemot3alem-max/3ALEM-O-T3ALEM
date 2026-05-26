export interface UserProfile {
  uid: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string;
  bannerURL?: string;
  role: 'student' | 'mentor' | 'school' | 'admin';
  level: string;
  bio?: string;
  institution?: string;
  major?: string;
  city?: string;
  selectedPack?: string;
  profileViews?: number;
  createdAt: string;
}

export interface Post {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  authorRole?: string;
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
  createdAt?: string;
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
  description?: string;
  logoUrl: string;
  duration?: string;
  diploma?: string;
  thresholds?: {
    sm: string | number;
    pc: string | number;
    svt: string | number;
    eco: string | number;
  };
  entrance?: string;
  specialties?: string;
  sector?: string;
  whatsappNumber?: string;
}
