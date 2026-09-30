import React, { useState } from 'react';
import { NoteItem, Order, StudentUser } from '../types';
import { X, Smartphone, CheckCircle2, ShieldCheck, Copy, Check, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { apiCreateOrder } from '../services/apiClient';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartNotes: NoteItem[];
  onRemoveFromCart: (noteId: string) => void;
  onOrderCreated: (order: Order) => void;
  easyPaisaAccount: string;
  whatsAppNumber: string;
  onStudentAuthenticated?: (student: StudentUser) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartNotes,
  onRemoveFromCart,
  onOrderCreated,
  easyPaisaAccount,
  whatsAppNumber,
  onStudentAuthenticated,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  if (!isOpen) return null;

  const totalAmountPKR = cartNotes.reduce((sum, n) => sum + n.pricePKR, 0);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(easyPaisaAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim() || !studentEmail.trim() || !studentPhone.trim() || !trxId.trim()) {
      setErrorMessage('Please fill in your name, Gmail, WhatsApp number, and TRX ID.');
      return;
    }

    if (cartNotes.length === 0) {
      setErrorMessage('Your cart is empty. Please select at least one note.');
      return;
    }

    try {
      setLoading(true);
      const data = await apiCreateOrder({
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
        studentPhone: studentPhone.trim(),
        noteIds: cartNotes.map((n) => n.id),
        noteTitles: cartNotes.map((n) => n.title),
        totalAmountPKR: totalAmountPKR,
        paymentMethod: 'easypaisa',
        easypaisaAccount: easyPaisaAccount,
        trxId: trxId.trim(),
      });

      if (!data.success || !data.order) {
        throw new Error(data.message || 'Failed to submit order.');
      }

      const formattedWhatsAppPhone = whatsAppNumber.replace(/[^0-9]/g, '');
      const notesListText = cartNotes.map((n) => `• ${n.title}`).join('%0A');
      const waUrl = `https://api.whatsapp.com/send?phone=${formattedWhatsAppPhone}&text=${encodeURIComponent(
        `Assalam-o-Alaikum Kainat! I have placed Order #${data.order.id} on Kainat Notes Hub.%0A%0AStudent Name: ${data.order.studentName}%0AEmail: ${data.order.studentEmail}%0AEasyPaisa Trx ID: ${data.order.trxId}%0ATotal Amount: Rs. ${data.order.totalAmountPKR}%0A%0ACourses Ordered:%0A${notesListText}%0A%0APlease verify my payment and unlock my notes.`
      )}`;

      const studentObj: StudentUser = {
        email: studentEmail.trim().toLowerCase(),
        name: studentName.trim(),
        phone: studentPhone.trim(),
        verifiedAt: new Date().toISOString(),
      };
      if (onStudentAuthenticated) {
        onStudentAuthenticated(studentObj);
      }

      setSubmittedOrder(data.order);
      setWhatsappUrl(waUrl);
      onOrderCreated(data.order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting order.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>EasyPaisa Direct Checkout</span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">Order Checkout</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {submittedOrder ? (
            /* Post-submission Success View */
            <div className="space-y-5 text-center py-2">
              <div className="w-12 h-12 bg-emerald-950/80 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Order Submitted!</h3>
                <p className="text-xs text-zinc-400">
                  Order Reference: <strong className="text-emerald-400 font-mono text-sm px-2 py-0.5 bg-zinc-950 rounded border border-zinc-800">{submittedOrder.id}</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/80 text-left space-y-3">
                <div className="text-xs font-semibold text-zinc-200">Next Step: Verification via WhatsApp</div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Send your EasyPaisa payment screenshot to Kainat at <strong className="text-zinc-200">{whatsAppNumber}</strong>. Once approved, your notes will unlock instantly in your library!
                </p>

                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs flex justify-between">
                  <span className="text-zinc-400">TRX ID: <strong className="text-white font-mono">{submittedOrder.trxId}</strong></span>
                  <span className="text-zinc-400">Amount: <strong className="text-emerald-400 font-mono">Rs. {submittedOrder.totalAmountPKR}</strong></span>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Screenshot on WhatsApp</span>
                </a>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close & Return to Store
              </button>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Cart Items Summary */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2.5">
                <div className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                  Order Summary ({cartNotes.length} Items)
                </div>
                <div className="divide-y divide-zinc-800/80 max-h-36 overflow-y-auto">
                  {cartNotes.map((note) => (
                    <div key={note.id} className="py-2 flex items-center justify-between text-xs">
                      <span className="text-zinc-200 truncate pr-3">{note.title}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-emerald-400 font-semibold">Rs. {note.pricePKR}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveFromCart(note.id)}
                          className="text-zinc-500 hover:text-red-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-800/80 pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Total:</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    Rs. {totalAmountPKR}
                  </span>
                </div>
              </div>

              {/* Step 1: Payment Instructions */}
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  Step 1: Send Payment via EasyPaisa
                </div>

                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div>
                    <div className="text-[11px] text-zinc-400">EasyPaisa Account</div>
                    <div className="text-base font-extrabold text-white font-mono tracking-wider">
                      {easyPaisaAccount}
                    </div>
                    <div className="text-[10px] text-zinc-500">Account Title: Kainat / Verified</div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-emerald-400 border border-zinc-700 transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400">
                  Transfer <strong className="text-emerald-400">Rs. {totalAmountPKR}</strong> to the account above and copy your 10-digit TRX ID.
                </p>
              </div>

              {/* Step 2: Student Details */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                  Step 2: Enter Student Details
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Ali Ahmed"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Gmail Address (For Multi-Device Access) *</label>
                    <input
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="e.g. ali@gmail.com"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Notes will be permanently linked to this Gmail across all devices.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">WhatsApp Phone *</label>
                      <input
                        type="tel"
                        required
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        placeholder="0300 1234567"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">EasyPaisa TRX ID *</label>
                      <input
                        type="text"
                        required
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        placeholder="e.g. 8291048291"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Order for Verification</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
