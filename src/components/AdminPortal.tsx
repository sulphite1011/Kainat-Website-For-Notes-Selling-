import React, { useState, useEffect } from 'react';
import { NoteItem, Order, SiteSettings, StudentUser } from '../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Edit2,
  Upload,
  RefreshCw,
  ExternalLink,
  Search,
  Check,
  Camera,
  Users,
  Image,
  BookOpen,
  Plus,
} from 'lucide-react';
import {
  apiVerifyOrder,
  apiRejectOrder,
  apiSaveNote,
  apiUpdateNote,
  apiDeleteNote,
  apiSaveSettings,
  apiUploadFile,
  apiGetUsers,
} from '../services/apiClient';
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
  const [activeTab, setActiveTab] = useState<'orders' | 'notes' | 'branding' | 'users'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Branding Inputs
  const [siteNameInput, setSiteNameInput] = useState(settings.siteName || 'Kainat Notes Hub');
  const [easyPaisaInput, setEasyPaisaInput] = useState(settings.easyPaisaNumber || '03415892099');
  const [whatsAppInput, setWhatsAppInput] = useState(settings.whatsAppNumber || '0324 9059918');
  const [ownerEmailInput, setOwnerEmailInput] = useState(settings.ownerEmail || 'ka8984510@gmail.com');
  const [logoPreview, setLogoPreview] = useState(settings.logoUrl || '');
  const [cropModalSrc, setCropModalSrc] = useState<string | null>(null);

  // Registered Students State
  const [registeredStudents, setRegisteredStudents] = useState<StudentUser[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Note Edit State
  const [editingNote, setEditingNote] = useState<Partial<NoteItem> | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchRegisteredStudents();
    }
  }, [isOpen]);

  const fetchRegisteredStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const users = await apiGetUsers();
      setRegisteredStudents(users);
    } catch {
      // ignore
    } finally {
      setIsLoadingStudents(false);
    }
  };

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
      showNotification(`Order #${orderId} marked as rejected.`);
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
      };

      const res = await apiSaveSettings(newSettings);
      if (res.success) {
        onUpdateSettings(res.settings);
        showNotification('Settings saved in app storage successfully!');
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
        showNotification('Logo cropped! Click "Save Branding" to persist.');
      } else {
        setLogoPreview(croppedBase64);
        showNotification('Logo updated! Click "Save Branding" to persist.');
      }
    } catch {
      setLogoPreview(croppedBase64);
    }
  };

  // Cover Page Picture Upload for Course Note
  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const uploadRes = await apiUploadFile(base64, 'note_cover');
        if (uploadRes.success && uploadRes.url) {
          setEditingNote((prev) => ({ ...prev, coverImage: uploadRes.url }));
          showNotification('Cover page uploaded successfully!');
        } else {
          setEditingNote((prev) => ({ ...prev, coverImage: base64 }));
          showNotification('Cover image attached!');
        }
        setIsUploadingCover(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotification('Cover upload failed: ' + err.message, true);
      setIsUploadingCover(false);
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
      const noteToSave: NoteItem = {
        id: editingNote.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: editingNote.title.trim(),
        classLevel: editingNote.classLevel || 'Matric-9th',
        subject: editingNote.subject || 'Physics',
        chapterNumber: Number(editingNote.chapterNumber) || 1,
        chapterTitle: editingNote.chapterTitle || '',
        description: editingNote.description || '',
        totalPages: Number(editingNote.totalPages) || 24,
        pricePKR: Number(editingNote.pricePKR) || 199,
        rating: editingNote.rating || 5.0,
        reviewsCount: editingNote.reviewsCount || 1,
        topicsCovered: Array.isArray(editingNote.topicsCovered) && editingNote.topicsCovered.length > 0
          ? editingNote.topicsCovered
          : ['Solved Derivations', 'Board Important Numericals'],
        previewPageLimit: Number(editingNote.previewPageLimit) || 3,
        googleDriveUrl: editingNote.googleDriveUrl || '',
        samplePdfUrl: editingNote.samplePdfUrl || '',
        coverImage: editingNote.coverImage || '',
        previewPages: (editingNote.previewPages && editingNote.previewPages.length > 0)
          ? editingNote.previewPages
          : generatePagesFromRawContent(editingNote.description || '', editingNote.chapterTitle || 'Chapter 1', editingNote.classLevel || 'Matric-9th', editingNote.subject || 'Physics'),
        fullContentPages: (editingNote.fullContentPages && editingNote.fullContentPages.length > 0)
          ? editingNote.fullContentPages
          : generatePagesFromRawContent(editingNote.description || '', editingNote.chapterTitle || 'Chapter 1', editingNote.classLevel || 'Matric-9th', editingNote.subject || 'Physics'),
      };

      if (editingNote.id) {
        await apiUpdateNote(noteToSave);
        showNotification('Note updated successfully!');
      } else {
        await apiSaveNote(noteToSave);
        showNotification('New note added to catalog successfully!');
      }
      setEditingNote(null);
      onRefreshData();
    } catch (err: any) {
      showNotification('Failed to save note: ' + (err.message || 'Error'), true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      setConfirmDeleteId(null);
      await apiDeleteNote(noteId);
      showNotification('Course note permanently deleted from catalog.');
      onRefreshData();
    } catch {
      showNotification('Failed to delete note.', true);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-6xl h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-zinc-950 border-zinc-800 text-white'
      }`}>
        {/* Header */}
        <header className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/90 border-zinc-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Owner Administration Portal
              </h2>
              <span className="text-[11px] text-zinc-400">
                Kainat Notes Hub · In-App Cloud Storage (Vercel & Cloudflare Ready)
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
            onClick={() => { setActiveTab('users'); setEditingNote(null); }}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students ({registeredStudents.length})</span>
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

          {/* TAB 2: COURSE CATALOG WITH COVER PAGE UPLOAD */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {!editingNote ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Course Notes Catalog ({notes.length})</h3>
                      <p className="text-[11px] text-zinc-400">Manage notes, Google Drive PDF links, and cover pictures.</p>
                    </div>
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
                          coverImage: '',
                        })
                      }
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Course Note</span>
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/40">
                    {notes.map((note) => (
                      <div key={note.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Note Cover Thumbnail */}
                          <div className="w-12 h-14 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {note.coverImage ? (
                              <img
                                src={note.coverImage}
                                alt={note.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BookOpen className="w-5 h-5 text-zinc-600" />
                            )}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                                {(note.classLevel || 'Course').replace('-', ' ')}
                              </span>
                              <span className="text-xs text-zinc-400">{note.subject}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white truncate">{note.title}</h4>
                            <span className="text-xs font-mono text-emerald-400">Rs. {note.pricePKR} · {note.totalPages} pages</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingNote(note)}
                            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg cursor-pointer"
                            title="Edit Note & Cover"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {confirmDeleteId === note.id ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note.id)}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg cursor-pointer animate-pulse transition-all shadow"
                              title="Click to confirm permanent deletion"
                            >
                              Delete?
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteId(note.id);
                                setTimeout(() => setConfirmDeleteId((prev) => (prev === note.id ? null : prev)), 4000);
                              }}
                              className="p-2 bg-zinc-900 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 rounded-lg cursor-pointer transition-colors"
                              title="Delete Course Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

                  {/* COVER PAGE PIC UPLOAD SECTION */}
                  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-3">
                    <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                      Course Book Cover Page Picture
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Image Preview Box */}
                      <div className="w-24 h-32 rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                        {editingNote.coverImage ? (
                          <img
                            src={editingNote.coverImage}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-2 text-zinc-500">
                            <Image className="w-6 h-6 mx-auto mb-1 text-zinc-600" />
                            <span className="text-[10px] block">No Cover</span>
                          </div>
                        )}
                      </div>

                      {/* Upload and URL Controls */}
                      <div className="flex-1 space-y-2.5 w-full">
                        <div className="flex items-center gap-2">
                          <label className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-sm">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploadingCover ? 'Uploading...' : 'Choose Cover Picture'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingCover}
                              onChange={handleCoverImageUpload}
                              className="hidden"
                            />
                          </label>

                          {editingNote.coverImage && (
                            <button
                              type="button"
                              onClick={() => setEditingNote((prev) => ({ ...prev, coverImage: '' }))}
                              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-rose-400 text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              Remove Cover
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">
                            Or paste Direct Image URL:
                          </label>
                          <input
                            type="text"
                            value={editingNote.coverImage || ''}
                            onChange={(e) => setEditingNote({ ...editingNote, coverImage: e.target.value })}
                            placeholder="https://... or /images/cover.jpg"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
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
                      placeholder="e.g. Kinematics Derivations & Solved Board Numericals"
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
                    <p className="text-[11px] text-zinc-500 mt-1">
                      PDF stays in your Google Drive. The link is stored in app storage for licensed students.
                    </p>
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
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    {isSaving ? 'Saving...' : 'Save Note to Catalog'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: REGISTERED STUDENTS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Registered Students ({registeredStudents.length})</h3>
                  <p className="text-[11px] text-zinc-400">
                    Accounts created when students sign in or place orders. Stored cleanly in app storage.
                  </p>
                </div>

                <button
                  onClick={fetchRegisteredStudents}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStudents ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {registeredStudents.length > 0 ? (
                <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/40">
                  {registeredStudents.map((st) => (
                    <div key={st.id || st.email} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {st.avatarUrl ? (
                          <img
                            src={st.avatarUrl}
                            alt={st.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-emerald-400/50 shadow shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30 shrink-0">
                            {(st.name || st.email)[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-white">{st.name || 'Student'}</h4>
                          <p className="text-xs text-emerald-400 font-mono">{st.email}</p>
                          {st.phone && <p className="text-[11px] text-zinc-500 font-mono">Phone: {st.phone}</p>}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                          Active Student
                        </span>
                        <span className="text-[11px] text-zinc-500 block mt-1 font-mono">
                          {st.verifiedAt ? new Date(st.verifiedAt).toLocaleDateString() : 'Active'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-zinc-500 text-xs border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 space-y-2">
                  <Users className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p>No student accounts recorded yet.</p>
                  <p className="text-[11px] text-zinc-600">Students will appear here automatically when they log in or order notes.</p>
                </div>
              )}
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
                    <label className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload & Adjust Circular Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      Upload any image to zoom and drag with touch gestures into a perfect circle.
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
