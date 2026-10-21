import React, { useState } from 'react';
import {
  Globe,
  PhoneCall,
  ShieldAlert,
  Users,
  Eye,
  Type,
  Volume2,
  ChevronDown,
  UserCheck,
  User as UserIcon,
  Bell,
  BellRing,
  UserPlus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS, speakText } from '../i18n';

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  textSize: 'normal' | 'large' | 'xlarge';
  onTextSizeChange: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  currentUser: any;
  onOpenHelp: () => void;
  onOpenAdmin: () => void;
  onOpenFamily: () => void;
  onSwitchUser: (userId: string) => void;
  allUsers: any[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  notifications: any[];
  onSimulateNotification: (type: 'friend_request' | 'message') => void;
  onClearNotifications: () => void;
  onSelectNotification: (item: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  textSize,
  onTextSizeChange,
  highContrast,
  onToggleHighContrast,
  currentUser,
  onOpenHelp,
  onOpenAdmin,
  onOpenFamily,
  onSwitchUser,
  allUsers,
  activeTab,
  onSelectTab,
  notifications,
  onSimulateNotification,
  onClearNotifications,
  onSelectNotification,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.Hindi;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors border-b ${
        highContrast
          ? 'bg-black text-amber-300 border-amber-400'
          : 'bg-[#FAF7F2] text-stone-900 border-stone-200 shadow-xs'
      }`}
    >
      {/* Accessibility Strip for Seniors */}
      <div className={`px-4 py-1.5 flex items-center justify-between text-xs border-b ${
        highContrast ? 'bg-stone-950 border-amber-400/40 text-amber-200' : 'bg-[#F2ECE1] border-stone-200 text-stone-700'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => speakText(`आप अपनासाथ पर हैं। ${t.tagline}`, currentLanguage)}
            className="flex items-center gap-1.5 font-medium hover:underline text-stone-800 dark:text-amber-200"
            title="Read page title aloud"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">{t.listenToThis}</span>
          </button>
          <span className="text-stone-300 dark:text-stone-700">|</span>
          <span className="truncate max-w-[200px] sm:max-w-md font-medium text-stone-700 dark:text-amber-200">
            {t.tagline}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Text Size Control */}
          <div className="flex items-center gap-1 font-medium">
            <Type className="w-3.5 h-3.5 text-stone-500" />
            <button
              onClick={() => onTextSizeChange('normal')}
              className={`px-1.5 py-0.5 rounded text-xs ${textSize === 'normal' ? 'font-bold underline text-amber-800' : 'text-stone-600'}`}
              aria-label="Normal font size"
            >
              A
            </button>
            <button
              onClick={() => onTextSizeChange('large')}
              className={`px-1.5 py-0.5 rounded text-sm ${textSize === 'large' ? 'font-bold underline text-amber-800' : 'text-stone-600'}`}
              aria-label="Large font size"
            >
              A+
            </button>
            <button
              onClick={() => onTextSizeChange('xlarge')}
              className={`px-1.5 py-0.5 rounded text-base ${textSize === 'xlarge' ? 'font-bold underline text-amber-800' : 'text-stone-600'}`}
              aria-label="Extra large font size"
            >
              A++
            </button>
          </div>

          <span className="text-stone-300">|</span>

          {/* High Contrast Toggle */}
          <button
            onClick={onToggleHighContrast}
            className="flex items-center gap-1 hover:text-amber-700 font-medium"
            title="Toggle high contrast mode"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t.highContrast}</span>
          </button>

          <span className="text-stone-300">|</span>

          {/* Emergency Helpline Hotline */}
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1 text-red-700 font-semibold hover:underline"
          >
            <PhoneCall className="w-3 h-3" />
            <span>14567</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center font-serif text-xl font-bold shadow-xs">
              अ
            </div>
            <div>
              <div className="font-serif text-2xl font-bold tracking-tight text-amber-950 dark:text-amber-300 leading-none">
                {t.appName}
              </div>
              <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 mt-0.5">
                ApnaSaath 55+
              </div>
            </div>
          </button>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-base font-medium">
          <button
            onClick={() => onSelectTab('home')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'home'
                ? 'text-amber-800 font-bold border-b-2 border-amber-800'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab('saathi')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'saathi'
                ? 'text-amber-800 font-bold border-b-2 border-amber-800'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            AI Saathi
          </button>
          <button
            onClick={() => onSelectTab('friends')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'friends'
                ? 'text-amber-800 font-bold border-b-2 border-amber-800'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Apne Log
          </button>
          <button
            onClick={() => onSelectTab('circles')}
            className={`transition-colors whitespace-nowrap py-1 ${
              activeTab === 'circles'
                ? 'text-amber-800 font-bold border-b-2 border-amber-800'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Saath Circle
          </button>
          <button
            onClick={onOpenFamily}
            className="text-stone-600 hover:text-stone-900 transition-colors whitespace-nowrap py-1"
          >
            Family Assist
          </button>
          <button
            onClick={onOpenAdmin}
            className="text-stone-600 hover:text-stone-900 transition-colors whitespace-nowrap py-1"
          >
            Trust & Safety
          </button>
        </nav>

        {/* Right Action Zone */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="min-h-[44px] px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 flex items-center gap-1.5 text-sm font-medium hover:border-amber-600 transition-colors shadow-2xs"
            >
              <Globe className="w-4 h-4 text-amber-700" />
              <span>{SUPPORTED_LANGUAGES.find((l) => l.name === currentLanguage)?.nativeName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-2xl bg-white dark:bg-stone-900 shadow-xl border border-stone-200 dark:border-stone-700 p-2 z-50">
                <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Select Language / भाषा चुनें
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.name);
                      setLangDropdownOpen(false);
                      speakText(`भाषा बदलकर ${lang.nativeName} की गई।`, lang.name);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                      currentLanguage === lang.name
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 font-bold'
                        : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-xs text-stone-400">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Social Notification Bell & Tray */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 flex items-center justify-center hover:border-amber-600 transition-colors shadow-2xs relative"
              title="Social Notifications / मित्र सूचनाएं"
              aria-label="Social Notifications"
            >
              {unreadCount > 0 ? (
                <BellRing className="w-5 h-5 text-amber-800 animate-wiggle" />
              ) : (
                <Bell className="w-5 h-5 text-stone-600" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-stone-900 shadow-xl border border-stone-200 dark:border-stone-700 p-3 z-50 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-800" />
                    <span>Social Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-900 font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={onClearNotifications}
                      className="text-[11px] text-stone-400 hover:text-stone-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Instant Social Interaction Simulator (for easy testing) */}
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                  <div className="font-semibold text-[11px] uppercase tracking-wider text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>Test Toast Notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSimulateNotification('friend_request');
                        setNotifDropdownOpen(false);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-[11px] font-bold transition-colors shadow-2xs flex items-center justify-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ Friend Request</span>
                    </button>
                    <button
                      onClick={() => {
                        onSimulateNotification('message');
                        setNotifDropdownOpen(false);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3 text-blue-700" />
                      <span>+ Message</span>
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-72 overflow-y-auto space-y-2 py-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-stone-400">
                      No recent notifications. All caught up!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onSelectNotification(n);
                          setNotifDropdownOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors space-y-1 ${
                          !n.isRead
                            ? 'bg-amber-50/50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700'
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100 dark:bg-stone-800 dark:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 dark:text-stone-100">
                            {n.senderName || 'ApnaSaath'}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-300 line-clamp-2">
                          {n.body}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Switcher / Profile Badge */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="min-h-[44px] flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-amber-600 transition-colors shadow-2xs"
                title="Switch Demo Member Profile"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-amber-600/30"
                />
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-stone-900 dark:text-stone-100 leading-tight truncate max-w-[100px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-stone-500">
                    Age {currentUser.age} · {currentUser.city}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-stone-900 shadow-xl border border-stone-200 dark:border-stone-700 p-2 z-50">
                  <div className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Demo Older Adults</span>
                    <span className="text-[10px] text-emerald-600">55+ Verified</span>
                  </div>
                  <div className="space-y-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors ${
                          currentUser.id === u.id
                            ? 'bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800'
                            : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                      >
                        <img
                          src={u.avatar}
                          alt={u.name}
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                        <div className="overflow-hidden">
                          <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {u.name} ({u.age})
                          </div>
                          <div className="text-stone-500 text-[11px] truncate">
                            {u.city} · {u.preferredLanguage}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-stone-200 dark:border-stone-800 mt-2 pt-2">
                    <button
                      onClick={() => {
                        onOpenHelp();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-700" />
                      Senior Helpline & Safety Tips
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="min-h-[44px] min-w-[44px] px-3.5 py-2 rounded-xl bg-amber-800 text-white hover:bg-amber-900 text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>{t.help}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
