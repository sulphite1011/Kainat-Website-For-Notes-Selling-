import React, { useEffect, useState } from 'react';
import { OrderNotificationAlert } from '../types';
import { CheckCircle2, X, ArrowRight } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface RealtimeAlertBannerProps {
  onOpenLibrary: () => void;
  onRefreshOrders: () => void;
}

export const RealtimeAlertBanner: React.FC<RealtimeAlertBannerProps> = ({
  onOpenLibrary,
  onRefreshOrders,
}) => {
  const [activeAlert, setActiveAlert] = useState<OrderNotificationAlert | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.orderId) {
            setActiveAlert(parsed);
            sound.playVerificationChime();
            onRefreshOrders();

            setTimeout(() => {
              setActiveAlert((current) => (current?.id === parsed.id ? null : current));
            }, 10000);
          }
        } catch {
          // heartbeat
        }
      };

      eventSource.onerror = () => {
        // SSE reconnects automatically
      };
    } catch (e) {
      console.warn('SSE event stream error:', e);
    }

    return () => {
      eventSource?.close();
    };
  }, [onRefreshOrders]);

  if (!activeAlert) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl border border-emerald-500/50 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-md space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  Order Verified!
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Order #{activeAlert.orderId} Confirmed
              </h4>
            </div>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          {activeAlert.message}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-zinc-400">
            Amount: <strong className="text-emerald-400 font-mono">Rs. {activeAlert.totalAmountPKR}</strong>
          </span>

          <button
            onClick={() => {
              onOpenLibrary();
              setActiveAlert(null);
            }}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <span>Open Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
