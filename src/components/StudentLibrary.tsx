import React, { useState } from 'react';
import { NoteItem, Order } from '../types';
import { BookOpen, ShieldCheck, Key } from 'lucide-react';

interface StudentLibraryProps {
  unlockedOrders: Order[];
  allNotes: NoteItem[];
  onOpenViewer: (noteId: string, studentData: { name: string; email: string; phone: string; orderId: string }) => void;
  onTrackOrder: () => void;
}

export const StudentLibrary: React.FC<StudentLibraryProps> = ({
  unlockedOrders,
  allNotes,
  onOpenViewer,
  onTrackOrder,
}) => {
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [loadError, setLoadError] = useState('');
  const [localOrders, setLocalOrders] = useState<Order[]>(unlockedOrders);

  // Sync prop changes
  React.useEffect(() => {
    setLocalOrders(unlockedOrders);
  }, [unlockedOrders]);

  const handleLookupAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) return;

    try {
      setLoadError('');
      const res = await fetch(`/api/orders/lookup?query=${encodeURIComponent(accessCodeInput.trim())}`);
      const data = await res.json();
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
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Kainat Verified Reader Active</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">My Digital Reading Library</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Access your licensed notes with dynamic watermark protection. Content is read-only and tied exclusively to your verified purchase.
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
              placeholder="Enter Order ID or Email to load library..."
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
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unlockedItems.map(({ note, order }) => (
            <div
              key={`${note.id}-${order.id}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden flex flex-col justify-between hover:border-emerald-700/60 transition-all duration-200 group"
            >
              <div>
                <div className="relative h-40 w-full bg-zinc-950 overflow-hidden border-b border-zinc-800">
                  {note.coverImage ? (
                    <img
                      src={note.coverImage}
                      alt={note.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-600">
                      <BookOpen className="w-10 h-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                  <div className="absolute top-3 left-3 bg-emerald-950/90 text-emerald-300 border border-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Paying Student License: {order.studentName}</span>
                  </div>

                  <div className="absolute bottom-2 left-3 text-[11px] text-zinc-300 font-medium">
                    {note.classLevel} · {note.subject}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-300 transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {note.description}
                  </p>

                  <div className="pt-2 text-[11px] text-zinc-500 font-mono">
                    Order Ref: #{order.id} · Student: {order.studentEmail}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-zinc-800/80 mt-2">
                <button
                  onClick={() =>
                    onOpenViewer(note.id, {
                      name: order.studentName,
                      email: order.studentEmail,
                      phone: order.studentPhone,
                      orderId: order.id,
                    })
                  }
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Launch Secure Document Viewer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
