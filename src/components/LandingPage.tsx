import React from 'react';
import {
  Sparkles,
  Users,
  ShieldCheck,
  PhoneCall,
  Video,
  Heart,
  ChevronRight,
  Globe,
  Radio,
  Lock,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  speakText,
} from '../i18n';

interface LandingPageProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onGetStarted: () => void;
  onExploreDemo: () => void;
  onOpenHelp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentLanguage,
  onLanguageChange,
  onGetStarted,
  onExploreDemo,
  onOpenHelp,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.Hindi;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-stone-200 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#F5ECE0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-950 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Har Din, Ek Apna Saath · 55+</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-[1.15]">
                Good conversations. New friendships. A little more joy in every day.
              </h1>

              <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-xl">
                Meet people who share your interests, talk to your AI Saathi, and discover meaningful connections across India — in the language you love.
              </p>

              {/* Language Selector Strip on Landing Page */}
              <div className="p-3.5 rounded-2xl bg-white/90 border border-stone-200 shadow-2xs space-y-2">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-700" />
                  <span>Choose Your Language / भाषा चुनें</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORTED_LANGUAGES.slice(0, 7).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => onLanguageChange(l.name)}
                      className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                        currentLanguage === l.name
                          ? 'bg-amber-800 text-white font-bold'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {l.nativeName}
                    </button>
                  ))}
                  <button
                    onClick={onGetStarted}
                    className="px-2 py-1 text-xs text-amber-800 font-bold hover:underline"
                  >
                    + More
                  </button>
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={onGetStarted}
                  className="min-h-[56px] px-8 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white text-base font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  <span>{t.getStarted}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onExploreDemo}
                  className="min-h-[56px] px-6 rounded-2xl bg-white hover:bg-amber-50/50 border-2 border-stone-300 hover:border-amber-700 text-stone-800 text-base font-bold transition-colors shadow-2xs flex items-center justify-center gap-2"
                >
                  <span>{t.seeHowItWorks}</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Age Assured 55+</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4 text-amber-700" />
                  <span>No Spam or Hidden Charges</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-100">
                <img
                  src="/src/assets/images/apnasaath_hero_elders_1792601941884.jpg"
                  alt="Dignified Indian elders enjoying conversation and tea"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover aspect-16/10"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    Pure Human Connection
                  </div>
                  <div className="text-xl font-serif font-bold mt-0.5">
                    "Every day has room for a good story and a warm cup of tea."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Simple Steps Section (Prompt Section 14) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Simple & Accessible
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Three Simple Steps to Begin
          </h2>
          <p className="text-sm text-stone-600">
            Designed with generous buttons, large fonts, and zero complicated jargon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg font-serif">
              1
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Choose Your Language
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Available in 13 Indian languages including Hindi, Tamil, Bengali, Marathi, and Gujarati. The whole app talks to you in your own voice.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-lg font-serif">
              2
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Create Your Profile
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Confirm your age (55+) with a privacy-preserving check. Pick your hobbies like gardening, retro songs, or morning walks.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold text-lg font-serif">
              3
            </div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Start Connecting
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Talk anytime to your patient AI Saathi, find compatible peers across India for one-tap voice calls, or join "Chai Pe Charcha".
            </p>
          </div>
        </div>
      </section>

      {/* The 3 Core Pillars: AI Saathi, Apne Log, Saath Circle */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pillar 1: AI Saathi */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#FFFDF9] to-[#F7EDE0] border border-amber-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-800 text-white flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              1. AI Saathi
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              A gentle, patient companion available at 6:00 AM or midnight. Share poetry, enjoy reminiscence, practice breathing exercises, or simply chat.
            </p>
            <div className="text-xs text-stone-500 italic border-l-2 border-amber-500 pl-3">
              "Never pretends to be human; never rushes you; listens patiently."
            </div>
          </div>

          {/* Pillar 2: Apne Log */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              2. Apne Log
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              A trusted community where you can discover compatible older adults across India. We match by shared languages and passions, never by superficial metrics.
            </p>
            <div className="text-xs text-stone-500 italic border-l-2 border-orange-500 pl-3">
              "Mutual consent required before calling. No cold calls from strangers."
            </div>
          </div>

          {/* Pillar 3: Saath Circle */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              3. Saath Circle
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Small interest-based group gatherings. Daily "Chai Pe Charcha", old cinema trivia, terrace gardening workshops, and spiritual reflection sessions.
            </p>
            <div className="text-xs text-stone-500 italic border-l-2 border-emerald-500 pl-3">
              "Trained senior hosts maintain a welcoming, respectful environment."
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Freemium Pricing (Section 13) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-8">
          <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Honest & Sustainable
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Transparent Membership Plans
          </h2>
          <p className="text-sm text-stone-600 max-w-lg mx-auto">
            Essential safety, blocking, reporting, and crisis guidance are completely free forever.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Free Tier */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Basic Membership
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                Free Forever
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Everything you need for daily connection
              </p>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Daily AI Saathi conversations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified peer discovery across India</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>One-tap voice & video calling</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Join Chai Pe Charcha community circles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Essential safety, blocking & reporting</span>
              </li>
            </ul>

            <button
              onClick={onExploreDemo}
              className="w-full min-h-[48px] rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs transition-colors"
            >
              Start Free
            </button>
          </div>

          {/* Plus Tier */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#FFFDF9] to-[#FAF2E6] border-2 border-amber-600/80 shadow-md space-y-4 relative">
            <span className="absolute -top-3 right-6 bg-amber-800 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
              Recommended
            </span>
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                ApnaSaath Plus
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-3xl font-serif font-bold text-stone-900">
                  ₹299
                </h3>
                <span className="text-xs text-stone-500">/ month</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Cancel anytime with one tap, no questions asked
              </p>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unlimited conversational depth with AI Saathi</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Priority host access to specialized workshops</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Enhanced family-assisted setup portal</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Audio priority mode for low internet connections</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero advertisements, full DPDP data control</span>
              </li>
            </ul>

            <button
              onClick={onGetStarted}
              className="w-full min-h-[48px] rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Get ApnaSaath Plus
            </button>
          </div>
        </div>
      </section>

      {/* Emergency & Trust Footer Bar */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif font-bold text-stone-900 text-base">
              Need assistance or guidance right now?
            </h4>
            <p className="text-xs text-stone-500">
              National Elderline: 14567 · National Mental Health KIRAN: 1800-599-0019
            </p>
          </div>
          <button
            onClick={onOpenHelp}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold whitespace-nowrap"
          >
            Senior Support Center
          </button>
        </div>
      </section>
    </div>
  );
};
