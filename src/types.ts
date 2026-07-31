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
  coursePoints?: number;
  unlockedCourses?: string[];
  createdAt: string;
  isVerified?: boolean;
  fcmToken?: string;
}

export interface Post {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  authorRole?: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
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

export interface Course {
  id: string;
  title: string;
  description: string;
  authorUid: string;
  authorName: string;
  fileUrl: string;
  fileType: 'pdf' | 'video' | 'photo';
  pages?: number;
  level: string;
  pointsCost: number;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  type: string;
  city: string;
  description?: string;
  details?: string;
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

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  type: 'like' | 'comment' | 'share' | 'news';
  postId?: string;
  content: string;
  read: boolean;
  readBy?: string[];
  createdAt: string;
}
