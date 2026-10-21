import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  UserPlus,
  Users,
  Heart,
  Home,
  Shield,
  PhoneCall,
  Volume2,
  CheckCheck,
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS, speakText } from './i18n';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { HomeDashboard } from './components/HomeDashboard';
import { AiSaathiView } from './components/AiSaathiView';
import { FriendsDiscoveryView } from './components/FriendsDiscoveryView';
import { SaathCircleView } from './components/SaathCircleView';
import { CallModal } from './components/CallModal';
import { OnboardingModal } from './components/OnboardingModal';
import { HelpEmergencyModal } from './components/HelpEmergencyModal';
import { FamilyPortalModal } from './components/FamilyPortalModal';
import { ReportModal } from './components/ReportModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ToastNotification, ToastItem } from './components/ToastNotification';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('Hindi');
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [liveCircle, setLiveCircle] = useState<any | null>(null);

  // Social Notification & Toast System
  const [notifications, setNotifications] = useState<ToastItem[]>([]);
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const seenNotificationIds = React.useRef<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<string>('home'); // 'home' | 'saathi' | 'friends' | 'circles' | 'landing'
  const [activeCallSession, setActiveCallSession] = useState<any | null>(null);

  // Modals
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showFamilyModal, setShowFamilyModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [reportingUser, setReportingUser] = useState<any | null>(null);

  // Initial data load & notification polling
  useEffect(() => {
    loadCurrentUser();
    loadAllUsers();
    loadConnections();
    loadCircles();
    loadNotifications();

    // Poll for notifications every 3.5 seconds
    const notifTimer = setInterval(loadNotifications, 3500);

    // Initial delightful social hello after 3 seconds
    const initialHello = setTimeout(() => {
      loadNotifications();
    }, 2500);

    return () => {
      clearInterval(notifTimer);
      clearTimeout(initialHello);
    };
  }, []);

  // Poll for incoming active calls every 3 seconds
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/calls/active');
        const data = await res.json();
        if (data.call) {
          // If call is ringing or connected and not currently open
          if (!activeCallSession || activeCallSession.id !== data.call.id) {
            setActiveCallSession(data.call);
          }
        } else if (activeCallSession && activeCallSession.status === 'ended') {
          setActiveCallSession(null);
        }
      } catch (e) {
        // silent
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [currentUser, activeCallSession]);

  const loadCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (data.user.preferredLanguage) {
          setCurrentLanguage(data.user.preferredLanguage as SupportedLanguage);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const loadAllUsers = async () => {
    try {
      const res = await fetch('/api/users/discover');
      const data = await res.json();
      if (data.users) {
        setAllUsers(data.users);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const loadConnections = async () => {
    try {
      const res = await fetch('/api/connections');
      const data = await res.json();
      if (data.friends) setFriendsList(data.friends);
    } catch (e) {
      console.warn(e);
    }
  };

  const loadCircles = async () => {
    try {
      const res = await fetch('/api/circles');
      const data = await res.json();
      if (data.circles) {
        const live = data.circles.find((c: any) => c.isLiveNow);
        setLiveCircle(live || data.circles[0]);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);

        // Check for new unread notifications that haven't been shown as toasts yet
        const newUnread = data.notifications.filter(
          (n: any) => !n.isRead && !seenNotificationIds.current.has(n.id)
        );

        if (newUnread.length > 0) {
          newUnread.forEach((n: any) => seenNotificationIds.current.add(n.id));
          setActiveToasts((prev) => {
            const combined = [...newUnread, ...prev];
            return combined.slice(0, 3); // Maximum 3 simultaneous non-intrusive toasts
          });
        }
      }
    } catch (e) {
      // silent
    }
  };

  const handleToastDismiss = async (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      // silent
    }
  };

  const handleToastAction = async (
    toast: ToastItem,
    actionType?: 'view_request' | 'reply' | 'join' | 'accept' | 'call'
  ) => {
    await handleToastDismiss(toast.id);

    if (actionType === 'accept') {
      if (toast.actionData?.requestId) {
        try {
          await fetch('/api/connections/respond', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId: toast.actionData.requestId, action: 'accept' }),
          });
          loadConnections();
          loadAllUsers();
        } catch (e) {
          // silent
        }
      }
      setActiveTab('friends');
      speakText(`${toast.senderName || 'Friend'} invitation accepted.`, currentLanguage);
    } else if (actionType === 'reply') {
      setActiveTab('saathi');
    } else if (actionType === 'join') {
      setActiveTab('circles');
    } else if (actionType === 'call') {
      setActiveTab('friends');
      if (toast.actionData?.fromUserId) {
        const friend = allUsers.find((u) => u.id === toast.actionData.fromUserId);
        if (friend) {
          handleStartCall(friend, 'voice');
        }
      }
    } else {
      if (toast.actionTab) {
        setActiveTab(toast.actionTab);
      } else {
        setActiveTab('friends');
      }
    }
  };

  const handleSimulateNotification = async (type: 'friend_request' | 'message' | 'circle_reminder') => {
    try {
      const res = await fetch('/api/notifications/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (data.notification) {
        seenNotificationIds.current.add(data.notification.id);
        setActiveToasts((prev) => [data.notification, ...prev.filter((t) => t.id !== data.notification.id)].slice(0, 3));
        setNotifications((prev) => [data.notification, ...prev]);
        speakText(`नई सूचना: ${data.notification.title}`, currentLanguage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await fetch('/api/notifications/clear', { method: 'POST' });
      setNotifications([]);
      setActiveToasts([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    // 1. Optimistically update local state so the UI reflects change instantly
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setActiveToasts([]);

    // 2. Persist update on the server
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    } catch (e) {
      console.error('Failed to mark all notifications as read on server:', e);
    }
  };

  const handleSelectNotification = async (item: ToastItem) => {
    await handleToastDismiss(item.id);
    if (item.actionTab) {
      setActiveTab(item.actionTab);
    } else {
      setActiveTab('friends');
    }
  };

  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        if (data.user.preferredLanguage) {
          setCurrentLanguage(data.user.preferredLanguage as SupportedLanguage);
        }
        loadConnections();
        loadAllUsers();
        loadNotifications();
        speakText(`खाता बदलकर ${data.user.name} किया गया।`, data.user.preferredLanguage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartCall = async (targetUser: any, type: 'voice' | 'video' = 'voice') => {
    try {
      const res = await fetch('/api/calls/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: targetUser.id, type }),
      });
      const data = await res.json();
      if (data.call) {
        setActiveCallSession(data.call);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptCall = async (callId: string) => {
    try {
      const res = await fetch(`/api/calls/${callId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });
      const data = await res.json();
      if (data.call) {
        setActiveCallSession(data.call);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineCall = async (callId: string) => {
    try {
      await fetch(`/api/calls/${callId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      });
      setActiveCallSession(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEndCall = async (callId: string) => {
    try {
      await fetch(`/api/calls/${callId}/end`, { method: 'POST' });
      setActiveCallSession(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReportUser = async (reportedUserId: string, category: string, notes: string) => {
    try {
      await fetch('/api/moderation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportedUserId, category, notes }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.Hindi;

  // Text size multiplier class
  const textSizeClass =
    textSize === 'xlarge'
      ? 'text-lg [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_p]:text-lg [&_button]:text-base'
      : textSize === 'large'
      ? 'text-base [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_p]:text-base [&_button]:text-sm'
      : '';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        highContrast
          ? 'bg-black text-amber-200'
          : 'bg-[#FDFBF7] text-stone-900'
      } ${textSizeClass}`}
    >
      {/* Top Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        textSize={textSize}
        onTextSizeChange={setTextSize}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        currentUser={currentUser}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        onOpenFamily={() => setShowFamilyModal(true)}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        notifications={notifications}
        onSimulateNotification={handleSimulateNotification}
        onClearNotifications={handleClearNotifications}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onSelectNotification={handleSelectNotification}
      />

      {/* Social Notification Header Bar */}
      {notifications.length > 0 && notifications.some((n) => !n.isRead) && (
        <div
          role="region"
          aria-label="Notification header"
          className={`px-4 py-2 flex items-center justify-between text-xs sm:text-sm border-b transition-colors ${
            highContrast
              ? 'bg-amber-950/90 text-amber-200 border-amber-400'
              : 'bg-amber-100/90 text-amber-950 border-amber-300/80 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2 max-w-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse shrink-0" />
            <span className="font-semibold truncate">
              {notifications.filter((n) => !n.isRead).length} unread notification{notifications.filter((n) => !n.isRead).length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleMarkAllNotificationsRead}
              aria-label="Mark all existing notifications as read"
              className="px-3 py-1 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer min-h-[36px]"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 pb-20 lg:pb-8">
        {activeTab === 'landing' ? (
          <LandingPage
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onGetStarted={() => setShowOnboarding(true)}
            onExploreDemo={() => setActiveTab('home')}
            onOpenHelp={() => setShowHelpModal(true)}
          />
        ) : activeTab === 'home' ? (
          <HomeDashboard
            currentUser={currentUser}
            currentLanguage={currentLanguage}
            onNavigate={setActiveTab}
            onStartCallWithFriend={(friend) => handleStartCall(friend, friend.callType || 'voice')}
            friendsList={friendsList}
            liveCircle={liveCircle}
          />
        ) : activeTab === 'saathi' ? (
          <AiSaathiView
            currentUser={currentUser}
            currentLanguage={currentLanguage}
          />
        ) : activeTab === 'friends' ? (
          <FriendsDiscoveryView
            currentUser={currentUser}
            currentLanguage={currentLanguage}
            onStartCall={handleStartCall}
            onOpenReportModal={(user) => setReportingUser(user)}
          />
        ) : activeTab === 'circles' ? (
          <SaathCircleView
            currentUser={currentUser}
            currentLanguage={currentLanguage}
          />
        ) : null}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Thumb Zone - 15% Cap) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-lg">
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
              activeTab === 'home' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* AI Saathi */}
          <button
            onClick={() => setActiveTab('saathi')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
              activeTab === 'saathi' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5" />
            </div>
            <span className="text-[10px] mt-0.5">Saathi</span>
          </button>

          {/* Apne Log */}
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
              activeTab === 'friends' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Apne Log</span>
          </button>

          {/* Saath Circle */}
          <button
            onClick={() => setActiveTab('circles')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
              activeTab === 'circles' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Circles</span>
          </button>

          {/* Landing / About */}
          <button
            onClick={() => setActiveTab(activeTab === 'landing' ? 'home' : 'landing')}
            className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
              activeTab === 'landing' ? 'text-amber-800 font-bold' : 'text-stone-500'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">About</span>
          </button>
        </div>
      </div>

      {/* ACTIVE CALL MODAL (When Voice or Video Call in progress or incoming) */}
      {activeCallSession && (
        <CallModal
          callSession={activeCallSession}
          currentUser={currentUser}
          currentLanguage={currentLanguage}
          onEndCall={handleEndCall}
          onAcceptCall={handleAcceptCall}
          onDeclineCall={handleDeclineCall}
        />
      )}

      {/* ONBOARDING MODAL */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={(newUser) => {
          setCurrentUser(newUser);
          setShowOnboarding(false);
          setActiveTab('home');
          loadConnections();
          loadAllUsers();
        }}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      {/* HELP & EMERGENCY MODAL */}
      <HelpEmergencyModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* FAMILY ASSISTANCE PORTAL MODAL */}
      <FamilyPortalModal
        isOpen={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        currentUser={currentUser}
      />

      {/* ADMIN & TRUST CONSOLE MODAL */}
      <AdminDashboard
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />

      {/* REPORT MEMBER MODAL */}
      <ReportModal
        targetUser={reportingUser}
        onClose={() => setReportingUser(null)}
        onSubmitReport={handleReportUser}
      />

      {/* NON-INTRUSIVE SOCIAL TOAST NOTIFICATIONS */}
      <ToastNotification
        toasts={activeToasts}
        onDismiss={handleToastDismiss}
        onAction={handleToastAction}
        currentLanguage={currentLanguage}
        highContrast={highContrast}
      />
    </div>
  );
}
