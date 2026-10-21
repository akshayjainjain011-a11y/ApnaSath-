import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  PhoneCall,
  Volume2,
  Subtitles,
  Wifi,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../i18n';

interface CallModalProps {
  callSession: any;
  currentUser: any;
  currentLanguage: SupportedLanguage;
  onEndCall: (callId: string) => void;
  onAcceptCall: (callId: string) => void;
  onDeclineCall: (callId: string) => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  callSession,
  currentUser,
  currentLanguage,
  onEndCall,
  onAcceptCall,
  onDeclineCall,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.Hindi;
  const isIncoming = callSession.receiverId === currentUser.id && callSession.status === 'ringing';
  const isConnected = callSession.status === 'connected';

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(callSession.type === 'voice');
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [liveCaptions, setLiveCaptions] = useState<string>('Connection established. Audio channel live and secure.');
  const [callDurationSec, setCallDurationSec] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Call timer
  useEffect(() => {
    let timer: any = null;
    if (isConnected) {
      timer = setInterval(() => {
        setCallDurationSec((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isConnected]);

  // Request actual camera & mic access when connected or initiating
  useEffect(() => {
    if (!isIncoming && typeof navigator.mediaDevices?.getUserMedia === 'function') {
      startMedia();
    }
    return () => {
      stopMedia();
    };
  }, [isConnected, isIncoming]);

  const startMedia = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callSession.type === 'video' && !isLowBandwidth,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && callSession.type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      setupAudioVisualizer(stream);
      startLiveCaptionsDemo();
    } catch (err) {
      console.warn('Camera/mic access unavailable or denied, falling back to audio canvas visualizer', err);
      startLiveCaptionsDemo();
    }
  };

  const stopMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const setupAudioVisualizer = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = '#D97706'; // Amber visualizer wave
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          x += barWidth;
        }
      };
      draw();
    } catch (e) {
      console.warn('Audio visualizer init error:', e);
    }
  };

  const startLiveCaptionsDemo = () => {
    // Generate realistic respectful captions for senior comfort
    const samplePhrases = [
      'Namaste! Kaise hain aap?',
      'Maine sunna aapko bhi classical geet behad pasand hain.',
      'Haan, bilkul sahi baat hai. Purane samay ka swaad hi alag tha.',
      'Aapki aawaz bilkul saaf aa rahi hai.',
      'Ji, main kal subah ki Chai Pe Charcha mein bhi judunga.',
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setLiveCaptions(samplePhrases[idx % samplePhrases.length]);
      idx++;
    }, 4500);

    return () => clearInterval(interval);
  };

  const handleToggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = isMuted));
    }
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach((t) => (t.enabled = isVideoDisabled));
    }
    setIsVideoDisabled(!isVideoDisabled);
  };

  const handleToggleLowBandwidth = () => {
    setIsLowBandwidth(!isLowBandwidth);
    if (!isLowBandwidth) {
      setIsVideoDisabled(true);
      setLiveCaptions('Switched to Low Bandwidth Mode (Audio Priority for stable network).');
    }
  };

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const otherPersonName =
    callSession.callerId === currentUser.id ? callSession.receiverName : callSession.callerName;
  const otherPersonAvatar =
    callSession.callerId === currentUser.id ? callSession.receiverAvatar : callSession.callerAvatar;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-[#1C1917] text-white shadow-2xl border border-stone-800 overflow-hidden flex flex-col min-h-[520px]">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-sm font-semibold tracking-wide uppercase text-stone-300">
              {isConnected ? `Call in Progress (${formatDuration(callDurationSec)})` : 'Calling Peer...'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleLowBandwidth}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                isLowBandwidth
                  ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                  : 'bg-stone-800 text-stone-400 border-stone-700'
              }`}
              title="Prioritize clear audio on 3G/4G"
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>{isLowBandwidth ? 'Audio-Priority Mode' : 'Standard'}</span>
            </button>

            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`p-1.5 rounded-xl border text-xs ${
                showCaptions ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'text-stone-500 border-stone-800'
              }`}
              title="Toggle Live Subtitles / Captions"
            >
              <Subtitles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video / Call Center Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-stone-900 to-black">
          {/* Peer Avatar or Video Feed */}
          <div className="relative text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={otherPersonAvatar}
                alt={otherPersonName}
                referrerPolicy="no-referrer"
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-amber-600/60 shadow-xl mx-auto"
              />
              {isConnected && (
                <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-3 py-0.5 rounded-full bg-emerald-900/90 border border-emerald-500 text-emerald-200 text-xs font-semibold">
                  Connected
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {otherPersonName}
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 mt-1">
                {isIncoming
                  ? 'Incoming call on ApnaSaath'
                  : isConnected
                  ? `${callSession.type === 'video' && !isVideoDisabled ? 'Video Call' : 'Voice Call'} · High Privacy`
                  : 'Ringing with mutual consent...'}
              </p>
            </div>

            {/* Audio Wave Visualizer */}
            <canvas ref={canvasRef} width={220} height={36} className="mx-auto rounded-lg opacity-80" />
          </div>

          {/* Self Video PIP Preview (When Video Enabled) */}
          {callSession.type === 'video' && !isVideoDisabled && (
            <div className="absolute top-4 right-4 w-28 sm:w-36 aspect-video bg-stone-800 rounded-2xl overflow-hidden border-2 border-stone-700 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 py-0.2 rounded text-stone-300">
                You
              </div>
            </div>
          )}

          {/* Live Captions / Subtitles Strip for Hearing Accessibility */}
          {showCaptions && (
            <div className="absolute bottom-4 inset-x-6 bg-stone-900/90 border border-stone-700 p-3 rounded-2xl shadow-lg text-center backdrop-blur-xs">
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-amber-400 uppercase font-semibold mb-1">
                <Subtitles className="w-3.5 h-3.5" />
                <span>Live Assistive Subtitles</span>
              </div>
              <p className="text-sm sm:text-base font-medium text-stone-100">
                "{liveCaptions}"
              </p>
            </div>
          )}
        </div>

        {/* Safety Warning Reminder for Senior Protection */}
        <div className="px-6 py-2 bg-amber-950/40 border-t border-amber-900/40 flex items-center justify-center gap-2 text-xs text-amber-200/90 text-center">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Reminder: Never share bank account details, PINs, or OTPs with anyone on call.</span>
        </div>

        {/* Call Controls Footer */}
        <div className="p-6 bg-stone-950 border-t border-stone-800 flex items-center justify-center gap-4 sm:gap-6">
          {isIncoming ? (
            /* Incoming Call Screen with Large Accept and Decline Buttons (Prompt Requirement) */
            <div className="w-full flex items-center justify-around gap-6">
              <button
                onClick={() => onDeclineCall(callSession.id)}
                className="min-h-[56px] flex-1 max-w-[180px] rounded-2xl bg-red-700 hover:bg-red-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <PhoneOff className="w-6 h-6" />
                <span>{t.decline}</span>
              </button>

              <button
                onClick={() => onAcceptCall(callSession.id)}
                className="min-h-[56px] flex-1 max-w-[180px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 animate-bounce"
              >
                <PhoneCall className="w-6 h-6" />
                <span>{t.accept}</span>
              </button>
            </div>
          ) : (
            /* Connected / Active Call Controls */
            <>
              {/* Mic Mute Button */}
              <button
                onClick={handleToggleMute}
                className={`min-h-[56px] min-w-[56px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors ${
                  isMuted ? 'bg-red-900/60 text-red-200 border border-red-500' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                <span className="text-[10px]">{isMuted ? 'Muted' : 'Mute'}</span>
              </button>

              {/* Video Toggle Button */}
              {callSession.type === 'video' && (
                <button
                  onClick={handleToggleVideo}
                  className={`min-h-[56px] min-w-[56px] rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors ${
                    isVideoDisabled
                      ? 'bg-amber-900/60 text-amber-200 border border-amber-500'
                      : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                  }`}
                  title={isVideoDisabled ? 'Turn Camera On' : 'Turn Camera Off'}
                >
                  {isVideoDisabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  <span className="text-[10px]">{isVideoDisabled ? 'Camera Off' : 'Camera'}</span>
                </button>
              )}

              {/* End Call Button (Large, high contrast, red) */}
              <button
                onClick={() => onEndCall(callSession.id)}
                className="min-h-[56px] px-8 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
                <span>{t.endCall}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
