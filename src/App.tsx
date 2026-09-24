/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { NoteItem, Order, SiteSettings } from './types';
import { initialNotesCatalog } from './data/notesCatalog';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CatalogSection } from './components/CatalogSection';
import { NotePreviewModal } from './components/NotePreviewModal';
import { CheckoutModal } from './components/CheckoutModal';
import { SecureDocumentViewer } from './components/SecureDocumentViewer';
import { OrderTracker } from './components/OrderTracker';
import { StudentLibrary } from './components/StudentLibrary';
import { AdminPortal } from './components/AdminPortal';
import { RealtimeAlertBanner } from './components/RealtimeAlertBanner';
import { Footer } from './components/Footer';

const defaultSettings: SiteSettings = {
  siteName: 'Kainat Notes Hub',
  ownerName: 'Kainat',
  logoUrl: '',
  easyPaisaNumber: '03415892099',
  whatsAppNumber: '0324 9059918',
  ownerEmail: 'ka8984510@gmail.com',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [notes, setNotes] = useState<NoteItem[]>(initialNotesCatalog);
  const [cart, setCart] = useState<NoteItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('kainat_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('kainat_theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('kainat_theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [previewNote, setPreviewNote] = useState<NoteItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);
  const [activeViewerState, setActiveViewerState] = useState<{
    note: NoteItem;
    studentData: { name: string; email: string; phone: string; orderId: string };
  } | null>(null);

  // Load saved state from localStorage if available
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('kainat_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedOrders = localStorage.getItem('kainat_orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kainat_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Save orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kainat_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Fetch site settings (Logo & contact info)
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch {
      // fallback to default
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Fetch latest notes from API
  const refreshNotes = useCallback(async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      if (data.success && data.notes) {
        // If API notes has items, populate them
        setNotes(data.notes);
      }
    } catch (e) {
      console.warn('Using local catalog fallback:', e);
    }
  }, []);

  // Refresh user orders from API
  const refreshOrders = useCallback(async () => {
    try {
      if (orders.length > 0) {
        const orderIds = orders.map((o) => o.id);
        const updatedOrders: Order[] = [];
        for (const id of orderIds) {
          const res = await fetch(`/api/orders/${id}`);
          const data = await res.json();
          if (data.success && data.order) {
            updatedOrders.push(data.order);
          }
        }
        if (updatedOrders.length > 0) {
          setOrders(updatedOrders);
        }
      }
    } catch (e) {
      console.warn('Orders refresh fallback:', e);
    }
  }, [orders]);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  // Handle admin auth change
  const handleAdminAuthChange = (status: boolean) => {
    setIsAdminAuthenticated(status);
    try {
      if (status) {
        sessionStorage.setItem('kainat_admin_auth', 'true');
      } else {
        sessionStorage.removeItem('kainat_admin_auth');
      }
    } catch {
      // ignore
    }
  };

  // Cart operations
  const handleAddToCart = (note: NoteItem) => {
    if (!cart.some((n) => n.id === note.id)) {
      setCart((prev) => [...prev, note]);
    }
    setIsCheckoutOpen(true);
  };

  const handleRemoveFromCart = (noteId: string) => {
    setCart((prev) => prev.filter((n) => n.id !== noteId));
  };

  // Order created callback
  const handleOrderCreated = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    setCart([]);
  };

  // Unlocked note IDs across all verified orders strictly
  const verifiedOrders = orders.filter((o) => o.status === 'verified');
  const unlockedNoteIds = verifiedOrders.flatMap((o) => o.noteIds);

  // Open viewer handler: STRICTLY scoped so course is available ONLY to student who paid
  const handleOpenViewer = async (
    noteId: string,
    studentInfo?: { name: string; email: string; phone: string; orderId: string }
  ) => {
    setAccessDeniedMessage(null);
    const noteObj = notes.find((n) => n.id === noteId);
    if (!noteObj) return;

    // Check if this student/order has paid for this specific note
    let studentData = studentInfo;
    if (!studentData) {
      const matchingOrder = verifiedOrders.find(
        (o) =>
          o.noteIds.includes(noteId) ||
          (o.noteIds.includes('bundle-fsc2-complete') && ['fsc2-phy-ch12', 'fsc2-math-ch2'].includes(noteId))
      );

      if (matchingOrder) {
        studentData = {
          name: matchingOrder.studentName,
          email: matchingOrder.studentEmail,
          phone: matchingOrder.studentPhone,
          orderId: matchingOrder.id,
        };
      }
    }

    if (!studentData) {
      setAccessDeniedMessage(
        `Access Restricted: You have not purchased "${noteObj.title}". Full notes are unlocked exclusively for students whose EasyPaisa payment has been verified by Kainat.`
      );
      setTimeout(() => setAccessDeniedMessage(null), 6000);
      return;
    }

    try {
      const res = await fetch(`/api/notes/${noteId}?orderId=${encodeURIComponent(studentData.orderId)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAccessDeniedMessage(
          data.message || 'Access Denied: You do not have verified purchasing rights for this course.'
        );
        setTimeout(() => setAccessDeniedMessage(null), 6000);
        return;
      }

      setActiveViewerState({
        note: { ...noteObj, ...data.note },
        studentData: data.studentData || studentData,
      });
    } catch {
      setActiveViewerState({
        note: noteObj,
        studentData,
      });
    }
  };

  // Map active nav tab to category filter
  let categoryFilter = 'All';
  if (activeTab === 'matric') categoryFilter = 'Matric-9th';
  if (activeTab === 'fsc') categoryFilter = 'FSc-Part1';
  if (activeTab === 'bsc') categoryFilter = 'BSc-Year1';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'
    }`}>
      {/* Real-time automated alert notification banner */}
      <RealtimeAlertBanner
        onOpenLibrary={() => setActiveTab('library')}
        onRefreshOrders={refreshOrders}
      />

      {/* Top Bar adhering to 3-zone contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.length}
        openCart={() => setIsCheckoutOpen(true)}
        openAdmin={() => setIsAdminOpen(true)}
        unlockedCount={unlockedNoteIds.length}
        logoUrl={settings.logoUrl}
        isAdminAuthenticated={isAdminAuthenticated}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Access Denied Warning Toast if student tries to open course they haven't paid for */}
      {accessDeniedMessage && (
        <div className="mx-auto max-w-4xl my-3 px-4 w-full">
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-400">Security Notice:</span>
              <span>{accessDeniedMessage}</span>
            </div>
            <button
              onClick={() => setAccessDeniedMessage(null)}
              className="text-red-400 hover:text-white ml-2 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Banner: only on main catalog or class landing */}
        {['catalog', 'matric', 'fsc', 'bsc'].includes(activeTab) && (
          <Hero
            onSelectCategory={(cat) => {
              if (cat.startsWith('Matric')) setActiveTab('matric');
              else if (cat.startsWith('FSc')) setActiveTab('fsc');
              else if (cat.startsWith('BSc')) setActiveTab('bsc');
            }}
            onOpenTrack={() => setActiveTab('track')}
          />
        )}

        {/* View: Course Catalog (with class & subject filter) */}
        {['catalog', 'matric', 'fsc', 'bsc'].includes(activeTab) && (
          <CatalogSection
            notes={notes}
            selectedCategory={categoryFilter}
            setSelectedCategory={(cat) => {
              if (cat === 'All') setActiveTab('catalog');
              else if (cat.startsWith('Matric')) setActiveTab('matric');
              else if (cat.startsWith('FSc')) setActiveTab('fsc');
              else if (cat.startsWith('BSc')) setActiveTab('bsc');
              else setActiveTab('catalog');
            }}
            onPreviewNote={(note) => setPreviewNote(note)}
            onAddToCart={handleAddToCart}
            onOpenViewer={(id) => handleOpenViewer(id)}
            cartNoteIds={cart.map((n) => n.id)}
            unlockedNoteIds={unlockedNoteIds}
          />
        )}

        {/* View: Student Unlocked Library */}
        {activeTab === 'library' && (
          <StudentLibrary
            unlockedOrders={verifiedOrders}
            allNotes={notes}
            onOpenViewer={handleOpenViewer}
            onTrackOrder={() => setActiveTab('track')}
          />
        )}

        {/* View: Order & Payment Tracker */}
        {activeTab === 'track' && (
          <OrderTracker
            orders={orders}
            onOpenViewer={handleOpenViewer}
            allNotes={notes}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectTab={setActiveTab}
        logoUrl={settings.logoUrl}
      />

      {/* Free Sample Preview Modal */}
      {previewNote && (
        <NotePreviewModal
          note={previewNote}
          onClose={() => setPreviewNote(null)}
          onAddToCart={handleAddToCart}
          isInCart={cart.some((n) => n.id === previewNote.id)}
        />
      )}

      {/* EasyPaisa Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          cartNotes={cart}
          onRemoveFromCart={handleRemoveFromCart}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderCreated={handleOrderCreated}
          easyPaisaAccount={settings.easyPaisaNumber}
          whatsAppNumber={settings.whatsAppNumber}
        />
      )}

      {/* Ultra-Secure Document Viewer */}
      {activeViewerState && (
        <SecureDocumentViewer
          note={activeViewerState.note}
          studentData={activeViewerState.studentData}
          onClose={() => setActiveViewerState(null)}
        />
      )}

      {/* Owner / Admin Portal (Password protected: Kainat / HamadJani) */}
      {isAdminOpen && (
        <AdminPortal
          onClose={() => setIsAdminOpen(false)}
          onRefreshData={() => {
            refreshNotes();
            refreshOrders();
            fetchSettings();
          }}
          allNotes={notes}
          settings={settings}
          onUpdateSettings={setSettings}
          isAuthenticated={isAdminAuthenticated}
          onAuthenticate={handleAdminAuthChange}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      )}
    </div>
  );
}
