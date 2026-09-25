import React, { useState } from 'react';
import { NoteItem, Order } from '../types';
import { X, Copy, Check, Smartphone, Upload, Send, ArrowRight, CheckCircle2 } from 'lucide-react';
import { apiUploadImage, apiCreateOrder } from '../services/apiClient';

interface CheckoutModalProps {
  cartNotes: NoteItem[];
  onRemoveFromCart: (id: string) => void;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
  easyPaisaAccount?: string;
  whatsAppNumber?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cartNotes,
  onRemoveFromCart,
  onClose,
  onOrderCreated,
  easyPaisaAccount = '03415892099',
  whatsAppNumber = '0324 9059918',
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');

  const totalAmountPKR = cartNotes.reduce((sum, n) => sum + n.pricePKR, 0);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(easyPaisaAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage('Screenshot file size exceeds 8MB limit. Please upload a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        setScreenshotPreview(rawBase64);
        setErrorMessage('');

        // Attempt upload or keep base64 fallback
        try {
          const uploadData = await apiUploadImage(rawBase64, 'easypaisa_proof_' + Date.now());
          if (uploadData.success && uploadData.url) {
            setScreenshotPreview(uploadData.url);
          }
        } catch {
          // fallback to base64
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim() || !studentEmail.trim() || !studentPhone.trim() || !trxId.trim()) {
      setErrorMessage('Please fill in all student details and your EasyPaisa TRX ID.');
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
        studentEmail: studentEmail.trim(),
        studentPhone: studentPhone.trim(),
        noteIds: cartNotes.map((n) => n.id),
        noteTitles: cartNotes.map((n) => n.title),
        totalAmountPKR: totalAmountPKR,
        paymentMethod: 'easypaisa',
        easypaisaAccount: easyPaisaAccount,
        trxId: trxId.trim(),
        screenshotUrl: screenshotPreview || '',
      });

      if (!data.success || !data.order) {
        throw new Error(data.message || 'Failed to submit order. Please check inputs.');
      }

      const formattedWhatsAppPhone = whatsAppNumber.replace(/[^0-9]/g, '');
      const notesListText = cartNotes.map((n) => `• ${n.title}`).join('%0A');
      const waUrl = `https://api.whatsapp.com/send?phone=${formattedWhatsAppPhone}&text=${encodeURIComponent(
        `Assalam-o-Alaikum Kainat! I have placed Order #${data.order.id} on Kainat Notes Hub.%0A%0AStudent Name: ${data.order.studentName}%0AEmail: ${data.order.studentEmail}%0AEasyPaisa Trx ID: ${data.order.trxId}%0ATotal Amount: Rs. ${data.order.totalAmountPKR}%0A%0ACourses Ordered:%0A${notesListText}%0A%0APlease verify my payment and unlock my notes.`
      )}`;

      setSubmittedOrder(data.order);
      setWhatsappUrl(waUrl);
      onOrderCreated(data.order);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error submitting order';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>EasyPaisa Manual Payment Checkout</span>
            </div>
            <h2 className="text-lg font-bold text-white">Order Checkout & Verification</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {submittedOrder ? (
            /* Post-submission Success / WhatsApp Sender View */
            <div className="space-y-6 text-center py-4">
              <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Order Placed Successfully!</h3>
                <p className="text-xs text-zinc-400">
                  Your Order Reference ID is:{' '}
                  <strong className="text-emerald-400 font-mono text-sm px-2 py-0.5 bg-zinc-950 rounded border border-zinc-800">
                    {submittedOrder.id}
                  </strong>
                </p>
              </div>

              {/* Action Box to send SS to Kainat at 0324 9059918 */}
              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/80 text-left space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-zinc-300">Final Verification Step:</div>
                  <span className="text-[11px] text-amber-400 font-mono font-semibold">Action Required</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Send your EasyPaisa payment screenshot directly to Ma'am Kainat's official WhatsApp (
                  <strong className="text-zinc-200">{whatsAppNumber}</strong>). Once verified by Kainat on the website, your purchased notes will unlock exclusively for your account with an automated audio and visual alert!
                </p>

                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-1">
                  <div className="text-zinc-400">
                    EasyPaisa TRX ID: <strong className="text-zinc-200 font-mono">{submittedOrder.trxId}</strong>
                  </div>
                  <div className="text-zinc-400">
                    Total Paid: <strong className="text-emerald-400 font-mono">Rs. {submittedOrder.totalAmountPKR}</strong>
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Screenshot to WhatsApp ({whatsAppNumber})</span>
                </a>
              </div>

              <div className="text-xs text-zinc-500">
                You can keep this browser tab open; the reader will automatically refresh and chime once approved by Kainat.
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cart Summary */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 border-b border-zinc-800/80 pb-2">
                  <span>Selected Notes ({cartNotes.length})</span>
                  <span>Price</span>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {cartNotes.map((note) => (
                    <div key={note.id} className="flex items-center justify-between text-xs">
                      <div className="truncate max-w-[70%]">
                        <span className="text-zinc-200 font-medium">{note.title}</span>
                        <span className="text-zinc-500 text-[11px] block">{note.classLevel} · {note.subject}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-zinc-300">Rs. {note.pricePKR}</span>
                        <button
                          type="button"
                          onClick={() => onRemoveFromCart(note.id)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-800/80 pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">Total Payable:</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    Rs. {totalAmountPKR}
                  </span>
                </div>
              </div>

              {/* EasyPaisa Payment Account Instructions Card */}
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                    Step 1: Transfer via EasyPaisa
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">Manual Verification</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-zinc-900/90 border border-zinc-800">
                  <div>
                    <div className="text-[11px] text-zinc-400">EasyPaisa Account Number</div>
                    <div className="text-lg font-extrabold text-white font-mono tracking-wider">
                      {easyPaisaAccount}
                    </div>
                    <div className="text-[11px] text-zinc-400">Title: Verified Account / Kainat</div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-emerald-400 border border-zinc-700 transition-colors shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-zinc-400 space-y-1">
                  <div>1. Send <strong className="text-emerald-400">Rs. {totalAmountPKR}</strong> to EasyPaisa <strong>{easyPaisaAccount}</strong>.</div>
                  <div>2. Save payment screenshot and copy the 10-digit TRX ID.</div>
                </div>
              </div>

              {/* Step 2: Form Inputs */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                  Step 2: Enter Student Verification Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Ali Ahmed"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400">Email Address (For Single-Student License) *</label>
                    <input
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="student@gmail.com"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400">Student WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="e.g. 0324 1234567"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-400">EasyPaisa Transaction ID (TRX ID) *</label>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="e.g. 9845102931"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                    <span>Payment Screenshot (Optional here, can also send directly on WhatsApp)</span>
                    <span className="text-[11px] text-zinc-500">Max 5MB</span>
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/60 rounded-xl p-4 cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {screenshotPreview ? (
                      <div className="space-y-2 text-center">
                        <img
                          src={screenshotPreview}
                          alt="Screenshot preview"
                          className="h-28 mx-auto rounded border border-zinc-700 object-contain"
                        />
                        <span className="text-[11px] text-emerald-400 font-semibold block">
                          Screenshot Attached ✓ (Click to change)
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                        <span className="text-xs text-zinc-300 block">Click to upload EasyPaisa screenshot</span>
                        <span className="text-[11px] text-zinc-500 block">PNG, JPG or JPEG</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-900 text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.99]"
              >
                {loading ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>Place Order & Connect to Kainat ({whatsAppNumber})</span>
                    <ArrowRight className="w-4 h-4" />
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
