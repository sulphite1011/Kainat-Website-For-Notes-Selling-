import { MongoClient, Db, Collection } from 'mongodb';
import { NoteItem, Order, SiteSettings, StudentUser, OrderNotificationAlert } from '../types/index.ts';
import { initialNotesCatalog } from '../data/notesCatalog.ts';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;
let connectionError: string | null = null;

export interface MongoCollections {
  notes: Collection<NoteItem>;
  orders: Collection<Order>;
  users: Collection<StudentUser>;
  settings: Collection<SiteSettings>;
  notifications: Collection<OrderNotificationAlert>;
}

export function isMongoConnected(): boolean {
  return isConnected && db !== null;
}

export function getMongoError(): string | null {
  return connectionError;
}

export async function initMongo(customUri?: string): Promise<boolean> {
  const uri = customUri || process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    connectionError = 'MONGODB_URI is not set in environment or settings. Using local file storage.';
    return false;
  }

  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas cluster...');
    if (client) {
      try {
        await client.close();
      } catch {
        // ignore
      }
      client = null;
      db = null;
      isConnected = false;
    }

    client = new MongoClient(uri.trim(), {
      connectTimeoutMS: 8000,
      serverSelectionTimeoutMS: 8000,
    });

    await client.connect();
    // Default to 'kainat_notes_hub' database
    db = client.db('kainat_notes_hub');
    isConnected = true;
    connectionError = null;
    console.log('[MongoDB] Successfully connected to MongoDB database: kainat_notes_hub');

    // Auto-seed if empty
    await seedMongoIfEmpty();
    return true;
  } catch (err: any) {
    isConnected = false;
    connectionError = err.message || 'Failed to connect to MongoDB';
    console.error('[MongoDB] Connection error:', connectionError);
    return false;
  }
}

export async function testMongoConnection(uri: string): Promise<{ success: boolean; message: string; database?: string }> {
  if (!uri || !uri.trim()) {
    return { success: false, message: 'MongoDB URI cannot be empty.' };
  }
  let testClient: MongoClient | null = null;
  try {
    testClient = new MongoClient(uri.trim(), {
      connectTimeoutMS: 6000,
      serverSelectionTimeoutMS: 6000,
    });
    await testClient.connect();
    const testDb = testClient.db('kainat_notes_hub');
    await testDb.command({ ping: 1 });
    await testClient.close();
    return { success: true, message: 'Successfully connected and pinged MongoDB Atlas cluster!', database: 'kainat_notes_hub' };
  } catch (err: any) {
    if (testClient) {
      try { await testClient.close(); } catch {}
    }
    return { success: false, message: err.message || 'Failed to connect to MongoDB cluster with provided URI.' };
  }
}

async function seedMongoIfEmpty() {
  if (!db) return;
  try {
    const notesCount = await db.collection('notes').countDocuments();
    if (notesCount === 0) {
      console.log('[MongoDB] Seeding initial course catalog and Google Drive links into MongoDB...');
      await db.collection('notes').insertMany(initialNotesCatalog as any[]);
    }

    const settingsCount = await db.collection('settings').countDocuments();
    if (settingsCount === 0) {
      console.log('[MongoDB] Seeding default site settings into MongoDB...');
      const defaultSettings: SiteSettings = {
        siteName: 'Kainat Notes Hub',
        ownerName: 'Kainat',
        logoUrl: '',
        easyPaisaNumber: '03415892099',
        whatsAppNumber: '0324 9059918',
        ownerEmail: 'ka8984510@gmail.com',
        clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY || '',
      };
      await db.collection('settings').insertOne(defaultSettings as any);
    }
  } catch (err) {
    console.error('[MongoDB] Seeding error:', err);
  }
}

// Data Access API
export async function mongoGetNotes(): Promise<NoteItem[]> {
  if (!db) throw new Error('MongoDB not connected');
  return (await db.collection('notes').find({}).toArray()) as unknown as NoteItem[];
}

export async function mongoSaveNote(note: NoteItem): Promise<NoteItem> {
  if (!db) throw new Error('MongoDB not connected');
  await db.collection('notes').updateOne(
    { id: note.id },
    { $set: note },
    { upsert: true }
  );
  return note;
}

export async function mongoDeleteNote(id: string): Promise<boolean> {
  if (!db) throw new Error('MongoDB not connected');
  const res = await db.collection('notes').deleteOne({ id });
  return res.deletedCount > 0;
}

export async function mongoGetOrders(): Promise<Order[]> {
  if (!db) throw new Error('MongoDB not connected');
  return (await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray()) as unknown as Order[];
}

export async function mongoSaveOrder(order: Order): Promise<Order> {
  if (!db) throw new Error('MongoDB not connected');
  await db.collection('orders').updateOne(
    { id: order.id },
    { $set: order },
    { upsert: true }
  );
  return order;
}

export async function mongoGetSettings(): Promise<SiteSettings | null> {
  if (!db) throw new Error('MongoDB not connected');
  const doc = await db.collection('settings').findOne({});
  return doc as unknown as SiteSettings | null;
}

export async function mongoSaveSettings(settings: SiteSettings): Promise<SiteSettings> {
  if (!db) throw new Error('MongoDB not connected');
  await db.collection('settings').updateOne(
    {},
    { $set: settings },
    { upsert: true }
  );
  return settings;
}

export async function mongoGetUsers(): Promise<StudentUser[]> {
  if (!db) throw new Error('MongoDB not connected');
  return (await db.collection('users').find({}).toArray()) as unknown as StudentUser[];
}

export async function mongoSaveUser(user: StudentUser): Promise<StudentUser> {
  if (!db) throw new Error('MongoDB not connected');
  await db.collection('users').updateOne(
    { email: user.email.toLowerCase().trim() },
    { $set: user },
    { upsert: true }
  );
  return user;
}

export async function mongoGetStatus() {
  if (!db || !isConnected) {
    return {
      connected: false,
      configured: Boolean(process.env.MONGODB_URI),
      error: connectionError || 'MongoDB cluster not connected yet. Add MONGODB_URI in environment or Settings.',
      counts: null,
    };
  }
  try {
    const [notes, orders, users] = await Promise.all([
      db.collection('notes').countDocuments(),
      db.collection('orders').countDocuments(),
      db.collection('users').countDocuments(),
    ]);
    return {
      connected: true,
      configured: true,
      error: null,
      database: db.databaseName,
      counts: { notes, orders, users },
    };
  } catch (err: any) {
    return {
      connected: false,
      configured: true,
      error: err.message,
      counts: null,
    };
  }
}
