import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Key,
  CheckCircle,
  Copy,
  Info,
  Lock,
} from 'lucide-react';

interface FamilyPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export const FamilyPortalModal: React.FC<FamilyPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadFamilyStatus();
    }
  }, [isOpen]);

  const loadFamilyStatus = async () => {
    try {
      const res = await fetch('/api/family/status');
      const data = await res.json();
      if (data.links) setLinks(data.links);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleGenerateCode = async () => {
    try {
      const res = await fetch('/api/family/generate-invite', { method: 'POST' });
      const data = await res.json();
      if (data.code) {
        setInviteCode(data.code);
        loadFamilyStatus();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-800" />
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Family Assistance Portal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Independence Guarantee Note (Section 12 requirement) */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-2 text-xs text-amber-950">
          <div className="font-bold flex items-center gap-1.5 text-amber-900 text-sm">
            <Lock className="w-4 h-4 text-emerald-700" />
            <span>Independence & Dignity Guarantee</span>
          </div>
          <p className="leading-relaxed">
            Your adult child or trusted person can assist you with audio/video settings, high contrast, and onboarding. <strong>They CANNOT read your private conversations, listen to calls, or see your friends list without your express consent.</strong>
          </p>
        </div>

        {/* Generate / Show Invite Code */}
        <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
          <div className="text-xs font-semibold text-stone-600">
            Share this temporary 6-character code with your family member:
          </div>

          {inviteCode ? (
            <div className="flex items-center justify-center gap-3">
              <div className="px-5 py-2.5 rounded-2xl bg-white border-2 border-amber-600 font-mono text-2xl font-bold tracking-widest text-amber-950 shadow-xs">
                {inviteCode}
              </div>
              <button
                onClick={handleCopy}
                className="min-h-[48px] px-4 rounded-xl bg-amber-800 text-white text-xs font-semibold hover:bg-amber-900 transition-colors flex items-center gap-1.5"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateCode}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-xs flex items-center gap-2 mx-auto"
            >
              <Key className="w-4 h-4" />
              <span>Generate Family Connect Code</span>
            </button>
          )}

          <div className="text-[11px] text-stone-400">
            The code expires after 24 hours. You can disconnect linked assistants anytime.
          </div>
        </div>

        {/* Active Connected Family Members */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-stone-700 uppercase tracking-wider">
            Connected Supporters ({links.length})
          </div>
          {links.length === 0 ? (
            <div className="text-xs text-stone-400 p-3 bg-stone-50 rounded-xl text-center">
              No family members connected yet.
            </div>
          ) : (
            links.map((link) => (
              <div
                key={link.id}
                className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-stone-900 text-sm">
                    {link.helperName}
                  </div>
                  <div className="text-stone-500">
                    Relationship: {link.relationship} · Code: {link.code}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                  {link.status === 'active' ? 'Assisting' : 'Pending'}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
