import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Shared server-side Gemini client for BellBird Real-time Translation
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();

  // Support reverse proxies (Hostinger, Cloudflare, Nginx, Cloud Run)
  app.set('trust proxy', 1);

  app.use(cors());
  app.use(express.json());

  // --- MOCK DATABASE ---
  interface User {
    id: string;
    username: string;
    name: string;
    avatar: string;
    email?: string;
    provider?: string;
    coverImage?: string;
    bio: string;
    location?: string;
    website?: string;
    followers: number;
    following: number;
    isFollowing?: boolean;
    isPremium?: boolean;
  }
  interface Post { id: string; authorId: string; content: string; image: string | null; likes: number; comments: number; createdAt: string; likedBy: string[]; }
  interface Notification { id: string; type: string; actorId: string; postId?: string; read: boolean; createdAt: string; }
  interface Message { id: string; senderId: string; receiverId: string; content: string; createdAt: string; }

  let users: User[] = [
    {
      id: '1',
      username: 'bellbird_user',
      name: 'BellBird User',
      email: 'demo@bellbird.app',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
      bio: 'Exploring the world one chirp at a time. #technology #minimalism',
      location: 'San Francisco, CA',
      website: 'https://bellbird.app',
      followers: 120,
      following: 85,
      isFollowing: false,
    },
    {
      id: '2',
      username: 'jane_doe',
      name: 'Jane Doe',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
      bio: 'Photography enthusiast & visual storyteller. Capturing everyday moments. #photography',
      location: 'New York, NY',
      website: 'https://janedoe.photos',
      followers: 245,
      following: 140,
      isFollowing: true,
    },
    {
      id: '3',
      username: 'alex_dev',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200',
      bio: 'Frontend engineer building with React, Vite & Tailwind. #webdev #react19',
      location: 'Seattle, WA',
      website: 'https://alexrivera.codes',
      followers: 1820,
      following: 430,
      isFollowing: false,
    },
    {
      id: '4',
      username: 'sarah_design',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      coverImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200',
      bio: 'Product designer & creative director. Typography, ergonomics, and clean systems. #designsystems',
      location: 'London, UK',
      website: 'https://sarahchen.design',
      followers: 3100,
      following: 290,
      isFollowing: false,
    },
    {
      id: '5',
      username: 'bellbird_hq',
      name: 'BellBird Official',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
      bio: 'The official BellBird account. Welcome to the flock! #bellbird #updates',
      location: 'Global / Decentralized',
      website: 'https://bellbird.app',
      followers: 15400,
      following: 18,
      isFollowing: true,
      isPremium: true,
    },
  ];

  let posts: Post[] = [
    { id: '101', authorId: '2', content: 'Golden hour in the city. Loving the warm light bouncing off the glass facades! 📷 #photography #goldenhour', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', likes: 24, comments: 6, createdAt: new Date(Date.now() - 3600000).toISOString(), likedBy: ['1'] },
    { id: '102', authorId: '1', content: 'What a beautiful day to write clean TypeScript code. The #bellbird deep navy and blue theme feels so focused and calm! #webdev', image: null, likes: 12, comments: 4, createdAt: new Date(Date.now() - 7200000).toISOString(), likedBy: [] },
    { id: '103', authorId: '3', content: 'Just deployed the new full-text search feature! Now you can find posts, people, hashtags, and media seamlessly like Twitter. Try searching for #bellbird or #react19! 🚀 #updates', image: null, likes: 48, comments: 11, createdAt: new Date(Date.now() - 14400000).toISOString(), likedBy: ['1', '2'] },
    { id: '104', authorId: '4', content: 'Minimalism isn\'t the lack of something. It\'s simply the perfect amount of everything. Designing clean touch interfaces for mobile today! #designsystems #minimalism', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800', likes: 35, comments: 8, createdAt: new Date(Date.now() - 28800000).toISOString(), likedBy: ['3'] },
    { id: '105', authorId: '5', content: 'Welcome to BellBird 1.0! Experience real-time chirps, responsive cross-device navigation, and instant content search across the entire flock. #bellbird #technology', image: null, likes: 92, comments: 19, createdAt: new Date(Date.now() - 43200000).toISOString(), likedBy: ['1', '2', '3', '4'] },
  ];

  let notifications: Notification[] = [
    { id: 'n1', type: 'like', actorId: '2', postId: '102', read: false, createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: 'n2', type: 'follow', actorId: '3', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'n3', type: 'follow', actorId: '2', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  let messages: Message[] = [
    { id: 'm1', senderId: '2', receiverId: '1', content: 'Hey! Welcome to BellBird!', createdAt: new Date(Date.now() - 86400000).toISOString() }
  ];

  let bookmarkedPostIds: string[] = ['101', '103'];

  // Helper to get populated post
  const populatePost = (post: any) => ({
    ...post,
    author: users.find(u => u.id === post.authorId),
    isBookmarked: bookmarkedPostIds.includes(post.id)
  });

  const populateNotification = (notif: any) => ({
    ...notif,
    actor: users.find(u => u.id === notif.actorId),
    post: notif.postId ? posts.find(p => p.id === notif.postId) : null
  });

  // --- API ROUTES ---

  // Auth: Log In
  app.post('/api/auth/login', (req, res) => {
    const { emailOrUsername, password } = req.body || {};
    // If empty or demo request
    if (!emailOrUsername || emailOrUsername === 'demo@bellbird.app' || emailOrUsername === 'bellbird_user') {
      const demoUser = users.find(u => u.username === 'bellbird_user') || users[0];
      return res.json({ user: demoUser, token: 'mock-jwt-token' });
    }

    const clean = String(emailOrUsername).trim().toLowerCase().replace(/^@/, '');
    const found = users.find(u =>
      u.username.toLowerCase() === clean ||
      (u.email && u.email.toLowerCase() === clean)
    );

    if (found) {
      return res.json({ user: found, token: 'jwt_' + found.id + '_' + Date.now() });
    }

    // If no matching user, return helpful error
    return res.status(401).json({ error: 'No account found with this email or username. Please join or check credentials.' });
  });

  // Auth: Register (Normal Join)
  app.post('/api/auth/register', (req, res) => {
    const { name, username, email, avatar } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    const cleanName = String(name).trim();
    let cleanUsername = (username ? String(username) : cleanName.toLowerCase().replace(/[^a-z0-9_]/g, ''))
      .replace(/^@/, '')
      .trim();

    if (!cleanUsername) {
      cleanUsername = 'flock_' + Math.floor(1000 + Math.random() * 9000);
    }

    // Ensure username uniqueness
    if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      cleanUsername = `${cleanUsername}_${Math.floor(10 + Math.random() * 90)}`;
    }

    const defaultAvatars = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    ];
    const pickedAvatar = avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newUser: User = {
      id: 'u_' + Date.now(),
      name: cleanName,
      username: cleanUsername,
      email: email ? String(email).trim() : `${cleanUsername}@bellbird.app`,
      avatar: pickedAvatar,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
      bio: `Joined BellBird! Passionate about sharing thoughts with the flock.`,
      location: 'Global Flock',
      website: 'https://bellbird.app',
      followers: 0,
      following: 1,
      isFollowing: false,
      isPremium: false,
      provider: 'normal'
    };

    users.unshift(newUser);
    res.json({ user: newUser, token: 'jwt_' + newUser.id + '_' + Date.now() });
  });

  // Auth: OAuth / Provider Sign-in (Google Gmail, LinkedIn, Zoho Mail)
  app.post('/api/auth/oauth', (req, res) => {
    const { provider, email, name, avatar } = req.body || {};
    if (!provider) {
      return res.status(400).json({ error: 'Provider is required' });
    }

    const cleanEmail = email ? String(email).trim().toLowerCase() : '';

    // Check if user already exists by email
    if (cleanEmail) {
      const existing = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.json({ user: existing, token: 'jwt_' + existing.id + '_' + Date.now() });
      }
    }

    let defaultName = name ? String(name).trim() : '';
    let defaultHandle = '';
    let defaultAvatar = avatar || '';
    let defaultBio = '';

    if (provider === 'google') {
      defaultName = defaultName || (cleanEmail ? cleanEmail.split('@')[0].replace(/[\._]/g, ' ') : 'Google Member');
      defaultHandle = (cleanEmail ? cleanEmail.split('@')[0] : 'google_user').replace(/[^a-z0-9_]/g, '_');
      defaultAvatar = defaultAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
      defaultBio = 'Signed in with Google Gmail. Connected to BellBird.';
    } else if (provider === 'linkedin') {
      defaultName = defaultName || (cleanEmail ? cleanEmail.split('@')[0].replace(/[\._]/g, ' ') : 'LinkedIn Professional');
      defaultHandle = (cleanEmail ? cleanEmail.split('@')[0] : 'linkedin_pro').replace(/[^a-z0-9_]/g, '_');
      defaultAvatar = defaultAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
      defaultBio = 'Professional networking on BellBird via LinkedIn.';
    } else if (provider === 'zoho') {
      defaultName = defaultName || (cleanEmail ? cleanEmail.split('@')[0].replace(/[\._]/g, ' ') : 'Zoho Workspace Member');
      defaultHandle = (cleanEmail ? cleanEmail.split('@')[0] : 'zoho_user').replace(/[^a-z0-9_]/g, '_');
      defaultAvatar = defaultAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';
      defaultBio = 'Zoho Mail user active on BellBird.';
    } else {
      defaultName = defaultName || 'BellBird Member';
      defaultHandle = 'flock_' + Math.floor(Math.random() * 10000);
      defaultAvatar = defaultAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
      defaultBio = 'Exploring the BellBird feed.';
    }

    if (users.some(u => u.username.toLowerCase() === defaultHandle.toLowerCase())) {
      defaultHandle = `${defaultHandle}_${Math.floor(10 + Math.random() * 90)}`;
    }

    const domain = provider === 'google' ? 'gmail.com' : provider === 'zoho' ? 'zohomail.com' : 'linkedin.com';
    const oauthUser: User = {
      id: 'u_' + provider + '_' + Date.now(),
      name: defaultName,
      username: defaultHandle,
      email: cleanEmail || `${defaultHandle}@${domain}`,
      avatar: defaultAvatar,
      coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
      bio: defaultBio,
      location: 'Global',
      website: 'https://bellbird.app',
      followers: 14,
      following: 6,
      isFollowing: false,
      isPremium: false,
      provider: String(provider)
    };

    users.unshift(oauthUser);
    res.json({ user: oauthUser, token: 'jwt_' + oauthUser.id + '_' + Date.now() });
  });

  // Users
  app.get('/api/users', (req, res) => {
    res.json(users);
  });

  app.get('/api/users/:id', (req, res) => {
    const rawId = req.params.id;
    if (!rawId || rawId === 'undefined' || rawId === 'null' || rawId === 'me' || rawId === 'current') {
      return res.json(users[0]);
    }
    const clean = rawId.replace(/^@/, '').toLowerCase().trim();
    const user = users.find(u =>
      u.id === rawId ||
      u.id.toLowerCase() === clean ||
      u.username.toLowerCase() === clean
    ) || users[0];
    res.json(user);
  });

  app.patch('/api/users/:id', (req, res) => {
    const userIndex = users.findIndex(u => u.id === req.params.id);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
    users[userIndex] = { ...users[userIndex], ...req.body };
    res.json(users[userIndex]);
  });

  app.post('/api/users/:id/follow', (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.isFollowing = !user.isFollowing;
    if (user.isFollowing) {
      user.followers += 1;
      // Add a notification for follow
      notifications.unshift({
        id: 'n_' + Date.now(),
        type: 'follow',
        actorId: '1',
        read: false,
        createdAt: new Date().toISOString()
      });
    } else {
      user.followers = Math.max(0, user.followers - 1);
    }
    res.json(user);
  });

  // Search API (all content like Twitter)
  const trendsList = [
    { id: '1', tag: '#bellbird', name: '#BellBird', category: 'Technology · Trending', chirpsCount: 15420 },
    { id: '2', tag: '#react19', name: '#React19', category: 'Software Development', chirpsCount: 28940 },
    { id: '3', tag: '#photography', name: '#Photography', category: 'Visual Arts · Trending', chirpsCount: 42100 },
    { id: '4', tag: '#designsystems', name: '#DesignSystems', category: 'UI/UX Design', chirpsCount: 9780 },
    { id: '5', tag: '#webdev', name: '#WebDev', category: 'Coding · Trending', chirpsCount: 19350 },
    { id: '6', tag: '#minimalism', name: '#Minimalism', category: 'Lifestyle', chirpsCount: 12400 },
  ];

  app.get('/api/search', (req, res) => {
    const rawQuery = (req.query.q as string || '').trim();
    const query = rawQuery.toLowerCase();
    const queryWithoutHash = query.startsWith('#') ? query.slice(1) : query;
    const tab = (req.query.tab as string || 'top').toLowerCase();

    // Matching posts
    let matchingPosts = posts.filter(p => {
      const author = users.find(u => u.id === p.authorId);
      if (!query) return true;
      const contentLower = p.content.toLowerCase();
      const authorNameLower = author?.name.toLowerCase() || '';
      const authorUserLower = author?.username.toLowerCase() || '';

      return contentLower.includes(query) ||
             contentLower.includes(queryWithoutHash) ||
             authorNameLower.includes(query) ||
             authorUserLower.includes(query);
    });

    // Filter by tab
    if (tab === 'media') {
      matchingPosts = matchingPosts.filter(p => !!p.image);
    }

    // Sort matching posts
    if (tab === 'latest') {
      matchingPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Top: sort by engagement (likes * 2 + comments)
      matchingPosts.sort((a, b) => (b.likes * 2 + b.comments) - (a.likes * 2 + a.comments));
    }

    // Matching users
    let matchingUsers = users.filter(u => {
      if (!query) return true;
      const nameMatch = u.name.toLowerCase().includes(query) || u.name.toLowerCase().includes(queryWithoutHash);
      const userMatch = u.username.toLowerCase().includes(query) || u.username.toLowerCase().includes(queryWithoutHash);
      const bioMatch = u.bio.toLowerCase().includes(query) || u.bio.toLowerCase().includes(queryWithoutHash);
      return nameMatch || userMatch || bioMatch;
    });

    res.json({
      query: rawQuery,
      tab,
      posts: matchingPosts.map(populatePost),
      users: matchingUsers,
      trends: trendsList,
      totalCount: matchingPosts.length + matchingUsers.length
    });
  });

  app.get('/api/trends', (req, res) => {
    res.json(trendsList);
  });

  // Posts
  app.get('/api/posts', (req, res) => {
    const sorted = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sorted.map(populatePost));
  });

  app.post('/api/posts', (req, res) => {
    const { content, image, authorId } = req.body;
    const newPost = {
      id: String(Date.now()),
      authorId: authorId || '1',
      content,
      image: image || null,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      likedBy: []
    };
    posts.unshift(newPost);
    res.status(201).json(populatePost(newPost));
  });

  app.post('/api/posts/:id/like', (req, res) => {
    const post = posts.find(p => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    
    // Toggle like for user 1
    const userId = '1';
    const isLiked = post.likedBy.includes(userId);
    
    if (isLiked) {
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }
    
    res.json(populatePost(post));
  });

  // Bookmarks
  app.get('/api/bookmarks', (req, res) => {
    const bookmarkedPosts = posts
      .filter((p) => bookmarkedPostIds.includes(p.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(bookmarkedPosts.map(populatePost));
  });

  app.post('/api/posts/:id/bookmark', (req, res) => {
    const postId = req.params.id;
    const exists = bookmarkedPostIds.includes(postId);
    if (exists) {
      bookmarkedPostIds = bookmarkedPostIds.filter((id) => id !== postId);
    } else {
      bookmarkedPostIds.unshift(postId);
    }
    const post = posts.find((p) => p.id === postId);
    res.json({
      postId,
      isBookmarked: !exists,
      post: post ? populatePost(post) : null,
      bookmarksCount: bookmarkedPostIds.length,
    });
  });

  app.delete('/api/bookmarks', (req, res) => {
    bookmarkedPostIds = [];
    res.json({ success: true, count: 0 });
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    const sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sorted.map(populateNotification));
  });

  app.post('/api/notifications/read', (req, res) => {
    notifications = notifications.map(n => ({ ...n, read: true }));
    res.json({ success: true });
  });

  // Messages
  app.get('/api/messages/:userId', (req, res) => {
    const userId = req.params.userId;
    const chat = messages.filter(m => (m.senderId === userId && m.receiverId === '1') || (m.senderId === '1' && m.receiverId === userId));
    res.json(chat);
  });
  
  app.get('/api/conversations', (req, res) => {
    // For simplicity, just return Jane Doe as a conversation
    res.json([{
      user: users[1],
      lastMessage: messages[messages.length - 1]
    }]);
  });

  app.post('/api/messages', (req, res) => {
    const { receiverId, content, senderId } = req.body;
    const newMessage = {
      id: String(Date.now()),
      senderId: senderId || '1',
      receiverId,
      content,
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    res.status(201).json(newMessage);
  });

  // --- REAL-TIME TRANSLATION (GEMINI 3.8 FLASH + SMART FALLBACK) ---
  const translationCache = new Map<string, string>();
  let rateLimitCooldownUntil = 0;

  const LANGUAGE_NAMES: Record<string, string> = {
    es: 'Spanish (Español)',
    fr: 'French (Français)',
    de: 'German (Deutsch)',
    ja: 'Japanese (日本語)',
    hi: 'Hindi (हिन्दी)',
    zh: 'Chinese (Simplified)',
    ar: 'Arabic (العربية)',
    pt: 'Portuguese (Português)',
    it: 'Italian (Italiano)',
    ko: 'Korean (한국어)',
    ru: 'Russian (Русский)',
    nl: 'Dutch (Nederlands)',
    en: 'English',
  };

  // Pre-seed known posts and bios in key languages for instantaneous responses and zero API calls on initial feed load
  const PRE_TRANSLATED_DATABASE: Record<string, Record<string, string>> = {
    'Golden hour in the city. Loving the warm light bouncing off the glass facades! 📷 #photography #goldenhour': {
      es: 'Hora dorada en la ciudad. ¡Me encanta la luz cálida reflejándose en las fachadas de vidrio! 📷 #photography #goldenhour',
      fr: "L'heure dorée dans la ville. J'adore la lumière chaude qui rebondit sur les façades de verre ! 📷 #photography #goldenhour",
      de: 'Goldene Stunde in der Stadt. Ich liebe das warme Licht, das von den Glasfassaden reflektiert wird! 📷 #photography #goldenhour',
      ja: '街のゴールデンアワー。ガラスのファサードに反射する温かい光が大好きです！ 📷 #photography #goldenhour',
      hi: 'शहर में गोल्डन ऑवर। कांच के अग्रभागों से टकराती गर्म रोशनी बहुत प्यारी लग रही है! 📷 #photography #goldenhour',
      zh: '城市的黄金时刻。超爱反射在玻璃幕墙上的温暖光芒！ 📷 #photography #goldenhour',
      ar: 'الساعة الذهبية في المدينة. أعشق الضوء الدافئ المنعكس على الواجهات الزجاجية! 📷 #photography #goldenhour',
      pt: 'Hora dourada na cidade. Adorando a luz quente refletindo nas fachadas de vidro! 📷 #photography #goldenhour',
      it: "L'ora d'oro in città. Adoro la luce calda che si riflette sulle facciate di vetro! 📷 #photography #goldenhour",
      ko: '도시의 골든 아워. 유리 파사드에 반사되는 따뜻한 빛이 너무 좋아요! 📷 #photography #goldenhour',
      ru: 'Золотой час в городе. Обожаю тёплый свет, отражающийся от стеклянных фасадов! 📷 #photography #goldenhour',
      nl: 'Gouden uur in de stad. Genieten van het warme licht dat weerkaatst op de glazen gevels! 📷 #photography #goldenhour',
      en: 'Golden hour in the city. Loving the warm light bouncing off the glass facades! 📷 #photography #goldenhour',
    },
    'What a beautiful day to write clean TypeScript code. The #bellbird deep navy and blue theme feels so focused and calm! #webdev': {
      es: '¡Qué hermoso día para escribir código TypeScript limpio! El tema azul marino y azul de #bellbird se siente tan concentrado y tranquilo. #webdev',
      fr: 'Quelle belle journée pour écrire du code TypeScript propre. Le thème bleu marine et bleu de #bellbird est tellement concentré et apaisant ! #webdev',
      de: 'Was für ein schöner Tag, um sauberen TypeScript-Code zu schreiben. Das dunkelblaue und blaue Design von #bellbird fühlt sich so fokussiert und ruhig an! #webdev',
      ja: 'クリーンなTypeScriptコードを書くのに最高の日です。#bellbird のディープネイビーとブルーのテーマはとても集中できて落ち着きます！ #webdev',
      hi: 'साफ-सुथरा टाइपस्क्रिप्ट कोड लिखने के लिए कितना सुंदर दिन है। #bellbird का गहरा नौसेना और नीला थीम बहुत केंद्रित और शांत लगता है! #webdev',
      zh: '编写干净的 TypeScript 代码的美好一天。#bellbird 深海军蓝和蓝色主题让人感觉格外专注与沉静！ #webdev',
      ar: 'يا له من يوم جميل لكتابة كود TypeScript نظيف. الثيم الكحلي والأزرق لـ #bellbird يمنح شعوراً بالتركيز والهدوء! #webdev',
      pt: 'Que dia lindo para escrever código TypeScript limpo. O tema marinho e azul escuro do #bellbird é tão focado e tranquilo! #webdev',
      it: 'Che bella giornata per scrivere codice TypeScript pulito. Il tema blu navy e blu di #bellbird sembra così concentrato e calmo! #webdev',
      ko: '깔끔한 TypeScript 코드를 작성하기에 너무 좋은 날입니다. #bellbird 딥 네이비와 블루 테마는 정말 집중력 있고 차분하게 느껴집니다! #webdev',
      ru: 'Прекрасный день для написания чистого кода на TypeScript. Тёмно-синяя тема #bellbird выглядит очень сфокусированной и спокойной! #webdev',
      nl: 'Wat een prachtige dag om schone TypeScript-code te schrijven. Het diepe marineblauwe thema van #bellbird voelt zo gefocust en rustig aan! #webdev',
      en: 'What a beautiful day to write clean TypeScript code. The #bellbird deep navy and blue theme feels so focused and calm! #webdev',
    },
    'Just deployed the new full-text search feature! Now you can find posts, people, hashtags, and media seamlessly like Twitter. Try searching for #bellbird or #react19! 🚀 #updates': {
      es: '¡Acabo de implementar la nueva función de búsqueda de texto completo! Ahora puedes encontrar publicaciones, personas, hashtags y medios sin problemas como Twitter. ¡Prueba a buscar #bellbird o #react19! 🚀 #updates',
      fr: "La nouvelle fonctionnalité de recherche en texte intégral vient d'être déployée ! Vous pouvez désormais trouver facilement des publications, des personnes, des hashtags et des médias comme Twitter. Essayez de rechercher #bellbird ou #react19 ! 🚀 #updates",
      de: 'Die neue Volltextsuche wurde gerade bereitgestellt! Jetzt können Sie Beiträge, Personen, Hashtags und Medien nahtlos wie auf Twitter finden. Probieren Sie die Suche nach #bellbird oder #react19 aus! 🚀 #updates',
      ja: '新しい全文検索機能をデプロイしました！Twitterのように投稿、ユーザー、ハッシュタグ、メディアをシームレスに見つけることができます。#bellbird または #react19 を検索してみてください！ 🚀 #updates',
      hi: 'नया पूर्ण-पाठ खोज फीचर अभी तैनात किया गया है! अब आप ट्विटर की तरह पोस्ट, लोगों, हैशटैग और मीडिया को सहजता से खोज सकते हैं। #bellbird या #react19 खोज कर देखें! 🚀 #updates',
      zh: '刚刚部署了全新的全文搜索功能！现在你可以像 Twitter 一样无缝查找帖子、用户、话题标签和多媒体内容。尝试搜索 #bellbird 或 #react19 吧！ 🚀 #updates',
      ar: 'تم نشر ميزة البحث بالنص الكامل الجديدة للتو! يمكنك الآن العثور على المنشورات والأشخاص والوسوم والوسائط بسلاسة مثل تويتر. جرب البحث عن #bellbird أو #react19! 🚀 #updates',
      pt: 'Acabei de implantar o novo recurso de pesquisa em texto completo! Agora você pode encontrar postagens, pessoas, hashtags e mídias perfeitamente como no Twitter. Experimente pesquisar por #bellbird ou #react19! 🚀 #updates',
      it: 'Appena implementata la nuova funzionalità di ricerca full-text! Ora puoi trovare post, persone, hashtag e media senza problemi come Twitter. Prova a cercare #bellbird o #react19! 🚀 #updates',
      ko: '새로운 전체 텍스트 검색 기능을 배포했습니다! 이제 Twitter처럼 게시물, 사용자, 해시태그, 미디어를 원활하게 찾을 수 있습니다. #bellbird 또는 #react19 를 검색해 보세요! 🚀 #updates',
      ru: 'Только что развернули новый полнотекстовый поиск! Теперь вы можете находить публикации, людей, хештеги и медиафайлы так же легко, как в Twitter. Попробуйте поискать #bellbird или #react19! 🚀 #updates',
      nl: 'Zojuist de nieuwe full-text zoekfunctie uitgerold! Nu kun je naadloos berichten, mensen, hashtags en media vinden zoals op Twitter. Probeer te zoeken naar #bellbird of #react19! 🚀 #updates',
      en: 'Just deployed the new full-text search feature! Now you can find posts, people, hashtags, and media seamlessly like Twitter. Try searching for #bellbird or #react19! 🚀 #updates',
    },
    "Minimalism isn't the lack of something. It's simply the perfect amount of everything. Designing clean touch interfaces for mobile today! #designsystems #minimalism": {
      es: 'El minimalismo no es la falta de algo. Es simplemente la cantidad perfecta de todo. ¡Diseñando interfaces táctiles limpias para móviles hoy! #designsystems #minimalism',
      fr: "Le minimalisme n'est pas le manque de quelque chose. C'est simplement la quantité parfaite de tout. Conception d'interfaces tactiles épurées pour mobile aujourd'hui ! #designsystems #minimalism",
      de: 'Minimalismus ist nicht das Fehlen von etwas. Es ist einfach die perfekte Menge von allem. Heute saubere Touch-Oberflächen für Mobilgeräte gestalten! #designsystems #minimalism',
      ja: 'ミニマリズムとは何かが欠けていることではありません。単にすべての完璧な量のことです。今日はモバイル向けのクリーンなタッチインターフェースをデザインしています！ #designsystems #minimalism',
      hi: 'अल्पवाद किसी चीज़ की कमी नहीं है। यह केवल हर चीज़ की सटीक मात्रा है। आज मोबाइल के लिए स्वच्छ स्पर्श इंटरफेस डिजाइन कर रहे हैं! #designsystems #minimalism',
      zh: '极简主义并非缺乏，而是恰到好处的完美。今天为移动端设计清爽的触控界面！ #designsystems #minimalism',
      ar: 'البساطة ليست غياب الشيء، بل هي ببساطة المقدار المثالي من كل شيء. أصمم واجهات لمسية نظيفة للهواتف اليوم! #designsystems #minimalism',
      pt: 'Minimalismo não é a falta de algo. É simplesmente a quantidade perfeita de tudo. Projetando interfaces de toque limpas para celular hoje! #designsystems #minimalism',
      it: 'Il minimalismo non è la mancanza di qualcosa. È semplicemente la quantità perfetta di tutto. Progettare interfacce touch pulite per dispositivi mobili oggi! #designsystems #minimalism',
      ko: '미니멀리즘은 무언가의 부족이 아닙니다. 단지 모든 것의 완벽한 양일 뿐입니다. 오늘 모바일을 위한 깔끔한 터치 인터페이스를 디자인합니다! #designsystems #minimalism',
      ru: 'Минимализм — это не отсутствие чего-то. Это просто идеальное количество всего. Сегодня проектирую чистые сенсорные интерфейсы для мобильных! #designsystems #minimalism',
      nl: 'Minimalisme is niet het gebrek aan iets. Het is simpelweg de perfecte hoeveelheid van alles. Vandaag schone touch-interfaces voor mobiel ontwerpen! #designsystems #minimalism',
      en: "Minimalism isn't the lack of something. It's simply the perfect amount of everything. Designing clean touch interfaces for mobile today! #designsystems #minimalism",
    },
    'Welcome to BellBird 1.0! Experience real-time chirps, responsive cross-device navigation, and instant content search across the entire flock. #bellbird #technology': {
      es: '¡Bienvenido a BellBird 1.0! Experimenta trinos en tiempo real, navegación adaptable entre dispositivos y búsqueda instantánea de contenido en toda la bandada. #bellbird #technology',
      fr: 'Bienvenue sur BellBird 1.0 ! Découvrez des gazouillis en temps réel, une navigation réactive multi-appareils et une recherche instantanée de contenu dans toute la volée. #bellbird #technology',
      de: 'Willkommen bei BellBird 1.0! Erleben Sie Echtzeit-Chirps, reaktionsschnelle geräteübergreifende Navigation und sofortige Inhaltssuche im gesamten Schwarm. #bellbird #technology',
      ja: 'BellBird 1.0 へようこそ！リアルタイムのチャープ、レスポンシブなクロスデバイスナビゲーション、そして群れ全体のインスタント検索を体験してください。 #bellbird #technology',
      hi: 'BellBird 1.0 में आपका स्वागत है! रीयल-टाइम चहक, उत्तरदायी क्रॉस-डिवाइस नेविगेशन और पूरे झुंड में त्वरित सामग्री खोज का अनुभव करें। #bellbird #technology',
      zh: '欢迎来到 BellBird 1.0！体验即时鸣叫、跨设备自适应导航以及整个鸟群的即时内容检索。 #bellbird #technology',
      ar: 'مرحبًا بكم في BellBird 1.0! جرب التغريدات في الوقت الفعلي والتنقل المتجاوب عبر الأجهزة والبحث الفوري عن المحتوى عبر السرب بأكمله. #bellbird #technology',
      pt: 'Bem-vindo ao BellBird 1.0! Experimente chirps em tempo real, navegação responsiva entre dispositivos e pesquisa instantânea de conteúdo em todo o bando. #bellbird #technology',
      it: 'Benvenuto in BellBird 1.0! Sperimenta cinguettii in tempo reale, navigazione reattiva su tutti i dispositivi e ricerca istantanea di contenuti in tutto lo stormo. #bellbird #technology',
      ko: 'BellBird 1.0에 오신 것을 환영합니다! 실시간 처프, 반응형 크로스 디바이스 내비게이션, 그리고 무리 전체의 즉각적인 콘텐츠 검색을 경험해 보세요. #bellbird #technology',
      ru: 'Добро пожаловать в BellBird 1.0! Оцените чириканье в реальном времени, адаптивную навигацию на всех устройствах и мгновенный поиск контента по всей стае. #bellbird #technology',
      nl: 'Welkom bij BellBird 1.0! Ervaar real-time chirps, responsieve navigatie op verschillende apparaten en direct zoeken naar inhoud binnen de hele zwerm. #bellbird #technology',
      en: 'Welcome to BellBird 1.0! Experience real-time chirps, responsive cross-device navigation, and instant content search across the entire flock. #bellbird #technology',
    },
    'Product designer & creative thinker. Exploring new interfaces.': {
      es: 'Diseñador de producto y pensador creativo. Explorando nuevas interfaces.',
      fr: 'Designer de produit et penseur créatif. Exploration de nouvelles interfaces.',
      de: 'Produktdesigner und kreativer Denker. Erkundung neuer Schnittstellen.',
      ja: 'プロダクトデザイナー兼クリエイティブシンカー。新しいインターフェースを探求中。',
      hi: 'उत्पाद डिज़ाइनर और रचनात्मक विचारक। नए इंटरफ़ेस की खोज।',
      zh: '产品设计师兼创意探索者。探索全新交互界面。',
      ar: 'مصمم منتجات ومفكر إبداعي. استكشاف واجهات جديدة.',
      pt: 'Designer de produtos e pensador criativo. Explorando novas interfaces.',
      it: 'Product designer e pensatore creativo. Esplorazione di nuove interfacce.',
      ko: '프로덕트 디자이너이자 창의적인 사색가. 새로운 인터페이스를 탐구합니다.',
      ru: 'Продуктовый дизайнер и креативный мыслитель. Исследую новые интерфейсы.',
      nl: 'Productontwerper en creatief denker. Nieuwe interfaces verkennen.',
      en: 'Product designer & creative thinker. Exploring new interfaces.',
    },
    'Digital photographer & visual storyteller. Chasing sunsets and city lines.': {
      es: 'Fotógrafo digital y narrador visual. Persiguiendo atardeceres y líneas de la ciudad.',
      fr: 'Photographe numérique et conteur visuel. À la poursuite des couchers de soleil et des lignes urbaines.',
      de: 'Digitalfotograf und visueller Geschichtenerzähler. Auf der Jagd nach Sonnenuntergängen und Stadtlinien.',
      ja: 'デジタルフォトグラファー兼ビジュアルストーリーテラー。夕日と街のラインを追いかけています。',
      hi: 'डिजिटल फोटोग्राफर और दृश्य कहानीकार। सूर्यास्त और शहर की रेखाओं का पीछा।',
      zh: '数码摄影师与视觉叙事者。追逐日落与城市天际线。',
      ar: 'مصور رقمي ورواة بصري. مطاردة غروب الشمس وخطوط المدينة.',
      pt: 'Fotógrafo digital e contador de histórias visual. Perseguindo pores do sol e linhas da cidade.',
      it: 'Fotografo digitale e narratore visivo. Inseguendo tramonti e linee della città.',
      ko: '디지털 사진작가이자 비주얼 스토리텔러. 노을과 도시의 스카이라인을 쫓습니다.',
      ru: 'Цифровой фотограф и визуальный рассказчик. Охочусь за закатами и линиями города.',
      nl: 'Digitaal fotograaf en visueel verhalenverteller. Zonsondergangen en stadslijnen najagen.',
      en: 'Digital photographer & visual storyteller. Chasing sunsets and city lines.',
    },
    'Frontend engineer building with React, Vite & Tailwind. #webdev #react19': {
      es: 'Ingeniero frontend construyendo con React, Vite y Tailwind. #webdev #react19',
      fr: 'Ingénieur frontend développant avec React, Vite & Tailwind. #webdev #react19',
      de: 'Frontend-Entwickler, der mit React, Vite und Tailwind entwickelt. #webdev #react19',
      ja: 'React、Vite、Tailwindで開発するフロントエンドエンジニア。 #webdev #react19',
      hi: 'React, Vite और Tailwind के साथ निर्माण करने वाला फ्रंटएंड इंजीनियर। #webdev #react19',
      zh: '使用 React、Vite 和 Tailwind 构建的前端工程师。 #webdev #react19',
      ar: 'مهندس واجهات أمامية يبني باستخدام React و Vite و Tailwind. #webdev #react19',
      pt: 'Engenheiro frontend construindo com React, Vite e Tailwind. #webdev #react19',
      it: 'Ingegnere frontend che sviluppa con React, Vite e Tailwind. #webdev #react19',
      ko: 'React, Vite, Tailwind로 개발하는 프론트엔드 엔지니어. #webdev #react19',
      ru: 'Frontend-инженер, создающий на React, Vite и Tailwind. #webdev #react19',
      nl: 'Frontend-engineer die bouwt met React, Vite en Tailwind. #webdev #react19',
      en: 'Frontend engineer building with React, Vite & Tailwind. #webdev #react19',
    },
    'Product designer & creative director. Typography, ergonomics, and clean systems. #designsystems': {
      es: 'Diseñadora de productos y directora creativa. Tipografía, ergonomía y sistemas limpios. #designsystems',
      fr: 'Designer produit et directrice artistique. Typographie, ergonomie et systèmes épurés. #designsystems',
      de: 'Produktdesignerin & Kreativdirektorin. Typografie, Ergonomie und saubere Systeme. #designsystems',
      ja: 'プロダクトデザイナー兼クリエイティブディレクター。タイポグラフィ、エルゴノミクス、クリーンなシステム。 #designsystems',
      hi: 'उत्पाद डिज़ाइनर और रचनात्मक निदेशक। टाइपोग्राफी, एर्गोनॉमिक्स और स्वच्छ सिस्टम। #designsystems',
      zh: '产品设计师兼创意总监。字体排版、人机工学与整洁系统。 #designsystems',
      ar: 'مصممة منتجات ومديرة إبداعية. طباعة وبيئة عمل وأنظمة نظيفة. #designsystems',
      pt: 'Designer de produtos e diretora criativa. Tipografia, ergonomia e sistemas limpos. #designsystems',
      it: 'Product designer e direttrice creativa. Tipografia, ergonomia e sistemi puliti. #designsystems',
      ko: '프로덕트 디자이너 겸 크리에이티브 디렉터. 타이포그래피, 인체공학, 깔끔한 시스템. #designsystems',
      ru: 'Продуктовый дизайнер и креативный директор. Типографика, эргономика и чистые системы. #designsystems',
      nl: 'Productontwerper & creatief directeur. Typografie, ergonomie en schone systemen. #designsystems',
      en: 'Product designer & creative director. Typography, ergonomics, and clean systems. #designsystems',
    },
    'The official BellBird account. Welcome to the flock! #bellbird #updates': {
      es: 'La cuenta oficial de BellBird. ¡Bienvenido a la bandada! #bellbird #updates',
      fr: 'Le compte officiel de BellBird. Bienvenue dans la volée ! #bellbird #updates',
      de: 'Das offizielle BellBird-Konto. Willkommen im Schwarm! #bellbird #updates',
      ja: 'BellBird 公式アカウント。群れへようこそ！ #bellbird #updates',
      hi: 'BellBird आधिकारिक खाता। झुंड में आपका स्वागत है! #bellbird #updates',
      zh: 'BellBird 官方账号。欢迎加入鸟群！ #bellbird #updates',
      ar: 'حساب BellBird الرسمي. مرحباً بك في السرب! #bellbird #updates',
      pt: 'A conta oficial do BellBird. Bem-vindo ao bando! #bellbird #updates',
      it: "L'account ufficiale di BellBird. Benvenuto nello stormo! #bellbird #updates",
      ko: 'BellBird 공식 계정입니다. 무리에 오신 것을 환영합니다! #bellbird #updates',
      ru: 'Официальный аккаунт BellBird. Добро пожаловать в стаю! #bellbird #updates',
      nl: 'Het officiële BellBird-account. Welkom bij de zwerm! #bellbird #updates',
      en: 'The official BellBird account. Welcome to the flock! #bellbird #updates',
    },
  };

  // Seed cache on initialization
  for (const [sourceText, langMap] of Object.entries(PRE_TRANSLATED_DATABASE)) {
    for (const [lang, trans] of Object.entries(langMap)) {
      translationCache.set(`${lang}:${sourceText}`, trans);
    }
  }

  // Intelligent fallback translation engine for social posts when Gemini quota limit is reached
  const COMMON_VOCABULARY: Record<string, Record<string, string>> = {
    es: {
      'hello': 'hola', 'hi': 'hola', 'good morning': 'buenos días', 'good night': 'buenas noches',
      'welcome': 'bienvenido', 'love': 'amor', 'loving': 'amando', 'happy': 'feliz', 'great': 'genial',
      'beautiful': 'hermoso', 'amazing': 'increíble', 'awesome': 'asombroso', 'today': 'hoy',
      'tomorrow': 'mañana', 'yesterday': 'ayer', 'city': 'ciudad', 'light': 'luz', 'code': 'código',
      'clean': 'limpio', 'new': 'nuevo', 'feature': 'función', 'search': 'búsqueda', 'posts': 'publicaciones',
      'people': 'personas', 'flock': 'bandada', 'explore': 'explorar', 'design': 'diseño', 'work': 'trabajo',
      'team': 'equipo', 'coffee': 'café', 'photo': 'foto', 'camera': 'cámara', 'sky': 'cielo',
      'sunset': 'atardecer', 'peace': 'paz', 'quiet': 'tranquilo', 'developer': 'desarrollador',
    },
    fr: {
      'hello': 'bonjour', 'hi': 'salut', 'good morning': 'bonjour', 'good night': 'bonne nuit',
      'welcome': 'bienvenue', 'love': 'amour', 'loving': 'adorant', 'happy': 'heureux', 'great': 'génial',
      'beautiful': 'magnifique', 'amazing': 'incroyable', 'awesome': 'impressionnant', 'today': "aujourd'hui",
      'tomorrow': 'demain', 'yesterday': 'hier', 'city': 'ville', 'light': 'lumière', 'code': 'code',
      'clean': 'propre', 'new': 'nouveau', 'feature': 'fonctionnalité', 'search': 'recherche', 'posts': 'publications',
      'people': 'personnes', 'flock': 'volée', 'explore': 'explorer', 'design': 'conception', 'work': 'travail',
    },
    de: {
      'hello': 'hallo', 'hi': 'hallo', 'welcome': 'willkommen', 'happy': 'glücklich', 'great': 'großartig',
      'beautiful': 'wunderschön', 'amazing': 'erstaunlich', 'today': 'heute', 'city': 'Stadt', 'light': 'Licht',
      'code': 'Code', 'clean': 'sauber', 'new': 'neu', 'feature': 'Funktion', 'search': 'Suche',
    },
    ja: {
      'hello': 'こんにちは', 'welcome': 'ようこそ', 'happy': '嬉しい', 'great': '素晴らしい',
      'beautiful': '美しい', 'amazing': '驚き', 'today': '今日', 'city': '都市', 'light': '光',
      'code': 'コード', 'clean': 'クリーン', 'new': '新しい', 'feature': '機能', 'search': '検索',
    },
    zh: {
      'hello': '你好', 'welcome': '欢迎', 'happy': '开心', 'great': '太棒了',
      'beautiful': '美丽', 'amazing': '令人惊叹', 'today': '今天', 'city': '城市', 'light': '光芒',
      'code': '代码', 'clean': '整洁', 'new': '全新', 'feature': '功能', 'search': '搜索',
    },
    pt: {
      'hello': 'olá', 'welcome': 'bem-vindo', 'happy': 'feliz', 'great': 'ótimo',
      'beautiful': 'lindo', 'amazing': 'incrível', 'today': 'hoje', 'city': 'cidade', 'light': 'luz',
      'code': 'código', 'clean': 'limpo', 'new': 'novo', 'feature': 'recurso', 'search': 'busca',
    },
    it: {
      'hello': 'ciao', 'welcome': 'benvenuto', 'happy': 'felice', 'great': 'fantastico',
      'beautiful': 'bellissimo', 'amazing': 'incredibile', 'today': 'oggi', 'city': 'città', 'light': 'luce',
      'code': 'codice', 'clean': 'pulito', 'new': 'nuovo', 'feature': 'funzionalità', 'search': 'cerca',
    },
    ko: {
      'hello': '안녕하세요', 'welcome': '환영합니다', 'happy': '행복한', 'great': '멋진',
      'beautiful': '아름다운', 'amazing': '놀라운', 'today': '오늘', 'city': '도시', 'light': '빛',
      'code': '코드', 'clean': '깔끔한', 'new': '새로운', 'feature': '기능', 'search': '검색',
    },
    ru: {
      'hello': 'привет', 'welcome': 'добро пожаловать', 'happy': 'счастлив', 'great': 'отлично',
      'beautiful': 'прекрасно', 'amazing': 'потрясающе', 'today': 'сегодня', 'city': 'город', 'light': 'свет',
      'code': 'код', 'clean': 'чистый', 'new': 'новый', 'feature': 'функция', 'search': 'поиск',
    },
  };

  const smartFallbackTranslate = (text: string, targetLanguage: string): string => {
    // If target language is english, return text
    if (targetLanguage === 'en') return text;

    // Check pre-translated database first
    if (PRE_TRANSLATED_DATABASE[text]?.[targetLanguage]) {
      return PRE_TRANSLATED_DATABASE[text][targetLanguage];
    }

    // Split words while preserving hashtags (#tag), mentions (@user), emojis, and urls
    const vocab = COMMON_VOCABULARY[targetLanguage] || {};
    const tokens = text.split(/(\s+|[.,!?;:()]+|#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+|https?:\/\/\S+)/g);

    let translated = tokens.map((tok) => {
      if (!tok || tok.startsWith('#') || tok.startsWith('@') || tok.startsWith('http')) {
        return tok;
      }
      const lower = tok.toLowerCase();
      if (vocab[lower]) {
        // preserve capitalization
        if (tok[0] === tok[0].toUpperCase()) {
          return vocab[lower].charAt(0).toUpperCase() + vocab[lower].slice(1);
        }
        return vocab[lower];
      }
      return tok;
    }).join('');

    // If no vocabulary match was made and text is untranslated, append subtle locale indicator
    return translated || text;
  };

  app.post('/api/translate', async (req, res) => {
    try {
      const { text, targetLanguage = 'es' } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.json({ originalText: '', translatedText: '', targetLanguage });
      }

      const trimmed = text.trim();
      const cacheKey = `${targetLanguage}:${trimmed}`;

      // Return instant cached translation
      if (translationCache.has(cacheKey)) {
        return res.json({
          originalText: trimmed,
          translatedText: translationCache.get(cacheKey),
          targetLanguage,
          cached: true,
        });
      }

      // Check pre-translated static content
      if (PRE_TRANSLATED_DATABASE[trimmed]?.[targetLanguage]) {
        const trans = PRE_TRANSLATED_DATABASE[trimmed][targetLanguage];
        translationCache.set(cacheKey, trans);
        return res.json({
          originalText: trimmed,
          translatedText: trans,
          targetLanguage,
          pretranslated: true,
        });
      }

      // If currently within a rate limit cooldown window or AI client is unavailable,
      // smoothly serve smart local fallback without triggering 429 quota exhaustion.
      const now = Date.now();
      if (!ai || now < rateLimitCooldownUntil) {
        const fallbackText = smartFallbackTranslate(trimmed, targetLanguage);
        translationCache.set(cacheKey, fallbackText);
        return res.json({
          originalText: trimmed,
          translatedText: fallbackText,
          targetLanguage,
          cooldown: now < rateLimitCooldownUntil,
          fallback: true,
        });
      }

      const langName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
      const prompt = `You are a real-time translation system for the BellBird social network.
Translate the following user text naturally into ${langName}.

Rules:
1. Preserve all emojis, whitespace, @mentions, #hashtags, and links exactly.
2. Maintain natural colloquial phrasing and tone appropriate for social media.
3. Return ONLY the translated text without surrounding quotes, explanation, language tags, or preface.

Text to translate:
${trimmed}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const translatedText = response.text?.trim() || trimmed;
        translationCache.set(cacheKey, translatedText);

        return res.json({
          originalText: trimmed,
          translatedText,
          targetLanguage,
          model: 'gemini-3.8-flash',
        });
      } catch (geminiErr: any) {
        const errMsg = String(geminiErr?.message || geminiErr);
        const isQuotaExceeded =
          geminiErr?.status === 'RESOURCE_EXHAUSTED' ||
          geminiErr?.code === 429 ||
          errMsg.includes('429') ||
          errMsg.includes('quota') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isQuotaExceeded) {
          // Activate 30-second cooldown so subsequent requests use smart fallback
          rateLimitCooldownUntil = Date.now() + 30000;
          console.warn('[Translate] Gemini free-tier quota reached (429); active cooldown engaged for 30s. Using local smart translation engine.');
        } else {
          console.warn('[Translate] Upstream translation warning:', errMsg.slice(0, 150));
        }

        const fallbackText = smartFallbackTranslate(trimmed, targetLanguage);
        translationCache.set(cacheKey, fallbackText);

        return res.json({
          originalText: trimmed,
          translatedText: fallbackText,
          targetLanguage,
          fallback: true,
        });
      }
    } catch (err: any) {
      console.warn('[Translate] Handled error in translation router:', err?.message || err);
      const fallbackText = smartFallbackTranslate(req.body?.text || '', req.body?.targetLanguage || 'es');
      return res.json({
        originalText: req.body?.text || '',
        translatedText: fallbackText,
        targetLanguage: req.body?.targetLanguage || 'es',
        fallback: true,
      });
    }
  });

  // Health check endpoint for Cloud Run and container rollout probes
  app.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });

  // --- VITE MIDDLEWARE (DEV) / STATIC ASSETS (PROD) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    const clientPath = path.resolve(distPath, 'client');
    const staticRoot = fs.existsSync(clientPath) ? clientPath : distPath;
    const indexPath = fs.existsSync(path.join(staticRoot, 'index.html'))
      ? path.join(staticRoot, 'index.html')
      : path.join(distPath, 'index.html');

    app.use(express.static(staticRoot));
    // Express 5 catch-all SPA routing: use middleware without '*' string pattern
    app.use((_req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
