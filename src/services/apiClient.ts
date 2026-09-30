import { NoteItem, Order, SiteSettings, StudentUser } from '../types';
import { initialNotesCatalog } from '../data/notesCatalog';

const SETTINGS_KEY = 'kainat_notes_settings';
const NOTES_KEY = 'kainat_notes_catalog';
const DELETED_NOTES_KEY = 'kainat_deleted_note_ids';
const ORDERS_KEY = 'kainat_orders_vault';
const STUDENT_USER_KEY = 'kainat_student_user';
const USERS_LIST_KEY = 'kainat_registered_students';
const CATALOG_VERSION_KEY = 'kainat_catalog_version';
const CURRENT_CATALOG_VERSION = 'v2026_canonical_catalog_v3';

export const defaultSettings: SiteSettings = {
  siteName: 'Kainat Notes Hub',
  ownerName: 'Kainat',
  logoUrl: '/kainat_logo.svg',
  easyPaisaNumber: '03415892099',
  whatsAppNumber: '0324 9059918',
  ownerEmail: 'ka8984510@gmail.com',
  clerkPublishableKey: '',
};

// --- Storage Helpers ---
export function getStoredSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultSettings,
        ...parsed,
        logoUrl: parsed.logoUrl && parsed.logoUrl.trim() !== '' ? parsed.logoUrl : defaultSettings.logoUrl,
      };
    }
  } catch {
    // ignore
  }
  return defaultSettings;
}

export function saveStoredSettings(settings: SiteSettings): void {
  try {
    const toSave = {
      ...settings,
      logoUrl: settings.logoUrl && settings.logoUrl.trim() !== '' ? settings.logoUrl : defaultSettings.logoUrl,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

export function getDeletedNoteIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_NOTES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

export function saveDeletedNoteId(id: string): void {
  try {
    const deleted = getDeletedNoteIds();
    deleted.add(id);
    localStorage.setItem(DELETED_NOTES_KEY, JSON.stringify(Array.from(deleted)));
  } catch {}
}

/**
 * Standardized course catalog retrieval:
 * Filters out any notes deleted by the admin, merges custom admin notes cleanly.
 */
export function getStoredNotes(): NoteItem[] {
  const deletedIds = getDeletedNoteIds();
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((n: NoteItem) => !deletedIds.has(n.id));
      }
    }
  } catch {
    // ignore
  }

  // Initial load
  const initial = initialNotesCatalog.filter((n) => !deletedIds.has(n.id));
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(initial));
  } catch {}
  return initial;
}

export function saveStoredNotes(notes: NoteItem[]): void {
  try {
    const deletedIds = getDeletedNoteIds();
    const filtered = notes.filter((n) => !deletedIds.has(n.id));
    localStorage.setItem(NOTES_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

export function getStoredStudent(): StudentUser | null {
  try {
    const raw = localStorage.getItem(STUDENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function saveStoredStudent(student: StudentUser | null): void {
  try {
    if (student) {
      localStorage.setItem(STUDENT_USER_KEY, JSON.stringify(student));
      // Also sync to registered users list immediately
      apiSyncUser(student).catch(() => {});
    } else {
      localStorage.removeItem(STUDENT_USER_KEY);
    }
  } catch {
    // ignore
  }
}

// --- API Methods ---
export async function apiGetSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        saveStoredSettings(data.settings);
        return data.settings;
      }
    }
  } catch {
    // fallback to cache
  }
  return getStoredSettings();
}

export async function apiSaveSettings(settings: SiteSettings): Promise<{ success: boolean; settings: SiteSettings }> {
  try {
    saveStoredSettings(settings);
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        saveStoredSettings(data.settings);
        return data;
      }
    }
  } catch {
    // ignore
  }
  return { success: true, settings };
}

export async function apiGetNotes(): Promise<NoteItem[]> {
  try {
    const res = await fetch('/api/notes');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.notes)) {
        saveStoredNotes(data.notes);
        return data.notes;
      }
    }
  } catch {
    // fallback
  }
  return getStoredNotes();
}

export async function apiSaveNote(note: NoteItem): Promise<NoteItem> {
  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.note) {
        const current = getStoredNotes();
        const updated = [data.note, ...current.filter((n) => n.id !== data.note.id)];
        saveStoredNotes(updated);
        return data.note;
      }
    }
  } catch {
    // local fallback
  }
  const current = getStoredNotes();
  const updated = [note, ...current.filter((n) => n.id !== note.id)];
  saveStoredNotes(updated);
  return note;
}

export async function apiUpdateNote(note: NoteItem): Promise<NoteItem> {
  try {
    const res = await fetch(`/api/notes/${note.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.note) {
        const current = getStoredNotes();
        const updated = current.map((n) => (n.id === note.id ? data.note : n));
        saveStoredNotes(updated);
        return data.note;
      }
    }
  } catch {
    // fallback
  }
  const current = getStoredNotes();
  const updated = current.map((n) => (n.id === note.id ? note : n));
  saveStoredNotes(updated);
  return note;
}

export async function apiDeleteNote(id: string): Promise<boolean> {
  // 1. Permanently record deletion
  saveDeletedNoteId(id);

  // 2. Remove from local stored notes
  const current = getStoredNotes();
  const updated = current.filter((n) => n.id !== id);
  saveStoredNotes(updated);

  // 3. Notify server if available
  try {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
  } catch {
    // ignore
  }

  return true;
}

export async function apiGetOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        saveStoredOrders(data.orders);
        return data.orders;
      }
    }
  } catch {
    // fallback
  }
  return getStoredOrders();
}

export async function apiCreateOrder(orderData: Partial<Order>): Promise<{ success: boolean; order: Order; message?: string }> {
  const newOrder: Order = {
    id: `KN-${Math.floor(1000 + Math.random() * 9000)}`,
    studentName: orderData.studentName || 'Student',
    studentEmail: (orderData.studentEmail || '').toLowerCase().trim(),
    studentPhone: orderData.studentPhone || '',
    noteIds: orderData.noteIds || [],
    noteTitles: orderData.noteTitles || [],
    totalAmountPKR: orderData.totalAmountPKR || 0,
    paymentMethod: 'easypaisa',
    easypaisaAccount: '03415892099',
    trxId: orderData.trxId || '',
    screenshotUrl: orderData.screenshotUrl || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Sync student user immediately
  if (newOrder.studentEmail) {
    apiSyncUser({
      name: newOrder.studentName,
      email: newOrder.studentEmail,
      phone: newOrder.studentPhone,
    }).catch(() => {});
  }

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        const current = getStoredOrders();
        saveStoredOrders([data.order, ...current]);
        return { success: true, order: data.order };
      }
    }
  } catch {
    // ignore
  }

  const current = getStoredOrders();
  saveStoredOrders([newOrder, ...current]);
  return { success: true, order: newOrder };
}

export async function apiVerifyOrder(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}/verify`, { method: 'PATCH' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        const current = getStoredOrders();
        const updated = current.map((o) => (o.id === orderId ? data.order : o));
        saveStoredOrders(updated);
        return data.order;
      }
    }
  } catch {
    // fallback
  }

  const current = getStoredOrders();
  const order = current.find((o) => o.id === orderId);
  if (order) {
    order.status = 'verified';
    order.verifiedAt = new Date().toISOString();
    order.accessToken = `tok_${order.id.toLowerCase()}_access`;
    saveStoredOrders(current);
    return order;
  }
  return null;
}

export async function apiRejectOrder(orderId: string): Promise<boolean> {
  try {
    await fetch(`/api/orders/${orderId}/reject`, { method: 'PATCH' });
  } catch {
    // fallback
  }

  const current = getStoredOrders();
  const order = current.find((o) => o.id === orderId);
  if (order) {
    order.status = 'rejected';
    saveStoredOrders(current);
    return true;
  }
  return false;
}

export async function apiLookupOrders(query: string): Promise<{ success: boolean; orders: Order[] }> {
  try {
    const res = await fetch(`/api/orders/lookup/${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) return data;
    }
  } catch {
    // fallback
  }

  const q = query.trim().toLowerCase();
  const current = getStoredOrders();
  const matched = current.filter(
    (o) =>
      o.id.toLowerCase() === q ||
      o.studentEmail.toLowerCase() === q ||
      o.studentPhone.includes(q) ||
      o.trxId.toLowerCase() === q
  );
  return { success: true, orders: matched };
}

export const apiLookupOrder = apiLookupOrders;

export async function apiGetStudentOrders(email: string): Promise<Order[]> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await fetch(`/api/orders/student/${encodeURIComponent(cleanEmail)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) return data.orders;
    }
  } catch {
    // fallback
  }

  const current = getStoredOrders();
  return current.filter(
    (o) => o.studentEmail.toLowerCase() === cleanEmail && o.status === 'verified'
  );
}

export async function apiUploadFile(base64Data: string, prefix = 'upload'): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, prefix }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) return data;
    }
  } catch {
    // fallback to data URI in serverless / static deployments
  }
  return { success: true, url: base64Data };
}

export async function apiSyncUser(student: Partial<StudentUser>): Promise<{ success: boolean; user?: StudentUser }> {
  const cleanEmail = (student.email || '').toLowerCase().trim();
  if (!cleanEmail) return { success: false };

  // Store in in-app local storage immediately
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    const list: StudentUser[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((u) => u.email.toLowerCase().trim() === cleanEmail);
    const userObj: StudentUser = {
      id: idx >= 0 ? list[idx].id : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      name: student.name || (idx >= 0 ? list[idx].name : 'Student'),
      phone: student.phone || (idx >= 0 ? list[idx].phone : ''),
      verifiedAt: student.verifiedAt || new Date().toISOString(),
    };
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...userObj };
    } else {
      list.push(userObj);
    }
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }

  // Also sync to server if running
  try {
    const res = await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    if (res.ok) return await res.json();
  } catch {
    // serverless / offline
  }
  return { success: true };
}

const CANONICAL_SEED_STUDENTS: StudentUser[] = [
  {
    id: 'usr_hamad_khadim',
    name: 'Hamad khadim',
    email: 'hamadkhadim474@gmail.com',
    phone: '0341 5892099',
    verifiedAt: '2026-09-29T10:00:00.000Z',
  },
  {
    id: 'usr_muhammad_hamza',
    name: 'Muhammad Hamza',
    email: 'hamza.student@gmail.com',
    phone: '0304 1234567',
    verifiedAt: '2026-09-28T05:00:00.000Z',
  },
];

/**
 * Universally retrieves registered students:
 * Seeds canonical registered student accounts and merges dynamic accounts from orders,
 * active Clerk sessions, and device storage so that Admin Portal stays consistent across browsers.
 */
export async function apiGetUsers(): Promise<StudentUser[]> {
  const userMap = new Map<string, StudentUser>();

  // 0. Seed canonical students (guarantees student accounts exist across all browsers)
  CANONICAL_SEED_STUDENTS.forEach((st) => {
    userMap.set(st.email.toLowerCase().trim(), { ...st });
  });

  // 1. From USERS_LIST_KEY
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    if (raw) {
      const list: StudentUser[] = JSON.parse(raw);
      list.forEach((u) => {
        if (u.email) {
          const key = u.email.toLowerCase().trim();
          const existing = userMap.get(key);
          userMap.set(key, { ...existing, ...u });
        }
      });
    }
  } catch {}

  // 2. From Orders (every order placed belongs to a student!)
  try {
    const orders = getStoredOrders();
    orders.forEach((o) => {
      if (o.studentEmail) {
        const email = o.studentEmail.toLowerCase().trim();
        const existing = userMap.get(email);
        userMap.set(email, {
          id: existing?.id || `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: o.studentName || existing?.name || 'Student',
          email: email,
          avatarUrl: existing?.avatarUrl || '',
          phone: o.studentPhone || existing?.phone || '',
          verifiedAt: o.createdAt || existing?.verifiedAt || new Date().toISOString(),
        });
      }
    });
  } catch {}

  // 3. From Currently Stored Student
  try {
    const current = getStoredStudent();
    if (current && current.email) {
      const email = current.email.toLowerCase().trim();
      const existing = userMap.get(email);
      userMap.set(email, {
        id: current.id || existing?.id || `usr_${Date.now()}`,
        name: current.name || existing?.name || 'Student',
        email: email,
        avatarUrl: current.avatarUrl || existing?.avatarUrl || '',
        phone: current.phone || existing?.phone || '',
        verifiedAt: current.verifiedAt || existing?.verifiedAt || new Date().toISOString(),
      });
    }
  } catch {}

  // 4. Try server if available
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        data.users.forEach((u: StudentUser) => {
          if (u.email) userMap.set(u.email.toLowerCase().trim(), u);
        });
      }
    }
  } catch {}

  const combined = Array.from(userMap.values());
  try {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(combined));
  } catch {}
  return combined;
}
