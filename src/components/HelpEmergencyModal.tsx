import React from 'react';
import {
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  Lock,
  BookOpen,
  LifeBuoy,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface HelpEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpEmergencyModal: React.FC<HelpEmergencyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-amber-800" />
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Senior Support & Helpline
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Emergency Hotlines Box */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Verified National Helplines (Toll-Free in India)
          </div>

          <div className="space-y-2.5">
            <a
              href="tel:14567"
              className="p-4 rounded-2xl bg-amber-50 border border-amber-300 hover:bg-amber-100/80 transition-colors flex items-center justify-between group block"
            >
              <div>
                <div className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-emerald-700" />
                  <span>National Elderline: 14567</span>
                </div>
                <div className="text-xs text-stone-600 mt-0.5">
                  Ministry of Social Justice & Empowerment helpline for older adults.
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-800 text-white shrink-0">
                Call 14567
              </span>
            </a>

            <a
              href="tel:18005990019"
              className="p-4 rounded-2xl bg-rose-50 border border-rose-300 hover:bg-rose-100/80 transition-colors flex items-center justify-between group block"
            >
              <div>
                <div className="font-bold text-sm text-rose-950 flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-rose-700" />
                  <span>KIRAN Mental Wellbeing: 1800-599-0019</span>
                </div>
                <div className="text-xs text-stone-600 mt-0.5">
                  24/7 National toll-free psychological support and counseling.
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-xl bg-rose-800 text-white shrink-0">
                Call Free
              </span>
            </a>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="tel:112"
                className="p-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-semibold flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-stone-600" />
                <span>Emergency: 112</span>
              </a>
              <a
                href="tel:1291"
                className="p-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-semibold flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-stone-600" />
                <span>Senior Police Cell: 1291</span>
              </a>
            </div>
          </div>
        </div>

        {/* Anti-Scam Safeguards (Section 11) */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-stone-700">
          <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Anti-Scam Golden Rules</span>
          </div>
          <ul className="space-y-1.5 list-disc pl-4 text-stone-600">
            <li><strong>Never share bank OTPs or PINs</strong> with anyone you meet on ApnaSaath or over phone.</li>
            <li>No ApnaSaath moderator will ever ask you to transfer funds or click suspicious links.</li>
            <li>If someone asks for money or creates emotional urgency, immediately tap <strong>Report</strong> or block them.</li>
          </ul>
        </div>

        {/* DPDP Act 2023 & 2025 Privacy Rights (Section 18) */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2 text-xs text-stone-700">
          <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-800" />
            <span>Your Privacy Rights (DPDP Act)</span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            You hold statutory rights to access your profile data, correct discrepancies, erase your saved AI memories, and withdraw consent anytime through your profile settings.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
