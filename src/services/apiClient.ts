import { NoteItem, Order, SiteSettings, StudentUser } from '../types';
import { initialNotesCatalog } from '../data/notesCatalog';

const SETTINGS_KEY = 'kainat_notes_settings';
const NOTES_KEY = 'kainat_notes_catalog';
const ORDERS_KEY = 'kainat_orders_vault';
const STUDENT_USER_KEY = 'kainat_student_user';
const USERS_LIST_KEY = 'kainat_registered_students';
const CATALOG_VERSION_KEY = 'kainat_catalog_version';
const CURRENT_CATALOG_VERSION = 'v2026_canonical_catalog_v2';

export const defaultSettings: SiteSettings = {
  siteName: 'Kainat Notes Hub',
  ownerName: 'Kainat',
  logoUrl: '',
  easyPaisaNumber: '03415892099',
  whatsAppNumber: '0324 9059918',
  ownerEmail: 'ka8984510@gmail.com',
  clerkPublishableKey: '',
};

// --- Storage Helpers ---
export function getStoredSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return defaultSettings;
}

export function saveStoredSettings(settings: SiteSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

/**
 * Standardized course catalog retrieval:
 * Always keeps the canonical course catalog from initialNotesCatalog as the single source
 * of truth across all browsers and devices. Merges newly created admin notes cleanly.
 */
export function getStoredNotes(): NoteItem[] {
  try {
    const storedVer = localStorage.getItem(CATALOG_VERSION_KEY);
    if (storedVer !== CURRENT_CATALOG_VERSION) {
      // Flush stale or mismatched cache from older browser sessions
      localStorage.setItem(CATALOG_VERSION_KEY, CURRENT_CATALOG_VERSION);
      localStorage.setItem(NOTES_KEY, JSON.stringify(initialNotesCatalog));
      return initialNotesCatalog;
    }

    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Always preserve official canonical notes and append any custom notes created by admin
        const customNotes = parsed.filter(
          (p: NoteItem) => !initialNotesCatalog.some((init) => init.id === p.id)
        );
        return [...initialNotesCatalog, ...customNotes];
      }
    }
  } catch {
    // ignore
  }
  return initialNotesCatalog;
}

export function saveStoredNotes(notes: NoteItem[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    localStorage.setItem(CATALOG_VERSION_KEY, CURRENT_CATALOG_VERSION);
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
  try {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
  } catch {
    // ignore
  }
  const current = getStoredNotes();
  const updated = current.filter((n) => n.id !== id);
  saveStoredNotes(updated);
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

/**
 * Universally retrieves registered students:
 * Aggregates across registered users storage, placed orders, and currently logged in student.
 * Guarantees student count is ALWAYS fresh, accurate, and refreshed in Admin Portal.
 */
export async function apiGetUsers(): Promise<StudentUser[]> {
  const userMap = new Map<string, StudentUser>();

  // 1. From USERS_LIST_KEY
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    if (raw) {
      const list: StudentUser[] = JSON.parse(raw);
      list.forEach((u) => {
        if (u.email) userMap.set(u.email.toLowerCase().trim(), u);
      });
    }
  } catch {}

  // 2. From Orders (every order placed belongs to a student!)
  try {
    const orders = getStoredOrders();
    orders.forEach((o) => {
      if (o.studentEmail) {
        const email = o.studentEmail.toLowerCase().trim();
        if (!userMap.has(email)) {
          userMap.set(email, {
            id: `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: o.studentName || 'Student',
            email: email,
            phone: o.studentPhone || '',
            verifiedAt: o.createdAt || new Date().toISOString(),
          });
        }
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
