import React, { useState } from 'react';
import { Flag, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

interface ReportModalProps {
  targetUser: any | null;
  onClose: () => void;
  onSubmitReport: (reportedUserId: string, category: string, notes: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetUser,
  onClose,
  onSubmitReport,
}) => {
  const [category, setCategory] = useState<string>('harassment');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!targetUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport(targetUser.id, category, notes);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2 text-red-700">
            <Flag className="w-5 h-5" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Report Member / रिपोर्ट करें
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-lg text-stone-900">
              Report Submitted for Priority Review
            </h4>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              Our Trust & Safety team has received your report. The user will be muted from your recommendations.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-xs text-stone-600">
              Reporting: <strong className="text-stone-900">{targetUser.name}</strong> ({targetUser.city})
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Reason / कारण
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[48px] px-3 rounded-xl border border-stone-300 text-xs text-stone-800 bg-white"
              >
                <option value="harassment">Disrespectful or Unkind Behavior</option>
                <option value="fraud_scam">Asked for Money, OTP, or Bank Details (Scam)</option>
                <option value="impersonation">Fake Profile or Impersonation</option>
                <option value="inappropriate">Inappropriate Video/Audio Content</option>
                <option value="other">Other Concern</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what occurred..."
                className="w-full p-3 rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-hidden focus:border-red-600"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50 text-[11px] text-amber-900 border border-amber-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>We never disclose the identity of the person who reported.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-xs"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
