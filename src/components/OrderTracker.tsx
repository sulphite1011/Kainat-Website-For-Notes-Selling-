import React, { useState, useEffect } from 'react';
import { Order, NoteItem } from '../types';
import { Search, CheckCircle2, Clock, AlertCircle, BookOpen, Send, ShieldCheck, RefreshCw } from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { apiLookupOrders, getStoredOrders } from '../services/apiClient';

interface OrderTrackerProps {
  orders: Order[];
  onOpenViewer: (noteId: string, studentData: { name: string; email: string; phone: string; orderId: string }) => void;
  allNotes: NoteItem[];
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  orders,
  onOpenViewer,
  allNotes,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(orders[0] || null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Handle lookup
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setStatusMessage('');
      const data = await apiLookupOrders(searchQuery.trim());

      if (data.success && data.orders.length > 0) {
        setActiveOrder(data.orders[0]);
      } else {
        setStatusMessage('No orders found matching that Order ID or Email. Please check your spelling.');
      }
    } catch {
      setStatusMessage('Error searching orders.');
    } finally {
      setLoading(false);
    }
  };

  // Poll active order if it is pending
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const stored = getStoredOrders();
        const updated = stored.find((o) => o.id === activeOrder.id);
        if (updated) {
          if (updated.status === 'verified' && activeOrder.status === 'pending') {
            sound.playVerificationChime();
          }
          setActiveOrder(updated);
        }
      } catch {
        // silent polling catch
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeOrder]);

  return (
    <section className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Track Order & Verify Payment</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Check your EasyPaisa verification status or look up your unlocked digital notes verified by Kainat.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Order ID (e.g. KN-8102) or your Student Email..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-900/60 text-xs text-amber-300">
          {statusMessage}
        </div>
      )}

      {/* Active Order Card */}
      {activeOrder ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 bg-zinc-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Order Reference:</span>
                <span className="text-sm font-bold text-white font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                  {activeOrder.id}
                </span>
              </div>
              <div className="text-xs text-zinc-400">
                Student: <strong className="text-zinc-200">{activeOrder.studentName}</strong> ({activeOrder.studentEmail})
              </div>
            </div>

            {/* Status Pill Indicator */}
            <div>
              {activeOrder.status === 'verified' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified & Unlocked</span>
                </div>
              )}

              {activeOrder.status === 'pending' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-400 text-xs font-semibold animate-pulse">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Pending Kainat's Verification</span>
                </div>
              )}

              {activeOrder.status === 'rejected' && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>Payment Unconfirmed</span>
                </div>
              )}
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-6">
            {/* Payment Audit Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs">
              <div>
                <span className="text-zinc-500 block">Total Amount</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  Rs. {activeOrder.totalAmountPKR}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">EasyPaisa TRX ID</span>
                <span className="font-mono text-zinc-200 font-medium">{activeOrder.trxId}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">WhatsApp Phone</span>
                <span className="font-mono text-zinc-200">{activeOrder.studentPhone}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Account Transferred</span>
                <span className="font-mono text-zinc-200">03415892099</span>
              </div>
            </div>

            {/* Pending State WhatsApp Guide */}
            {activeOrder.status === 'pending' && (
              <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Live Automated Sync Active</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Have you sent your screenshot to Kainat's WhatsApp? If not, tap below to send it to{' '}
                  <strong className="text-white">0324 9059918</strong>. As soon as Kainat approves on her end,
                  this screen will play a chime and unlock your notes automatically!
                </p>

                <a
                  href={`https://wa.me/923249059918?text=${encodeURIComponent(
                    `Assalam o Alaikum Ma'am Kainat! Following up on Order #${activeOrder.id} (TRX: ${activeOrder.trxId}). Here is my screenshot proof.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open WhatsApp (0324 9059918)</span>
                </a>
              </div>
            )}

            {/* Unlocked Notes List */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wide flex items-center justify-between">
                <span>Ordered Notes ({activeOrder.noteIds.length})</span>
                {activeOrder.status === 'verified' && (
                  <span className="text-[11px] text-emerald-400 lowercase font-normal">
                    Ready to read in protected viewer
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {activeOrder.noteIds.map((noteId) => {
                  const noteObj = allNotes.find((n) => n.id === noteId);
                  const title = noteObj?.title || noteId;

                  return (
                    <div
                      key={noteId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-950 gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white line-clamp-1">{title}</div>
                        {noteObj && (
                          <div className="text-[11px] text-zinc-400">
                            {noteObj.classLevel} · {noteObj.subject} · {noteObj.totalPages} Pages
                          </div>
                        )}
                      </div>

                      {activeOrder.status === 'verified' ? (
                        <button
                          onClick={() =>
                            onOpenViewer(noteId, {
                              name: activeOrder.studentName,
                              email: activeOrder.studentEmail,
                              phone: activeOrder.studentPhone,
                              orderId: activeOrder.id,
                            })
                          }
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors shrink-0"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Launch Secure Reader</span>
                        </button>
                      ) : (
                        <div className="text-[11px] text-zinc-500 font-mono italic">
                          Locked pending verification
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 space-y-2">
          <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-medium text-zinc-300">Search for your order to view unlocked notes</p>
          <p className="text-xs text-zinc-500">
            Enter your Order ID (e.g. KH-8102) or the email you entered at checkout.
          </p>
        </div>
      )}
    </section>
  );
};
