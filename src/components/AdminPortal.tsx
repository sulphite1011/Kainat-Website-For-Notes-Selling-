import React, { useState, useEffect } from 'react';
import { Order, NoteItem, OrderNotificationAlert, SiteSettings } from '../types';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Send, 
  FileText, 
  TrendingUp, 
  Clock, 
  Users, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Lock, 
  Sparkles, 
  Image as ImageIcon,
  Key,
  LogOut,
  UserCheck,
  Database,
  Download,
  RefreshCw,
  AlertCircle,
  Check,
  HardDrive,
  Sun,
  Moon
} from 'lucide-react';
import { KainatLogo } from './KainatLogo';
import { CircularLogoCropper } from './CircularLogoCropper';
import { sound } from '../utils/soundEffects';
import {
  apiAdminLogin,
  apiGetOrders,
  apiVerifyOrder,
  apiRejectOrder,
  apiGrantCourse,
  apiRevokeCourse,
  apiUploadImage,
  apiSaveSettings,
  apiSaveNote,
  apiDeleteNote,
  apiGetDatabaseStatus,
  apiTestMongo,
  apiExportDatabaseBackup,
  apiRestoreDatabaseBackup,
  apiCreateOrder,
} from '../services/apiClient';

interface AdminPortalProps {
  onClose: () => void;
  onRefreshData: () => void;
  allNotes: NoteItem[];
  settings: SiteSettings;
  onUpdateSettings: (newSettings: SiteSettings) => void;
  isAuthenticated: boolean;
  onAuthenticate: (status: boolean) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onClose,
  onRefreshData,
  allNotes,
  settings,
  onUpdateSettings,
  isAuthenticated,
  onAuthenticate,
  theme: externalTheme,
  onToggleTheme,
}) => {
  // Theme state (synced with localStorage and external theme)
  const [localTheme, setLocalTheme] = useState<'dark' | 'light'>(() => {
    if (externalTheme) return externalTheme;
    try {
      return (localStorage.getItem('kainat_theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    if (externalTheme) {
      setLocalTheme(externalTheme);
    }
  }, [externalTheme]);

  const currentTheme = externalTheme || localTheme;
  const isLight = currentTheme === 'light';

  const toggleTheme = () => {
    const next = currentTheme === 'light' ? 'dark' : 'light';
    setLocalTheme(next);
    try {
      localStorage.setItem('kainat_theme', next);
    } catch {
      // ignore
    }
    if (onToggleTheme) {
      onToggleTheme();
    }
  };

  // Login form state
  const [usernameInput, setUsernameInput] = useState('Kainat');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active tab inside admin
  const [activeTab, setActiveTab] = useState<'orders' | 'notes' | 'branding' | 'database' | 'alerts'>('orders');

  // Orders and metrics
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingCount: 0,
    verifiedCount: 0,
    totalRevenuePKR: 0,
  });
  const [notifications, setNotifications] = useState<OrderNotificationAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterState, setFilterState] = useState<'all' | 'pending' | 'verified'>('pending');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Delete confirmation state (inline, never window.confirm)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Branding & Logo state
  const [logoPreview, setLogoPreview] = useState<string>(settings.logoUrl || '');
  const [siteNameInput, setSiteNameInput] = useState<string>(settings.siteName || 'Kainat Notes Hub');
  const [easyPaisaInput, setEasyPaisaInput] = useState<string>(settings.easyPaisaNumber || '03415892099');
  const [whatsAppInput, setWhatsAppInput] = useState<string>(settings.whatsAppNumber || '0324 9059918');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [rawLogoForCropping, setRawLogoForCropping] = useState<string | null>(null);

  // Note creation & editing state
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [formValidationErrors, setFormValidationErrors] = useState<string[]>([]);

  const [noteForm, setNoteForm] = useState({
    title: '',
    classLevel: 'Matric-9th',
    subject: 'Physics',
    chapterNumber: 1,
    chapterTitle: '',
    topicsCovered: '',
    description: '',
    rawTextContent: '',
    totalPages: 24,
    pricePKR: 199,
    googleDriveUrl: '',
    coverImage: '',
  });

  // Student Course Access Management
  const [selectedStudentOrder, setSelectedStudentOrder] = useState<Order | null>(null);
  const [courseToGrant, setCourseToGrant] = useState<string>(allNotes[0]?.id || '');

  // Database / Storage State
  const [dbStorageInfo, setDbStorageInfo] = useState<any>(null);
  const [mongoUriInput, setMongoUriInput] = useState<string>(settings.mongoDbUri || '');
  const [isTestingMongo, setIsTestingMongo] = useState(false);
  const [isRestoringDb, setIsRestoringDb] = useState(false);

  // Sync settings prop when it updates
  useEffect(() => {
    if (settings.logoUrl !== undefined) setLogoPreview(settings.logoUrl);
    if (settings.siteName) setSiteNameInput(settings.siteName);
    if (settings.easyPaisaNumber) setEasyPaisaInput(settings.easyPaisaNumber);
    if (settings.whatsAppNumber) setWhatsAppInput(settings.whatsAppNumber);
    if (settings.mongoDbUri) setMongoUriInput(settings.mongoDbUri);
  }, [settings]);

  const showNotification = (msg: string, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 5000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const data = await apiGetOrders();
      setOrders(data.orders || []);
      setStats(data.stats || { totalOrders: 0, pendingOrders: 0, verifiedOrders: 0, totalRevenuePKR: 0 });
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const data = await apiGetDatabaseStatus();
      if (data && data.success) {
        setDbStorageInfo(data);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
      fetchDbStatus();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const data = await apiAdminLogin(usernameInput, passwordInput);
      if (data.success) {
        sound.verified();
        onAuthenticate(true);
      } else {
        sound.alert();
        setLoginError(data.message || 'Invalid username or password.');
      }
    } catch {
      sound.alert();
      setLoginError('Authentication check failed. Please verify credentials.');
    }
  };

  const handleLogout = () => {
    onAuthenticate(false);
  };

  // Verify Order Payment
  const handleVerifyOrder = async (orderId: string) => {
    try {
      const data = await apiVerifyOrder(orderId);
      if (data.success) {
        sound.verified();
        showNotification(`Order #${orderId} verified! Course unlocked for student.`);
        fetchAdminData();
        onRefreshData();
      } else {
        showNotification(data.message || 'Verification failed.', true);
      }
    } catch {
      showNotification('Error while verifying payment.', true);
    }
  };

  // Reject Order Payment
  const handleRejectOrder = async (orderId: string) => {
    try {
      const data = await apiRejectOrder(orderId);
      if (data.success) {
        showNotification(`Order #${orderId} marked as rejected.`);
        fetchAdminData();
        onRefreshData();
      } else {
        showNotification(data.message || 'Action failed.', true);
      }
    } catch {
      showNotification('Error rejecting order.', true);
    }
  };

  // Simulate Order for Kainat Testing
  const handleSimulateNewOrder = async () => {
    try {
      const sampleNotes = [allNotes[0] || { id: 'sample-1', title: 'Sample Physics Unit 1', pricePKR: 199 }];
      const data = await apiCreateOrder({
        studentName: 'Ayesha Khan (Student)',
        studentEmail: 'ayesha.student@gmail.com',
        studentPhone: '0300 1234567',
        noteIds: sampleNotes.map((n) => n.id),
        noteTitles: sampleNotes.map((n) => n.title),
        totalAmountPKR: sampleNotes.reduce((s, n) => s + (n.pricePKR || 0), 0),
        trxId: `EP-${Date.now().toString().slice(-6)}`,
        paymentMethod: 'easypaisa',
        easypaisaAccount: settings.easyPaisaNumber,
        screenshotUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400',
      });

      if (data.success) {
        sound.order();
        showNotification(`Simulated Order #${data.order.id} generated for verification testing!`);
        fetchAdminData();
        onRefreshData();
      }
    } catch {
      showNotification('Could not simulate order.', true);
    }
  };

  // Grant Course Access to Student
  const handleGrantCourse = async (orderId: string) => {
    if (!courseToGrant) return;
    try {
      const data = await apiGrantCourse(orderId, courseToGrant);
      if (data.success) {
        showNotification(`Course access successfully granted to student!`);
        fetchAdminData();
        onRefreshData();
        if (selectedStudentOrder && data.order) {
          setSelectedStudentOrder(data.order);
        }
      } else {
        showNotification(data.message || 'Error granting course.', true);
      }
    } catch {
      showNotification('Error granting course.', true);
    }
  };

  // Revoke Course Access from Student
  const handleRevokeCourse = async (orderId: string, noteId: string) => {
    try {
      const data = await apiRevokeCourse(orderId, noteId);
      if (data.success) {
        showNotification(`Course access revoked.`);
        fetchAdminData();
        onRefreshData();
        if (selectedStudentOrder && data.order) {
          setSelectedStudentOrder(data.order);
        }
      } else {
        showNotification(data.message || 'Error revoking course.', true);
      }
    } catch {
      showNotification('Error revoking course.', true);
    }
  };

  // Handle Logo Upload (Opens circular Instagram-style cropper)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result as string;
        setRawLogoForCropping(base64Data);
      };
      reader.readAsDataURL(file);
    } catch {
      showNotification('Error reading image file.', true);
    } finally {
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  // Called when user finishes cropping their circular Instagram-style logo
  const handleApplyCroppedLogo = async (croppedDataUrl: string) => {
    try {
      setIsUploadingLogo(true);
      setRawLogoForCropping(null);
      const uploadData = await apiUploadImage(croppedDataUrl, 'logo_circular_' + Date.now());
      const newLogoUrl = uploadData.url;
      setLogoPreview(newLogoUrl);

      const newSettings = { ...settings, logoUrl: newLogoUrl };
      const saveData = await apiSaveSettings(newSettings);
      if (saveData.success) {
        onUpdateSettings(saveData.settings);
        showNotification('Circular Instagram-style logo saved & updated across site!');
        sound.verified();
        onRefreshData();
      } else {
        showNotification('Error saving logo settings.', true);
      }
    } catch {
      showNotification('Error saving circular logo picture.', true);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Reset to Demo Logo
  const handleResetDemoLogo = async () => {
    try {
      setIsSavingSettings(true);
      const newSettings = { ...settings, logoUrl: '' };
      const data = await apiSaveSettings(newSettings);
      if (data.success) {
        setLogoPreview('');
        onUpdateSettings(data.settings);
        showNotification('Reset to Kainat Demo Emblem Logo.');
        onRefreshData();
      }
    } catch {
      showNotification('Failed to reset logo.', true);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      const newSettings: SiteSettings = {
        ...settings,
        siteName: siteNameInput.trim() || 'Kainat Notes Hub',
        easyPaisaNumber: easyPaisaInput.trim() || '03415892099',
        whatsAppNumber: whatsAppInput.trim() || '0324 9059918',
        logoUrl: logoPreview,
        mongoDbUri: mongoUriInput.trim(),
      };

      const data = await apiSaveSettings(newSettings);
      if (data.success) {
        onUpdateSettings(data.settings);
        showNotification('Brand & contact details saved successfully!');
        sound.verified();
        onRefreshData();
      } else {
        showNotification('Failed to save settings.', true);
      }
    } catch {
      showNotification('Server error while saving settings.', true);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Note Cover Upload (Save to /uploads/ or local storage)
  const handleNoteCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const uploadData = await apiUploadImage(base64Data, 'note_cover_' + Date.now());
        if (uploadData.success && uploadData.url) {
          setNoteForm((prev) => ({ ...prev, coverImage: uploadData.url }));
          showNotification(`Cover picture uploaded successfully!`);
        } else {
          showNotification(uploadData.message || 'Upload failed.', true);
        }
        setIsUploadingCover(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploadingCover(false);
      showNotification('Error uploading cover image.', true);
    }
  };

  // Create or Update Note (with inline validation)
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationErrors([]);

    const errors: string[] = [];
    if (!noteForm.title.trim()) errors.push('Note Title / Name is required.');
    if (!noteForm.classLevel.trim()) errors.push('Class Level (e.g. Matric-9th, FSc, BSc) is required.');
    if (!noteForm.subject.trim()) errors.push('Subject Name is required.');
    if (!noteForm.chapterTitle.trim()) errors.push('Unit / Chapter Name is required.');

    if (errors.length > 0) {
      setFormValidationErrors(errors);
      showNotification('Please fill in all required fields highlighted below.', true);
      return;
    }

    try {
      setIsSubmittingNote(true);
      const notePayload = {
        ...noteForm,
        topicsCovered: noteForm.topicsCovered
          ? noteForm.topicsCovered.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };
      const data = await apiSaveNote(notePayload, editNoteId);
      if (data.success) {
        showNotification(data.message || 'Note saved successfully!');
        sound.verified();
        setIsEditingNote(false);
        setEditNoteId(null);
        setNoteForm({
          title: '',
          classLevel: 'Matric-9th',
          subject: 'Physics',
          chapterNumber: 1,
          chapterTitle: '',
          topicsCovered: '',
          description: '',
          rawTextContent: '',
          totalPages: 24,
          pricePKR: 199,
          googleDriveUrl: '',
          coverImage: '',
        });
        onRefreshData();
        fetchDbStatus();
      } else {
        showNotification(data.message || 'Error saving note.', true);
      }
    } catch {
      showNotification('Error saving note.', true);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Delete Note (Two-step inline confirmation)
  const handleDeleteNote = async (id: string, title: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }

    try {
      const data = await apiDeleteNote(id);
      if (data.success) {
        showNotification(`Note "${title}" deleted successfully.`);
        sound.verified();
        setDeleteConfirmId(null);
        onRefreshData();
        fetchDbStatus();
      } else {
        showNotification(data.message || 'Error deleting note.', true);
      }
    } catch {
      showNotification('Error deleting note.', true);
    }
  };

  // Populate form to edit
  const startEditNote = (note: NoteItem) => {
    setEditNoteId(note.id);
    setNoteForm({
      title: note.title,
      classLevel: note.classLevel,
      subject: note.subject,
      chapterNumber: note.chapterNumber,
      chapterTitle: note.chapterTitle,
      topicsCovered: note.topicsCovered?.join(', ') || '',
      description: note.description,
      rawTextContent: note.fullContentPages?.[0]?.contentHtml
        ? note.fullContentPages.map((p) => `### ${p.title}\n${p.keyPoints?.map((k) => `• ${k}`).join('\n') || ''}\n\n`).join('---\n')
        : '',
      totalPages: note.totalPages,
      pricePKR: note.pricePKR,
      googleDriveUrl: note.googleDriveUrl,
      coverImage: note.coverImage || '',
    });
    setFormValidationErrors([]);
    setIsEditingNote(true);
  };

  // Test MongoDB Connection
  const handleTestMongo = async () => {
    if (!mongoUriInput.trim()) {
      showNotification('Please enter a MongoDB connection URI (e.g. mongodb+srv://...)', true);
      return;
    }

    try {
      setIsTestingMongo(true);
      const data = await apiTestMongo(mongoUriInput.trim());
      if (data.success) {
        showNotification(`MongoDB Status: ${data.message}`);
        sound.verified();
        fetchDbStatus();
      } else {
        showNotification(`MongoDB Note: ${data.message}`, true);
      }
    } catch {
      showNotification('Failed to test MongoDB connection.', true);
    } finally {
      setIsTestingMongo(false);
    }
  };

  // Restore Database from JSON
  const handleRestoreDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsRestoringDb(true);
      const text = await file.text();
      const jsonData = JSON.parse(text);
      const result = await apiRestoreDatabaseBackup(jsonData);
      if (result.success) {
        showNotification('Database successfully restored from JSON backup!');
        sound.verified();
        onRefreshData();
        fetchAdminData();
        fetchDbStatus();
      } else {
        showNotification(result.message || 'Restore failed.', true);
      }
    } catch {
      showNotification('Invalid JSON backup file or restore failed.', true);
    } finally {
      setIsRestoringDb(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterState === 'all') return true;
    return o.status === filterState;
  });

  // ----------------------------------------------------
  // Gated View: If not authenticated, show password prompt
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md overflow-y-auto ${
        isLight ? 'bg-slate-900/40' : 'bg-black/85'
      }`}>
        <div className={`relative w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl space-y-5 ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
        }`}>
          <div className={`flex items-center justify-between border-b pb-4 ${
            isLight ? 'border-slate-200' : 'border-zinc-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-950/80 border-amber-800/80 text-amber-400'
              }`}>
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Owner Portal Login
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Protected Admin for Kainat
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Quick theme toggle on login */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isLight 
                    ? 'border-slate-200 hover:bg-slate-100 text-slate-600' 
                    : 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                }`}
                title={isLight ? 'Switch to Dark Theme' : 'Switch to White Theme'}
              >
                {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                Username
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Username (Kainat)"
                className={`w-full rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400'
                    : 'bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-500'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password (HamadJani)"
                className={`w-full rounded-lg px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400'
                    : 'bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-500'
                }`}
              />
            </div>

            {loginError && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                isLight ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-950/60 border-red-900 text-red-300'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>Unlock Admin Portal</span>
            </button>
          </form>

          <div className={`text-center text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            Official Owner Credentials · ka8984510@gmail.com
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // Authenticated Portal View (Mobile responsive + White/Dark theme)
  // ----------------------------------------------------
  return (
    <div className={`fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center p-0 sm:p-4 backdrop-blur-md overflow-hidden sm:overflow-y-auto ${
      isLight ? 'bg-slate-900/40' : 'bg-black/85'
    }`}>
      <div className={`relative w-full sm:max-w-6xl h-full sm:h-auto sm:max-h-[94vh] sm:rounded-2xl rounded-none border-0 sm:border shadow-2xl flex flex-col overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-zinc-100'
      }`}>
        
        {/* Top Header - Mobile friendly */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b gap-2.5 shrink-0 ${
          isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-zinc-950/90 border-zinc-800'
        }`}>
          {/* Brand & Identity */}
          <div className="flex items-center justify-between sm:justify-start gap-2.5 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <KainatLogo customLogoUrl={logoPreview} size="sm" showSubtitle={false} theme={isLight ? 'light' : 'dark'} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className={`text-sm sm:text-base font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Kainat Suite
                  </h2>
                  <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${
                    isLight ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    Owner Active
                  </span>
                </div>
                <div className={`hidden md:block text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  EasyPaisa: <strong className={isLight ? 'text-slate-800' : 'text-zinc-200'}>{settings.easyPaisaNumber}</strong> · WhatsApp:{' '}
                  <strong className={isLight ? 'text-slate-800' : 'text-zinc-200'}>{settings.whatsAppNumber}</strong>
                </div>
              </div>
            </div>

            {/* Mobile quick close button */}
            <button
              onClick={onClose}
              className={`sm:hidden p-1.5 rounded-lg border ${
                isLight ? 'border-slate-200 text-slate-500 hover:bg-slate-100' : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar: Theme Toggle, Simulate, Logout, Desktop Close */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
            {/* White / Dark Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isLight
                  ? 'bg-amber-100/70 hover:bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border-zinc-700'
              }`}
              title={isLight ? 'Switch to Dark Theme' : 'Switch to White Theme'}
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-800" />
                  <span>White Theme</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dark Theme</span>
                </>
              )}
            </button>

            {/* Simulate order */}
            <button
              onClick={handleSimulateNewOrder}
              className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border-zinc-700'
              }`}
              title="Add a sample student order to test verification"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Simulate Order</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs border transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700'
              }`}
              title="Logout from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className={`hidden sm:flex p-1.5 rounded-lg border transition-colors ${
                isLight
                  ? 'border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                  : 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action toast - Success */}
        {actionSuccess && (
          <div className={`px-4 sm:px-6 py-2 text-xs font-medium flex items-center justify-between shrink-0 border-b animate-fadeIn ${
            isLight ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
          }`}>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action toast - Error */}
        {actionError && (
          <div className={`px-4 sm:px-6 py-2 text-xs font-medium flex items-center justify-between shrink-0 border-b animate-fadeIn ${
            isLight ? 'bg-red-50 text-red-900 border-red-200' : 'bg-red-950 text-red-300 border-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="p-1 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Metrics Row - Responsive on mobile (2x2 grid, then 4 cols) */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-5 border-b shrink-0 ${
          isLight ? 'bg-slate-50/60 border-slate-200' : 'bg-zinc-950/40 border-zinc-800'
        }`}>
          <div className={`p-2.5 sm:p-3.5 rounded-xl border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900 border-zinc-800'
          }`}>
            <div className={`text-[10px] sm:text-[11px] flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Verified Revenue</span>
            </div>
            <div className={`text-base sm:text-lg font-bold font-mono mt-0.5 truncate ${
              isLight ? 'text-emerald-700' : 'text-emerald-400'
            }`}>
              Rs. {stats.totalRevenuePKR}
            </div>
          </div>

          <div className={`p-2.5 sm:p-3.5 rounded-xl border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900 border-zinc-800'
          }`}>
            <div className={`text-[10px] sm:text-[11px] flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">Pending Proofs</span>
            </div>
            <div className={`text-base sm:text-lg font-bold font-mono mt-0.5 truncate ${
              isLight ? 'text-amber-700' : 'text-amber-400'
            }`}>
              {stats.pendingCount}
            </div>
          </div>

          <div className={`p-2.5 sm:p-3.5 rounded-xl border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900 border-zinc-800'
          }`}>
            <div className={`text-[10px] sm:text-[11px] flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              <Users className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">Paying Students</span>
            </div>
            <div className={`text-base sm:text-lg font-bold font-mono mt-0.5 truncate ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {stats.verifiedCount}
            </div>
          </div>

          <div className={`p-2.5 sm:p-3.5 rounded-xl border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900 border-zinc-800'
          }`}>
            <div className={`text-[10px] sm:text-[11px] flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
              <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">Catalog Notes</span>
            </div>
            <div className={`text-base sm:text-lg font-bold font-mono mt-0.5 truncate ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {allNotes.length}
            </div>
          </div>
        </div>

        {/* Tab Navigation - Smooth horizontal scrolling on mobile */}
        <div className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-6 pt-2 sm:pt-3 border-b overflow-x-auto shrink-0 scrollbar-none ${
          isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-zinc-950/40 border-zinc-800'
        }`}>
          <button
            onClick={() => { setActiveTab('orders'); setIsEditingNote(false); }}
            className={`pb-2.5 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? isLight
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-emerald-500 text-emerald-400'
                : isLight
                  ? 'border-transparent text-slate-600 hover:text-slate-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Orders & Access ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2.5 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'notes'
                ? isLight
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-emerald-500 text-emerald-400'
                : isLight
                  ? 'border-transparent text-slate-600 hover:text-slate-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Manage Notes ({allNotes.length})
          </button>

          <button
            onClick={() => { setActiveTab('branding'); setIsEditingNote(false); }}
            className={`pb-2.5 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'branding'
                ? isLight
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-emerald-500 text-emerald-400'
                : isLight
                  ? 'border-transparent text-slate-600 hover:text-slate-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Logo & Brand Settings
          </button>

          <button
            onClick={() => { setActiveTab('database'); setIsEditingNote(false); }}
            className={`pb-2.5 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'database'
                ? isLight
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-emerald-500 text-emerald-400'
                : isLight
                  ? 'border-transparent text-slate-600 hover:text-slate-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>Database & Storage</span>
          </button>

          <button
            onClick={() => { setActiveTab('alerts'); setIsEditingNote(false); }}
            className={`pb-2.5 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'alerts'
                ? isLight
                  ? 'border-emerald-600 text-emerald-800 font-bold'
                  : 'border-emerald-500 text-emerald-400'
                : isLight
                  ? 'border-transparent text-slate-600 hover:text-slate-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Alerts ({notifications.length})
          </button>
        </div>

        {/* Content Body - Scrollable with fluid padding on phone and desktop */}
        <div className={`p-3 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6 overscroll-contain ${
          isLight ? 'bg-slate-50/30' : 'bg-transparent'
        }`}>
          
          {/* TAB 1: ORDERS & VERIFICATION */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setFilterState('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      filterState === 'pending'
                        ? isLight
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                          : 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : isLight
                          ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-transparent'
                    }`}
                  >
                    Pending Proofs ({stats.pendingCount})
                  </button>
                  <button
                    onClick={() => setFilterState('verified')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      filterState === 'verified'
                        ? isLight
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                          : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        : isLight
                          ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-transparent'
                    }`}
                  >
                    Verified & Paid ({stats.verifiedCount})
                  </button>
                  <button
                    onClick={() => setFilterState('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      filterState === 'all'
                        ? isLight
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-zinc-700 text-white border-transparent'
                        : isLight
                          ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-transparent'
                    }`}
                  >
                    All Orders ({orders.length})
                  </button>
                </div>

                <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                  <span>Notes unlock exclusively for verified student</span>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className={`text-center py-12 text-xs border rounded-xl p-6 ${
                  isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                }`}>
                  No orders found in this filter state.
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {filteredOrders.map((order) => {
                    const cleanPhone = order.studentPhone.replace(/[^0-9]/g, '');
                    const waTarget = cleanPhone.startsWith('0')
                      ? `92${cleanPhone.substring(1)}`
                      : cleanPhone;

                    const waMsg = encodeURIComponent(
                      `Assalam o Alaikum ${order.studentName}! Your payment of Rs. ${order.totalAmountPKR} for Order #${order.id} has been verified by Kainat. Your notes are unlocked exclusively for your account on our website.`
                    );

                    return (
                      <div
                        key={order.id}
                        className={`p-3.5 sm:p-4 rounded-xl border space-y-3 transition-colors ${
                          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-950/70 border-zinc-800'
                        }`}
                      >
                        {/* Order Header */}
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 ${
                          isLight ? 'border-slate-100' : 'border-zinc-800/80'
                        }`}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                              isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-white'
                            }`}>
                              #{order.id}
                            </span>
                            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>
                              {order.studentName}
                            </span>
                            <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                              ({order.studentEmail})
                            </span>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-2">
                            <span className={`font-mono text-xs font-bold ${
                              isLight ? 'text-emerald-700' : 'text-emerald-400'
                            }`}>
                              Rs. {order.totalAmountPKR}
                            </span>
                            {order.status === 'verified' && (
                              <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded border ${
                                isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              }`}>
                                Verified & Unlocked
                              </span>
                            )}
                            {order.status === 'pending' && (
                              <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded border ${
                                isLight ? 'bg-amber-50 text-amber-800 border-amber-300' : 'bg-amber-950 text-amber-400 border-amber-800'
                              }`}>
                                Pending Proof
                              </span>
                            )}
                            {order.status === 'rejected' && (
                              <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded border ${
                                isLight ? 'bg-rose-50 text-rose-800 border-rose-300' : 'bg-red-950 text-red-400 border-red-800'
                              }`}>
                                Rejected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs ${
                          isLight ? 'text-slate-600' : 'text-zinc-400'
                        }`}>
                          <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-zinc-900/60'}`}>
                            <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                              EasyPaisa TRX ID
                            </span>
                            <span className={`font-mono font-semibold truncate block ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>
                              {order.trxId}
                            </span>
                          </div>
                          <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-zinc-900/60'}`}>
                            <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                              Student WhatsApp
                            </span>
                            <span className={`font-mono truncate block ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>
                              {order.studentPhone}
                            </span>
                          </div>
                          <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-50' : 'bg-zinc-900/60'}`}>
                            <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                              Courses ({order.noteIds.length})
                            </span>
                            <span className={`truncate block ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>
                              {order.noteTitles?.join(', ') || `${order.noteIds.length} Note(s)`}
                            </span>
                          </div>
                        </div>

                        {/* Screenshot proof preview link */}
                        {order.screenshotUrl && (
                          <div className="pt-0.5">
                            <button
                              onClick={() => setSelectedScreenshot(order.screenshotUrl || null)}
                              className={`text-xs hover:underline flex items-center gap-1 font-semibold ${
                                isLight ? 'text-emerald-700' : 'text-emerald-400'
                              }`}
                            >
                              <span>View EasyPaisa Payment Screenshot Proof</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Action buttons - Mobile thumb-friendly */}
                        <div className={`pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t ${
                          isLight ? 'border-slate-100' : 'border-zinc-800/80'
                        }`}>
                          <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(order.createdAt).toLocaleDateString()}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {order.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerifyOrder(order.id)}
                                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors active:scale-95"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verify Payment & Unlock</span>
                                </button>

                                <button
                                  onClick={() => handleRejectOrder(order.id)}
                                  className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                                    isLight
                                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                      : 'bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 border-zinc-700'
                                  }`}
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {order.status === 'verified' && (
                              <button
                                onClick={() => setSelectedStudentOrder(order)}
                                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border ${
                                  isLight
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                                }`}
                              >
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Manage Course Access</span>
                              </button>
                            )}

                            {/* WhatsApp Direct Sender */}
                            <a
                              href={`https://wa.me/${waTarget}?text=${waMsg}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                                isLight
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border-zinc-700'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>WhatsApp Student</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NOTES & UNIT MANAGEMENT */}
          {activeTab === 'notes' && (
            <div className="space-y-4 sm:space-y-6">
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${
                isLight ? 'border-slate-200' : 'border-zinc-800'
              }`}>
                <div>
                  <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Course Notes & Units Catalog
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                    Add and customize notes with title, class level, subject, unit number, topics, and cover picture.
                  </p>
                </div>

                {!isEditingNote && (
                  <button
                    onClick={() => {
                      setEditNoteId(null);
                      setNoteForm({
                        title: '',
                        classLevel: 'Matric-9th',
                        subject: 'Physics',
                        chapterNumber: 1,
                        chapterTitle: '',
                        topicsCovered: '',
                        description: '',
                        rawTextContent: '',
                        totalPages: 24,
                        pricePKR: 199,
                        googleDriveUrl: '',
                        coverImage: '',
                      });
                      setFormValidationErrors([]);
                      setIsEditingNote(true);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Note / Unit</span>
                  </button>
                )}
              </div>

              {/* Note Add / Edit Form */}
              {isEditingNote && (
                <form onSubmit={handleSaveNote} className={`p-4 sm:p-5 rounded-xl border space-y-4 shadow-xl ${
                  isLight ? 'bg-white border-emerald-300' : 'bg-zinc-950 border-emerald-800/80'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-2.5 ${
                    isLight ? 'border-slate-200' : 'border-zinc-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg border ${
                        isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}>
                        <Edit3 className="w-4 h-4" />
                      </span>
                      <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {editNoteId ? 'Edit Note Details' : 'Create New Note (Manual Configuration)'}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIsEditingNote(false); setFormValidationErrors([]); }}
                      className={`text-xs font-semibold ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
                    >
                      Cancel
                    </button>
                  </div>

                  {formValidationErrors.length > 0 && (
                    <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                      isLight ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-red-950/60 border-red-800 text-red-300'
                    }`}>
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span>Please fix the following:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 pl-2 text-[11px]">
                        {formValidationErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Note Title */}
                    <div className="space-y-1">
                      <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Note Title / Name <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={noteForm.title}
                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                        placeholder="e.g. Kinematics & Graphical Derivations"
                        className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900'
                            : 'bg-zinc-900 border border-zinc-800 text-white'
                        }`}
                      />
                    </div>

                    {/* Class Name */}
                    <div className="space-y-1">
                      <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Class Level Name <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={noteForm.classLevel}
                        onChange={(e) => setNoteForm({ ...noteForm, classLevel: e.target.value })}
                        placeholder="e.g. Matric-9th, FSc-Part1, BSc-Year1, etc."
                        className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900'
                            : 'bg-zinc-900 border border-zinc-800 text-white'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {/* Subject */}
                    <div className="space-y-1">
                      <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Subject Name <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={noteForm.subject}
                        onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                        placeholder="Physics, Chemistry, Math, etc."
                        className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900'
                            : 'bg-zinc-900 border border-zinc-800 text-white'
                        }`}
                      />
                    </div>

                    {/* Unit / Chapter Number */}
                    <div className="space-y-1">
                      <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Unit Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={noteForm.chapterNumber}
                        onChange={(e) => setNoteForm({ ...noteForm, chapterNumber: Number(e.target.value) })}
                        className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900'
                            : 'bg-zinc-900 border border-zinc-800 text-white'
                        }`}
                      />
                    </div>

                    {/* Unit / Chapter Title */}
                    <div className="space-y-1">
                      <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Unit / Chapter Name <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={noteForm.chapterTitle}
                        onChange={(e) => setNoteForm({ ...noteForm, chapterTitle: e.target.value })}
                        placeholder="e.g. Kinematics, Electrostatics"
                        className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900'
                            : 'bg-zinc-900 border border-zinc-800 text-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Topics Covered */}
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      Topics Covered (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={noteForm.topicsCovered}
                      onChange={(e) => setNoteForm({ ...noteForm, topicsCovered: e.target.value })}
                      placeholder="e.g. Velocity & Speed, Equations of Motion, Solved Numericals"
                      className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        isLight
                          ? 'bg-slate-50 border border-slate-300 text-slate-900'
                          : 'bg-zinc-900 border border-zinc-800 text-white'
                      }`}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      Note Description & Highlights
                    </label>
                    <textarea
                      rows={2}
                      value={noteForm.description}
                      onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                      placeholder="Detailed topper handwritten notes with solved past paper questions..."
                      className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        isLight
                          ? 'bg-slate-50 border border-slate-300 text-slate-900'
                          : 'bg-zinc-900 border border-zinc-800 text-white'
                      }`}
                    />
                  </div>

                  {/* Paste Text / Curriculum To Create Beautiful Interactive Notes */}
                  <div className={`p-3.5 sm:p-4 rounded-xl border space-y-2 ${
                    isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <label className={`text-xs font-bold ${isLight ? 'text-emerald-950' : 'text-emerald-300'}`}>
                          Paste Note Content or Textbook/Curriculum Text (Instant Beautiful Notes Generator)
                        </label>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        Auto-splits into formatted pages with formulas, bullets & board questions
                      </span>
                    </div>

                    <textarea
                      rows={5}
                      value={noteForm.rawTextContent}
                      onChange={(e) => setNoteForm({ ...noteForm, rawTextContent: e.target.value })}
                      placeholder="Paste your curriculum, syllabus, or lecture notes text here! Example:
I. Microscopy
• Principle of Simple & Compound Microscopes
• Handling and working of microscope
• Care, Cleaning & Quality Control of Microscope

II. Fixation & Tissue Processing
• The purpose of fixation (Formaldehyde, Zenker's solution)
• Factors affecting quality of fixation
---
(Separate pages with '---' or paste continuous text)"
                      className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed ${
                        isLight
                          ? 'bg-white border border-emerald-300 text-slate-900 placeholder:text-slate-400'
                          : 'bg-zinc-900 border border-emerald-900/60 text-zinc-100 placeholder:text-zinc-500'
                      }`}
                    />
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                      <span>✓</span>
                      <span>
                        Students will be able to read these beautiful formatted digital notes inside the Secure Document Viewer as well as see previews!
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {/* Price in PKR */}
                    <div className="space-y-1">
                      <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Price in PKR <span className="text-emerald-600">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={noteForm.pricePKR}
                        onChange={(e) => setNoteForm({ ...noteForm, pricePKR: Number(e.target.value) })}
                        className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900'
                            : 'bg-zinc-900 border border-zinc-800 text-white'
                        }`}
                      />
                    </div>

                    {/* Total Pages */}
                    <div className="space-y-1">
                      <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Total Pages
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={noteForm.totalPages}
                        onChange={(e) => setNoteForm({ ...noteForm, totalPages: Number(e.target.value) })}
                        className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900'
                            : 'bg-zinc-900 border border-zinc-800 text-white'
                        }`}
                      />
                    </div>

                    {/* Google Drive Link */}
                    <div className="space-y-1">
                      <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                        Google Drive Embed / Preview URL
                      </label>
                      <input
                        type="url"
                        value={noteForm.googleDriveUrl}
                        onChange={(e) => setNoteForm({ ...noteForm, googleDriveUrl: e.target.value })}
                        placeholder="https://drive.google.com/file/d/.../preview"
                        className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                          isLight
                            ? 'bg-slate-50 border border-slate-300 text-slate-900'
                            : 'bg-zinc-900 border border-zinc-800 text-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Manual Cover Picture Upload */}
                  <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
                    <label className={`text-xs font-semibold flex items-center justify-between ${
                      isLight ? 'text-slate-700' : 'text-zinc-300'
                    }`}>
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Cover Picture for Notes</span>
                      </span>
                      {noteForm.coverImage && (
                        <span className="text-[10px] text-emerald-600 font-mono truncate max-w-[200px]">
                          {noteForm.coverImage}
                        </span>
                      )}
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className={`flex-1 w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                        isLight
                          ? 'border-slate-300 hover:border-emerald-600 bg-slate-50'
                          : 'border-zinc-800 hover:border-emerald-600/60 bg-zinc-900/60'
                      }`}>
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span className={`text-xs ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                          {isUploadingCover ? 'Uploading Cover to Server...' : 'Upload New Cover Picture'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingCover}
                          onChange={handleNoteCoverUpload}
                          className="hidden"
                        />
                      </label>

                      {noteForm.coverImage && (
                        <div className="relative h-16 w-24 rounded-lg overflow-hidden border border-slate-300 dark:border-zinc-700 shrink-0">
                          <img
                            src={noteForm.coverImage}
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isSubmittingNote}
                      onClick={() => { setIsEditingNote(false); setFormValidationErrors([]); }}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingNote || isUploadingCover}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                      {isSubmittingNote ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{editNoteId ? 'Update Note' : 'Create Note'}</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Notes List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {allNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3.5 sm:p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-colors ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Cover Thumbnail */}
                      <div className={`h-16 w-14 rounded-lg border overflow-hidden shrink-0 flex items-center justify-center ${
                        isLight ? 'bg-slate-100 border-slate-200' : 'bg-zinc-900 border-zinc-800'
                      }`}>
                        {note.coverImage ? (
                          <img
                            src={note.coverImage}
                            alt={note.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className={`w-6 h-6 ${isLight ? 'text-slate-400' : 'text-zinc-600'}`} />
                        )}
                      </div>

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-semibold ${
                            isLight
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-zinc-800 text-emerald-400'
                          }`}>
                            {note.classLevel}
                          </span>
                          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                            {note.subject}
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {note.title}
                        </h4>
                        <div className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                          Unit {note.chapterNumber}: {note.chapterTitle} · {note.totalPages} pages
                        </div>
                      </div>
                    </div>

                    <div className={`flex items-center justify-between pt-2 border-t ${
                      isLight ? 'border-slate-100' : 'border-zinc-800/80'
                    }`}>
                      <span className={`font-mono text-xs font-bold ${
                        isLight ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        Rs. {note.pricePKR}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditNote(note)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                            isLight
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                          }`}
                          title="Edit Note Details"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Edit</span>
                        </button>

                        {/* Two-step delete confirmation */}
                        {deleteConfirmId === note.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteNote(note.id, note.title)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold animate-pulse"
                              title="Confirm Delete"
                            >
                              Confirm Delete?
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className={`px-2 py-1.5 rounded-lg text-xs border ${
                                isLight ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                              }`}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(note.id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              isLight
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                : 'bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 border-zinc-700'
                            }`}
                            title="Delete Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LOGO & BRAND SETTINGS */}
          {activeTab === 'branding' && (
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <KainatLogo customLogoUrl={logoPreview} size="sm" showSubtitle={false} theme={isLight ? 'light' : 'dark'} />
                  <span>Kainat Logo & Branding Customizer</span>
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Upload a custom picture for your store logo, or choose from presets. All images are stored permanently on server disk under <code className="text-emerald-600 font-mono">/uploads/</code>. Changes appear immediately across the site.
                </p>
              </div>

              {/* Logo Preview & Upload */}
              <div className={`p-4 sm:p-5 rounded-xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-950/60 border-zinc-800'
              }`}>
                <label className={`text-xs font-semibold block ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                  Current Store Logo Preview
                </label>

                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-900 border-zinc-800'
                }`}>
                  <KainatLogo customLogoUrl={logoPreview} size="lg" theme={isLight ? 'light' : 'dark'} />

                  {logoPreview ? (
                    <button
                      type="button"
                      onClick={handleResetDemoLogo}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      Reset to Demo Emblem
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-mono font-semibold">
                      Active: Demo Kainat Logo
                    </span>
                  )}
                </div>

                {/* Upload Button */}
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Upload New Picture for Logo (PNG, JPG, SVG, Transparent)
                  </label>
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors group ${
                    isLight
                      ? 'border-slate-300 hover:border-emerald-600 bg-slate-50'
                      : 'border-zinc-800 hover:border-emerald-600/70 bg-zinc-950'
                  }`}>
                    <Upload className="w-6 h-6 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                    <span className={`text-xs font-semibold text-center ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                      {isUploadingLogo ? 'Uploading & Saving to Server Storage...' : 'Click or Drag Image Here to Update Logo'}
                    </span>
                    <span className={`text-[11px] text-center ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                      Auto-saved to permanent /uploads/ directory
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingLogo}
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Site Details */}
              <div className={`space-y-4 p-4 sm:p-5 rounded-xl border ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-950/60 border-zinc-800'
              }`}>
                <div className="space-y-1.5">
                  <label className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Brand Title
                  </label>
                  <input
                    type="text"
                    value={siteNameInput}
                    onChange={(e) => setSiteNameInput(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isLight
                        ? 'bg-slate-50 border border-slate-300 text-slate-900'
                        : 'bg-zinc-900 border border-zinc-800 text-white'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      EasyPaisa Account Number
                    </label>
                    <input
                      type="text"
                      value={easyPaisaInput}
                      onChange={(e) => setEasyPaisaInput(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        isLight
                          ? 'bg-slate-50 border border-slate-300 text-slate-900'
                          : 'bg-zinc-900 border border-zinc-800 text-white'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      WhatsApp Notification Number
                    </label>
                    <input
                      type="text"
                      value={whatsAppInput}
                      onChange={(e) => setWhatsAppInput(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        isLight
                          ? 'bg-slate-50 border border-slate-300 text-slate-900'
                          : 'bg-zinc-900 border border-zinc-800 text-white'
                      }`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSavingSettings ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Brand Settings...</span>
                    </>
                  ) : (
                    <span>Save Brand Settings & Logo</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE & STORAGE (MongoDB + Local Document Storage) */}
          {activeTab === 'database' && (
            <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-950 border-zinc-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Database & Media Storage Architecture
                  </h3>
                </div>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Here is where all images, user data, orders, and notes are saved, with options to connect external MongoDB Atlas and export automated backups.
                </p>
              </div>

              {/* Storage Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-950/60 border-zinc-800'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                    <HardDrive className="w-4 h-4" />
                    <span>Uploaded Media Storage</span>
                  </div>
                  <div className={`text-xs ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    Directory: <code className="text-emerald-600 font-mono">public/uploads/</code>
                  </div>
                  <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Files stored: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{dbStorageInfo?.uploadedFilesCount ?? 0}</strong>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    All custom logo uploads, payment screenshots, and note cover images are saved directly to permanent server disk.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-950/60 border-zinc-800'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-600">
                    <Database className="w-4 h-4" />
                    <span>Local Document Database</span>
                  </div>
                  <div className={`text-xs ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    File: <code className="text-teal-600 font-mono">data/db.json</code>
                  </div>
                  <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Collections: <strong className={isLight ? 'text-slate-900' : 'text-white'}>notes, orders, notifications</strong>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    Stores all student orders, verified purchases, and catalog metadata with high reliability.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border space-y-2 ${
                  isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-950/60 border-zinc-800'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                    <ExternalLink className="w-4 h-4" />
                    <span>Google Drive Storage</span>
                  </div>
                  <div className={`text-xs ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    Linked Cloud Drive
                  </div>
                  <div className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    Large PDFs & Source Files
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    Full digital note files and PDFs are streamed from Google Drive links via the secure watermark viewer.
                  </p>
                </div>
              </div>

              {/* MongoDB Integration Section */}
              <div className={`p-4 sm:p-5 rounded-xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-950/60 border-zinc-800'
              }`}>
                <div className={`flex items-center justify-between border-b pb-3 ${
                  isLight ? 'border-slate-200' : 'border-zinc-800'
                }`}>
                  <div>
                    <h4 className={`text-xs font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      <span>MongoDB Atlas Integration</span>
                    </h4>
                    <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      Attach your MongoDB Atlas connection string below to sync all orders and user data directly to your MongoDB cluster.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    MongoDB Connection URI (Optional)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={mongoUriInput}
                      onChange={(e) => setMongoUriInput(e.target.value)}
                      placeholder="mongodb+srv://username:password@cluster0.mongodb.net/kainat_notes?retryWrites=true&w=majority"
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        isLight
                          ? 'bg-slate-50 border border-slate-300 text-slate-900'
                          : 'bg-zinc-900 border border-zinc-800 text-white'
                      }`}
                    />
                    <button
                      type="button"
                      disabled={isTestingMongo}
                      onClick={handleTestMongo}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {isTestingMongo ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <span>Save & Connect</span>
                      )}
                    </button>
                  </div>
                  <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    Current active status:{' '}
                    {dbStorageInfo?.mongoDbConnected ? (
                      <span className="text-emerald-600 font-semibold">Connected to MongoDB Atlas</span>
                    ) : (
                      <span className={isLight ? 'text-slate-600' : 'text-zinc-400'}>
                        Running smoothly on persistent local MongoDB document store
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Database Backup & Export */}
              <div className={`p-4 sm:p-5 rounded-xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-950/60 border-zinc-800'
              }`}>
                <div className={`flex items-center justify-between border-b pb-3 ${
                  isLight ? 'border-slate-200' : 'border-zinc-800'
                }`}>
                  <div>
                    <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>One-Click Database Backup & Restore</span>
                    </h4>
                    <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      Export your entire database (all notes, orders, and student licenses) into a portable JSON backup anytime.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => apiExportDatabaseBackup()}
                    className={`px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-2 ${
                      isLight
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border-zinc-700'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Complete JSON Backup</span>
                  </button>

                  <label className={`px-4 py-2.5 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                  }`}>
                    <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                    <span>{isRestoringDb ? 'Restoring...' : 'Restore from JSON Backup'}</span>
                    <input
                      type="file"
                      accept=".json"
                      disabled={isRestoringDb}
                      onChange={handleRestoreDatabase}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUTOMATED ALERT FEED */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                Real-time automated notification alerts recorded when payment verification happens:
              </div>

              {notifications.length === 0 ? (
                <div className={`text-center py-10 text-xs border rounded-xl p-6 ${
                  isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-zinc-950/40 border-zinc-800 text-zinc-500'
                }`}>
                  No notifications recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs ${
                        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-950/80 border-zinc-800'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {notif.message}
                        </div>
                        <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          Order: <span className="font-mono text-emerald-600 font-semibold">{notif.orderId}</span> · Student:{' '}
                          {notif.studentName} ({notif.studentEmail})
                        </div>
                      </div>
                      <span className={`font-mono text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                        {new Date(notif.verifiedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Screenshot Modal Viewer */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div
            className={`relative max-w-xl w-full rounded-2xl overflow-hidden p-3.5 sm:p-4 space-y-3 border shadow-2xl ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900 border-zinc-800 text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b pb-2 ${
              isLight ? 'border-slate-200' : 'border-zinc-800'
            }`}>
              <h4 className="text-xs font-bold">EasyPaisa Payment Screenshot Proof</h4>
              <button
                onClick={() => setSelectedScreenshot(null)}
                className={`p-1 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[68vh] overflow-auto flex items-center justify-center bg-black/10 rounded-lg p-2">
              <img
                src={selectedScreenshot}
                alt="EasyPaisa Payment Proof"
                className="max-h-full max-w-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* Manage Student Course Access Modal */}
      {selectedStudentOrder && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedStudentOrder(null)}
        >
          <div
            className={`relative max-w-lg w-full rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl border ${
              isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-900 border-zinc-800 text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${
              isLight ? 'border-slate-200' : 'border-zinc-800'
            }`}>
              <div>
                <h4 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Student Course Access Management</span>
                </h4>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  Student: <strong className={isLight ? 'text-slate-800' : 'text-white'}>{selectedStudentOrder.studentName}</strong> (Order #{selectedStudentOrder.id})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentOrder(null)}
                className={`p-1 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-900' : 'text-zinc-400 hover:text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Currently Unlocked Courses */}
            <div className="space-y-2">
              <label className={`text-xs font-semibold block ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                Currently Unlocked Courses for this Student:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedStudentOrder.noteIds.map((nId) => {
                  const nObj = allNotes.find((n) => n.id === nId);
                  return (
                    <div
                      key={nId}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950 border-zinc-800'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className={`font-semibold block truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {nObj ? nObj.title : nId}
                        </span>
                        <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                          ID: {nId}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRevokeCourse(selectedStudentOrder.id, nId)}
                        className={`text-xs font-medium px-2 py-1 rounded border shrink-0 ${
                          isLight
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'text-red-400 hover:text-red-300 bg-red-950/60 border-red-900'
                        }`}
                      >
                        Revoke Access
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grant New Course */}
            <div className={`space-y-2 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-zinc-800'}`}>
              <label className={`text-xs font-semibold block ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                Grant Additional Course Access:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={courseToGrant}
                  onChange={(e) => setCourseToGrant(e.target.value)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900'
                      : 'bg-zinc-950 border border-zinc-800 text-white'
                  }`}
                >
                  {allNotes.map((note) => (
                    <option key={note.id} value={note.id}>
                      [{note.classLevel}] {note.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleGrantCourse(selectedStudentOrder.id)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
                >
                  Grant Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Instagram-Style Circular Logo Cropper Modal */}
      {rawLogoForCropping && (
        <CircularLogoCropper
          imageSrc={rawLogoForCropping}
          isLight={isLight}
          onCropComplete={handleApplyCroppedLogo}
          onCancel={() => setRawLogoForCropping(null)}
        />
      )}
    </div>
  );
};
