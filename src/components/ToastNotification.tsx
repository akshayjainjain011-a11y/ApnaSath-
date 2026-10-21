import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  MessageSquare,
  Heart,
  Volume2,
  X,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { SupportedLanguage, speakText } from '../i18n';

export interface ToastItem {
  id: string;
  type: 'friend_request' | 'message' | 'circle_reminder' | 'connection_accepted';
  title: string;
  body: string;
  senderName?: string;
  senderAvatar?: string;
  senderCity?: string;
  actionTab?: 'friends' | 'saathi' | 'circles';
  actionData?: any;
  createdAt: string;
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  onAction: (toast: ToastItem) => void;
  currentLanguage: SupportedLanguage;
  highContrast: boolean;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
  onAction,
  currentLanguage,
  highContrast,
}) => {
  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
          onAction={onAction}
          currentLanguage={currentLanguage}
          highContrast={highContrast}
        />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
  onAction: (toast: ToastItem) => void;
  currentLanguage: SupportedLanguage;
  highContrast: boolean;
}

const ToastCard: React.FC<ToastCardProps> = ({
  toast,
  onDismiss,
  onAction,
  currentLanguage,
  highContrast,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const durationMs = 8000; // 8 seconds: gentle, generous duration for older adults

  useEffect(() => {
    if (isPaused) return;

    const interval = 100;
    const step = (interval / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, toast.id, onDismiss]);

  const isFriendReq = toast.type === 'friend_request';
  const isMessage = toast.type === 'message';
  const isAccepted = toast.type === 'connection_accepted';

  const readToastAloud = () => {
    const textToSpeak = `${toast.title}. ${toast.body}`;
    speakText(textToSpeak, currentLanguage);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="alert"
      className={`pointer-events-auto rounded-3xl p-4 sm:p-4.5 shadow-xl transition-all transform animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden border ${
        highContrast
          ? 'bg-black text-amber-200 border-amber-400'
          : 'bg-[#FFFDF9] text-stone-900 border-amber-200/90 shadow-amber-950/10'
      }`}
    >
      {/* Top Banner & Icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Avatar or Icon Badge */}
          <div className="relative shrink-0">
            {toast.senderAvatar ? (
              <img
                src={toast.senderAvatar}
                alt={toast.senderName || 'Member'}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-300 shadow-2xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg font-serif">
                अ
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-white shadow-xs ${
                isFriendReq
                  ? 'bg-orange-600'
                  : isMessage
                  ? 'bg-blue-600'
                  : 'bg-emerald-600'
              }`}
            >
              {isFriendReq ? (
                <UserPlus className="w-3 h-3" />
              ) : isMessage ? (
                <MessageSquare className="w-3 h-3" />
              ) : (
                <Heart className="w-3 h-3" />
              )}
            </span>
          </div>

          {/* Content */}
          <div className="space-y-1 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                {isFriendReq
                  ? 'Friend Invitation'
                  : isMessage
                  ? 'New Message'
                  : 'Namaste Accepted'}
              </span>
              <span className="text-[10px] text-stone-400">· Just now</span>
            </div>

            <h4 className="font-serif font-bold text-sm sm:text-base leading-snug text-stone-900 dark:text-amber-100">
              {toast.title}
            </h4>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2">
              "{toast.body}"
            </p>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className="min-h-[40px] min-w-[40px] flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors shrink-0"
          title="Dismiss alert"
          aria-label="Dismiss alert"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Action Strip */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
        {/* Listen Aloud Button for Accessibility */}
        <button
          onClick={readToastAloud}
          className="min-h-[38px] px-2.5 rounded-xl text-xs font-semibold text-amber-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors flex items-center gap-1.5"
          title="Read alert aloud"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-700" />
          <span>Listen</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={() => onAction(toast)}
          className="min-h-[38px] px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 group"
        >
          <span>
            {isFriendReq
              ? 'View in Apne Log'
              : isMessage
              ? 'Open Chat'
              : 'Say Namaste'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Non-intrusive progress bar */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-stone-100 dark:bg-stone-800">
        <div
          className="h-full bg-amber-600 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
