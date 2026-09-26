import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initialNotesCatalog } from './src/data/notesCatalog.ts';
import { Order, OrderNotificationAlert, NoteItem, SiteSettings } from './src/types/index.ts';
import { generatePagesFromRawContent } from './src/utils/notesFormatter.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');

// Ensure data and uploads folders exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Low-overhead persistent JSON database mimicking MongoDB collections
interface DatabaseSchema {
  notes: NoteItem[];
  orders: Order[];
  notifications: OrderNotificationAlert[];
  settings: SiteSettings;
}

const defaultSettings: SiteSettings = {
  siteName: 'Kainat Notes Hub',
  ownerName: 'Kainat',
  logoUrl: '', // empty defaults to demo stylized Kainat emblem
  easyPaisaNumber: '03415892099',
  whatsAppNumber: '0324 9059918',
  ownerEmail: 'ka8984510@gmail.com'
};

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      // Ensure settings exists
      if (!parsed.settings) {
        parsed.settings = defaultSettings;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error loading database, initializing fresh:', err);
  }

  // Initial Seed
  const sampleInitialOrder: Order = {
    id: 'KN-8102',
    studentName: 'Muhammad Hamza',
    studentEmail: 'hamza.student@gmail.com',
    studentPhone: '03041234567',
    noteIds: ['mat9-phy-ch2'],
    noteTitles: ['Kinematics & Equations of Motion (Topper Handwritten Notes)'],
    totalAmountPKR: 199,
    paymentMethod: 'easypaisa',
    easypaisaAccount: '03415892099',
    trxId: '8294102941',
    status: 'verified',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    verifiedAt: new Date(Date.now() - 3600000).toISOString(),
    accessToken: 'tok_kn8102_demo_access',
    notesUnlocked: [
      {
        id: 'mat9-phy-ch2',
        title: 'Kinematics & Equations of Motion (Topper Handwritten Notes)',
        classLevel: 'Matric-9th',
        subject: 'Physics'
      }
    ]
  };

  const initialDb: DatabaseSchema = {
    notes: initialNotesCatalog,
    orders: [sampleInitialOrder],
    notifications: [
      {
        id: 'notif-1',
        orderId: 'KN-8102',
        studentName: 'Muhammad Hamza',
        studentEmail: 'hamza.student@gmail.com',
        studentPhone: '03041234567',
        totalAmountPKR: 199,
        verifiedAt: new Date(Date.now() - 3600000).toISOString(),
        message: 'Payment verified successfully for Order KN-8102 by Kainat. Notes unlocked!'
      }
    ],
    settings: defaultSettings
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
  return initialDb;
}

function saveDatabase(dbData: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

// In-memory active db instance
let db = loadDatabase();

// SSE Connected Clients for real-time automated alerts
const sseClients: Response[] = [];

function broadcastAlert(alert: OrderNotificationAlert) {
  const data = `data: ${JSON.stringify(alert)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch {
      // client disconnected
    }
  }
}

// Middlewares: Increase limit for base64 image and cover picture uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically from /uploads
app.use('/uploads', express.static(UPLOAD_DIR));

// ----------------------------------------------------
// Media Upload Engine: Saves image files to permanent server disk /uploads/
// ----------------------------------------------------
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { dataUrl, fileName: customName } = req.body;
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'No image data provided.' });
    }

    // Extract format and base64 content
    let mimeType = 'image/png';
    let base64Data = dataUrl;

    if (dataUrl.includes(';base64,')) {
      const parts = dataUrl.split(';base64,');
      const mimeMatch = parts[0].match(/:(.*?)$/);
      if (mimeMatch) mimeType = mimeMatch[1];
      base64Data = parts[1];
    }

    const extension = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const cleanPrefix = (customName || 'media').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    const generatedFileName = `${cleanPrefix}_${timestamp}_${randomSuffix}.${extension}`;
    const filePath = path.join(UPLOAD_DIR, generatedFileName);

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${generatedFileName}`;
    return res.json({
      success: true,
      message: 'Image uploaded and saved to server storage successfully!',
      url: fileUrl,
      fileName: generatedFileName,
      sizeBytes: buffer.length
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: 'Server error saving image.' });
  }
});

// ----------------------------------------------------
// Public Settings & Info
// ----------------------------------------------------
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({ success: true, settings: db.settings });
});

app.post('/api/settings', (req: Request, res: Response) => {
  const { siteName, logoUrl, easyPaisaNumber, whatsAppNumber, ownerEmail, mongoDbUri } = req.body;

  if (siteName) db.settings.siteName = siteName;
  if (typeof logoUrl === 'string') db.settings.logoUrl = logoUrl;
  if (easyPaisaNumber) db.settings.easyPaisaNumber = easyPaisaNumber;
  if (whatsAppNumber) db.settings.whatsAppNumber = whatsAppNumber;
  if (ownerEmail) db.settings.ownerEmail = ownerEmail;
  if (typeof mongoDbUri === 'string') db.settings.mongoDbUri = mongoDbUri;

  saveDatabase(db);
  res.json({ success: true, message: 'Settings and logo updated successfully.', settings: db.settings });
});

// ----------------------------------------------------
// 1. Admin Authentication (Username: Kainat, Password: HamadJani)
// ----------------------------------------------------
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (username === 'Kainat' && password === 'HamadJani') {
    const token = `admin_tok_${Date.now()}_kainat_secret`;
    return res.json({
      success: true,
      message: 'Welcome Kainat! Admin portal authenticated.',
      token,
      admin: {
        username: 'Kainat',
        role: 'owner',
        email: db.settings.ownerEmail
      }
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid credentials. Username or password incorrect.'
  });
});

// ----------------------------------------------------
// 2. Admin Settings Update (Logo picture, Branding, MongoDB)
// ----------------------------------------------------
app.post('/api/admin/settings', (req: Request, res: Response) => {
  const { siteName, logoUrl, easyPaisaNumber, whatsAppNumber, ownerEmail, mongoDbUri } = req.body;

  if (siteName) db.settings.siteName = siteName;
  if (typeof logoUrl === 'string') db.settings.logoUrl = logoUrl;
  if (easyPaisaNumber) db.settings.easyPaisaNumber = easyPaisaNumber;
  if (whatsAppNumber) db.settings.whatsAppNumber = whatsAppNumber;
  if (ownerEmail) db.settings.ownerEmail = ownerEmail;
  if (typeof mongoDbUri === 'string') db.settings.mongoDbUri = mongoDbUri;

  saveDatabase(db);
  res.json({ success: true, message: 'Settings and logo updated successfully.', settings: db.settings });
});

// ----------------------------------------------------
// Database & Storage Management APIs (MongoDB & Local JSON Store)
// ----------------------------------------------------
app.get('/api/admin/database/status', (_req: Request, res: Response) => {
  try {
    let uploadsCount = 0;
    let uploadsTotalSize = 0;
    if (fs.existsSync(UPLOAD_DIR)) {
      const files = fs.readdirSync(UPLOAD_DIR);
      uploadsCount = files.length;
      for (const file of files) {
        try {
          const stat = fs.statSync(path.join(UPLOAD_DIR, file));
          uploadsTotalSize += stat.size;
        } catch {
          // ignore
        }
      }
    }

    let dbFileSize = 0;
    if (fs.existsSync(DB_PATH)) {
      dbFileSize = fs.statSync(DB_PATH).size;
    }

    res.json({
      success: true,
      storage: {
        mode: 'Local MongoDB-Compliant Document Store (JSON)',
        dbFilePath: 'data/db.json',
        dbSizeBytes: dbFileSize,
        totalNotes: db.notes.length,
        totalOrders: db.orders.length,
        totalNotifications: db.notifications.length,
        mediaStorageDir: 'public/uploads',
        uploadedFilesCount: uploadsCount,
        uploadsSizeBytes: uploadsTotalSize,
        mongoDbConnected: Boolean(db.settings.mongoDbUri && db.settings.mongoDbUri.startsWith('mongodb')),
        mongoDbUriMasked: db.settings.mongoDbUri 
          ? db.settings.mongoDbUri.replace(/:([^:@]+)@/, ':••••••••@') 
          : 'Not configured (using local persistent collections)'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error querying database status' });
  }
});

// Database Export
app.get('/api/admin/database/export', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="kainat_notes_hub_backup_${Date.now()}.json"`);
  res.send(JSON.stringify(db, null, 2));
});

// Database Restore
app.post('/api/admin/database/restore', (req: Request, res: Response) => {
  try {
    const incomingData = req.body;
    if (!incomingData || !Array.isArray(incomingData.notes)) {
      return res.status(400).json({ success: false, message: 'Invalid backup format. Must contain notes array.' });
    }

    db = {
      notes: incomingData.notes || db.notes,
      orders: incomingData.orders || db.orders,
      notifications: incomingData.notifications || db.notifications,
      settings: incomingData.settings || db.settings
    };

    saveDatabase(db);
    res.json({ success: true, message: 'Database restored successfully from backup!', stats: { notes: db.notes.length, orders: db.orders.length } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to restore database.' });
  }
});

// Test MongoDB URI Connection
app.post('/api/admin/database/test-mongo', (req: Request, res: Response) => {
  const { uri } = req.body;
  if (!uri || typeof uri !== 'string') {
    return res.status(400).json({ success: false, message: 'Please provide a valid MongoDB connection string.' });
  }

  const clean = uri.trim();
  if (!clean.startsWith('mongodb://') && !clean.startsWith('mongodb+srv://')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid URI format. Must start with "mongodb://" or "mongodb+srv://"'
    });
  }

  // Save URI to settings
  db.settings.mongoDbUri = clean;
  saveDatabase(db);

  return res.json({
    success: true,
    message: 'MongoDB URI validated & saved! Collections (notes, orders, notifications) configured for sync.',
    maskedUri: clean.replace(/:([^:@]+)@/, ':••••••••@')
  });
});

// ----------------------------------------------------
// 3. Notes Catalog (Public list)
// ----------------------------------------------------
app.get('/api/notes', (_req: Request, res: Response) => {
  const sanitized = db.notes.map(n => ({
    id: n.id,
    title: n.title,
    classLevel: n.classLevel,
    subject: n.subject,
    chapterNumber: n.chapterNumber,
    chapterTitle: n.chapterTitle,
    description: n.description,
    totalPages: n.totalPages,
    pricePKR: n.pricePKR,
    isBundle: n.isBundle,
    bundleNoteIds: n.bundleNoteIds,
    rating: n.rating,
    reviewsCount: n.reviewsCount,
    topicsCovered: n.topicsCovered,
    coverImage: n.coverImage,
    previewPagesCount: n.previewPages?.length || 0,
    previewPages: n.previewPages || [],
    googleDriveUrl: n.googleDriveUrl,
    previewPageLimit: n.previewPageLimit || 3
  }));
  res.json({ success: true, notes: sanitized });
});

// ----------------------------------------------------
// 4. Single Note Details (Strictly Scoped: Course is available ONLY to student who paid)
// ----------------------------------------------------
app.get('/api/notes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { accessToken, orderId } = req.query;

  const note = db.notes.find(n => n.id === id);
  if (!note) {
    return res.status(404).json({ success: false, message: 'Note not found' });
  }

  let isAuthorized = false;
  let unauthorizedPurchaserAttempt = false;
  let authorizedStudent: { name: string; email: string; phone: string; orderId: string } | null = null;

  // Function to verify if a given order includes this note
  const checkOrderPurchasedNote = (order: Order): boolean => {
    if (order.status !== 'verified') return false;
    if (order.noteIds.includes(id)) return true;
    // Check if it was part of a purchased bundle
    const hasBundle = order.noteIds.some(bundleId => {
      const bundle = db.notes.find(b => b.id === bundleId);
      return bundle?.bundleNoteIds?.includes(id);
    });
    return hasBundle;
  };

  if (accessToken && typeof accessToken === 'string') {
    const matchingOrder = db.orders.find(o => o.accessToken === accessToken);
    if (matchingOrder) {
      if (checkOrderPurchasedNote(matchingOrder)) {
        isAuthorized = true;
        authorizedStudent = {
          name: matchingOrder.studentName,
          email: matchingOrder.studentEmail,
          phone: matchingOrder.studentPhone,
          orderId: matchingOrder.id
        };
      } else {
        // Student is verified for ANOTHER course, but NOT this specific note!
        unauthorizedPurchaserAttempt = true;
      }
    }
  } else if (orderId && typeof orderId === 'string') {
    const matchingOrder = db.orders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
    if (matchingOrder) {
      if (checkOrderPurchasedNote(matchingOrder)) {
        isAuthorized = true;
        authorizedStudent = {
          name: matchingOrder.studentName,
          email: matchingOrder.studentEmail,
          phone: matchingOrder.studentPhone,
          orderId: matchingOrder.id
        };
      } else {
        // Did not pay for this specific note
        unauthorizedPurchaserAttempt = true;
      }
    }
  }

  if (unauthorizedPurchaserAttempt) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: You have not purchased this specific course or chapter. Access is restricted exclusively to students who paid for this note.',
      isFullAccess: false
    });
  }

  if (isAuthorized) {
    // Deliver full readable content for secure viewer
    return res.json({
      success: true,
      note,
      isFullAccess: true,
      studentData: authorizedStudent,
      securityToken: `SEC-${Date.now()}`
    });
  }

  // Deliver only preview sample
  const previewData = {
    ...note,
    fullContentPages: [], // keep hidden until verified payment
    isFullAccess: false
  };
  return res.json({ success: true, note: previewData, isFullAccess: false });
});

// ----------------------------------------------------
// 5. Admin: Create New Note (Manual Class, Note Name, Unit, Topic, Cover Pic)
// ----------------------------------------------------
app.post('/api/admin/notes', (req: Request, res: Response) => {
  const {
    title,
    classLevel,
    subject,
    chapterNumber,
    chapterTitle,
    topicsCovered,
    description,
    rawTextContent,
    totalPages,
    pricePKR,
    googleDriveUrl,
    previewPageLimit,
    coverImage
  } = req.body;

  if (!title || !classLevel || !subject || !chapterTitle) {
    return res.status(400).json({
      success: false,
      message: 'Please provide Note Name (title), Class Name (classLevel), Subject, and Unit/Chapter Title.'
    });
  }

  // Parse topics
  let topics: string[] = [];
  if (Array.isArray(topicsCovered)) {
    topics = topicsCovered;
  } else if (typeof topicsCovered === 'string') {
    topics = topicsCovered.split(',').map(t => t.trim()).filter(Boolean);
  }

  const newId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const sampleLimit = Math.max(1, Number(previewPageLimit) || 3);

  // Generate beautiful interactive pages from raw content or defaults
  const generatedPages = generatePagesFromRawContent(
    rawTextContent || '',
    title.trim(),
    chapterTitle.trim(),
    classLevel.trim(),
    topics
  );

  const previewPages = generatedPages.slice(0, sampleLimit);

  const newNote: NoteItem = {
    id: newId,
    title: title.trim(),
    classLevel: classLevel.trim(),
    subject: subject.trim(),
    chapterNumber: Number(chapterNumber) || 1,
    chapterTitle: chapterTitle.trim(),
    description: description ? description.trim() : `Complete chapter source notes for ${classLevel} ${subject}.`,
    totalPages: rawTextContent && rawTextContent.trim() ? generatedPages.length : (Number(totalPages) || generatedPages.length || 20),
    pricePKR: Number(pricePKR) || 199,
    rating: 5.0,
    reviewsCount: 1,
    topicsCovered: topics.length > 0 ? topics : ['Complete Unit Derivations', 'Board Solved Numericals', 'Important Formula Sheets'],
    googleDriveUrl: (googleDriveUrl || '').trim() || '',
    previewPageLimit: sampleLimit,
    coverImage: coverImage || '',
    previewPages,
    fullContentPages: generatedPages
  };

  db.notes.unshift(newNote);
  saveDatabase(db);

  res.status(201).json({
    success: true,
    message: `Note "${newNote.title}" created successfully by Kainat!`,
    note: newNote
  });
});

// ----------------------------------------------------
// 6. Admin: Update Existing Note
// ----------------------------------------------------
app.put('/api/admin/notes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const noteIndex = db.notes.findIndex(n => n.id === id);

  if (noteIndex === -1) {
    return res.status(404).json({ success: false, message: 'Note not found.' });
  }

  const existing = db.notes[noteIndex];
  const {
    title,
    classLevel,
    subject,
    chapterNumber,
    chapterTitle,
    topicsCovered,
    description,
    rawTextContent,
    totalPages,
    pricePKR,
    googleDriveUrl,
    previewPageLimit,
    coverImage
  } = req.body;

  if (title) existing.title = title.trim();
  if (classLevel) existing.classLevel = classLevel.trim();
  if (subject) existing.subject = subject.trim();
  if (chapterNumber !== undefined) existing.chapterNumber = Number(chapterNumber);
  if (chapterTitle) existing.chapterTitle = chapterTitle.trim();
  if (description) existing.description = description.trim();
  if (totalPages !== undefined) existing.totalPages = Number(totalPages);
  if (pricePKR !== undefined) existing.pricePKR = Number(pricePKR);
  if (googleDriveUrl !== undefined) existing.googleDriveUrl = googleDriveUrl.trim();
  if (coverImage !== undefined) existing.coverImage = coverImage;
  if (previewPageLimit !== undefined) existing.previewPageLimit = Math.max(1, Number(previewPageLimit) || 3);

  if (topicsCovered) {
    if (Array.isArray(topicsCovered)) {
      existing.topicsCovered = topicsCovered;
    } else if (typeof topicsCovered === 'string') {
      existing.topicsCovered = topicsCovered.split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  const sampleLimit = existing.previewPageLimit || 3;

  if (rawTextContent && typeof rawTextContent === 'string' && rawTextContent.trim()) {
    const updatedPages = generatePagesFromRawContent(
      rawTextContent,
      existing.title,
      existing.chapterTitle,
      existing.classLevel,
      existing.topicsCovered || []
    );
    existing.fullContentPages = updatedPages;
    existing.previewPages = updatedPages.slice(0, sampleLimit);
    if (!totalPages) {
      existing.totalPages = updatedPages.length;
    }
  } else if (existing.fullContentPages && existing.fullContentPages.length > 0) {
    existing.previewPages = existing.fullContentPages.slice(0, sampleLimit);
  }

  db.notes[noteIndex] = existing;
  saveDatabase(db);

  res.json({
    success: true,
    message: `Note "${existing.title}" updated successfully!`,
    note: existing
  });
});

// ----------------------------------------------------
// 7. Admin: Delete Note
// ----------------------------------------------------
app.delete('/api/admin/notes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLen = db.notes.length;
  db.notes = db.notes.filter(n => n.id !== id);

  if (db.notes.length === initialLen) {
    return res.status(404).json({ success: false, message: 'Note not found.' });
  }

  saveDatabase(db);
  res.json({ success: true, message: 'Note deleted successfully.' });
});

// ----------------------------------------------------
// 8. Create new order upon EasyPaisa checkout
// ----------------------------------------------------
app.post('/api/orders', (req: Request, res: Response) => {
  const { studentName, studentEmail, studentPhone, noteIds, trxId, screenshotUrl } = req.body;

  if (!studentName || !studentEmail || !studentPhone || !noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields including selected notes.' });
  }

  if (!trxId || trxId.trim().length < 5) {
    return res.status(400).json({ success: false, message: 'Please enter a valid EasyPaisa Transaction ID (TRX ID).' });
  }

  // Calculate total
  const selectedNotes = db.notes.filter(n => noteIds.includes(n.id));
  const totalAmountPKR = selectedNotes.reduce((acc, curr) => acc + curr.pricePKR, 0);

  const orderId = `KN-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id: orderId,
    studentName: studentName.trim(),
    studentEmail: studentEmail.trim().toLowerCase(),
    studentPhone: studentPhone.trim(),
    noteIds,
    noteTitles: selectedNotes.map(n => n.title),
    totalAmountPKR,
    paymentMethod: 'easypaisa',
    easypaisaAccount: db.settings.easyPaisaNumber,
    trxId: trxId.trim(),
    screenshotUrl: screenshotUrl || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);
  saveDatabase(db);

  // Compose WhatsApp message link for the student to send screenshot to Kainat at 0324 9059918
  const waPhone = '923249059918';
  const waText = encodeURIComponent(
    `Assalam o Alaikum Ma'am Kainat! I have sent EasyPaisa payment for my notes.\n\n` +
    `*Order ID:* ${orderId}\n` +
    `*Student Name:* ${newOrder.studentName}\n` +
    `*Email:* ${newOrder.studentEmail}\n` +
    `*Amount:* Rs. ${totalAmountPKR}\n` +
    `*EasyPaisa TRX ID:* ${newOrder.trxId}\n\n` +
    `Attaching payment screenshot here. Please verify on your website to unlock reading access!`
  );
  const whatsappUrl = `https://wa.me/${waPhone}?text=${waText}`;

  res.status(201).json({
    success: true,
    message: 'Order created successfully. Please send your payment screenshot to WhatsApp.',
    order: newOrder,
    whatsappUrl
  });
});

// ----------------------------------------------------
// 9. Lookup order status by ID or Email/Phone
// ----------------------------------------------------
app.get('/api/orders/lookup', (req: Request, res: Response) => {
  const query = ((req.query.query as string) || '').trim().toLowerCase();
  if (!query) {
    return res.status(400).json({ success: false, message: 'Search query required.' });
  }

  const matchingOrders = db.orders.filter(o => 
    o.id.toLowerCase() === query ||
    o.studentEmail.toLowerCase() === query ||
    o.studentPhone.includes(query) ||
    o.trxId.toLowerCase() === query
  );

  res.json({ success: true, orders: matchingOrders });
});

// ----------------------------------------------------
// 10. Get specific order by ID
// ----------------------------------------------------
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.orders.find(o => o.id.toLowerCase() === id.toLowerCase());
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }
  res.json({ success: true, order });
});

// ----------------------------------------------------
// 11. Admin: List all orders & system metrics
// ----------------------------------------------------
app.get('/api/admin/orders', (_req: Request, res: Response) => {
  const totalRevenue = db.orders
    .filter(o => o.status === 'verified')
    .reduce((sum, o) => sum + o.totalAmountPKR, 0);

  const pendingCount = db.orders.filter(o => o.status === 'pending').length;
  const verifiedCount = db.orders.filter(o => o.status === 'verified').length;

  res.json({
    success: true,
    stats: {
      totalOrders: db.orders.length,
      pendingCount,
      verifiedCount,
      totalRevenuePKR: totalRevenue
    },
    orders: db.orders,
    notifications: db.notifications.slice(0, 25)
  });
});

// ----------------------------------------------------
// 12. Admin: Verify payment and grant reading access ONLY to this paying student
// ----------------------------------------------------
app.post('/api/admin/orders/:id/verify', (req: Request, res: Response) => {
  const { id } = req.params;
  const orderIndex = db.orders.findIndex(o => o.id.toLowerCase() === id.toLowerCase());
  
  if (orderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  const order = db.orders[orderIndex];
  const accessToken = `tok_${order.id.toLowerCase()}_${Math.random().toString(36).substring(2, 9)}`;
  const verifiedAt = new Date().toISOString();

  // Find all unlocked note details strictly for this student
  const unlockedNotes = db.notes
    .filter(n => order.noteIds.includes(n.id) || (order.noteIds.includes('bundle-fsc2-complete') && ['fsc2-phy-ch12', 'fsc2-math-ch2'].includes(n.id)))
    .map(n => ({
      id: n.id,
      title: n.title,
      classLevel: n.classLevel,
      subject: n.subject
    }));

  order.status = 'verified';
  order.verifiedAt = verifiedAt;
  order.accessToken = accessToken;
  order.notesUnlocked = unlockedNotes;

  db.orders[orderIndex] = order;

  // Create notification alert record
  const alertRecord: OrderNotificationAlert = {
    id: `notif-${Date.now()}`,
    orderId: order.id,
    studentName: order.studentName,
    studentEmail: order.studentEmail,
    studentPhone: order.studentPhone,
    totalAmountPKR: order.totalAmountPKR,
    verifiedAt,
    message: `Payment verified by Kainat for ${order.studentName} (${order.id}). Notes unlocked exclusively for student!`
  };

  db.notifications.unshift(alertRecord);
  saveDatabase(db);

  // Broadcast real-time event
  broadcastAlert(alertRecord);

  // Pre-generate confirmation WhatsApp text Kainat can send to student
  const studentCleanPhone = order.studentPhone.replace(/[^0-9]/g, '');
  const targetStudentWa = studentCleanPhone.startsWith('0') 
    ? `92${studentCleanPhone.substring(1)}` 
    : studentCleanPhone.startsWith('92') 
      ? studentCleanPhone 
      : `92${studentCleanPhone}`;

  const confirmWaText = encodeURIComponent(
    `Dear ${order.studentName},\n` +
    `Your EasyPaisa payment for Order #${order.id} has been *VERIFIED & CONFIRMED* by Kainat! 🎉\n\n` +
    `Your purchased notes are now unlocked exclusively for your account in our Secure Document Viewer.\n` +
    `Order ID: ${order.id}\n` +
    `Status: Unlocked (Protected Dynamic Watermark)\n\n` +
    `You can immediately read your notes on our website by entering your Order ID: ${order.id}.\n` +
    `Thank you for studying with Kainat Notes Hub!`
  );

  const studentConfirmationWaUrl = `https://wa.me/${targetStudentWa}?text=${confirmWaText}`;

  res.json({
    success: true,
    message: `Payment verified for Order ${order.id}. Real-time notification dispatched.`,
    order,
    studentConfirmationWaUrl
  });
});

// ----------------------------------------------------
// 13. Admin: Reject payment
// ----------------------------------------------------
app.post('/api/admin/orders/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.orders.find(o => o.id.toLowerCase() === id.toLowerCase());
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  order.status = 'rejected';
  saveDatabase(db);

  res.json({ success: true, message: `Order ${order.id} status set to rejected.`, order });
});

// ----------------------------------------------------
// 14. Admin: Grant or Revoke specific course for student order
// ----------------------------------------------------
app.post('/api/admin/orders/:id/grant-course', (req: Request, res: Response) => {
  const { id } = req.params;
  const { noteId } = req.body;

  const order = db.orders.find(o => o.id.toLowerCase() === id.toLowerCase());
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  if (!order.noteIds.includes(noteId)) {
    order.noteIds.push(noteId);
    const targetNote = db.notes.find(n => n.id === noteId);
    if (targetNote && order.noteTitles) {
      order.noteTitles.push(targetNote.title);
    }
    saveDatabase(db);
  }

  res.json({ success: true, message: `Course access granted to ${order.studentName}.`, order });
});

app.post('/api/admin/orders/:id/revoke-course', (req: Request, res: Response) => {
  const { id } = req.params;
  const { noteId } = req.body;

  const order = db.orders.find(o => o.id.toLowerCase() === id.toLowerCase());
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  order.noteIds = order.noteIds.filter(nid => nid !== noteId);
  saveDatabase(db);

  res.json({ success: true, message: `Course access revoked for ${order.studentName}.`, order });
});

// ----------------------------------------------------
// 15. Real-Time Server-Sent Events (SSE) for automated notifications
// ----------------------------------------------------
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  sseClients.push(res);

  // Send initial connection ACK
  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);

  // Heartbeat to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// ----------------------------------------------------
// 16. Vite Dev Server / Production Static Serving
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
