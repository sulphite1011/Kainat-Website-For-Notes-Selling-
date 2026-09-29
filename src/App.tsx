import React, { useState, useEffect } from 'react';
import { NoteItem, Order, SiteSettings, StudentUser } from './types';
import {
  apiGetSettings,
  apiGetNotes,
  apiGetOrders,
  getStoredStudent,
  saveStoredStudent,
  apiGetStudentOrders,
} from './services/apiClient';
import { ClerkAuthProvider } from './context/ClerkContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CatalogSection } from './components/CatalogSection';
import { NotePreviewModal } from './components/NotePreviewModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTracker } from './components/OrderTracker';
import { SecureDocumentViewer } from './components/SecureDocumentViewer';
import { StudentLibrary } from './components/StudentLibrary';
import { StudentAuthModal } from './components/StudentAuthModal';
import { AdminPortal } from './components/AdminPortal';
import { RealtimeAlertBanner } from './components/RealtimeAlertBanner';
import { Footer } from './components/Footer';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'library' | 'track' | 'matric' | 'fsc' | 'bsc'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Kainat Notes Hub',
    ownerName: 'Kainat',
    logoUrl: '',
    easyPaisaNumber: '03415892099',
    whatsAppNumber: '0324 9059918',
    ownerEmail: 'ka8984510@gmail.com',
  });
  const [cartNotes, setCartNotes] = useState<NoteItem[]>([]);
  const [currentStudent, setCurrentStudent] = useState<StudentUser | null>(() => getStoredStudent());

  // Modals
  const [previewNote, setPreviewNote] = useState<NoteItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStudentAuthOpen, setIsStudentAuthOpen] = useState(false);
  const [viewerData, setViewerData] = useState<{
    note: NoteItem;
    studentData: { name: string; email: string; phone: string; orderId: string };
  } | null>(null);

  // Theme
  const [isLight, setIsLight] = useState<boolean>(() => {
    try {
      return localStorage.getItem('kainat_theme') === 'light';
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsLight((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('kainat_theme', next ? 'light' : 'dark');
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Initial Data Fetch
  const loadData = async () => {
    try {
      const [fetchedSettings, fetchedNotes, fetchedOrders] = await Promise.all([
        apiGetSettings(),
        apiGetNotes(),
        apiGetOrders(),
      ]);
      if (fetchedSettings) setSettings(fetchedSettings);
      if (fetchedNotes) setNotes(fetchedNotes);
      if (fetchedOrders) setOrders(fetchedOrders);
    } catch (e) {
      console.warn('Initial data load error:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When tab changes, update category filter if applicable
  useEffect(() => {
    if (activeTab === 'matric') {
      setSelectedCategory('Matric-9th');
    } else if (activeTab === 'fsc') {
      setSelectedCategory('FSc-Part1');
    } else if (activeTab === 'bsc') {
      setSelectedCategory('BSc-Year1');
    } else if (activeTab === 'catalog') {
      setSelectedCategory('All');
    }
  }, [activeTab]);

  // Sync Student verified notes
  const handleStudentSync = async (student: StudentUser) => {
    setCurrentStudent(student);
    saveStoredStudent(student);
    try {
      const studentOrders = await apiGetStudentOrders(student.email);
      if (studentOrders && studentOrders.length > 0) {
        setOrders((prev) => {
          const map = new Map<string, Order>();
          prev.forEach((o) => map.set(o.id, o));
          studentOrders.forEach((o) => map.set(o.id, o));
          return Array.from(map.values());
        });
      }
    } catch {
      // ignore
    }
  };

  const handleStudentLoggedOut = () => {
    setCurrentStudent(null);
    saveStoredStudent(null);
  };

  const handleAddToCart = (note: NoteItem) => {
    setCartNotes((prev) => {
      if (prev.some((n) => n.id === note.id)) {
        return prev.filter((n) => n.id !== note.id);
      }
      return [...prev, note];
    });
  };

  const handleOpenViewer = (noteId: string, customStudentData?: { name: string; email: string; phone: string; orderId: string }) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    if (customStudentData) {
      setViewerData({ note, studentData: customStudentData });
      return;
    }

    // Lookup verified order
    const verifiedOrder = orders.find(
      (o) => o.status === 'verified' && (o.noteIds.includes(noteId) || o.noteIds.includes('bundle-fsc2-complete'))
    );

    const sData = {
      name: verifiedOrder?.studentName || currentStudent?.name || 'Verified Student',
      email: verifiedOrder?.studentEmail || currentStudent?.email || 'student@gmail.com',
      phone: verifiedOrder?.studentPhone || currentStudent?.phone || '',
      orderId: verifiedOrder?.id || 'DEMO-ACCESS',
    };

    setViewerData({ note, studentData: sData });
  };

  // Compute all unlocked note IDs
  const unlockedOrders = orders.filter((o) => o.status === 'verified');
  const unlockedNoteIds = Array.from(
    new Set(
      unlockedOrders.flatMap((o) => {
        if (o.noteIds.includes('bundle-fsc2-complete')) {
          return [...o.noteIds, 'fsc2-phy-ch12', 'fsc2-math-ch2'];
        }
        return o.noteIds;
      })
    )
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'
    }`}>
      {/* Navbar */}
      <Navbar
        cartCount={cartNotes.length}
        unlockedCount={unlockedNoteIds.length}
        onOpenCart={() => setIsCheckoutOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        logoUrl={settings.logoUrl}
        isLight={isLight}
        onToggleTheme={toggleTheme}
        currentStudent={currentStudent}
        openStudentAuth={() => setIsStudentAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Catalog View */}
        {(activeTab === 'catalog' || activeTab === 'matric' || activeTab === 'fsc' || activeTab === 'bsc') && (
          <>
            <Hero
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                const el = document.getElementById('catalog-view');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenTrack={() => setActiveTab('track')}
            />

            <div id="catalog-view">
              <CatalogSection
                notes={notes}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onPreviewNote={(note) => setPreviewNote(note)}
                onAddToCart={handleAddToCart}
                onOpenViewer={(id) => handleOpenViewer(id)}
                cartNoteIds={cartNotes.map((n) => n.id)}
                unlockedNoteIds={unlockedNoteIds}
              />
            </div>
          </>
        )}

        {/* Student Library View */}
        {activeTab === 'library' && (
          <StudentLibrary
            unlockedOrders={unlockedOrders}
            allNotes={notes}
            onOpenViewer={(id, sData) => handleOpenViewer(id, sData)}
            onTrackOrder={() => setActiveTab('track')}
            currentStudent={currentStudent}
            onOpenStudentAuth={() => setIsStudentAuthOpen(true)}
            onRefreshOrders={loadData}
          />
        )}

        {/* Track Payment View */}
        {activeTab === 'track' && (
          <OrderTracker
            onOpenLibrary={() => setActiveTab('library')}
            onOpenViewer={(id, sData) => handleOpenViewer(id, sData)}
          />
        )}
      </main>

      {/* Real-time Order Verification Toast Alert */}
      <RealtimeAlertBanner
        onOpenLibrary={() => setActiveTab('library')}
        onRefreshOrders={loadData}
      />

      {/* Footer */}
      <Footer
        easyPaisaNumber={settings.easyPaisaNumber}
        whatsAppNumber={settings.whatsAppNumber}
        ownerEmail={settings.ownerEmail}
        logoUrl={settings.logoUrl}
        onOpenTrack={() => setActiveTab('track')}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveTab('catalog');
        }}
        isLight={isLight}
      />

      {/* Note Preview Modal */}
      {previewNote && (
        <NotePreviewModal
          note={previewNote}
          onClose={() => setPreviewNote(null)}
          onAddToCart={handleAddToCart}
          isInCart={cartNotes.some((n) => n.id === previewNote.id)}
        />
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartNotes={cartNotes}
        onRemoveFromCart={(id) => setCartNotes((prev) => prev.filter((n) => n.id !== id))}
        onOrderCreated={(order) => {
          setOrders((prev) => [order, ...prev]);
          setCartNotes([]);
        }}
        easyPaisaAccount={settings.easyPaisaNumber || '03415892099'}
        whatsAppNumber={settings.whatsAppNumber || '0324 9059918'}
        onStudentAuthenticated={handleStudentSync}
      />

      {/* Student Google Auth Modal */}
      <StudentAuthModal
        isOpen={isStudentAuthOpen}
        currentStudent={currentStudent}
        onClose={() => setIsStudentAuthOpen(false)}
        onStudentAuthenticated={handleStudentSync}
        onStudentLoggedOut={handleStudentLoggedOut}
      />

      {/* Admin Portal Modal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        orders={orders}
        notes={notes}
        settings={settings}
        onRefreshData={loadData}
        onUpdateSettings={(newSet) => setSettings(newSet)}
        isLight={isLight}
      />

      {/* Secure Document Viewer Modal */}
      {viewerData && (
        <SecureDocumentViewer
          note={viewerData.note}
          studentData={viewerData.studentData}
          onClose={() => setViewerData(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ClerkAuthProvider>
      <AppContent />
    </ClerkAuthProvider>
  );
}
