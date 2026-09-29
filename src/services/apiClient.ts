import { NoteItem, Order, SiteSettings, StudentUser } from '../types';
import { initialNotesCatalog } from '../data/notesCatalog';

const SETTINGS_KEY = 'kainat_notes_settings';
const NOTES_KEY = 'kainat_notes_catalog';
const ORDERS_KEY = 'kainat_orders_vault';
const STUDENT_USER_KEY = 'kainat_student_user';
const USERS_LIST_KEY = 'kainat_registered_students';

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

export function getStoredNotes(): NoteItem[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return initialNotesCatalog;
}

export function saveStoredNotes(notes: NoteItem[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
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
        if (data.settings.clerkPublishableKey) {
          localStorage.setItem('kainat_clerk_pub_key', data.settings.clerkPublishableKey);
        }
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
      if (data.success) {
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
    // local fallback
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
  saveStoredNotes(current.filter((n) => n.id !== id));
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
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        const current = getStoredOrders();
        saveStoredOrders([data.order, ...current]);
        return data;
      }
    }
  } catch {
    // ignore
  }
  const fakeOrder: Order = {
    id: `KN-${Math.floor(1000 + Math.random() * 9000)}`,
    studentName: orderData.studentName || 'Student',
    studentEmail: orderData.studentEmail || 'student@gmail.com',
    studentPhone: orderData.studentPhone || '03001234567',
    noteIds: orderData.noteIds || [],
    noteTitles: orderData.noteTitles || [],
    totalAmountPKR: orderData.totalAmountPKR || 0,
    paymentMethod: 'easypaisa',
    easypaisaAccount: '03415892099',
    trxId: orderData.trxId || '1234567890',
    screenshotUrl: orderData.screenshotUrl || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const current = getStoredOrders();
  saveStoredOrders([fakeOrder, ...current]);
  return { success: true, order: fakeOrder };
}

export async function apiVerifyOrder(orderId: string): Promise<{ success: boolean; order: Order }> {
  try {
    const res = await fetch(`/api/orders/${orderId}/verify`, { method: 'PATCH' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        const current = getStoredOrders();
        saveStoredOrders(current.map((o) => (o.id === orderId ? data.order : o)));
        return data;
      }
    }
  } catch {
    // ignore
  }
  const current = getStoredOrders();
  const order = current.find((o) => o.id === orderId);
  if (order) {
    order.status = 'verified';
    order.verifiedAt = new Date().toISOString();
    order.accessToken = `tok_${order.id.toLowerCase()}_access`;
    saveStoredOrders([...current]);
    return { success: true, order };
  }
  throw new Error('Order not found');
}

export async function apiRejectOrder(orderId: string): Promise<{ success: boolean; order: Order }> {
  try {
    const res = await fetch(`/api/orders/${orderId}/reject`, { method: 'PATCH' });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const current = getStoredOrders();
        saveStoredOrders(current.map((o) => (o.id === orderId ? data.order : o)));
        return data;
      }
    }
  } catch {
    // ignore
  }
  const current = getStoredOrders();
  const order = current.find((o) => o.id === orderId);
  if (order) {
    order.status = 'rejected';
    saveStoredOrders([...current]);
    return { success: true, order };
  }
  throw new Error('Order not found');
}

export async function apiLookupOrders(query: string): Promise<{ success: boolean; orders: Order[] }> {
  try {
    const res = await fetch(`/api/orders/lookup/${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) return data;
    }
  } catch {
    // fallback
  }
  const current = getStoredOrders();
  const q = query.toLowerCase().trim();
  const matched = current.filter(
    (o) =>
      o.id.toLowerCase() === q ||
      o.studentEmail.toLowerCase() === q ||
      o.studentPhone.includes(q) ||
      o.trxId.toLowerCase() === q
  );
  return { success: true, orders: matched };
}

export async function apiGetStudentOrders(email: string): Promise<Order[]> {
  try {
    const res = await fetch(`/api/orders/student/${encodeURIComponent(email)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) return data.orders;
    }
  } catch {
    // fallback
  }
  const current = getStoredOrders();
  const matched = current.filter(
    (o) => o.studentEmail.toLowerCase() === email.toLowerCase().trim() && o.status === 'verified'
  );
  return matched;
}

export async function apiLoginAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; message?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || 'Login failed' };
  }
}

export async function apiUploadFile(base64Data: string, prefix = 'upload'): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, prefix }),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err.message || 'Upload failed' };
  }
}

export async function apiSyncUser(student: Partial<StudentUser>): Promise<{ success: boolean; user?: StudentUser }> {
  // Store in in-app local storage immediately
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    const list: StudentUser[] = raw ? JSON.parse(raw) : [];
    const cleanEmail = (student.email || '').toLowerCase().trim();
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

export async function apiGetUsers(): Promise<StudentUser[]> {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        try {
          localStorage.setItem(USERS_LIST_KEY, JSON.stringify(data.users));
        } catch {}
        return data.users;
      }
    }
  } catch {
    // ignore
  }

  // In-app storage fallback
  try {
    const raw = localStorage.getItem(USERS_LIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

