import React, { useState, useEffect } from 'react';
import { NoteItem, Order, StudentUser } from '../types';
import { BookOpen, ShieldCheck, Key, RefreshCw, Mail, UserCheck, Smartphone } from 'lucide-react';
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
  onTrackOrder,
  currentStudent,
  onOpenStudentAuth,
  onRefreshOrders,
}) => {
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [loadError, setLoadError] = useState('');
  const [localOrders, setLocalOrders] = useState<Order[]>(unlockedOrders);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setLocalOrders(unlockedOrders);
  }, [unlockedOrders]);

  // If student is logged in, auto-sync their courses across devices
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
          setLoadError('Order found, but payment is still pending verification by Kainat. Please check Track Payment.');
        }
      } else {
        setLoadError('No verified orders found for this code or email. Please verify spelling.');
      }
    } catch {
      setLoadError('Error checking access code.');
    }
  };

  // Collect all unique unlocked note objects across verified orders
  const unlockedItems: Array<{
    note: NoteItem;
    order: Order;
  }> = [];

  for (const ord of localOrders) {
    if (ord.status === 'verified') {
      for (const noteId of ord.noteIds) {
        // If bundle, check sub notes
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
            <span>Kainat Verified Reader Active</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">My Digital Reading Library</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Access your licensed notes with dynamic watermark protection across all your devices.
          </p>
        </div>

        {/* Enter Code / Email Quick Access */}
        <form onSubmit={handleLookupAccess} className="flex gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Key className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              placeholder="Enter Order ID or Gmail to load..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors"
          >
            Load
          </button>
        </form>
      </div>

      {/* Cross-Device Account Status / Banner */}
      {currentStudent ? (
        <div className="p-3.5 rounded-xl border border-emerald-800/60 bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-zinc-400">Connected Student Account: </span>
              <strong className="text-emerald-400 font-mono">{currentStudent.email}</strong>
              <span className="text-[11px] text-zinc-400 block sm:inline sm:ml-2">
                (Synced across this device & your mobile)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncStudent}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-sm text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync My Courses'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-zinc-200 font-medium">Using another mobile, laptop, or tablet?</span>
              <p className="text-[11px] text-zinc-400">
                Sign in with the Gmail you used during checkout to automatically restore and read all your courses here.
              </p>
            </div>
          </div>

          {onOpenStudentAuth && (
            <button
              onClick={onOpenStudentAuth}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300 border border-zinc-700 rounded-lg font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Sign In with Gmail</span>
            </button>
          )}
        </div>
      )}

      {loadError && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-300">
          {loadError}
        </div>
      )}

      {unlockedItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 space-y-4">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Notes Unlocked Yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Once you checkout with EasyPaisa and your payment is verified by Kainat, your purchased notes will appear here automatically!
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onTrackOrder}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              Track Existing Order
            </button>
            {onOpenStudentAuth && (
              <button
                onClick={onOpenStudentAuth}
                className="px-4 py-2 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Sign In with Other Gmail
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unlockedItems.map(({ note, order }) => (
            <div
              key={`${order.id}-${note.id}`}
              className="group relative flex flex-col justify-between rounded-xl border border-emerald-900/40 bg-zinc-900/80 hover:border-emerald-700/60 transition-all duration-200 overflow-hidden shadow-lg"
            >
              <div>
                <div className="relative h-40 w-full bg-zinc-950 overflow-hidden border-b border-zinc-800/80">
                  {note.coverImage ? (
                    <img
                      src={note.coverImage}
                      alt={note.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                      <BookOpen className="w-12 h-12 text-emerald-500/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                  <div className="absolute top-3 left-3 bg-emerald-900/90 text-emerald-200 border border-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Licensed to: {order.studentName.split(' ')[0]}</span>
                  </div>

                  <div className="absolute bottom-2 left-3 text-[11px] font-medium text-zinc-400">
                    Order #{order.id}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {note.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">{note.description}</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() =>
                    onOpenViewer(note.id, {
                      name: order.studentName,
                      email: order.studentEmail,
                      phone: order.studentPhone,
                      orderId: order.id,
                    })
                  }
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open Complete Course PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
