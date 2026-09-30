export type ClassLevel = 'Matric-9th' | 'Matric-10th' | 'FSc-Part1' | 'FSc-Part2' | 'BSc-Year1' | 'BSc-Year2';

export type SubjectName = 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology' | 'Computer Science' | 'Urdu' | 'English' | 'Pak Studies' | 'Islamiat';

export interface NotePage {
  pageNumber: number;
  title: string;
  section: string;
  keyPoints: string[];
  formulas?: string[];
  boardQuestions?: string[];
  contentHtml: string;
}

export interface NoteItem {
  id: string;
  title: string;
  classLevel: ClassLevel;
  subject: SubjectName;
  chapterNumber: number;
  chapterTitle: string;
  description: string;
  totalPages: number;
  pricePKR: number;
  rating: number;
  reviewsCount: number;
  topicsCovered: string[];
  previewPages: NotePage[];
  fullContentPages: NotePage[];
  samplePdfUrl?: string;
  googleDriveUrl?: string;
  previewPageLimit?: number;
  coverImage?: string;
  isBundle?: boolean;
}

export type OrderStatus = 'pending' | 'verified' | 'rejected';

export interface Order {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  noteIds: string[];
  noteTitles: string[];
  totalAmountPKR: number;
  paymentMethod: 'easypaisa' | 'manual';
  easypaisaAccount: string;
  trxId: string;
  screenshotUrl?: string;
  status: OrderStatus;
  createdAt: string;
  verifiedAt?: string;
  accessToken?: string;
  notesUnlocked?: Array<{
    id: string;
    title: string;
    classLevel: string;
    subject: string;
  }>;
}

export interface StudentUser {
  id?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  phone?: string;
  verifiedAt?: string;
  orders?: Order[];
}

export interface OrderNotificationAlert {
  id: string;
  orderId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  totalAmountPKR: number;
  verifiedAt: string;
  message: string;
}

export interface SiteSettings {
  siteName: string;
  ownerName: string;
  logoUrl?: string;
  easyPaisaNumber: string;
  whatsAppNumber: string;
  ownerEmail: string;
  mongoDbUri?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSenderEmail?: string;
  googleClientId?: string;
  clerkPublishableKey?: string;
}
