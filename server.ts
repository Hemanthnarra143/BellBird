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
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
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

  // --- REAL-TIME TRANSLATION (GEMINI 3.8 FLASH) ---
  const translationCache = new Map<string, string>();

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

      const langName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

      if (!ai) {
        // Fallback without failing if API key not available
        return res.json({
          originalText: trimmed,
          translatedText: trimmed,
          targetLanguage,
          note: 'API key not configured',
        });
      }

      const prompt = `You are a real-time translation system for the BellBird social network.
Translate the following user text naturally into ${langName}.

Rules:
1. Preserve all emojis, whitespace, @mentions, #hashtags, and links exactly.
2. Maintain natural colloquial phrasing and tone appropriate for social media.
3. Return ONLY the translated text without surrounding quotes, explanation, language tags, or preface.

Text to translate:
${trimmed}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const translatedText = response.text?.trim() || trimmed;
      translationCache.set(cacheKey, translatedText);

      res.json({
        originalText: trimmed,
        translatedText,
        targetLanguage,
        model: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.error('Translation error:', err?.message || err);
      res.json({
        originalText: req.body.text || '',
        translatedText: req.body.text || '',
        targetLanguage: req.body.targetLanguage || 'es',
        error: true,
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
