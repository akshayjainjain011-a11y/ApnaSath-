import React from 'react';
import {
  MessageSquare,
  UserPlus,
  Users,
  Heart,
  Calendar,
  Volume2,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Video,
  ArrowRight,
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS, speakText } from '../i18n';

interface HomeDashboardProps {
  currentUser: any;
  currentLanguage: SupportedLanguage;
  onNavigate: (tab: string) => void;
  onStartCallWithFriend: (friend: any) => void;
  friendsList: any[];
  liveCircle: any;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentUser,
  currentLanguage,
  onNavigate,
  onStartCallWithFriend,
  friendsList,
  liveCircle,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.Hindi;
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Mitra';

  const greetingSpeech = `नमस्ते ${firstName}जी, अपनासाथ में आपका स्वागत है। क्या आप आज किसी से बात करना चाहेंगे?`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Reassuring Greeting Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF9F2] to-[#F5ECE0] border border-amber-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-800 text-sm font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              <span>Har Din, Ek Apna Saath</span>
              <button
                onClick={() => speakText(greetingSpeech, currentLanguage)}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-amber-100/70 hover:bg-amber-200 text-amber-900 transition-colors ml-2"
                title="Read greeting aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t.listenToThis}</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 leading-tight">
              Namaste, {firstName}ji!
            </h1>
            <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-xl">
              Would you like to talk to someone today? Enjoy a peaceful conversation, share a story, or hum an old melody.
            </p>
          </div>

          <div className="shrink-0 flex items-center sm:flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Age Assured 55+</span>
            </div>
            <div className="text-xs text-stone-500 text-right sm:text-center">
              Active in {currentUser?.city || 'India'}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Large Primary Actions (Prompt Requirement) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
            Choose What You Would Like to Do
          </h2>
          <span className="text-xs text-stone-500">Tap any large card</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Action 1: Talk to My AI Saathi */}
          <button
            onClick={() => onNavigate('saathi')}
            className="group text-left p-6 rounded-3xl bg-amber-900 text-white hover:bg-amber-950 transition-all shadow-md hover:shadow-lg flex flex-col justify-between min-h-[160px] relative overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 w-36 h-36 opacity-20 pointer-events-none">
              <img
                src="/src/assets/images/apnasaath_ai_companion_1792601942145.jpg"
                alt="AI Saathi"
                className="w-full h-full object-cover rounded-tl-full"
              />
            </div>
            <div className="space-y-2 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-800/80 flex items-center justify-center text-amber-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif leading-tight">
                1. {t.talkToAi}
              </h3>
              <p className="text-sm text-amber-100/90 leading-normal max-w-xs">
                Patient, multilingual companion for stories, poetry, morning tea chat, or quiet reflection.
              </p>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 group-hover:translate-x-1 transition-transform">
              <span>Start Speaking</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Action 2: Talk to a New Friend */}
          <button
            onClick={() => onNavigate('friends')}
            className="group text-left p-6 rounded-3xl bg-white border-2 border-stone-200 hover:border-amber-700 hover:bg-amber-50/30 transition-all shadow-xs hover:shadow-md flex flex-col justify-between min-h-[160px]"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-800">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-tight">
                2. {t.talkToFriend}
              </h3>
              <p className="text-sm text-stone-600 leading-normal">
                Discover verified peers across India who share your language, hobbies, and favorite eras.
              </p>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 group-hover:translate-x-1 transition-transform">
              <span>Explore Apne Log</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Action 3: Join a Group Conversation (Saath Circle) */}
          <button
            onClick={() => onNavigate('circles')}
            className="group text-left p-6 rounded-3xl bg-white border-2 border-stone-200 hover:border-amber-700 hover:bg-amber-50/30 transition-all shadow-xs hover:shadow-md flex flex-col justify-between min-h-[160px]"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-tight">
                  3. {t.joinCircle}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase animate-pulse">
                  Live
                </span>
              </div>
              <p className="text-sm text-stone-600 leading-normal">
                Join "Chai Pe Charcha", old Bollywood song gatherings, gardening tips, or spiritual readings.
              </p>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 group-hover:translate-x-1 transition-transform">
              <span>Join Circle</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Action 4: My Friends */}
          <button
            onClick={() => onNavigate('friends')}
            className="group text-left p-6 rounded-3xl bg-white border-2 border-stone-200 hover:border-amber-700 hover:bg-amber-50/30 transition-all shadow-xs hover:shadow-md flex flex-col justify-between min-h-[160px]"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-800">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 leading-tight">
                4. {t.myFriends}
              </h3>
              <p className="text-sm text-stone-600 leading-normal">
                {friendsList.length > 0
                  ? `You have ${friendsList.length} connected friends ready for a one-tap voice or video call.`
                  : 'See your connected companions or pending conversation invitations.'}
              </p>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-800 group-hover:translate-x-1 transition-transform">
              <span>View Connections ({friendsList.length})</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Action 5: My Activities (Full Width) */}
        <button
          onClick={() => onNavigate('circles')}
          className="w-full text-left p-5 sm:p-6 rounded-3xl bg-[#FAF5ED] border border-amber-300 hover:border-amber-600 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
                5. {t.myActivities}
              </h3>
              <p className="text-sm text-stone-600">
                Upcoming "Chai Pe Charcha" at 4:30 PM & Sunday Balcony Gardening Meetup.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 shrink-0">
            <span>Explore Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      {/* Quick Call Row with Connected Friends (If Any) */}
      {friendsList.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Your Connected Friends Waiting to Talk
            </h3>
            <span className="text-xs text-stone-500">Mutual consent approved</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {friendsList.map((friend) => (
              <div
                key={friend.id}
                className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-amber-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">{friend.name}</h4>
                    <p className="text-xs text-stone-500">
                      {friend.city} · {friend.preferredLanguage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStartCallWithFriend({ ...friend, callType: 'voice' })}
                    className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Start Voice Call"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-700" />
                    <span className="hidden xs:inline">Voice</span>
                  </button>
                  <button
                    onClick={() => onStartCallWithFriend({ ...friend, callType: 'video' })}
                    className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                    title="Start Video Call"
                  >
                    <Video className="w-4 h-4" />
                    <span className="hidden xs:inline">Video</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety & Anti-Scam Reassurance Notice (Section 11) */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-1">
          <div className="font-semibold text-stone-900">
            {t.scamWarning}
          </div>
          <p className="text-stone-600">
            ApnaSaath will never ask for your bank password, debit card PIN, or money. You control when to talk, whom to meet, and you can end any call or report unwanted conduct at any time.
          </p>
        </div>
      </div>
    </div>
  );
};
