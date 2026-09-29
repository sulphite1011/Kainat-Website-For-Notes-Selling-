import React, { useState } from 'react';
import { NoteItem, Order, SiteSettings, OrderNotificationAlert } from '../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Upload,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Database,
  Lock,
  MessageSquare,
  Search,
  Filter,
  Check,
  Copy,
  ChevronDown,
  KeyRound,
  Mail,
  Camera,
} from 'lucide-react';
import { apiVerifyOrder, apiRejectOrder, apiSaveNote, apiUpdateNote, apiDeleteNote, apiSaveSettings, apiUploadFile } from '../services/apiClient';
import { sound } from '../utils/soundEffects';
import { CircularLogoCropper } from './CircularLogoCropper';
import { KainatLogo } from './KainatLogo';
import { generatePagesFromRawContent } from '../utils/notesFormatter';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  notes: NoteItem[];
  settings: SiteSettings;
  onRefreshData: () => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  isLight?: boolean;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  orders,
  notes,
  settings,
  onRefreshData,
  onUpdateSettings,
  isLight = false,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'notes' | 'branding' | 'database' | 'clerk-auth' | 'alerts'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Branding Inputs
  const [siteNameInput, setSiteNameInput] = useState(settings.siteName || 'Kainat Notes Hub');
  const [easyPaisaInput, setEasyPaisaInput] = useState(settings.easyPaisaNumber || '03415892099');
  const [whatsAppInput, setWhatsAppInput] = useState(settings.whatsAppNumber || '0324 9059918');
  const [ownerEmailInput, setOwnerEmailInput] = useState(settings.ownerEmail || 'ka8984510@gmail.com');
  const [logoPreview, setLogoPreview] = useState(settings.logoUrl || '');
  const [cropModalSrc, setCropModalSrc] = useState<string | null>(null);

  // Clerk Auth Input
  const [clerkKeyInput, setClerkKeyInput] = useState(settings.clerkPublishableKey || '');

  // SMTP Inputs
  const [smtpHostInput, setSmtpHostInput] = useState(settings.smtpHost || 'smtp.gmail.com');
  const [smtpPortInput, setSmtpPortInput] = useState(settings.smtpPort || 465);
  const [smtpUserInput, setSmtpUserInput] = useState(settings.smtpUser || settings.ownerEmail || 'ka8984510@gmail.com');
  const [smtpPassInput, setSmtpPassInput] = useState(settings.smtpPass || '');

  // Note Edit State
  const [editingNote, setEditingNote] = useState<Partial<NoteItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const showNotification = (text: string, error = false) => {
    setStatusMessage({ text, error });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleVerify = async (orderId: string) => {
    try {
      await apiVerifyOrder(orderId);
      sound.verified();
      showNotification(`Order #${orderId} verified successfully!`);
      onRefreshData();
    } catch {
      showNotification('Failed to verify order.', true);
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await apiRejectOrder(orderId);
      showNotification(`Order #${orderId} rejected.`);
      onRefreshData();
    } catch {
      showNotification('Failed to reject order.', true);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const newSettings: SiteSettings = {
        ...settings,
        siteName: siteNameInput.trim() || 'Kainat Notes Hub',
        easyPaisaNumber: easyPaisaInput.trim() || '03415892099',
        whatsAppNumber: whatsAppInput.trim() || '0324 9059918',
        ownerEmail: ownerEmailInput.trim() || 'ka8984510@gmail.com',
        logoUrl: logoPreview,
        clerkPublishableKey: clerkKeyInput.trim(),
        smtpHost: smtpHostInput.trim(),
        smtpPort: Number(smtpPortInput),
        smtpUser: smtpUserInput.trim(),
        smtpPass: smtpPassInput.trim(),
      };

      if (clerkKeyInput.trim()) {
        try {
          localStorage.setItem('kainat_clerk_pub_key', clerkKeyInput.trim());
        } catch {
          // ignore
        }
      }

      const res = await apiSaveSettings(newSettings);
      if (res.success) {
        onUpdateSettings(res.settings);
        showNotification('Settings saved successfully!');
        sound.verified();
        onRefreshData();
      } else {
        showNotification('Failed to save settings.', true);
      }
    } catch {
      showNotification('Error saving settings.', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropModalSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBase64: string) => {
    setCropModalSrc(null);
    try {
      const uploadRes = await apiUploadFile(croppedBase64, 'kainat_logo');
      if (uploadRes.success && uploadRes.url) {
        setLogoPreview(uploadRes.url);
        showNotification('Logo cropped and updated! Click "Save Settings" to publish.');
      } else {
        setLogoPreview(croppedBase64);
        showNotification('Logo updated locally. Click "Save Settings" to publish.');
      }
    } catch {
      setLogoPreview(croppedBase64);
    }
  };

  const handleSaveNoteForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote || !editingNote.title || !editingNote.classLevel || !editingNote.subject) {
      showNotification('Please fill in note title, class, and subject.', true);
      return;
    }

    setIsSaving(true);
    try {
      if (editingNote.id) {
        await apiUpdateNote(editingNote as NoteItem);
        showNotification('Note updated successfully!');
      } else {
        await apiSaveNote(editingNote as NoteItem);
        showNotification('New note created successfully!');
      }
      setEditingNote(null);
      onRefreshData();
    } catch {
      showNotification('Failed to save note.', true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note from the catalog?')) {
      try {
        await apiDeleteNote(id);
        showNotification('Note removed from catalog.');
        onRefreshData();
      } catch {
        showNotification('Failed to delete note.', true);
      }
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.studentName.toLowerCase().includes(q) ||
        o.studentEmail.toLowerCase().includes(q) ||
        o.trxId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className={`relative w-full max-w-6xl h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-white'
      }`}>
        {/* Header */}
        <header className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/90 border-zinc-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Owner Administration Portal
              </h2>
              <span className="text-[11px] text-zinc-400">
                Kainat Notes Hub Management
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Tab Navigation */}
        <div className={`px-6 pt-3 border-b flex items-center gap-3 overflow-x-auto text-xs shrink-0 ${
          isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/40 border-zinc-800'
        }`}>
          <button
            onClick={() => { setActiveTab('orders'); setEditingNote(null); }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Orders & Verification ({orders.filter((o) => o.status === 'pending').length} Pending)
          </button>

          <button
            onClick={() => { setActiveTab('notes'); setEditingNote(null); }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Course Catalog ({notes.length})
          </button>

          <button
            onClick={() => { setActiveTab('clerk-auth'); setEditingNote(null); }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'clerk-auth'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Clerk & Google Login</span>
          </button>

          <button
            onClick={() => { setActiveTab('branding'); setEditingNote(null); }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'branding'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Store Branding & Contacts
          </button>
        </div>

        {statusMessage && (
          <div className={`py-2 px-6 text-xs font-semibold ${
            statusMessage.error ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {statusMessage.text}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {(['all', 'pending', 'verified', 'rejected'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setOrderFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        orderFilter === filter
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              {filteredOrders.length > 0 ? (
                <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/40">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">{order.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            order.status === 'verified'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : order.status === 'pending'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-300">
                          <strong>{order.studentName}</strong> · {order.studentEmail} · {order.studentPhone}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          TRX: <strong className="text-zinc-200">{order.trxId}</strong> · Amount: <strong className="text-emerald-400">Rs. {order.totalAmountPKR}</strong>
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Notes: {order.noteTitles?.join(', ') || order.noteIds?.join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleVerify(order.id)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              Verify & Unlock
                            </button>
                            <button
                              onClick={() => handleReject(order.id)}
                              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-rose-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {order.status === 'verified' && (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-zinc-500 text-xs">
                  No orders match this filter.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COURSE CATALOG */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {!editingNote ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Course Notes Catalog ({notes.length})</h3>
                    <button
                      onClick={() =>
                        setEditingNote({
                          title: '',
                          classLevel: 'Matric-9th',
                          subject: 'Physics',
                          chapterNumber: 1,
                          chapterTitle: '',
                          description: '',
                          totalPages: 24,
                          pricePKR: 199,
                          rating: 5.0,
                          reviewsCount: 1,
                          topicsCovered: ['Key Derivations'],
                          previewPageLimit: 3,
                          googleDriveUrl: '',
                          samplePdfUrl: '',
                        })
                      }
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Course Note</span>
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/40">
                    {notes.map((note) => (
                      <div key={note.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                              {note.classLevel.replace('-', ' ')}
                            </span>
                            <span className="text-xs text-zinc-400">{note.subject}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white truncate">{note.title}</h4>
                          <span className="text-xs font-mono text-emerald-400">Rs. {note.pricePKR} · {note.totalPages} pages</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingNote(note)}
                            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-rose-400 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Note Edit / Create Form */
                <form onSubmit={handleSaveNoteForm} className="space-y-4 max-w-2xl bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="text-sm font-bold text-white">
                      {editingNote.id ? 'Edit Course Note' : 'Create New Course Note'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingNote(null)}
                      className="text-xs text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Class Level *</label>
                      <select
                        value={editingNote.classLevel || 'Matric-9th'}
                        onChange={(e) => setEditingNote({ ...editingNote, classLevel: e.target.value as any })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                      >
                        <option value="Matric-9th">Matric 9th</option>
                        <option value="Matric-10th">Matric 10th</option>
                        <option value="FSc-Part1">FSc Part-1</option>
                        <option value="FSc-Part2">FSc Part-2</option>
                        <option value="BSc-Year1">BSc Year-1</option>
                        <option value="BSc-Year2">BSc Year-2</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Subject *</label>
                      <input
                        type="text"
                        value={editingNote.subject || ''}
                        onChange={(e) => setEditingNote({ ...editingNote, subject: e.target.value as any })}
                        placeholder="Physics, Chemistry, Maths..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Note Title *</label>
                    <input
                      type="text"
                      required
                      value={editingNote.title || ''}
                      onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                      placeholder="e.g. Kinematics Derivations & Numerical Vault"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Price (PKR) *</label>
                      <input
                        type="number"
                        value={editingNote.pricePKR || 199}
                        onChange={(e) => setEditingNote({ ...editingNote, pricePKR: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">Total Pages</label>
                      <input
                        type="number"
                        value={editingNote.totalPages || 24}
                        onChange={(e) => setEditingNote({ ...editingNote, totalPages: Number(e.target.value) })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Google Drive PDF URL (For Unlocked Reader)</label>
                    <input
                      type="text"
                      value={editingNote.googleDriveUrl || ''}
                      onChange={(e) => setEditingNote({ ...editingNote, googleDriveUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/.../view"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Sample PDF URL (For Free Student Demo)</label>
                    <input
                      type="text"
                      value={editingNote.samplePdfUrl || ''}
                      onChange={(e) => setEditingNote({ ...editingNote, samplePdfUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/.../view"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Description / Content Summary</label>
                    <textarea
                      rows={4}
                      value={editingNote.description || ''}
                      onChange={(e) => setEditingNote({ ...editingNote, description: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : 'Save Note to Catalog'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: CLERK & GOOGLE AUTHENTICATION SETUP */}
          {activeTab === 'clerk-auth' && (
            <div className="space-y-5 max-w-2xl">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Clerk 1-Click Google Authentication</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  With Clerk, students log into your website using their Google / Gmail account in 1 click. Zero OTP emails and zero passwords needed!
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${clerkKeyInput.trim().startsWith('pk_') ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {clerkKeyInput.trim().startsWith('pk_') ? 'Clerk Active & Configured' : 'Clerk Key Needed'}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {clerkKeyInput.trim().startsWith('pk_') ? 'Students can sign in instantly with Google.' : 'Paste your Publishable Key below to enable Google login.'}
                    </div>
                  </div>
                </div>

                <a
                  href="https://dashboard.clerk.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1"
                >
                  <span>Clerk Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Input Form */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-300">
                  Clerk Publishable Key (<code className="text-purple-400 font-mono">pk_test_...</code> or <code className="text-purple-400 font-mono">pk_live_...</code>)
                </label>
                <input
                  type="text"
                  value={clerkKeyInput}
                  onChange={(e) => setClerkKeyInput(e.target.value)}
                  placeholder="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-zinc-500">
                  From Clerk Dashboard &gt; <strong>API Keys</strong> &gt; <strong>Publishable Key</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save & Activate Clerk Google Login'}
              </button>

              {/* Instructions */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs space-y-2">
                <strong className="text-purple-400 block font-semibold">How to get your key in 2 minutes:</strong>
                <ol className="list-decimal pl-4 space-y-1 text-zinc-400 text-[11px]">
                  <li>Create or log into your account at <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">dashboard.clerk.com</a>.</li>
                  <li>In sidebar, go to <strong>User & Authentication &gt; Social Connections</strong> and verify <strong>Google</strong> is ON.</li>
                  <li>Go to <strong>API Keys</strong> in sidebar, copy the <strong>Publishable Key</strong>, and paste it above!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: STORE BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-5 max-w-2xl">
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-300">Website Name</label>
                <input
                  type="text"
                  value={siteNameInput}
                  onChange={(e) => setSiteNameInput(e.target.value)}
                  placeholder="Kainat Notes Hub"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Circular Logo Upload */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <label className="block text-xs font-semibold text-zinc-300">Official Circular Logo</label>
                <div className="flex items-center gap-4">
                  <KainatLogo customLogoUrl={logoPreview} size="lg" showText={false} />
                  <div className="space-y-1.5">
                    <label className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 cursor-pointer inline-flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload & Crop Circular Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      Upload any photo or image to position and crop into a perfect circle.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">EasyPaisa Account Number *</label>
                  <input
                    type="text"
                    value={easyPaisaInput}
                    onChange={(e) => setEasyPaisaInput(e.target.value)}
                    placeholder="03415892099"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-300">Official WhatsApp Number *</label>
                  <input
                    type="text"
                    value={whatsAppInput}
                    onChange={(e) => setWhatsAppInput(e.target.value)}
                    placeholder="0324 9059918"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Branding & Contact Settings'}
              </button>
            </div>
          )}
        </div>
      </div>

      {cropModalSrc && (
        <CircularLogoCropper
          imageSrc={cropModalSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropModalSrc(null)}
        />
      )}
    </div>
  );
};
