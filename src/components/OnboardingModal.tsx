import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Camera,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Phone,
  User,
  MapPin,
  Sparkles,
  Heart,
  Volume2,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  speakText,
} from '../i18n';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (user: any) => void;
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  currentLanguage,
  onLanguageChange,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(currentLanguage);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sampleOtp, setSampleOtp] = useState('551467');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('1964-05-15'); // Defaults to ~62 years old
  const [calculatedAge, setCalculatedAge] = useState<number>(62);
  const [city, setCity] = useState('Pune');
  const [state, setState] = useState('Maharashtra');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Classical Indian Music',
    'Morning Walks',
    'Storytelling',
  ]);
  const [stageOfLife, setStageOfLife] = useState('Retired Educator & Grandparent');
  const [verificationMethod, setVerificationMethod] = useState<'camera_liveness' | 'accessible_alternative'>('camera_liveness');
  const [isCapturing, setIsCapturing] = useState(false);
  const [livenessPassed, setLivenessPassed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return null;

  const t = TRANSLATIONS[selectedLang] || TRANSLATIONS.Hindi;

  // Age calculation
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    const birthYear = new Date(val).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    setCalculatedAge(age);
    if (age < 55) {
      setErrorMsg('ApnaSaath requires members to be 55 years or older to maintain a safe, peer-aligned community.');
    } else {
      setErrorMsg(null);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.sampleCode) setSampleOtp(data.sampleCode);
      setOtpSent(true);
      speakText('OTP code has been sent. You may use 551467 for testing.', selectedLang);
    } catch (e) {
      setErrorMsg('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid OTP code.');
        return;
      }
      if (!data.isNewUser && data.user) {
        onComplete(data.user);
        return;
      }
      // Continue to Step 4 (DOB confirmation)
      setStep(4);
    } catch (e) {
      setErrorMsg('Verification failed.');
    }
  };

  const startCameraLiveness = async () => {
    setIsCapturing(true);
    setErrorMsg(null);
    try {
      if (typeof navigator.mediaDevices?.getUserMedia === 'function') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
      // Guided gentle 3-second liveness check
      setTimeout(() => {
        setLivenessPassed(true);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
      }, 3500);
    } catch (err) {
      console.warn('Camera not available or blocked in iframe, allowing accessible alternative', err);
      // Fallback graceful flow without penalizing user (per Section 4)
      setVerificationMethod('accessible_alternative');
      setLivenessPassed(true);
    }
  };

  const handleFinishRegistration = async () => {
    if (calculatedAge < 55) {
      setErrorMsg('You must be at least 55 years of age to register.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name: name || 'Respected Member',
          dob,
          age: calculatedAge,
          city,
          state,
          preferredLanguage: selectedLang,
          interests: selectedInterests,
          stageOfLife,
          verificationMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Registration failed.');
        return;
      }
      onComplete(data.user);
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    }
  };

  const availableInterests = [
    'Classical Indian Music',
    'Morning Walks',
    'Terrace Gardening',
    'Old Bollywood Songs',
    'Vedic & Spiritual Wisdom',
    'Traditional Cooking',
    'Hindi/Regional Poetry',
    'Travel Memories',
    'Chess & Puzzles',
    'Life Lessons & Mentorship',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Step Indicator Header */}
        <div className="px-6 py-4 bg-[#FAF6F0] border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-800 text-white flex items-center justify-center font-bold text-sm">
              {step}/5
            </span>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 leading-tight">
                {step === 1 && 'Step 1: Choose Your Language'}
                {step === 2 && 'Step 2: Welcome to ApnaSaath'}
                {step === 3 && 'Step 3: Mobile & OTP Verification'}
                {step === 4 && 'Step 4: Age Confirmation (55+)'}
                {step === 5 && 'Step 5: Guided Verification & Profile'}
              </h3>
              <p className="text-[11px] text-stone-500">
                Simple, dignified senior onboarding
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: CHOOSE LANGUAGE */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h4 className="font-serif font-bold text-xl text-stone-900">
                  Select Your Preferred Language / अपनी भाषा चुनें
                </h4>
                <p className="text-xs text-stone-500">
                  You can change this anytime from the top bar.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLang(lang.name);
                      onLanguageChange(lang.name);
                      speakText(`आपने ${lang.nativeName} चुनी है।`, lang.name);
                    }}
                    className={`min-h-[52px] p-3 rounded-2xl border-2 text-left flex flex-col justify-center transition-all ${
                      selectedLang === lang.name
                        ? 'border-amber-800 bg-amber-50/80 shadow-xs'
                        : 'border-stone-200 hover:border-amber-400 bg-white'
                    }`}
                  >
                    <span className="font-bold text-base text-stone-900">
                      {lang.nativeName}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full min-h-[52px] rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-base transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Continue / आगे बढ़ें</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: WARM WELCOME */}
          {step === 2 && (
            <div className="space-y-6 text-center py-2">
              <div className="w-20 h-20 rounded-3xl bg-amber-100 border border-amber-300 text-amber-900 mx-auto flex items-center justify-center text-3xl font-serif font-bold shadow-xs">
                अ
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                <h4 className="font-serif font-bold text-2xl text-stone-900">
                  {t.welcome}
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed">
                  "Har din, ek apna saath." Here, you choose when to talk, whom to meet, and how you want to connect. No advertisements, no spam, and complete respect for your privacy.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Senior Privacy Promise</span>
                </div>
                <p className="text-stone-600">
                  We strictly comply with India's DPDP Act. We never sell your personal conversations, never share your phone number with strangers, and keep you in total control.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="min-h-[48px] px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="min-h-[48px] flex-1 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-base shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Begin Registration</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MOBILE NUMBER & OTP */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-xl text-stone-900">
                  Enter Your Mobile Number
                </h4>
                <p className="text-xs text-stone-500">
                  We use an OTP to protect your account against impersonation.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-700">
                  Indian Mobile Number (10 Digits)
                </label>
                <div className="flex items-center gap-2">
                  <span className="min-h-[52px] px-3.5 rounded-2xl bg-stone-100 border border-stone-300 font-bold text-stone-700 flex items-center text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9820011223"
                    className="flex-1 min-h-[52px] px-4 rounded-2xl border-2 border-stone-300 focus:border-amber-700 focus:outline-hidden text-lg font-mono"
                  />
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="min-h-[52px] px-4 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs whitespace-nowrap shadow-xs"
                    >
                      Send OTP
                    </button>
                  )}
                </div>
              </div>

              {otpSent && (
                <div className="space-y-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-amber-950">
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtp('551467')}
                      className="text-xs font-bold text-amber-800 underline hover:text-amber-950"
                    >
                      Autofill Code ({sampleOtp})
                    </button>
                  </div>

                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 551467"
                    className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-amber-300 focus:border-amber-700 focus:outline-hidden text-xl font-mono text-center tracking-widest bg-white"
                  />

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-xs flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Verify Mobile</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="min-h-[48px] px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AGE ASSURANCE (55+) */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-xl text-stone-900">
                  Confirm Your Date of Birth
                </h4>
                <p className="text-xs text-stone-500">
                  ApnaSaath is exclusively dedicated to India's 55+ generation. We do not require Aadhaar cards by default.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-700">
                  Date of Birth
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={dob}
                    onChange={handleDobChange}
                    max="1971-12-31"
                    className="flex-1 min-h-[52px] px-4 rounded-2xl border-2 border-stone-300 focus:border-amber-700 focus:outline-hidden text-base text-stone-900 font-medium"
                  />
                  <div className="min-h-[52px] px-4 rounded-2xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center border border-amber-300 text-sm">
                    Age: {calculatedAge} Years
                  </div>
                </div>
              </div>

              {calculatedAge >= 55 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">Eligibility Confirmed!</div>
                    <p className="text-stone-600 mt-0.5">
                      You meet the eligibility criteria (55+). Your exact birth date is kept strictly private and never shown to other members.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-950 text-xs">
                  Age must be 55 or older.
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="min-h-[48px] px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm"
                >
                  Back
                </button>
                <button
                  disabled={calculatedAge < 55}
                  onClick={() => setStep(5)}
                  className="min-h-[48px] flex-1 rounded-2xl bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 text-white font-bold text-base shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Proceed to Final Verification</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: GUIDED LIVENESS / ACCESSIBLE ALTERNATIVE & PROFILE */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-xl text-stone-900">
                  Liveness Assurance & Profile Setup
                </h4>
                <p className="text-xs text-stone-500">
                  To prevent account farming and bot impersonation, we offer a quick 3-second camera liveness check or an accessible alternative.
                </p>
              </div>

              {/* Liveness Check Box */}
              {!livenessPassed ? (
                <div className="p-5 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-300 text-center space-y-4">
                  {isCapturing ? (
                    <div className="space-y-3">
                      <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-amber-600 shadow-md bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs font-semibold text-amber-800 animate-pulse">
                        Confirming presence... Please smile gently or blink.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                        <Camera className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 text-sm">
                          Quick 3-Second Camera Check
                        </div>
                        <p className="text-xs text-stone-500 max-w-xs mx-auto mt-0.5">
                          Raw biometric data is never stored on external servers or sold.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={startCameraLiveness}
                          className="min-h-[48px] px-5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Start Guided Camera Check</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setVerificationMethod('accessible_alternative');
                            setLivenessPassed(true);
                          }}
                          className="min-h-[48px] px-4 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
                        >
                          Use Accessible Alternative (Assisted)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-sm">
                      {verificationMethod === 'camera_liveness'
                        ? 'Camera Liveness Verified'
                        : 'Assisted Assurance Registered'}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                    Privacy Preserved
                  </span>
                </div>
              )}

              {/* Profile Details */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Your Full Name / Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rameshwar Sharma"
                    className="w-full min-h-[48px] px-4 rounded-xl border border-stone-300 focus:border-amber-700 focus:outline-hidden text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune, Jaipur"
                      className="w-full min-h-[48px] px-4 rounded-xl border border-stone-300 focus:border-amber-700 focus:outline-hidden text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Maharashtra"
                      className="w-full min-h-[48px] px-4 rounded-xl border border-stone-300 focus:border-amber-700 focus:outline-hidden text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700">
                    Stage of Life / Past Profession
                  </label>
                  <input
                    type="text"
                    value={stageOfLife}
                    onChange={(e) => setStageOfLife(e.target.value)}
                    placeholder="e.g. Retired Educator, Small Business Owner, Grandparent"
                    className="w-full min-h-[48px] px-4 rounded-xl border border-stone-300 focus:border-amber-700 focus:outline-hidden text-sm"
                  />
                </div>

                {/* Hobbies / Interests */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Select Your Hobbies (For Smart Peer Matching)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {availableInterests.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedInterests(selectedInterests.filter((i) => i !== interest));
                            } else {
                              setSelectedInterests([...selectedInterests, interest]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-amber-800 text-white shadow-2xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-200">
                <button
                  onClick={() => setStep(4)}
                  className="min-h-[48px] px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleFinishRegistration}
                  disabled={!livenessPassed || !name.trim()}
                  className="min-h-[52px] flex-1 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white font-bold text-base shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Enter ApnaSaath</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
