import React, { useEffect, useState } from 'react';
import { OrderNotificationAlert } from '../types';
import { CheckCircle2, Sparkles, X, ArrowRight, Volume2 } from 'lucide-react';
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
            // It's a payment verification event!
            setActiveAlert(parsed);
            sound.playVerificationChime();
            onRefreshOrders();

            // Auto dismiss after 10 seconds
            setTimeout(() => {
              setActiveAlert((current) => (current?.id === parsed.id ? null : current));
            }, 10000);
          }
        } catch {
          // heartbeat or non-json
        }
      };

      eventSource.onerror = () => {
        // SSE will attempt auto-reconnect
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
                  Automated Payment Alert
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Order #{activeAlert.orderId} Confirmed!
              </h4>
            </div>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Payment has been verified for <strong className="text-white">{activeAlert.studentName}</strong>. 
          Your digital notes are now unlocked in the secure document reader!
        </p>

        <div className="pt-1 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            {new Date(activeAlert.verifiedAt).toLocaleTimeString()}
          </span>

          <button
            onClick={() => {
              onOpenLibrary();
              setActiveAlert(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors"
          >
            <span>Open in Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
