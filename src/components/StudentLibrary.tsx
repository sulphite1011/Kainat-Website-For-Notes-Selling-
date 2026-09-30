import React, { useState, useEffect } from 'react';
import { NoteItem, Order, StudentUser } from '../types';
import { BookOpen, ShieldCheck, Key, RefreshCw, Smartphone, Search, AlertCircle } from 'lucide-react';
import { apiLookupOrders, apiGetStudentOrders } from '../services/apiClient';

interface StudentLibraryProps {
  unlockedOrders: Order[];
  allNotes: NoteItem[];
  onOpenViewer: (noteId: string, studentData: { name: string; email: string; phone: string; orderId: string }) => void;
  onTrackOrder: () => void;
  currentStudent?: StudentUser | null;
  onOpenStudentAuth?: () => void;
  onRefreshOrders?: () => void;
}

export const StudentLibrary: React.FC<StudentLibraryProps> = ({
  unlockedOrders,
  allNotes,
  onOpenViewer,
  currentStudent,
  onOpenStudentAuth,
  onRefreshOrders,
}) => {
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [loadError, setLoadError] = useState('');
  const [localOrders, setLocalOrders] = useState<Order[]>(unlockedOrders);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setLocalOrders(unlockedOrders);
  }, [unlockedOrders]);

  const handleSyncStudent = async () => {
    if (!currentStudent?.email) return;
    setIsSyncing(true);
    try {
      const orders = await apiGetStudentOrders(currentStudent.email);
      if (orders && orders.length > 0) {
        setLocalOrders(orders);
      }
      if (onRefreshOrders) onRefreshOrders();
    } catch {
      // ignore
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLookupAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) return;

    try {
      setLoadError('');
      const data = await apiLookupOrders(accessCodeInput.trim());
      if (data.success && data.orders.length > 0) {
        const verified = data.orders.filter((o: Order) => o.status === 'verified');
        if (verified.length > 0) {
          setLocalOrders(verified);
        } else {
          setLoadError('Order found, but payment is still being verified by Kainat.');
        }
      } else {
        setLoadError('No verified notes found for this Order ID or Gmail.');
      }
    } catch {
      setLoadError('Error checking access code.');
    }
  };

  // Unique unlocked items
  const unlockedItems: Array<{
    note: NoteItem;
    order: Order;
  }> = [];

  for (const ord of localOrders) {
    if (ord.status === 'verified') {
      for (const noteId of ord.noteIds) {
        if (noteId === 'bundle-fsc2-complete') {
          const sub1 = allNotes.find((n) => n.id === 'fsc2-phy-ch12');
          const sub2 = allNotes.find((n) => n.id === 'fsc2-math-ch2');
          if (sub1 && !unlockedItems.some((i) => i.note.id === sub1.id && i.order.id === ord.id)) {
            unlockedItems.push({ note: sub1, order: ord });
          }
          if (sub2 && !unlockedItems.some((i) => i.note.id === sub2.id && i.order.id === ord.id)) {
            unlockedItems.push({ note: sub2, order: ord });
          }
        } else {
          const found = allNotes.find((n) => n.id === noteId);
          if (found && !unlockedItems.some((i) => i.note.id === found.id && i.order.id === ord.id)) {
            unlockedItems.push({ note: found, order: ord });
          }
        }
      }
    }
  }

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Multi-Device Digital Reader</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">My Reading Library</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Access and read all your verified course notes on any phone, tablet, or laptop.
          </p>
        </div>

        {/* Enter Code / Email Quick Access */}
        <form onSubmit={handleLookupAccess} className="flex gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              placeholder="Order ID or Gmail..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors cursor-pointer"
          >
            Load
          </button>
        </form>
      </div>

      {loadError && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Account Status Card */}
      {currentStudent ? (
        <div className="p-3.5 rounded-xl border border-emerald-800/60 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {currentStudent.avatarUrl ? (
              <img
                src={currentStudent.avatarUrl}
                alt={currentStudent.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shrink-0 shadow"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow">
                {(currentStudent.name || 'S')[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{currentStudent.name}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Student
                </span>
              </div>
              <p className="text-emerald-400 font-mono text-xs">{currentStudent.email}</p>
            </div>
          </div>

          <button
            onClick={handleSyncStudent}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm text-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Courses'}</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-zinc-200 font-medium">Using a new device or browser?</span>
              <p className="text-[11px] text-zinc-400">
                Sign in with the Gmail used during checkout to automatically restore all your purchased notes.
              </p>
            </div>
          </div>

          {onOpenStudentAuth && (
            <button
              onClick={onOpenStudentAuth}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer"
            >
              Sign In with Google
            </button>
          )}
        </div>
      )}

      {/* Unlocked Notes List */}
      {unlockedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {unlockedItems.map(({ note, order }) => (
            <div
              key={`${note.id}-${order.id}`}
              className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {(note.classLevel || 'Course').replace('-', ' ')}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    Order #{order.id}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">
                  {note.title}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {note.description}
                </p>
              </div>

              <button
                onClick={() =>
                  onOpenViewer(note.id, {
                    name: order.studentName,
                    email: order.studentEmail,
                    phone: order.studentPhone,
                    orderId: order.id,
                  })
                }
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Read Notes Now</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 p-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 space-y-3">
          <BookOpen className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Notes in Library Yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Once you complete checkout with EasyPaisa, your purchased courses will appear here automatically.
          </p>
        </div>
      )}
    </section>
  );
};
