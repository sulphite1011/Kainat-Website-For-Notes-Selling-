/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { NoteItem, Order, SiteSettings, StudentUser } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CatalogSection } from './components/CatalogSection';
import { NotePreviewModal } from './components/NotePreviewModal';
import { CheckoutModal } from './components/CheckoutModal';
import { SecureDocumentViewer } from './components/SecureDocumentViewer';
import { OrderTracker } from './components/OrderTracker';
import { StudentLibrary } from './components/StudentLibrary';
import { StudentAuthModal } from './components/StudentAuthModal';
import { ClerkAuthProvider } from './context/ClerkContext';
import { AdminPortal } from './components/AdminPortal';
import { RealtimeAlertBanner } from './components/RealtimeAlertBanner';
import { Footer } from './components/Footer';
import {
  getStoredNotes,
  getStoredSettings,
  getStoredOrders,
  getStoredStudent,
  saveStoredStudent,
  apiGetStudentOrders,
  apiGetNotes,
  apiGetSettings,
  defaultSettings,
} from './services/apiClient';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [notes, setNotes] = useState<NoteItem[]>(getStoredNotes);
  const [cart, setCart] = useState<NoteItem[]>([]);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [settings, setSettings] = useState<SiteSettings>(getStoredSettings);
  const [currentStudent, setCurrentStudent] = useState<StudentUser | null>(getStoredStudent);
  const [isStudentAuthOpen, setIsStudentAuthOpen] = useState(false);
  const [pendingCheckoutAfterLogin, setPendingCheckoutAfterLogin] = useState(false);

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

  // Auto-sync orders for logged-in student across devices
  useEffect(() => {
    if (currentStudent?.email) {
      apiGetStudentOrders(currentStudent.email).then((remoteOrders) => {
        if (remoteOrders && remoteOrders.length > 0) {
          setOrders((prev) => {
            const map = new Map<string, Order>();
            [...remoteOrders, ...prev].forEach((o) => map.set(o.id, o));
            return Array.from(map.values());
          });
        }
      });
    }
  }, [currentStudent]);

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
      const data = await apiGetSettings();
      setSettings(data);
    } catch {
      // fallback to default
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Fetch latest notes
  const refreshNotes = useCallback(async () => {
    try {
      const notesList = await apiGetNotes();
      if (Array.isArray(notesList) && notesList.length > 0) {
        setNotes(notesList);
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
          setOrders((prev) => {
            const map = new Map<string, Order>();
            [...updatedOrders, ...prev].forEach((o) => map.set(o.id, o));
            return Array.from(map.values());
          });
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

  // Cart operations: when purchasing, student must sign in via Gmail first so purchase is cross-device
  const handleAddToCart = (note: NoteItem) => {
    if (!cart.some((n) => n.id === note.id)) {
      setCart((prev) => [...prev, note]);
    }
    if (!currentStudent) {
      setPendingCheckoutAfterLogin(true);
      setIsStudentAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleOpenCartOrCheckout = () => {
    if (!currentStudent && cart.length > 0) {
      setPendingCheckoutAfterLogin(true);
      setIsStudentAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
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
      } else if (currentStudent?.email) {
        // Cross-device email verification
        const studentVerified = orders.find(
          (o) =>
            o.status === 'verified' &&
            o.studentEmail.toLowerCase() === currentStudent.email.toLowerCase() &&
            (o.noteIds.includes(noteId) ||
              (o.noteIds.includes('bundle-fsc2-complete') && ['fsc2-phy-ch12', 'fsc2-math-ch2'].includes(noteId)))
        );
        if (studentVerified) {
          studentData = {
            name: studentVerified.studentName,
            email: studentVerified.studentEmail,
            phone: studentVerified.studentPhone,
            orderId: studentVerified.id,
          };
        }
      }
    }

    if (!studentData) {
      setAccessDeniedMessage(
        `Access Restricted: You have not purchased "${noteObj.title}". Full notes are unlocked exclusively for students whose EasyPaisa payment has been verified by Kainat.`
      );
      setTimeout(() => setAccessDeniedMessage(null), 6000);
      return;
    }

    // Open viewer with resilient access verification (supports cross-device email auth)
    try {
      const res = await fetch(
        `/api/notes/${noteId}?orderId=${encodeURIComponent(studentData.orderId)}&studentEmail=${encodeURIComponent(studentData.email)}`
      );
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.note) {
          setActiveViewerState({
            note: { ...noteObj, ...data.note },
            studentData: data.studentData || studentData,
          });
          return;
        }
      }
    } catch {
      // ignore
    }

    // Direct launcher (works both on Node.js and Cloudflare Workers)
    setActiveViewerState({
      note: noteObj,
      studentData,
    });
  };

  const handleStudentSync = useCallback((stu: StudentUser | null) => {
    if (stu) {
      setCurrentStudent(stu);
      apiGetStudentOrders(stu.email).then((remoteOrders) => {
        if (remoteOrders && remoteOrders.length > 0) {
          setOrders((prev) => {
            const map = new Map<string, Order>();
            [...remoteOrders, ...prev].forEach((o) => map.set(o.id, o));
            return Array.from(map.values());
          });
        }
      });
    } else {
      setCurrentStudent(null);
    }
  }, []);

  return (
    <ClerkAuthProvider onStudentSync={handleStudentSync}>
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
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'matric') setSelectedCategory('Matric-9th');
          else if (tab === 'fsc') setSelectedCategory('FSc-Part1');
          else if (tab === 'bsc') setSelectedCategory('BSc-Year1');
          else if (tab === 'catalog') setSelectedCategory('All');
        }}
        cartCount={cart.length}
        openCart={handleOpenCartOrCheckout}
        openAdmin={() => setIsAdminOpen(true)}
        unlockedCount={unlockedNoteIds.length}
        logoUrl={settings.logoUrl}
        isAdminAuthenticated={isAdminAuthenticated}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentStudent={currentStudent}
        openStudentAuth={() => setIsStudentAuthOpen(true)}
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
              setSelectedCategory(cat);
              setActiveTab('catalog');
            }}
            onOpenTrack={() => setActiveTab('track')}
          />
        )}

        {/* View: Course Catalog (with class & subject filter) */}
        {['catalog', 'matric', 'fsc', 'bsc'].includes(activeTab) && (
          <CatalogSection
            notes={notes}
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
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
            currentStudent={currentStudent}
            onOpenStudentAuth={() => setIsStudentAuthOpen(true)}
            onRefreshOrders={refreshOrders}
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
          currentStudent={currentStudent}
          onStudentAuthenticated={(stu) => setCurrentStudent(stu)}
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

      {/* Student Cross-Device Login Modal */}
      <StudentAuthModal
        isOpen={isStudentAuthOpen}
        currentStudent={currentStudent}
        onClose={() => {
          setIsStudentAuthOpen(false);
          setPendingCheckoutAfterLogin(false);
        }}
        title={pendingCheckoutAfterLogin ? 'Sign In with Gmail to Purchase' : 'Student Multi-Device Access'}
        subtitle={
          pendingCheckoutAfterLogin
            ? 'Please enter your Gmail to link your purchase. You can then open and read your course on your phone, laptop, or tablet anytime.'
            : 'Access your purchased courses from your mobile, laptop, or any other device using your Gmail.'
        }
        onStudentAuthenticated={(student) => {
          setCurrentStudent(student);
          apiGetStudentOrders(student.email).then((remoteOrders) => {
            if (remoteOrders && remoteOrders.length > 0) {
              setOrders((prev) => {
                const map = new Map<string, Order>();
                [...remoteOrders, ...prev].forEach((o) => map.set(o.id, o));
                return Array.from(map.values());
              });
            }
          });
          setIsStudentAuthOpen(false);
          if (pendingCheckoutAfterLogin) {
            setPendingCheckoutAfterLogin(false);
            setIsCheckoutOpen(true);
          }
        }}
        onStudentLoggedOut={() => {
          setCurrentStudent(null);
        }}
      />

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
    </ClerkAuthProvider>
  );
}
