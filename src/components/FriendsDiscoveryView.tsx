import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  PhoneCall,
  Video,
  ShieldCheck,
  Slash,
  Flag,
  Heart,
  MessageCircle,
  Sparkles,
  MapPin,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS, speakText } from '../i18n';

interface FriendsDiscoveryViewProps {
  currentUser: any;
  currentLanguage: SupportedLanguage;
  onStartCall: (targetUser: any, type: 'voice' | 'video') => void;
  onOpenReportModal: (targetUser: any) => void;
}

export const FriendsDiscoveryView: React.FC<FriendsDiscoveryViewProps> = ({
  currentUser,
  currentLanguage,
  onStartCall,
  onOpenReportModal,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.Hindi;
  const [candidates, setCandidates] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [pendingSent, setPendingSent] = useState<any[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'discover' | 'my_friends' | 'requests'>('discover');
  const [inviteModalUser, setInviteModalUser] = useState<any | null>(null);
  const [introMsg, setIntroMsg] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  useEffect(() => {
    loadDiscovery();
    loadConnections();
  }, [currentUser]);

  const loadDiscovery = async () => {
    try {
      const res = await fetch('/api/users/discover');
      const data = await res.json();
      if (data.users) setCandidates(data.users);
    } catch (e) {
      console.warn('Failed to load candidates', e);
    }
  };

  const loadConnections = async () => {
    try {
      const res = await fetch('/api/connections');
      const data = await res.json();
      if (data.friends) setFriends(data.friends);
      if (data.pendingReceived) setPendingReceived(data.pendingReceived);
      if (data.pendingSent) setPendingSent(data.pendingSent);
    } catch (e) {
      console.warn('Failed to load connections', e);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteModalUser) return;
    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toUserId: inviteModalUser.id,
          introductionMessage:
            introMsg ||
            `Namaste ${inviteModalUser.name}! I noticed we both share interests in ${inviteModalUser.interests.slice(0, 2).join(' & ')}. Would be lovely to connect!`,
        }),
      });
      const data = await res.json();
      setFeedbackNotice(data.message || 'Invitation sent with warm greetings.');
      setInviteModalUser(null);
      setIntroMsg('');
      loadDiscovery();
      loadConnections();
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRespond = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      await fetch('/api/connections/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      loadDiscovery();
      loadConnections();
      setFeedbackNotice(action === 'accept' ? 'Friend connection accepted! You can now call each other.' : 'Invitation declined politely.');
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBlockUser = async (userToBlock: any) => {
    if (confirm(`Do you wish to block ${userToBlock.name}? They will not be able to contact you.`)) {
      try {
        await fetch('/api/connections/block', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUserId: userToBlock.id }),
        });
        loadDiscovery();
        loadConnections();
        setFeedbackNotice(`${userToBlock.name} has been blocked.`);
        setTimeout(() => setFeedbackNotice(null), 4000);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#FFFBF5] to-[#F7EDE0] border border-amber-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-600" />
            <span>Apne Log · Trusted Senior Peer Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Discover Genuine Companions
          </h1>
          <p className="text-sm text-stone-600 max-w-xl mt-1">
            We suggest a curated handful of verified people aged 55+ who share your mother tongue, hobbies, and favorite eras across India.
          </p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/80 rounded-2xl border border-stone-200 shrink-0">
          <button
            onClick={() => setActiveSubTab('discover')}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeSubTab === 'discover'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Recommended ({candidates.length})
          </button>
          <button
            onClick={() => setActiveSubTab('my_friends')}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeSubTab === 'my_friends'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveSubTab('requests')}
            className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors relative ${
              activeSubTab === 'requests'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Requests ({pendingReceived.length})
            {pendingReceived.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5" />
            )}
          </button>
        </div>
      </div>

      {/* Temporary Feedback Notification */}
      {feedbackNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* DISCOVER TAB */}
      {activeSubTab === 'discover' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>Showing verified 55+ peers matching your preferences</span>
            <span>Safety: No cold calls permitted before mutual connection</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((person) => {
              const isConnected = person.connectionState === 'connected';
              const isSent = person.connectionState === 'pending_sent';
              const isReceived = person.connectionState === 'pending_received';

              return (
                <div
                  key={person.id}
                  className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* User Profile Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={person.avatar}
                          alt={person.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-2xl object-cover border border-amber-200 shadow-2xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-serif font-bold text-lg text-stone-900 leading-tight">
                              {person.name}
                            </h3>
                            <span className="text-xs font-semibold text-stone-500">
                              ({person.age})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-700" />
                            <span>{person.city}, {person.state}</span>
                          </div>
                          <div className="text-[11px] text-amber-900 font-medium">
                            Speaks: {person.knownLanguages.join(', ')}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {person.compatibilityScore}% Match
                        </span>
                        <div className="text-[10px] text-stone-400">
                          {person.stageOfLife}
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Explanation */}
                    <div className="px-3 py-2 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-medium flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{person.matchReason}</span>
                    </div>

                    {/* Bio */}
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
                      "{person.bio}"
                    </p>

                    {/* Interest Tags (Unboxed Text with Separators as per constitution) */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-500">
                      <span className="font-semibold text-stone-700">Interests:</span>
                      {person.interests.map((interest: string, idx: number) => (
                        <React.Fragment key={interest}>
                          <span>{interest}</span>
                          {idx < person.interests.length - 1 && <span aria-hidden="true">·</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <>
                          <button
                            onClick={() => onStartCall(person, 'voice')}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <PhoneCall className="w-4 h-4 text-emerald-700" />
                            <span>Voice Call</span>
                          </button>
                          <button
                            onClick={() => onStartCall(person, 'video')}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <Video className="w-4 h-4" />
                            <span>Video Call</span>
                          </button>
                        </>
                      ) : isSent ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 text-stone-500 text-xs font-medium">
                          <Clock className="w-4 h-4" />
                          <span>Invitation Pending</span>
                        </div>
                      ) : isReceived ? (
                        <button
                          onClick={() => setActiveSubTab('requests')}
                          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold"
                        >
                          Respond to Invitation
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setInviteModalUser(person);
                            setIntroMsg(`Namaste ${person.name}! I noticed we both enjoy ${person.interests[0]}. Would be a pleasure to connect.`);
                          }}
                          className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Send Namaste / Connect</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenReportModal(person)}
                        className="p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Report account"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBlockUser(person)}
                        className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Block user"
                      >
                        <Slash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MY FRIENDS TAB */}
      {activeSubTab === 'my_friends' && (
        <div className="space-y-4">
          {friends.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
              <Users className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-stone-900">
                You have not connected with any friends yet
              </h3>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                Explore the recommended seniors in the discovery tab to send a polite Namaste invitation and start talking.
              </p>
              <button
                onClick={() => setActiveSubTab('discover')}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-800 text-white font-semibold text-xs"
              >
                Find Compatible Peers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-amber-200"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-base text-stone-900">
                        {friend.name} ({friend.age})
                      </h4>
                      <p className="text-xs text-stone-500">
                        {friend.city} · Speaks {friend.preferredLanguage}
                      </p>
                      <span className="inline-block mt-1 text-[11px] text-emerald-700 font-semibold">
                        Connected Friend
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onStartCall(friend, 'voice')}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Start Voice Call"
                    >
                      <PhoneCall className="w-4 h-4 text-emerald-700" />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={() => onStartCall(friend, 'video')}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                      title="Start Video Call"
                    >
                      <Video className="w-4 h-4" />
                      <span>Video</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REQUESTS TAB */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Invitations Received ({pendingReceived.length})
            </h3>
            {pendingReceived.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-stone-200 text-sm text-stone-400 text-center">
                No pending invitations right now.
              </div>
            ) : (
              pendingReceived.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.avatar}
                      alt={req.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover"
                    />
                    <div>
                      <div className="font-bold text-stone-900 text-sm">
                        {req.name} ({req.age}, {req.city})
                      </div>
                      <p className="text-xs text-stone-600 italic">
                        "{req.request?.introductionMessage || 'Would like to connect on ApnaSaath'}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespond(req.request.id, 'accept')}
                      className="min-h-[44px] px-4 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold"
                    >
                      {t.accept}
                    </button>
                    <button
                      onClick={() => handleRespond(req.request.id, 'decline')}
                      className="min-h-[44px] px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium"
                    >
                      {t.decline}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Invitation Introduction Composer Modal */}
      {inviteModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Send Namaste to {inviteModalUser.name}
              </h3>
              <button
                onClick={() => setInviteModalUser(null)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-500">
              A respectful introduction message helps new friends feel comfortable. You can edit this message before sending.
            </p>

            <textarea
              rows={3}
              value={introMsg}
              onChange={(e) => setIntroMsg(e.target.value)}
              className="w-full p-3 rounded-2xl border-2 border-stone-200 focus:border-amber-700 focus:outline-hidden text-sm"
              placeholder="Write a warm note..."
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setInviteModalUser(null)}
                className="px-4 py-2 rounded-xl text-stone-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Invitation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
