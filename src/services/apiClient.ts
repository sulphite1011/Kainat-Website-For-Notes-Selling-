import { NoteItem, Order, SiteSettings, StudentUser } from '../types';
import { initialNotesCatalog } from '../data/notesCatalog';

/**
 * Master Default Settings:
 * Single canonical source of truth for website branding, contact numbers, and owner details.
 * Applied identically across all browsers and devices without relying on browser localStorage.
 */
export const defaultSettings: SiteSettings = {
  siteName: 'Kainat Notes Hub',
  ownerName: 'Kainat',
  logoUrl: '/kainat_logo.svg',
  easyPaisaNumber: '03415892099',
  whatsAppNumber: '0324 9059918',
  ownerEmail: 'ka8984510@gmail.com',
  clerkPublishableKey: '',
};

// In-memory runtime session state (isolated to runtime execution, never faked into localStorage)
let inMemorySettings: SiteSettings = { ...defaultSettings };
let inMemoryNotes: NoteItem[] = [...initialNotesCatalog];
let inMemoryOrders: Order[] = [];
let inMemoryUsers: StudentUser[] = [];

// --- API Methods ---

export async function apiGetSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        inMemorySettings = {
          ...defaultSettings,
          ...data.settings,
          logoUrl: data.settings.logoUrl && data.settings.logoUrl.trim() !== '' ? data.settings.logoUrl : defaultSettings.logoUrl,
        };
        return inMemorySettings;
      }
    }
  } catch {
    // static host fallback: return master settings
  }
  return inMemorySettings;
}

export async function apiSaveSettings(settings: SiteSettings): Promise<{ success: boolean; settings: SiteSettings }> {
  inMemorySettings = {
    ...settings,
    logoUrl: settings.logoUrl && settings.logoUrl.trim() !== '' ? settings.logoUrl : defaultSettings.logoUrl,
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inMemorySettings),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        inMemorySettings = { ...inMemorySettings, ...data.settings };
      }
    }
  } catch {
    // static host: in-memory state updated
  }

  return { success: true, settings: inMemorySettings };
}

/**
 * Universal Course Notes Retrieval:
 * Master catalog deployed with code (initialNotesCatalog) is the source of truth for all users.
 */
export async function apiGetNotes(): Promise<NoteItem[]> {
  try {
    const res = await fetch('/api/notes');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.notes)) {
        inMemoryNotes = data.notes;
        return inMemoryNotes;
      }
    }
  } catch {
    // static host: return master catalog
  }
  return inMemoryNotes;
}

export async function apiSaveNote(note: NoteItem): Promise<NoteItem> {
  const existingIdx = inMemoryNotes.findIndex((n) => n.id === note.id);
  if (existingIdx >= 0) {
    inMemoryNotes[existingIdx] = note;
  } else {
    inMemoryNotes = [note, ...inMemoryNotes];
  }

  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.note) {
        return data.note;
      }
    }
  } catch {
    // static host
  }

  return note;
}

export async function apiUpdateNote(note: NoteItem): Promise<NoteItem> {
  return apiSaveNote(note);
}

export async function apiDeleteNote(id: string): Promise<boolean> {
  inMemoryNotes = inMemoryNotes.filter((n) => n.id !== id);

  try {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
  } catch {
    // static host
  }

  return true;
}

export async function apiGetOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        inMemoryOrders = data.orders;
        return inMemoryOrders;
      }
    }
  } catch {
    // static host
  }
  return inMemoryOrders;
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
    paymentMethod: orderData.paymentMethod || 'easypaisa',
    easypaisaAccount: orderData.easypaisaAccount || defaultSettings.easyPaisaNumber,
    trxId: orderData.trxId || '',
    screenshotUrl: orderData.screenshotUrl || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  inMemoryOrders = [newOrder, ...inMemoryOrders];

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        return { success: true, order: data.order };
      }
    }
  } catch {
    // static host
  }

  return { success: true, order: newOrder };
}

export async function apiLookupOrders(query: string): Promise<{ success: boolean; orders: Order[] }> {
  const q = query.toLowerCase().trim();
  const all = await apiGetOrders();
  const matched = all.filter(
    (o) =>
      o.id.toLowerCase() === q ||
      o.trxId.toLowerCase() === q ||
      o.studentEmail.toLowerCase() === q
  );

  return { success: true, orders: matched };
}

export async function apiVerifyOrder(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}/verify`, { method: 'PATCH' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        inMemoryOrders = inMemoryOrders.map((o) => (o.id === orderId ? data.order : o));
        return data.order;
      }
    }
  } catch {
    // static host
  }

  const idx = inMemoryOrders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    inMemoryOrders[idx] = {
      ...inMemoryOrders[idx],
      status: 'verified',
      verifiedAt: new Date().toISOString(),
      accessToken: `tok_${orderId.toLowerCase()}_access`,
    };
    return inMemoryOrders[idx];
  }

  return null;
}

export async function apiRejectOrder(orderId: string): Promise<Order | null> {
  try {
    const res = await fetch(`/api/orders/${orderId}/reject`, { method: 'PATCH' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.order) {
        inMemoryOrders = inMemoryOrders.map((o) => (o.id === orderId ? data.order : o));
        return data.order;
      }
    }
  } catch {
    // static host
  }

  const idx = inMemoryOrders.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    inMemoryOrders[idx] = {
      ...inMemoryOrders[idx],
      status: 'rejected',
    };
    return inMemoryOrders[idx];
  }

  return null;
}

export async function apiGetStudentOrders(email: string): Promise<Order[]> {
  const cleanEmail = email.toLowerCase().trim();
  const allOrders = await apiGetOrders();
  return allOrders.filter((o) => (o.studentEmail || '').toLowerCase().trim() === cleanEmail);
}

export async function apiTrackOrder(query: string): Promise<Order | null> {
  const q = query.toLowerCase().trim();
  const allOrders = await apiGetOrders();
  return (
    allOrders.find(
      (o) =>
        o.id.toLowerCase() === q ||
        o.trxId.toLowerCase() === q ||
        o.studentEmail.toLowerCase() === q
    ) || null
  );
}

export async function apiUploadFile(base64Data: string, purpose: string): Promise<{ success: boolean; url: string }> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64: base64Data, purpose }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return { success: true, url: data.url };
      }
    }
  } catch {
    // static host fallback
  }

  return { success: true, url: base64Data };
}

export async function apiSyncUser(student: StudentUser): Promise<{ success: boolean }> {
  const existingIdx = inMemoryUsers.findIndex((u) => u.email.toLowerCase() === student.email.toLowerCase());
  if (existingIdx >= 0) {
    inMemoryUsers[existingIdx] = { ...inMemoryUsers[existingIdx], ...student };
  } else {
    inMemoryUsers.push(student);
  }

  try {
    await fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
  } catch {
    // static host
  }

  return { success: true };
}

export async function apiGetUsers(): Promise<StudentUser[]> {
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        return data.users;
      }
    }
  } catch {
    // static host
  }

  return inMemoryUsers;
}
