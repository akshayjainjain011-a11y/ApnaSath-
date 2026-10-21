import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  phone: string;
  name: string;
  age: number;
  dob: string;
  city: string;
  state: string;
  bio: string;
  avatar: string;
  preferredLanguage: string;
  knownLanguages: string[];
  interests: string[];
  stageOfLife: string; // e.g. "Retired Educator", "Grandparent", "Home Creator", "Avid Traveller"
  isAgeAssured: boolean;
  verificationMethod: 'camera_liveness' | 'accessible_alternative' | 'admin_verified';
  verificationDate: string;
  isOnline: boolean;
  plan: 'free' | 'plus';
  callPreference: 'both' | 'voice_only' | 'video_only';
  privacySettings: {
    showOnlineStatus: boolean;
    showCity: boolean;
    allowFamilyAssist: boolean;
    aiMemoryEnabled: boolean;
  };
  createdAt: string;
}

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  introductionMessage: string;
  createdAt: string;
}

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  type: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'declined';
  isAudioOnlyFallback: boolean;
  captionsEnabled: boolean;
  createdAt: string;
  connectedAt?: string;
  endedAt?: string;
  sdpOffer?: string;
  sdpAnswer?: string;
  candidates: any[];
}

export interface SaathCircle {
  id: string;
  title: string;
  tagline: string;
  category: string;
  language: string;
  hostName: string;
  scheduledTime: string;
  isLiveNow: boolean;
  participantCount: number;
  maxParticipants: number;
  description: string;
  image: string;
  attendeeIds: string[];
}

export interface SaathiMemory {
  id: string;
  userId: string;
  topic: string;
  content: string;
  createdAt: string;
}

export interface SaathiChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: string;
  audioGenerated?: boolean;
}

export interface ModerationReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  category: 'harassment' | 'fraud_scam' | 'impersonation' | 'inappropriate' | 'other';
  notes: string;
  status: 'pending' | 'reviewed' | 'resolved';
  actionTaken?: string;
  createdAt: string;
}

export interface SystemAuditLog {
  id: string;
  actorId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'friend_request' | 'message' | 'circle_reminder' | 'connection_accepted';
  title: string;
  body: string;
  senderName?: string;
  senderAvatar?: string;
  senderCity?: string;
  actionTab?: 'friends' | 'saathi' | 'circles';
  actionData?: any;
  isRead: boolean;
  createdAt: string;
}

export interface DatabaseSchema {
  users: User[];
  connectionRequests: ConnectionRequest[];
  callSessions: CallSession[];
  circles: SaathCircle[];
  saathiMemories: SaathiMemory[];
  saathiChatHistory: Record<string, SaathiChatMessage[]>;
  moderationReports: ModerationReport[];
  blockedUserMap: Record<string, string[]>; // userId -> blocked userIds
  familyAssistLinks: Array<{
    id: string;
    elderUserId: string;
    helperName: string;
    helperPhone: string;
    relationship: string;
    code: string;
    status: 'active' | 'pending';
    createdAt: string;
  }>;
  notifications: NotificationItem[];
  pricingConfig: {
    freeAiDailyLimit: number;
    plusPriceInr: number;
    annualDiscountPercent: number;
    emergencyHotlines: Array<{ name: string; number: string; desc: string }>;
  };
  auditLogs: SystemAuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_USERS: User[] = [
  {
    id: 'user_rameshwar',
    phone: '+919820011223',
    name: 'Rameshwar Sharma',
    age: 67,
    dob: '1959-04-12',
    city: 'Jaipur',
    state: 'Rajasthan',
    bio: 'Retired Kendriya Vidyalaya Principal. Lover of Munshi Premchand, old Rafi & Mukesh songs, and evening chai chats on history and poetry.',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    preferredLanguage: 'Hindi',
    knownLanguages: ['Hindi', 'English'],
    interests: ['Classical Indian Music', 'Hindi Poetry', 'Chess', 'Morning Walks'],
    stageOfLife: 'Retired Educator & Grandfather',
    isAgeAssured: true,
    verificationMethod: 'camera_liveness',
    verificationDate: '2026-09-15',
    isOnline: true,
    plan: 'free',
    callPreference: 'both',
    privacySettings: {
      showOnlineStatus: true,
      showCity: true,
      allowFamilyAssist: true,
      aiMemoryEnabled: true,
    },
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'user_meenakshi',
    phone: '+919840055667',
    name: 'Meenakshi Sundaram',
    age: 62,
    dob: '1964-07-28',
    city: 'Chennai',
    state: 'Tamil Nadu',
    bio: 'Retired Bank Manager. Passionate about Carnatic classical music, South Indian traditional recipes, and temple architecture.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    preferredLanguage: 'Tamil',
    knownLanguages: ['Tamil', 'English', 'Hindi'],
    interests: ['Carnatic Music', 'Traditional Cooking', 'Temple Architecture', 'Reading'],
    stageOfLife: 'Retired Banker & Avid Reader',
    isAgeAssured: true,
    verificationMethod: 'camera_liveness',
    verificationDate: '2026-09-18',
    isOnline: true,
    plan: 'plus',
    callPreference: 'both',
    privacySettings: {
      showOnlineStatus: true,
      showCity: true,
      allowFamilyAssist: false,
      aiMemoryEnabled: true,
    },
    createdAt: '2026-08-12T14:30:00Z',
  },
  {
    id: 'user_prabir',
    phone: '+919830077889',
    name: 'Prabir Sen',
    age: 70,
    dob: '1956-11-03',
    city: 'Kolkata',
    state: 'West Bengal',
    bio: 'Former Geological Survey Officer. Enjoy Rabindra Sangeet, sharing travel memories across the Himalayas, and nostalgic conversations about old Calcutta.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    preferredLanguage: 'Bengali',
    knownLanguages: ['Bengali', 'English', 'Hindi'],
    interests: ['Rabindra Sangeet', 'Travel Memoirs', 'Himalayan Trekking', 'Photography'],
    stageOfLife: 'Retired Geologist',
    isAgeAssured: true,
    verificationMethod: 'accessible_alternative',
    verificationDate: '2026-09-20',
    isOnline: false,
    plan: 'free',
    callPreference: 'voice_only',
    privacySettings: {
      showOnlineStatus: false,
      showCity: true,
      allowFamilyAssist: true,
      aiMemoryEnabled: true,
    },
    createdAt: '2026-08-15T09:15:00Z',
  },
  {
    id: 'user_sunita',
    phone: '+919822033445',
    name: 'Sunita Kulkarni',
    age: 59,
    dob: '1967-02-14',
    city: 'Pune',
    state: 'Maharashtra',
    bio: 'Former high school biology teacher. Love terrace gardening, making homemade pickles and preserves, and discussing Marathi natak and literature.',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
    preferredLanguage: 'Marathi',
    knownLanguages: ['Marathi', 'Hindi', 'English'],
    interests: ['Terrace Gardening', 'Ayurvedic Plants', 'Marathi Literature', 'Storytelling'],
    stageOfLife: 'Nature Lover & Educator',
    isAgeAssured: true,
    verificationMethod: 'camera_liveness',
    verificationDate: '2026-09-22',
    isOnline: true,
    plan: 'plus',
    callPreference: 'both',
    privacySettings: {
      showOnlineStatus: true,
      showCity: true,
      allowFamilyAssist: true,
      aiMemoryEnabled: true,
    },
    createdAt: '2026-08-20T11:45:00Z',
  },
  {
    id: 'user_harpreet',
    phone: '+919814099881',
    name: 'Harpreet Singh Sodhi',
    age: 65,
    dob: '1961-08-19',
    city: 'Amritsar',
    state: 'Punjab',
    bio: 'Retired businessman. Deep interest in Gurbani kirtan, organic farming, community seva, and healthy longevity habits.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    preferredLanguage: 'Punjabi',
    knownLanguages: ['Punjabi', 'Hindi', 'English'],
    interests: ['Gurbani & Reflection', 'Organic Farming', 'Community Seva', 'Cooking'],
    stageOfLife: 'Grandfather & Community Volunteer',
    isAgeAssured: true,
    verificationMethod: 'camera_liveness',
    verificationDate: '2026-09-25',
    isOnline: true,
    plan: 'free',
    callPreference: 'both',
    privacySettings: {
      showOnlineStatus: true,
      showCity: true,
      allowFamilyAssist: false,
      aiMemoryEnabled: true,
    },
    createdAt: '2026-08-22T16:00:00Z',
  },
  {
    id: 'user_leela',
    phone: '+919847012345',
    name: 'Sister Leela Nair',
    age: 66,
    dob: '1960-05-09',
    city: 'Kochi',
    state: 'Kerala',
    bio: 'Retired hospital head nurse. Enjoy gentle yoga, herbal tea recipes, Malayalam poetry, and listening patiently to people’s life stories.',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    preferredLanguage: 'Malayalam',
    knownLanguages: ['Malayalam', 'English', 'Tamil'],
    interests: ['Gentle Movement', 'Life Stories', 'Malayalam Poetry', 'Herbal Wellness'],
    stageOfLife: 'Retired Healthcare Professional',
    isAgeAssured: true,
    verificationMethod: 'camera_liveness',
    verificationDate: '2026-10-01',
    isOnline: false,
    plan: 'free',
    callPreference: 'both',
    privacySettings: {
      showOnlineStatus: true,
      showCity: true,
      allowFamilyAssist: true,
      aiMemoryEnabled: true,
    },
    createdAt: '2026-08-28T08:30:00Z',
  }
];

const INITIAL_CIRCLES: SaathCircle[] = [
  {
    id: 'circle_chai_pe_charcha',
    title: 'Chai Pe Charcha: Dil Ki Baatein',
    tagline: 'Grab a cup of tea and join a friendly 4-person circle',
    category: 'Community Gathering',
    language: 'Hindi & English',
    hostName: 'Rameshwar Sharma (Moderator)',
    scheduledTime: 'Daily at 4:30 PM IST',
    isLiveNow: true,
    participantCount: 3,
    maxParticipants: 6,
    description: 'Our signature afternoon gathering. No formalities, no lectures — just warm conversation about life, childhood memories, seasonal weather, and sweet moments.',
    image: '/src/assets/images/apnasaath_chai_charcha_1792601943254.jpg',
    attendeeIds: ['user_rameshwar', 'user_sunita', 'user_harpreet'],
  },
  {
    id: 'circle_retro_bollywood',
    title: 'Sunehre Geet: 50s to 70s Bollywood Classics',
    tagline: 'Humming Kishore, Rafi, Lata, and Mukesh melodies together',
    category: 'Music & Nostalgia',
    language: 'Hindi',
    hostName: 'Anandji K. (Senior Host)',
    scheduledTime: 'Every Tue & Sat at 6:00 PM IST',
    isLiveNow: false,
    participantCount: 8,
    maxParticipants: 12,
    description: 'Share your favorite evergreen songs, recount memories of going to old cinema halls, and listen to timeless musical trivia.',
    image: '/src/assets/images/apnasaath_hero_elders_1792601941884.jpg',
    attendeeIds: ['user_rameshwar', 'user_prabir'],
  },
  {
    id: 'circle_garden_wisdom',
    title: 'Terrace & Balcony Gardening Circle',
    tagline: 'Tips for tulsi, flowering plants, kitchen herbs, and compost',
    category: 'Hobbies & Nature',
    language: 'All Languages',
    hostName: 'Sunita Kulkarni (Host)',
    scheduledTime: 'Every Sunday at 10:00 AM IST',
    isLiveNow: false,
    participantCount: 5,
    maxParticipants: 10,
    description: 'Exchange practical tips on tending to home plants, natural remedies for plant bugs, and the peace of morning garden care.',
    image: '/src/assets/images/apnasaath_chai_charcha_1792601943254.jpg',
    attendeeIds: ['user_sunita', 'user_harpreet'],
  },
  {
    id: 'circle_vedic_reflection',
    title: 'Morning Shanti: Reflection & Quiet Wisdom',
    tagline: 'Peaceful thoughts for starting the day with clarity',
    category: 'Spirituality & Peace',
    language: 'Hindi / Sanskrit / English',
    hostName: 'Pt. Madhavan (Volunteer)',
    scheduledTime: 'Daily at 7:15 AM IST',
    isLiveNow: false,
    participantCount: 14,
    maxParticipants: 20,
    description: 'A gentle, non-dogmatic space for morning peace, contemplation, breathing, and discussing uplifting verses and life philosophy.',
    image: '/src/assets/images/apnasaath_ai_companion_1792601942145.jpg',
    attendeeIds: ['user_meenakshi', 'user_rameshwar', 'user_harpreet'],
  },
  {
    id: 'circle_dadi_recipes',
    title: 'Grandmothers Kitchen: Lost Traditional Recipes',
    tagline: 'Preserving heirloom masalas, pickles, and traditional dishes',
    category: 'Regional Food & Heritage',
    language: 'Hindi / English / Marathi',
    hostName: 'Kaveri Amma',
    scheduledTime: 'Thursdays at 3:30 PM IST',
    isLiveNow: false,
    participantCount: 9,
    maxParticipants: 15,
    description: 'Reminiscing about festival delicacies made by our mothers and grandmothers, and sharing regional recipes from across India.',
    image: '/src/assets/images/apnasaath_chai_charcha_1792601943254.jpg',
    attendeeIds: ['user_meenakshi', 'user_sunita'],
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.notifications) parsed.notifications = [];
        return parsed;
      }
    } catch (err) {
      console.warn('Error reading db.json, initializing fresh database', err);
    }

    const defaultData: DatabaseSchema = {
      users: INITIAL_USERS,
      connectionRequests: [
        {
          id: 'req_1',
          fromUserId: 'user_rameshwar',
          toUserId: 'user_prabir',
          status: 'accepted',
          introductionMessage: 'Prabir babu, loved reading about your Himalayan travels. Would be delighted to connect!',
          createdAt: '2026-09-01T10:00:00Z',
        },
        {
          id: 'req_2',
          fromUserId: 'user_sunita',
          toUserId: 'user_rameshwar',
          status: 'accepted',
          introductionMessage: 'Namaste Rameshwarji, I saw you enjoy old poetry and educational conversations. Looking forward to talking!',
          createdAt: '2026-09-05T12:00:00Z',
        }
      ],
      callSessions: [],
      circles: INITIAL_CIRCLES,
      saathiMemories: [
        {
          id: 'mem_1',
          userId: 'user_rameshwar',
          topic: 'Morning routine & Health',
          content: 'Prefers mild morning walks at 6:30 AM in Central Park and drinks ginger tulsi tea.',
          createdAt: '2026-10-10T08:00:00Z',
        },
        {
          id: 'mem_2',
          userId: 'user_rameshwar',
          topic: 'Favourite Poets',
          content: 'Loves Dushyant Kumar and Harivansh Rai Bachchan poems.',
          createdAt: '2026-10-12T15:30:00Z',
        }
      ],
      saathiChatHistory: {
        user_rameshwar: [
          {
            id: 'msg_1',
            userId: 'user_rameshwar',
            role: 'assistant',
            text: 'Namaste Rameshwarji! How is the pleasant weather in Jaipur today? Would you like to hear a short poetic verse, or shall we chat about something on your mind?',
            timestamp: '2026-10-21T08:30:00Z',
            language: 'Hindi',
          }
        ]
      },
      moderationReports: [
        {
          id: 'rep_1',
          reporterId: 'user_meenakshi',
          reporterName: 'Meenakshi Sundaram',
          reportedUserId: 'spam_account_99',
          reportedUserName: 'Unverified Commercial Agent',
          category: 'fraud_scam',
          notes: 'User contacted via message asking for bank details claiming pension bonus scheme.',
          status: 'resolved',
          actionTaken: 'Account blocked and blacklisted.',
          createdAt: '2026-10-15T11:20:00Z',
        }
      ],
      blockedUserMap: {
        user_meenakshi: ['spam_account_99']
      },
      familyAssistLinks: [
        {
          id: 'fam_1',
          elderUserId: 'user_rameshwar',
          helperName: 'Gaurav Sharma (Son)',
          helperPhone: '+919820099887',
          relationship: 'Son',
          code: 'AS-8492',
          status: 'active',
          createdAt: '2026-09-10T11:00:00Z',
        }
      ],
      notifications: [
        {
          id: 'notif_welcome',
          userId: 'user_rameshwar',
          type: 'friend_request',
          title: 'New Connection Request from Sunita Kulkarni',
          body: 'Namaste Rameshwarji! Loved reading about your love for poetry and education. Would be delighted to connect!',
          senderName: 'Sunita Kulkarni',
          senderAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
          senderCity: 'Pune',
          actionTab: 'friends',
          isRead: false,
          createdAt: new Date().toISOString(),
        }
      ],
      pricingConfig: {
        freeAiDailyLimit: 15,
        plusPriceInr: 299,
        annualDiscountPercent: 25,
        emergencyHotlines: [
          { name: 'National Elderline', number: '14567', desc: 'Government of India toll-free senior support helpline' },
          { name: 'KIRAN Mental Wellbeing', number: '1800-599-0019', desc: '24/7 National mental health helpline' },
          { name: 'National Emergency', number: '112', desc: 'Unified emergency response support' },
          { name: 'Senior Citizens Cell (Delhi/National)', number: '1291', desc: 'Assistance for senior citizens' }
        ]
      },
      auditLogs: [
        {
          id: 'audit_init',
          actorId: 'system',
          action: 'SYSTEM_BOOT',
          details: 'ApnaSaath secure database initialized with DPDP compliance controls and age-assurance safeguards.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.save(defaultData);
    return defaultData;
  }

  public save(newData?: DatabaseSchema) {
    if (newData) {
      this.data = newData;
    }
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save db.json:', err);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public addAuditLog(actorId: string, action: string, details: string) {
    const entry: SystemAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorId,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    this.save();
  }
}

export const db = new Database();
