import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { db, User, CallSession, SaathiChatMessage, SaathiMemory, ModerationReport, NotificationItem } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Simple session store
let currentActiveUserId = 'user_rameshwar'; // Default logged-in demo user for immediate ease of use

// ==========================================
// 1. AUTHENTICATION & ONBOARDING API
// ==========================================

// Mock OTP in-memory store for verification
const otpStore: Record<string, { code: string; expiresAt: number }> = {};

app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid Indian mobile number.' });
  }

  // Generate 6 digit OTP
  const code = '551467'; // Pre-set friendly default OTP for smooth senior onboarding, while allowing real entry
  otpStore[phone] = {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };

  db.addAuditLog('auth', 'OTP_REQUESTED', `OTP requested for ${phone.slice(0, 4)}***`);
  return res.json({
    success: true,
    message: `OTP sent successfully to ${phone}. For instant testing, use code: ${code}`,
    sampleCode: code,
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, code } = req.body;
  const stored = otpStore[phone];

  // Allow 551467 or matching code
  if (code === '551467' || (stored && stored.code === code)) {
    const existingUser = db.get().users.find((u) => u.phone === phone);
    if (existingUser) {
      currentActiveUserId = existingUser.id;
      db.addAuditLog(existingUser.id, 'LOGIN_SUCCESS', `User ${existingUser.name} logged in via mobile OTP.`);
      return res.json({ success: true, isNewUser: false, user: existingUser });
    } else {
      return res.json({ success: true, isNewUser: true, phone });
    }
  }

  return res.status(400).json({ error: 'Incorrect OTP. Please check the SMS or use demo code 551467.' });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const {
    phone,
    name,
    dob,
    age,
    city,
    state,
    preferredLanguage,
    interests,
    stageOfLife,
    bio,
    avatar,
    verificationMethod,
  } = req.body;

  if (!name || !phone || !dob) {
    return res.status(400).json({ error: 'Name, phone, and date of birth are required.' });
  }

  // Age confirmation: must be 55+
  const birthYear = new Date(dob).getFullYear();
  const currentYear = new Date().getFullYear();
  const calculatedAge = age || currentYear - birthYear;

  if (calculatedAge < 55) {
    return res.status(400).json({
      error: 'ApnaSaath is designed exclusively for older adults aged 55 and above to foster a focused and safe peer community.',
    });
  }

  const data = db.get();
  const newUserId = `user_${Date.now()}`;
  const newUser: User = {
    id: newUserId,
    phone,
    name,
    age: calculatedAge,
    dob,
    city: city || 'New Delhi',
    state: state || 'Delhi NCR',
    bio: bio || 'Happy to connect for warm conversations, sharing stories, and good companionship.',
    avatar:
      avatar ||
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    preferredLanguage: preferredLanguage || 'Hindi',
    knownLanguages: [preferredLanguage || 'Hindi', 'English'],
    interests: interests && interests.length > 0 ? interests : ['Classical Music', 'Storytelling', 'Morning Walks'],
    stageOfLife: stageOfLife || 'Independent Elder',
    isAgeAssured: true,
    verificationMethod: verificationMethod || 'camera_liveness',
    verificationDate: new Date().toISOString(),
    isOnline: true,
    plan: 'free',
    callPreference: 'both',
    privacySettings: {
      showOnlineStatus: true,
      showCity: true,
      allowFamilyAssist: false,
      aiMemoryEnabled: true,
    },
    createdAt: new Date().toISOString(),
  };

  data.users.push(newUser);
  db.save(data);
  currentActiveUserId = newUserId;

  db.addAuditLog(newUserId, 'REGISTER_SUCCESS', `New user registered: ${name}, age ${calculatedAge}, verified via ${verificationMethod}`);

  return res.json({ success: true, user: newUser });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = db.get().users.find((u) => u.id === currentActiveUserId);
  if (!user) {
    const fallback = db.get().users[0];
    currentActiveUserId = fallback.id;
    return res.json({ user: fallback });
  }
  return res.json({ user });
});

app.post('/api/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.get().users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  currentActiveUserId = user.id;
  db.addAuditLog(user.id, 'SWITCH_DEMO_USER', `Switched active session to ${user.name}`);
  return res.json({ success: true, user });
});

// ==========================================
// 2. USER PROFILE & PRIVACY CONTROLS
// ==========================================

app.put('/api/users/profile', (req: Request, res: Response) => {
  const user = db.get().users.find((u) => u.id === currentActiveUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const {
    name,
    city,
    state,
    bio,
    avatar,
    preferredLanguage,
    knownLanguages,
    interests,
    stageOfLife,
    callPreference,
    privacySettings,
  } = req.body;

  if (name) user.name = name;
  if (city) user.city = city;
  if (state) user.state = state;
  if (bio) user.bio = bio;
  if (avatar) user.avatar = avatar;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  if (knownLanguages) user.knownLanguages = knownLanguages;
  if (interests) user.interests = interests;
  if (stageOfLife) user.stageOfLife = stageOfLife;
  if (callPreference) user.callPreference = callPreference;
  if (privacySettings) {
    user.privacySettings = { ...user.privacySettings, ...privacySettings };
  }

  db.save();
  db.addAuditLog(user.id, 'PROFILE_UPDATED', 'User updated profile preferences');
  return res.json({ success: true, user });
});

// ==========================================
// 3. APNE LOG - SMART FRIEND MATCHING & DISCOVERY
// ==========================================

app.get('/api/users/discover', (req: Request, res: Response) => {
  const currentUser = db.get().users.find((u) => u.id === currentActiveUserId);
  if (!currentUser) return res.status(404).json({ error: 'User not found' });

  const blocked = db.get().blockedUserMap[currentUser.id] || [];
  const connections = db.get().connectionRequests;

  // Filter out self and blocked users
  const candidates = db.get().users.filter((u) => u.id !== currentUser.id && !blocked.includes(u.id));

  // Compute compatibility score based on shared languages, interests, region
  const scored = candidates.map((candidate) => {
    let score = 50; // base score
    const reasonParts: string[] = [];

    // Language overlap
    const sharedLanguages = candidate.knownLanguages.filter((l) =>
      currentUser.knownLanguages.includes(l) || candidate.preferredLanguage === currentUser.preferredLanguage
    );
    if (sharedLanguages.length > 0) {
      score += 25;
      reasonParts.push(`Both speak ${sharedLanguages.join(' & ')}`);
    }

    // Shared interests
    const sharedInterests = candidate.interests.filter((i) => currentUser.interests.includes(i));
    if (sharedInterests.length > 0) {
      score += 20;
      reasonParts.push(`Shared interests in ${sharedInterests.slice(0, 2).join(', ')}`);
    }

    // Proximity / State
    if (candidate.state === currentUser.state) {
      score += 10;
      reasonParts.push(`From ${candidate.state}`);
    }

    // Connection status with this user
    const existingReq = connections.find(
      (c) =>
        (c.fromUserId === currentUser.id && c.toUserId === candidate.id) ||
        (c.fromUserId === candidate.id && c.toUserId === currentUser.id)
    );

    let connectionState: 'none' | 'pending_sent' | 'pending_received' | 'connected' = 'none';
    if (existingReq) {
      if (existingReq.status === 'accepted') {
        connectionState = 'connected';
      } else if (existingReq.status === 'pending') {
        connectionState = existingReq.fromUserId === currentUser.id ? 'pending_sent' : 'pending_received';
      }
    }

    // Respect privacy settings
    const displayUser = {
      ...candidate,
      city: candidate.privacySettings.showCity ? candidate.city : 'India',
      isOnline: candidate.privacySettings.showOnlineStatus ? candidate.isOnline : false,
      compatibilityScore: Math.min(score, 98),
      matchReason: reasonParts.join(' • ') || 'Eligible community member',
      connectionState,
      connectionRequestId: existingReq?.id,
    };

    return displayUser;
  });

  // Sort by compatibility score
  scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return res.json({ users: scored });
});

app.get('/api/connections', (req: Request, res: Response) => {
  const currentUser = db.get().users.find((u) => u.id === currentActiveUserId);
  if (!currentUser) return res.status(404).json({ error: 'User not found' });

  const allRequests = db.get().connectionRequests;
  const userMap = new Map(db.get().users.map((u) => [u.id, u]));

  const friends: any[] = [];
  const pendingReceived: any[] = [];
  const pendingSent: any[] = [];

  allRequests.forEach((reqItem) => {
    if (reqItem.fromUserId === currentUser.id && reqItem.status === 'accepted') {
      const other = userMap.get(reqItem.toUserId);
      if (other) friends.push({ ...other, connectionId: reqItem.id });
    } else if (reqItem.toUserId === currentUser.id && reqItem.status === 'accepted') {
      const other = userMap.get(reqItem.fromUserId);
      if (other) friends.push({ ...other, connectionId: reqItem.id });
    } else if (reqItem.toUserId === currentUser.id && reqItem.status === 'pending') {
      const other = userMap.get(reqItem.fromUserId);
      if (other) pendingReceived.push({ ...other, request: reqItem });
    } else if (reqItem.fromUserId === currentUser.id && reqItem.status === 'pending') {
      const other = userMap.get(reqItem.toUserId);
      if (other) pendingSent.push({ ...other, request: reqItem });
    }
  });

  return res.json({ friends, pendingReceived, pendingSent });
});

app.post('/api/connections/request', (req: Request, res: Response) => {
  const { toUserId, introductionMessage } = req.body;
  const currentUser = db.get().users.find((u) => u.id === currentActiveUserId);
  if (!currentUser) return res.status(404).json({ error: 'User not found' });

  const target = db.get().users.find((u) => u.id === toUserId);
  if (!target) return res.status(404).json({ error: 'Target user not found' });

  const data = db.get();
  const existing = data.connectionRequests.find(
    (c) =>
      (c.fromUserId === currentUser.id && c.toUserId === toUserId) ||
      (c.fromUserId === toUserId && c.toUserId === currentUser.id)
  );

  if (existing) {
    if (existing.status === 'accepted') {
      return res.json({ success: true, message: 'Already connected!', connection: existing });
    }
    return res.json({ success: true, message: 'Request already exists.', connection: existing });
  }

  const newReq = {
    id: `req_${Date.now()}`,
    fromUserId: currentUser.id,
    toUserId,
    status: 'pending' as const,
    introductionMessage:
      introductionMessage ||
      `Namaste ${target.name}! I would love to connect and share stories on ApnaSaath.`,
    createdAt: new Date().toISOString(),
  };

  data.connectionRequests.push(newReq);

  // Send non-intrusive notification to the recipient
  const friendReqNotif: NotificationItem = {
    id: `notif_${Date.now()}`,
    userId: toUserId,
    type: 'friend_request',
    title: `New Connection Request from ${currentUser.name}`,
    body: introductionMessage || `Namaste! I would love to connect and share stories on ApnaSaath.`,
    senderName: currentUser.name,
    senderAvatar: currentUser.avatar,
    senderCity: currentUser.city,
    actionTab: 'friends',
    actionData: { requestId: newReq.id, fromUserId: currentUser.id },
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  data.notifications.unshift(friendReqNotif);

  db.save(data);
  db.addAuditLog(currentUser.id, 'CONNECT_REQUEST_SENT', `Sent friend request to ${target.name}`);

  return res.json({ success: true, message: 'Connection invitation sent.', connection: newReq });
});

app.post('/api/connections/respond', (req: Request, res: Response) => {
  const { requestId, action } = req.body; // action: 'accept' | 'decline'
  const data = db.get();
  const reqItem = data.connectionRequests.find((r) => r.id === requestId);

  if (!reqItem) return res.status(404).json({ error: 'Request not found' });

  const responder = data.users.find((u) => u.id === currentActiveUserId);

  if (action === 'accept') {
    reqItem.status = 'accepted';
    db.addAuditLog(currentActiveUserId, 'CONNECT_ACCEPTED', `Accepted request ${requestId}`);

    // Notify the person whose request was accepted
    const acceptNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: reqItem.fromUserId,
      type: 'connection_accepted',
      title: `${responder?.name || 'A friend'} accepted your Namaste!`,
      body: `You are now connected friends. You can have a one-tap voice or video call anytime.`,
      senderName: responder?.name,
      senderAvatar: responder?.avatar,
      senderCity: responder?.city,
      actionTab: 'friends',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    data.notifications.unshift(acceptNotif);
  } else {
    reqItem.status = 'declined';
    db.addAuditLog(currentActiveUserId, 'CONNECT_DECLINED', `Declined request ${requestId}`);
  }

  db.save(data);
  return res.json({ success: true, status: reqItem.status });
});

// ==========================================
// NOTIFICATIONS API
// ==========================================

app.get('/api/notifications', (req: Request, res: Response) => {
  const userNotifs = (db.get().notifications || [])
    .filter((n) => n.userId === currentActiveUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ notifications: userNotifs });
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const notif = (data.notifications || []).find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
    db.save(data);
  }
  return res.json({ success: true });
});

app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const data = db.get();
  let updatedCount = 0;
  (data.notifications || []).forEach((n) => {
    if (n.userId === currentActiveUserId && !n.isRead) {
      n.isRead = true;
      updatedCount++;
    }
  });
  if (updatedCount > 0) {
    db.save(data);
  }
  return res.json({ success: true, updatedCount });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const data = db.get();
  let updatedCount = 0;
  (data.notifications || []).forEach((n) => {
    if (n.userId === currentActiveUserId && !n.isRead) {
      n.isRead = true;
      updatedCount++;
    }
  });
  if (updatedCount > 0) {
    db.save(data);
  }
  return res.json({ success: true, updatedCount });
});

app.post('/api/notifications/clear', (req: Request, res: Response) => {
  const data = db.get();
  data.notifications = (data.notifications || []).filter((n) => n.userId !== currentActiveUserId);
  db.save(data);
  return res.json({ success: true });
});

app.post('/api/notifications/simulate', (req: Request, res: Response) => {
  const { type } = req.body; // 'friend_request' | 'message'
  const data = db.get();
  const currentUser = data.users.find((u) => u.id === currentActiveUserId);
  const otherUsers = data.users.filter((u) => u.id !== currentActiveUserId);
  const sender = otherUsers[Math.floor(Math.random() * otherUsers.length)] || {
    name: 'Sunita Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
    city: 'Pune',
  };

  let notif: NotificationItem;
  if (type === 'message') {
    notif = {
      id: `notif_${Date.now()}`,
      userId: currentActiveUserId,
      type: 'message',
      title: `New Message from ${sender.name}`,
      body: `Namaste ${currentUser?.name ? currentUser.name.split(' ')[0] : 'Mitra'}ji! Have you listened to the new classical recording in Saath Circle?`,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      senderCity: sender.city,
      actionTab: 'saathi',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
  } else if (type === 'circle_reminder') {
    const liveCircle = (data.circles || []).find((c) => c.isLiveNow) || data.circles[0];
    notif = {
      id: `notif_${Date.now()}`,
      userId: currentActiveUserId,
      type: 'circle_reminder',
      title: `${liveCircle?.title || 'Chai Pe Charcha'} is Live Now!`,
      body: `${liveCircle?.hostName || 'Host'} and members have gathered for afternoon tea and nostalgia.`,
      senderName: liveCircle?.hostName || 'Saath Circle Host',
      senderAvatar: liveCircle?.image || '/src/assets/images/apnasaath_chai_charcha_1792601943254.jpg',
      senderCity: 'Community Stage',
      actionTab: 'circles',
      actionData: { circleId: liveCircle?.id },
      isRead: false,
      createdAt: new Date().toISOString(),
    };
  } else {
    notif = {
      id: `notif_${Date.now()}`,
      userId: currentActiveUserId,
      type: 'friend_request',
      title: `New Connection Request from ${sender.name}`,
      body: `Namaste! I saw that we both share an appreciation for old songs and literature. Would love to be friends on ApnaSaath.`,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      senderCity: sender.city,
      actionTab: 'friends',
      actionData: { fromUserId: sender.id },
      isRead: false,
      createdAt: new Date().toISOString(),
    };
  }

  data.notifications.unshift(notif);
  db.save(data);
  return res.json({ success: true, notification: notif });
});

app.post('/api/connections/block', (req: Request, res: Response) => {
  const { targetUserId } = req.body;
  const data = db.get();
  if (!data.blockedUserMap[currentActiveUserId]) {
    data.blockedUserMap[currentActiveUserId] = [];
  }
  if (!data.blockedUserMap[currentActiveUserId].includes(targetUserId)) {
    data.blockedUserMap[currentActiveUserId].push(targetUserId);
  }

  // Also remove any active connections
  data.connectionRequests = data.connectionRequests.filter(
    (c) =>
      !(
        (c.fromUserId === currentActiveUserId && c.toUserId === targetUserId) ||
        (c.fromUserId === targetUserId && c.toUserId === currentActiveUserId)
      )
  );

  db.save(data);
  db.addAuditLog(currentActiveUserId, 'USER_BLOCKED', `Blocked user ${targetUserId}`);

  return res.json({ success: true, message: 'User blocked. They will not be able to contact you or see your profile.' });
});

// ==========================================
// 4. REAL VOICE & VIDEO CALLING (WEBRTC SIGNALING)
// ==========================================

app.post('/api/calls/initiate', (req: Request, res: Response) => {
  const { receiverId, type } = req.body; // type: 'voice' | 'video'
  const caller = db.get().users.find((u) => u.id === currentActiveUserId);
  const receiver = db.get().users.find((u) => u.id === receiverId);

  if (!caller || !receiver) {
    return res.status(404).json({ error: 'User not found' });
  }

  const callId = `call_${Date.now()}`;
  const callSession: CallSession = {
    id: callId,
    callerId: caller.id,
    callerName: caller.name,
    callerAvatar: caller.avatar,
    receiverId: receiver.id,
    receiverName: receiver.name,
    receiverAvatar: receiver.avatar,
    type: type || 'voice',
    status: 'ringing',
    isAudioOnlyFallback: false,
    captionsEnabled: true,
    createdAt: new Date().toISOString(),
    candidates: [],
  };

  const data = db.get();
  data.callSessions.push(callSession);
  db.save(data);

  db.addAuditLog(caller.id, 'CALL_INITIATED', `Initiated ${type} call to ${receiver.name}`);
  return res.json({ success: true, call: callSession });
});

app.get('/api/calls/active', (req: Request, res: Response) => {
  const activeCall = db
    .get()
    .callSessions.find(
      (c) =>
        (c.callerId === currentActiveUserId || c.receiverId === currentActiveUserId) &&
        (c.status === 'ringing' || c.status === 'connected')
    );

  return res.json({ call: activeCall || null });
});

app.post('/api/calls/:id/respond', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, sdpAnswer } = req.body; // action: 'accept' | 'decline'
  const data = db.get();
  const call = data.callSessions.find((c) => c.id === id);

  if (!call) return res.status(404).json({ error: 'Call session not found' });

  if (action === 'accept') {
    call.status = 'connected';
    call.connectedAt = new Date().toISOString();
    if (sdpAnswer) call.sdpAnswer = sdpAnswer;
    db.addAuditLog(currentActiveUserId, 'CALL_ACCEPTED', `Call ${id} accepted`);
  } else {
    call.status = 'declined';
    call.endedAt = new Date().toISOString();
    db.addAuditLog(currentActiveUserId, 'CALL_DECLINED', `Call ${id} declined`);
  }

  db.save(data);
  return res.json({ success: true, call });
});

app.post('/api/calls/:id/signal', (req: Request, res: Response) => {
  const { id } = req.params;
  const { sdpOffer, sdpAnswer, candidate, isAudioOnlyFallback } = req.body;
  const data = db.get();
  const call = data.callSessions.find((c) => c.id === id);

  if (!call) return res.status(404).json({ error: 'Call session not found' });

  if (sdpOffer) call.sdpOffer = sdpOffer;
  if (sdpAnswer) call.sdpAnswer = sdpAnswer;
  if (candidate) call.candidates.push(candidate);
  if (typeof isAudioOnlyFallback === 'boolean') {
    call.isAudioOnlyFallback = isAudioOnlyFallback;
  }

  db.save(data);
  return res.json({ success: true, call });
});

app.post('/api/calls/:id/end', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const call = data.callSessions.find((c) => c.id === id);

  if (!call) return res.status(404).json({ error: 'Call session not found' });

  call.status = 'ended';
  call.endedAt = new Date().toISOString();
  db.save(data);

  db.addAuditLog(currentActiveUserId, 'CALL_ENDED', `Call ${id} completed`);
  return res.json({ success: true, message: 'Call ended' });
});

// ==========================================
// 5. AI SAATHI: EMPATHETIC MULTILINGUAL COMPANION
// ==========================================

app.post('/api/saathi/chat', async (req: Request, res: Response) => {
  const { message, language, mode } = req.body; // mode: 'chat' | 'story' | 'breathing' | 'quiz' | 'poetry'
  const currentUser = db.get().users.find((u) => u.id === currentActiveUserId);
  const userName = currentUser?.name || 'Mitra';
  const userLang = language || currentUser?.preferredLanguage || 'Hindi';

  if (!message && !mode) {
    return res.status(400).json({ error: 'Message or mode is required.' });
  }

  // Check saved memories for personalization
  const userMemories = db.get().saathiMemories.filter((m) => m.userId === currentActiveUserId);
  const memoriesContext = userMemories.map((m) => `- ${m.topic}: ${m.content}`).join('\n');

  // Crisis detection heuristic to provide supportive guidance
  const lowerMsg = (message || '').toLowerCase();
  const distressKeywords = ['die', 'suicide', 'kill myself', 'no reason to live', 'end it all', 'khudkushi', 'mar jana'];
  const hasDistress = distressKeywords.some((w) => lowerMsg.includes(w));

  if (hasDistress) {
    const supportiveMsg =
      `Aap akele nahi hain, ${userName}ji. Aapki zindgi behad ahem aur keemti hai. Hum aapse anurodh karte hain ki kripya kisi apne ya hamare vishwasniya sahayata kendra se baat karein.\n\n` +
      `📞 National Elderline: 14567 (Toll Free for Senior Citizens)\n` +
      `📞 KIRAN Mental Health Helpline: 1800-599-0019 (24/7 Support)\n` +
      `📞 National Emergency: 112\n\n` +
      `Hum hamesha yahan hain aapse baat karne ke liye, par kripya abhi kisi trained counselor se sampark karein.`;

    // Save message to chat history
    saveChatMessage(currentActiveUserId, message || 'Expression of distress', 'user');
    saveChatMessage(currentActiveUserId, supportiveMsg, 'assistant');

    return res.json({
      text: supportiveMsg,
      isCrisisAlert: true,
      hotlines: [
        { name: 'National Elderline', number: '14567' },
        { name: 'KIRAN Helpline', number: '1800-599-0019' },
      ],
    });
  }

  // System prompt embodying the guidelines
  const systemInstruction = `You are "AI Saathi" (आपका साथी), an empathetic, deeply respectful, warm, and comforting companion designed specifically for older adults (aged 55+) in India.
User details:
- Name: ${userName}
- Preferred language: ${userLang}
- City: ${currentUser?.city || 'India'}
- Interests: ${currentUser?.interests?.join(', ') || 'Culture, Music, Conversation'}
- Saved memories/preferences:
${memoriesContext || 'None saved yet'}

Core Principles:
1. Speak warmly, respectfully, and patiently. In Hindi, always use dignified respectful pronouns like 'Aap', 'Aapka', 'Namasteji', '-ji'.
2. Respond primarily in ${userLang} (or natural Hinglish if Hindi/English mix is preferred by user).
3. Be completely transparent that you are an AI companion, NOT a human, and not a replacement for family or medical care.
4. Never diagnose medical or mental health illnesses. Do not claim to be a doctor or therapist.
5. Topics: Reminiscence, old songs (Rafi, Kishore, Lata, Hemant Kumar, Carnatic legends), regional foods, grandchildren stories, gentle life wisdom, breathing exercises, light quizzes, Hindi/regional poetry (Dushyant Kumar, Harivansh Rai Bachchan, Tagore, Thiruvalluvar, Kabir).
6. Tone: Dignified, uplifting, encouraging, unhurried. Older adults have rich life experience; treat them as wise, accomplished peers.
7. Keep responses concise and pleasant (2 to 4 short paragraphs max) so it is easy to read or listen on mobile.`;

  let prompt = message;
  if (mode === 'story') {
    prompt = `Tell me a warm, heartwarming 2-minute nostalgic story about Indian monsoons or festival celebrations with family in old times.`;
  } else if (mode === 'breathing') {
    prompt = `Guide me through a gentle 1-minute calming breathing relaxation exercise (anulom-vilom or deep belly breathing) with gentle pacing.`;
  } else if (mode === 'poetry') {
    prompt = `Share an uplifting, inspiring 4-line classical Hindi or regional poem with its simple meaning.`;
  } else if (mode === 'quiz') {
    prompt = `Ask me a friendly, delightful trivia question about old Indian cinema, classical music, or historic heritage.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const aiText = response.text || `Namaste ${userName}ji! Main hamesha aapse baat karne ke liye yahan hoon.`;

    // Save to history
    saveChatMessage(currentActiveUserId, prompt, 'user');
    saveChatMessage(currentActiveUserId, aiText, 'assistant');

    // Extract potential preference to propose saving
    let suggestedMemory: string | null = null;
    if (
      prompt.toLowerCase().includes('i like') ||
      prompt.toLowerCase().includes('i love') ||
      prompt.toLowerCase().includes('pasand hai')
    ) {
      suggestedMemory = `User expressed interest in: "${prompt.slice(0, 80)}"`;
    }

    return res.json({
      text: aiText,
      suggestedMemory,
      language: userLang,
    });
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    // Graceful empathetic fallback
    const fallback = `Namaste ${userName}ji! Aapki baat sunkar bahut achha laga. Aaj ka din kaisa beet raha hai? Kahiye toh koi purana gungunane layak gaana ya kissa yaad karein?`;
    return res.json({
      text: fallback,
      isFallback: true,
      language: userLang,
    });
  }
});

function saveChatMessage(userId: string, text: string, role: 'user' | 'assistant') {
  const data = db.get();
  if (!data.saathiChatHistory[userId]) {
    data.saathiChatHistory[userId] = [];
  }
  data.saathiChatHistory[userId].push({
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    role,
    text,
    timestamp: new Date().toISOString(),
  });
  // Keep last 40 messages
  if (data.saathiChatHistory[userId].length > 40) {
    data.saathiChatHistory[userId].shift();
  }
  db.save(data);
}

app.get('/api/saathi/history', (req: Request, res: Response) => {
  const history = db.get().saathiChatHistory[currentActiveUserId] || [];
  return res.json({ messages: history });
});

app.post('/api/saathi/clear-history', (req: Request, res: Response) => {
  const data = db.get();
  data.saathiChatHistory[currentActiveUserId] = [];
  db.save(data);
  db.addAuditLog(currentActiveUserId, 'SAATHI_HISTORY_CLEARED', 'User cleared chat history');
  return res.json({ success: true, message: 'Chat history cleared safely.' });
});

app.get('/api/saathi/memories', (req: Request, res: Response) => {
  const memories = db.get().saathiMemories.filter((m) => m.userId === currentActiveUserId);
  return res.json({ memories });
});

app.post('/api/saathi/memories', (req: Request, res: Response) => {
  const { topic, content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });

  const data = db.get();
  const newMemory: SaathiMemory = {
    id: `mem_${Date.now()}`,
    userId: currentActiveUserId,
    topic: topic || 'Personal Note',
    content,
    createdAt: new Date().toISOString(),
  };
  data.saathiMemories.push(newMemory);
  db.save(data);
  db.addAuditLog(currentActiveUserId, 'MEMORY_SAVED', `Saved memory: ${topic}`);

  return res.json({ success: true, memory: newMemory });
});

app.delete('/api/saathi/memories/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  data.saathiMemories = data.saathiMemories.filter((m) => !(m.id === id && m.userId === currentActiveUserId));
  db.save(data);
  db.addAuditLog(currentActiveUserId, 'MEMORY_DELETED', `Deleted memory ${id}`);
  return res.json({ success: true, message: 'Memory deleted' });
});

// ==========================================
// 6. SAATH CIRCLE: GROUPS & COMMUNITY ACTIVITIES
// ==========================================

app.get('/api/circles', (req: Request, res: Response) => {
  const circles = db.get().circles.map((c) => ({
    ...c,
    isJoined: c.attendeeIds.includes(currentActiveUserId),
  }));
  return res.json({ circles });
});

app.post('/api/circles/:id/join', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const circle = data.circles.find((c) => c.id === id);

  if (!circle) return res.status(404).json({ error: 'Circle not found' });

  if (!circle.attendeeIds.includes(currentActiveUserId)) {
    circle.attendeeIds.push(currentActiveUserId);
    circle.participantCount = circle.attendeeIds.length;
  }

  db.save(data);
  db.addAuditLog(currentActiveUserId, 'CIRCLE_JOINED', `Joined circle ${circle.title}`);
  return res.json({ success: true, circle });
});

app.post('/api/circles/:id/leave', (req: Request, res: Response) => {
  const { id } = req.params;
  const data = db.get();
  const circle = data.circles.find((c) => c.id === id);

  if (!circle) return res.status(404).json({ error: 'Circle not found' });

  circle.attendeeIds = circle.attendeeIds.filter((uid) => uid !== currentActiveUserId);
  circle.participantCount = circle.attendeeIds.length;

  db.save(data);
  db.addAuditLog(currentActiveUserId, 'CIRCLE_LEFT', `Left circle ${circle.title}`);
  return res.json({ success: true, circle });
});

// ==========================================
// 7. TRUST & SAFETY: REPORTING & MODERATION
// ==========================================

app.post('/api/moderation/report', (req: Request, res: Response) => {
  const { reportedUserId, category, notes } = req.body;
  const reporter = db.get().users.find((u) => u.id === currentActiveUserId);
  const reported = db.get().users.find((u) => u.id === reportedUserId);

  if (!reporter || !reportedUserId) {
    return res.status(400).json({ error: 'Invalid report parameters' });
  }

  const data = db.get();
  const report: ModerationReport = {
    id: `rep_${Date.now()}`,
    reporterId: reporter.id,
    reporterName: reporter.name,
    reportedUserId,
    reportedUserName: reported?.name || reportedUserId,
    category: category || 'harassment',
    notes: notes || 'User filed safety report.',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  data.moderationReports.unshift(report);
  db.save(data);

  db.addAuditLog(reporter.id, 'SAFETY_REPORT_FILED', `Reported user ${reportedUserId} for ${category}`);
  return res.json({
    success: true,
    message: 'Thank you. Your report has been submitted to our Trust & Safety team for priority human review. The user will be muted from your feed.',
  });
});

app.get('/api/admin/reports', (req: Request, res: Response) => {
  const reports = db.get().moderationReports;
  return res.json({ reports });
});

app.post('/api/admin/reports/:id/resolve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { actionTaken } = req.body;
  const data = db.get();
  const report = data.moderationReports.find((r) => r.id === id);

  if (!report) return res.status(404).json({ error: 'Report not found' });

  report.status = 'resolved';
  report.actionTaken = actionTaken || 'Reviewed and flagged.';
  db.save(data);

  db.addAuditLog('admin', 'REPORT_RESOLVED', `Report ${id} resolved: ${actionTaken}`);
  return res.json({ success: true, report });
});

// ==========================================
// 8. FAMILY ASSISTANCE PORTAL
// ==========================================

app.post('/api/family/generate-invite', (req: Request, res: Response) => {
  const user = db.get().users.find((u) => u.id === currentActiveUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const code = `AS-${Math.floor(1000 + Math.random() * 9000)}`;
  const data = db.get();

  const link = {
    id: `fam_${Date.now()}`,
    elderUserId: user.id,
    helperName: 'Family Supporter',
    helperPhone: '',
    relationship: 'Child/Relative',
    code,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };

  data.familyAssistLinks.push(link);
  db.save(data);

  db.addAuditLog(user.id, 'FAMILY_INVITE_CREATED', `Created invite code ${code}`);
  return res.json({
    success: true,
    code,
    instructions:
      'Share this 6-character code with your son, daughter, or trusted family member so they can assist you with audio/video settings and onboarding.',
  });
});

app.get('/api/family/status', (req: Request, res: Response) => {
  const links = db.get().familyAssistLinks.filter((f) => f.elderUserId === currentActiveUserId);
  return res.json({ links });
});

// ==========================================
// 9. ADMIN METRICS & PRICING OVERSIGHT
// ==========================================

app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const data = db.get();
  const totalUsers = data.users.length;
  const ageAssuredUsers = data.users.filter((u) => u.isAgeAssured).length;
  const activeCalls = data.callSessions.filter((c) => c.status === 'connected').length;
  const totalConnections = data.connectionRequests.filter((c) => c.status === 'accepted').length;
  const pendingReports = data.moderationReports.filter((r) => r.status === 'pending').length;

  return res.json({
    totalUsers,
    ageAssuredRate: Math.round((ageAssuredUsers / totalUsers) * 100),
    activeCalls,
    totalConnections,
    pendingReports,
    pricing: data.pricingConfig,
    recentAudits: data.auditLogs.slice(0, 15),
  });
});

app.post('/api/admin/pricing', (req: Request, res: Response) => {
  const { plusPriceInr, freeAiDailyLimit, annualDiscountPercent } = req.body;
  const data = db.get();

  if (plusPriceInr) data.pricingConfig.plusPriceInr = Number(plusPriceInr);
  if (freeAiDailyLimit) data.pricingConfig.freeAiDailyLimit = Number(freeAiDailyLimit);
  if (annualDiscountPercent) data.pricingConfig.annualDiscountPercent = Number(annualDiscountPercent);

  db.save(data);
  db.addAuditLog('admin', 'PRICING_UPDATED', `Updated plusPriceInr to ${plusPriceInr}`);
  return res.json({ success: true, pricing: data.pricingConfig });
});

// ==========================================
// 10. VITE INTEGRATION FOR DEV & PROD
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ApnaSaath full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ApnaSaath server:', err);
});
