import React, { useState, useEffect } from 'react';
import {
  Users,
  Coffee,
  Music,
  Sprout,
  Compass,
  Utensils,
  BookOpen,
  Calendar,
  Volume2,
  Mic,
  MicOff,
  LogOut,
  Sparkles,
  Check,
  Shield,
  Clock,
  Radio,
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS, speakText } from '../i18n';

interface SaathCircleViewProps {
  currentUser: any;
  currentLanguage: SupportedLanguage;
}

export const SaathCircleView: React.FC<SaathCircleViewProps> = ({
  currentUser,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.Hindi;
  const [circles, setCircles] = useState<any[]>([]);
  const [activeStageCircle, setActiveStageCircle] = useState<any | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<string>('Rameshwar Sharma');

  useEffect(() => {
    loadCircles();
  }, []);

  const loadCircles = async () => {
    try {
      const res = await fetch('/api/circles');
      const data = await res.json();
      if (data.circles) {
        setCircles(data.circles);
        // If Chai Pe Charcha is live, pick as default active preview
        const live = data.circles.find((c: any) => c.isLiveNow);
        if (live && !activeStageCircle) {
          // keep available
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleJoinCircle = async (circle: any) => {
    try {
      await fetch(`/api/circles/${circle.id}/join`, { method: 'POST' });
      setActiveStageCircle(circle);
      loadCircles();
      speakText(`${circle.title} में आपका स्वागत है।`, currentLanguage);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeaveCircle = async () => {
    if (!activeStageCircle) return;
    try {
      await fetch(`/api/circles/${activeStageCircle.id}/leave`, { method: 'POST' });
      setActiveStageCircle(null);
      loadCircles();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FFF9F2] to-[#F7EDE0] border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Saath Circle · Moderated Community Gatherings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Chai Pe Charcha & Community Circles
          </h1>
          <p className="text-sm text-stone-600 max-w-xl mt-1">
            Join small, respectful 4-to-8 person groups to discuss evergreen melodies, nostalgic memories, gardening wisdom, and regional recipes.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Trained Senior Hosts</span>
          </div>
        </div>
      </div>

      {/* LIVE AUDITORIUM / STAGE VIEW (When User Joined a Circle) */}
      {activeStageCircle && (
        <div className="p-6 rounded-3xl bg-stone-900 text-white shadow-xl border border-stone-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs uppercase font-bold tracking-wider text-red-400">
                  Live Stage Active
                </span>
                <span className="text-xs text-stone-400">
                  · {activeStageCircle.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                {activeStageCircle.title}
              </h2>
            </div>

            <button
              onClick={handleLeaveCircle}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors border border-stone-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Circle</span>
            </button>
          </div>

          {/* Circle Description & Host Info */}
          <div className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
            <span className="font-semibold text-amber-400">Host: {activeStageCircle.hostName}</span>
            <span className="mx-2 text-stone-600">|</span>
            <span>Language: {activeStageCircle.language}</span>
            <div className="mt-1 text-stone-400 italic">
              "{activeStageCircle.description}"
            </div>
          </div>

          {/* Live Participant Avatars on Stage */}
          <div className="space-y-2">
            <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
              Participants in Circle ({activeStageCircle.participantCount} / {activeStageCircle.maxParticipants})
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Host Participant */}
              <div className="p-3 rounded-2xl bg-stone-800/80 border-2 border-amber-500/80 flex flex-col items-center text-center space-y-2 relative">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-amber-700 flex items-center justify-center font-bold text-lg text-white">
                    RS
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900 flex items-center justify-center text-[9px]">
                    🎤
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Rameshwar Sharma</div>
                  <div className="text-[10px] text-amber-400 font-medium">Host (Jaipur)</div>
                </div>
                <div className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full animate-pulse">
                  Speaking...
                </div>
              </div>

              {/* Participant 2 */}
              <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700 flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-rose-700 flex items-center justify-center font-bold text-lg text-white">
                  SK
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Sunita Kulkarni</div>
                  <div className="text-[10px] text-stone-400">Pune</div>
                </div>
                <div className="text-[10px] text-stone-400">Listening</div>
              </div>

              {/* Participant 3 */}
              <div className="p-3 rounded-2xl bg-stone-800/80 border border-stone-700 flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-blue-700 flex items-center justify-center font-bold text-lg text-white">
                  HS
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Harpreet Singh</div>
                  <div className="text-[10px] text-stone-400">Amritsar</div>
                </div>
                <div className="text-[10px] text-stone-400">Listening</div>
              </div>

              {/* You (Current User) */}
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-600/50 flex flex-col items-center text-center space-y-2">
                <div className="relative">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-stone-900 ${
                      isMicMuted ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">You ({currentUser.name})</div>
                  <div className="text-[10px] text-amber-300">Audience Member</div>
                </div>
                <div className="text-[10px] text-stone-300">
                  {isMicMuted ? 'Mic Muted' : 'Mic Live'}
                </div>
              </div>
            </div>
          </div>

          {/* Stage Controls */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setIsMicMuted(!isMicMuted)}
              className={`min-h-[48px] px-5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors ${
                isMicMuted
                  ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse'
              }`}
            >
              {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMicMuted ? 'Unmute to Speak' : 'Mute Microphone'}</span>
            </button>

            <button
              onClick={() => speakText(`You are listening to Chai Pe Charcha hosted by Rameshwar Sharma.`, currentLanguage)}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Status</span>
            </button>
          </div>
        </div>
      )}

      {/* CIRCLES CATALOG */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-stone-900">
            Available Circles & Activities
          </h2>
          <span className="text-xs text-stone-500">Tap Join with one tap</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {circles.map((circle) => {
            const isCurrentActive = activeStageCircle?.id === circle.id;

            return (
              <div
                key={circle.id}
                className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900">
                        {circle.category.includes('Music') ? (
                          <Music className="w-5 h-5" />
                        ) : circle.category.includes('Gardening') ? (
                          <Sprout className="w-5 h-5" />
                        ) : circle.category.includes('Spirituality') ? (
                          <BookOpen className="w-5 h-5" />
                        ) : (
                          <Coffee className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
                          {circle.category}
                        </span>
                        <h3 className="font-serif font-bold text-lg text-stone-900 leading-tight">
                          {circle.title}
                        </h3>
                      </div>
                    </div>

                    {circle.isLiveNow && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase animate-pulse border border-red-300">
                        Live Now
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {circle.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 pt-1">
                    <div className="flex items-center gap-1 text-amber-900 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{circle.scheduledTime}</span>
                    </div>
                    <span>·</span>
                    <span>Lang: {circle.language}</span>
                    <span>·</span>
                    <span>{circle.participantCount} / {circle.maxParticipants} joined</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-xs text-stone-400">
                    Host: <span className="text-stone-700 font-medium">{circle.hostName}</span>
                  </div>

                  {isCurrentActive ? (
                    <button
                      onClick={handleLeaveCircle}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold border border-red-200 transition-colors"
                    >
                      Leave Stage
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinCircle(circle)}
                      className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                        circle.isLiveNow
                          ? 'bg-amber-800 hover:bg-amber-900 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>{circle.isLiveNow ? 'Join Live Circle' : 'Join Schedule'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
