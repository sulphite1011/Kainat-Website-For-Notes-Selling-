import React, { useState } from 'react';
import { Order } from '../types';
import { Search, CheckCircle2, Clock, XCircle, BookOpen, AlertCircle } from 'lucide-react';
import { apiLookupOrders } from '../services/apiClient';

interface OrderTrackerProps {
  onOpenLibrary: () => void;
  onOpenViewer: (noteId: string, studentData: { name: string; email: string; phone: string; orderId: string }) => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ onOpenLibrary, onOpenViewer }) => {
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await apiLookupOrders(query.trim());
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">Track Order Status</h2>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Enter your Order ID (e.g. KN-8102), Gmail address, or EasyPaisa TRX ID to check verification status.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID, Gmail, or TRX ID..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
                  <div>
                    <span className="text-xs text-zinc-400">Order ID</span>
                    <h3 className="text-base font-bold text-white font-mono">{order.id}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'verified' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Payment Verified</span>
                      </span>
                    )}
                    {order.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Verification</span>
                      </span>
                    )}
                    {order.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Payment Rejected</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block">Student</span>
                    <span className="font-semibold text-zinc-200">{order.studentName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Gmail</span>
                    <span className="font-semibold text-zinc-200 truncate block">{order.studentEmail}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Total Amount</span>
                    <span className="font-bold text-emerald-400 font-mono">Rs. {order.totalAmountPKR}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">TRX ID</span>
                    <span className="font-mono text-zinc-300">{order.trxId}</span>
                  </div>
                </div>

                {order.status === 'verified' ? (
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      onClick={onOpenLibrary}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open in My Library</span>
                    </button>
                    {order.noteIds && order.noteIds[0] && (
                      <button
                        onClick={() =>
                          onOpenViewer(order.noteIds[0], {
                            name: order.studentName,
                            email: order.studentEmail,
                            phone: order.studentPhone,
                            orderId: order.id,
                          })
                        }
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                      >
                        Read Note #{order.noteIds[0]}
                      </button>
                    )}
                  </div>
                ) : order.status === 'pending' ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                    <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Payment received. Please send your EasyPaisa screenshot to WhatsApp (0324 9059918) for immediate activation.
                    </span>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="text-center py-12 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-2">
              <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Orders Found</h4>
              <p className="text-xs text-zinc-400">
                Please double check the spelling of your Gmail, Order ID, or EasyPaisa TRX ID.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
