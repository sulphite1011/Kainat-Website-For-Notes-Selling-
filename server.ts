import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { initialNotesCatalog } from './src/data/notesCatalog.ts';
import { Order, OrderNotificationAlert, NoteItem, SiteSettings, StudentUser } from './src/types/index.ts';
import { generatePagesFromRawContent } from './src/utils/notesFormatter.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

interface DatabaseSchema {
  notes: NoteItem[];
  orders: Order[];
  users: StudentUser[];
  notifications: OrderNotificationAlert[];
  settings: SiteSettings;
}

const defaultSettings: SiteSettings = {
  siteName: 'Kainat Notes Hub',
  ownerName: 'Kainat',
  logoUrl: '/kainat_logo.svg',
  easyPaisaNumber: '03415892099',
  whatsAppNumber: '0324 9059918',
  ownerEmail: 'ka8984510@gmail.com',
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || '',
};

function getActiveClerkKey(): string {
  return (
    process.env.CLERK_PUBLISHABLE_KEY ||
    process.env.VITE_CLERK_PUBLISHABLE_KEY ||
    db.settings.clerkPublishableKey ||
    ''
  ).trim();
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.settings) {
        parsed.settings = defaultSettings;
      }
      if (!Array.isArray(parsed.users)) {
        parsed.users = [];
      }
      if (!Array.isArray(parsed.notes) || parsed.notes.length === 0) {
        parsed.notes = initialNotesCatalog;
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error loading database, initializing fresh:', err);
  }

  const initialDb: DatabaseSchema = {
    notes: initialNotesCatalog,
    orders: [],
    users: [],
    notifications: [],
    settings: defaultSettings,
  };

  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
  } catch {
    // In serverless / read-only environment, keep in memory
  }
  return initialDb;
}

function saveDatabase(dbData: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
  } catch (err) {
    // Graceful fallback for serverless read-only filesystems (Vercel / Cloudflare)
  }
}

let db = loadDatabase();

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(UPLOAD_DIR));

// Student User Sync & Directory
app.post('/api/users/sync', (req: Request, res: Response) => {
  const { email, name, phone, verifiedAt } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existingIndex = db.users.findIndex((u) => u.email.toLowerCase().trim() === cleanEmail);
  const studentUser: StudentUser = {
    id: existingIndex >= 0 ? db.users[existingIndex].id : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    name: name || (existingIndex >= 0 ? db.users[existingIndex].name : 'Student'),
    phone: phone || (existingIndex >= 0 ? db.users[existingIndex].phone : ''),
    verifiedAt: verifiedAt || new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    db.users[existingIndex] = { ...db.users[existingIndex], ...studentUser };
  } else {
    db.users.push(studentUser);
  }
  saveDatabase(db);

  res.json({ success: true, user: studentUser });
});

app.get('/api/users', (_req: Request, res: Response) => {
  res.json({ success: true, users: db.users });
});

// Media Upload Engine (Images for logos & book covers)
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { base64Data, filename, prefix } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, message: 'No file data received.' });
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = '.png';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
      else if (mime.includes('png')) ext = '.png';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('svg')) ext = '.svg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const cleanPrefix = prefix ? prefix.replace(/[^a-zA-Z0-9_-]/g, '') : 'upload';
    const uniqueName = `${cleanPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueName);

    try {
      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/uploads/${uniqueName}`;
      return res.json({
        success: true,
        url: publicUrl,
        filename: uniqueName,
      });
    } catch {
      // In serverless / read-only filesystem environments, return data URI directly
      return res.json({
        success: true,
        url: base64Data,
        filename: uniqueName,
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'File upload failed.' });
  }
});

// Settings & Config
app.get('/api/settings', (_req: Request, res: Response) => {
  const currentKey = getActiveClerkKey();
  res.json({
    success: true,
    settings: {
      ...db.settings,
      clerkPublishableKey: currentKey,
    },
  });
});

app.get('/api/clerk-key', (_req: Request, res: Response) => {
  const currentKey = getActiveClerkKey();
  res.json({
    success: true,
    clerkPublishableKey: currentKey,
  });
});

app.post('/api/settings', (req: Request, res: Response) => {
  const { siteName, logoUrl, easyPaisaNumber, whatsAppNumber, ownerEmail, clerkPublishableKey, googleClientId, smtpHost, smtpPort, smtpUser, smtpPass, smtpSenderEmail } = req.body;

  if (siteName) db.settings.siteName = siteName;
  if (typeof logoUrl === 'string') db.settings.logoUrl = logoUrl;
  if (easyPaisaNumber) db.settings.easyPaisaNumber = easyPaisaNumber;
  if (whatsAppNumber) db.settings.whatsAppNumber = whatsAppNumber;
  if (ownerEmail) db.settings.ownerEmail = ownerEmail;
  if (typeof clerkPublishableKey === 'string') db.settings.clerkPublishableKey = clerkPublishableKey.trim();
  if (typeof googleClientId === 'string') db.settings.googleClientId = googleClientId;
  if (smtpHost) db.settings.smtpHost = smtpHost;
  if (smtpPort) db.settings.smtpPort = Number(smtpPort);
  if (smtpUser) db.settings.smtpUser = smtpUser;
  if (smtpPass) db.settings.smtpPass = smtpPass;
  if (smtpSenderEmail) db.settings.smtpSenderEmail = smtpSenderEmail;

  saveDatabase(db);

  res.json({ success: true, message: 'Settings updated successfully.', settings: db.settings });
});

// Admin Authentication (Kainat / HamadJani)
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (
    username &&
    password &&
    username.trim().toLowerCase() === 'kainat' &&
    password.trim() === 'HamadJani'
  ) {
    const adminToken = `tok_admin_kainat_${Date.now()}`;
    return res.json({
      success: true,
      token: adminToken,
      admin: { username: 'Kainat', role: 'owner' },
    });
  }
  return res.status(401).json({
    success: false,
    message: 'Invalid Admin credentials. Access denied.',
  });
});

// Notes Catalog
app.get('/api/notes', (_req: Request, res: Response) => {
  res.json({ success: true, notes: db.notes });
});

app.post('/api/notes', (req: Request, res: Response) => {
  const noteData: NoteItem = req.body;
  if (!noteData.title || !noteData.classLevel || !noteData.subject) {
    return res.status(400).json({ success: false, message: 'Missing required note parameters.' });
  }

  const newId = noteData.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const createdNote: NoteItem = {
    ...noteData,
    id: newId,
    previewPages: noteData.previewPages && noteData.previewPages.length > 0
      ? noteData.previewPages
      : generatePagesFromRawContent(noteData.description || '', noteData.chapterTitle || 'Chapter 1', noteData.classLevel, noteData.subject),
    fullContentPages: noteData.fullContentPages && noteData.fullContentPages.length > 0
      ? noteData.fullContentPages
      : generatePagesFromRawContent(noteData.description || '', noteData.chapterTitle || 'Chapter 1', noteData.classLevel, noteData.subject),
  };

  db.notes.unshift(createdNote);
  saveDatabase(db);

  res.json({ success: true, note: createdNote });
});

app.put('/api/notes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.notes.findIndex((n) => n.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Note not found.' });
  }

  const updatedNote = { ...db.notes[index], ...req.body, id };
  db.notes[index] = updatedNote;
  saveDatabase(db);

  res.json({ success: true, note: updatedNote });
});

app.delete('/api/notes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.notes = db.notes.filter((n) => n.id !== id);
  saveDatabase(db);

  res.json({ success: true, message: 'Note deleted successfully.' });
});

// Orders
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json({ success: true, orders: db.orders });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { studentName, studentEmail, studentPhone, noteIds, noteTitles, totalAmountPKR, paymentMethod, easypaisaAccount, trxId, screenshotUrl } = req.body;

  if (!studentName || !studentEmail || !studentPhone || !trxId) {
    return res.status(400).json({ success: false, message: 'Please provide all student and transaction details.' });
  }

  const newOrder: Order = {
    id: `KN-${Math.floor(1000 + Math.random() * 9000)}`,
    studentName: studentName.trim(),
    studentEmail: studentEmail.trim().toLowerCase(),
    studentPhone: studentPhone.trim(),
    noteIds: noteIds || [],
    noteTitles: noteTitles || [],
    totalAmountPKR: Number(totalAmountPKR) || 0,
    paymentMethod: paymentMethod || 'easypaisa',
    easypaisaAccount: easypaisaAccount || db.settings.easyPaisaNumber,
    trxId: trxId.trim(),
    screenshotUrl: screenshotUrl || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.orders.unshift(newOrder);

  // Sync user in database
  const cleanEmail = newOrder.studentEmail.toLowerCase();
  const existingUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  const studentUserObj: StudentUser = {
    id: existingUser ? existingUser.id : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    name: newOrder.studentName,
    phone: newOrder.studentPhone,
    verifiedAt: new Date().toISOString(),
  };
  if (existingUser) {
    existingUser.name = newOrder.studentName;
    existingUser.phone = newOrder.studentPhone;
  } else {
    db.users.push(studentUserObj);
  }

  saveDatabase(db);

  res.json({ success: true, order: newOrder });
});

// Verify Order (Admin Action)
app.patch('/api/orders/:id/verify', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  order.status = 'verified';
  order.verifiedAt = new Date().toISOString();
  order.accessToken = `tok_${order.id.toLowerCase()}_access`;

  // Attach unlocked notes
  const unlocked = db.notes
    .filter((n) => order.noteIds.includes(n.id))
    .map((n) => ({ id: n.id, title: n.title, classLevel: n.classLevel, subject: n.subject }));
  order.notesUnlocked = unlocked;

  saveDatabase(db);

  // Broadcast real-time SSE alert
  const alert: OrderNotificationAlert = {
    id: `notif-${Date.now()}`,
    orderId: order.id,
    studentName: order.studentName,
    studentEmail: order.studentEmail,
    studentPhone: order.studentPhone,
    totalAmountPKR: order.totalAmountPKR,
    verifiedAt: order.verifiedAt,
    message: `Payment verified for ${order.studentName} (${order.id}). Notes unlocked in reader!`,
  };

  db.notifications.unshift(alert);
  broadcastAlert(alert);

  res.json({ success: true, order });
});

// Reject Order
app.patch('/api/orders/:id/reject', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  order.status = 'rejected';
  saveDatabase(db);

  res.json({ success: true, order });
});

// Student Order Lookup
app.get('/api/orders/lookup/:query', (req: Request, res: Response) => {
  const q = req.params.query.trim().toLowerCase();
  const matched = db.orders.filter(
    (o) =>
      o.id.toLowerCase() === q ||
      o.studentEmail.toLowerCase() === q ||
      o.studentPhone.includes(q) ||
      o.trxId.toLowerCase() === q
  );
  res.json({ success: true, orders: matched });
});

app.get('/api/orders/student/:email', (req: Request, res: Response) => {
  const email = req.params.email.trim().toLowerCase();
  const matched = db.orders.filter(
    (o) => o.studentEmail.toLowerCase() === email && o.status === 'verified'
  );
  res.json({ success: true, orders: matched });
});

// Real-Time Events (Server-Sent Events)
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  sseClients.push(res);
  res.write(`data: ${JSON.stringify({ type: 'connected', time: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Test SMTP
app.post('/api/test-smtp', async (req: Request, res: Response) => {
  const { smtpHost, smtpPort, smtpUser, smtpPass, testRecipient } = req.body;

  if (!smtpHost || !smtpUser || !smtpPass) {
    return res.status(400).json({ success: false, message: 'Missing SMTP credentials.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort) || 465,
      secure: Number(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass.replace(/\s+/g, ''),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: `"Kainat Notes Hub" <${smtpUser}>`,
      to: testRecipient || smtpUser,
      subject: '✅ Kainat Notes Hub — Email System Test',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>✅ SMTP Dispatch Successful</h2>
          <p>Your outgoing Gmail SMTP credentials are confirmed working properly on Kainat Notes Hub.</p>
        </div>
      `,
    });

    res.json({ success: true, message: `Test email dispatched successfully to ${testRecipient || smtpUser}! Message ID: ${info.messageId}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: `SMTP test failed: ${err.message}` });
  }
});

export default app;

const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('server.ts') ||
  process.argv[1].endsWith('server.js') ||
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
);

if (isMainModule) {
  const distDir = path.join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }
  app.listen(PORT, () => {
    console.log(`Kainat Notes Hub server running on port ${PORT}`);
  });
}
