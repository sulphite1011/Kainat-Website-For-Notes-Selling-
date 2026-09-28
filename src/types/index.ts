export type ClassLevel = 
  | 'Matric-9th' 
  | 'Matric-10th' 
  | 'FSc-Part1' 
  | 'FSc-Part2' 
  | 'BSc-Year1' 
  | 'BSc-Year2'
  | string;

export type SubjectName = 
  | 'Physics' 
  | 'Chemistry' 
  | 'Mathematics' 
  | 'Biology' 
  | 'Computer Science'
  | string;

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
  isBundle?: boolean;
  bundleNoteIds?: string[];
  rating: number;
  reviewsCount: number;
  topicsCovered: string[];
  samplePdfUrl?: string;
  googleDriveUrl: string;
  googleDriveFileId?: string;
  previewPageLimit?: number;
  coverImage?: string;
  previewPages?: NotePage[];
  fullContentPages?: NotePage[];
}

export interface StudentUser {
  email: string;
  name: string;
  phone?: string;
  verifiedAt?: string;
}

export interface Order {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  noteIds: string[];
  noteTitles?: string[];
  totalAmountPKR: number;
  paymentMethod: 'easypaisa';
  easypaisaAccount: string;
  trxId: string;
  screenshotUrl?: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
  accessToken?: string;
  notesUnlocked?: Array<{
    id: string;
    title: string;
    classLevel: ClassLevel;
    subject: SubjectName;
  }>;
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
  logoUrl: string; // custom uploaded picture base64 or demo logo
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
}
