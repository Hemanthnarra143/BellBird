// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  let users = [
    {
      id: "1",
      username: "bellbird_user",
      name: "BellBird User",
      email: "demo@bellbird.app",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
      bio: "Exploring the world one chirp at a time. #technology #minimalism",
      location: "San Francisco, CA",
      website: "https://bellbird.app",
      followers: 120,
      following: 85,
      isFollowing: false
    },
    {
      id: "2",
      username: "jane_doe",
      name: "Jane Doe",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
      bio: "Photography enthusiast & visual storyteller. Capturing everyday moments. #photography",
      location: "New York, NY",
      website: "https://janedoe.photos",
      followers: 245,
      following: 140,
      isFollowing: true
    },
    {
      id: "3",
      username: "alex_dev",
      name: "Alex Rivera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
      bio: "Frontend engineer building with React, Vite & Tailwind. #webdev #react19",
      location: "Seattle, WA",
      website: "https://alexrivera.codes",
      followers: 1820,
      following: 430,
      isFollowing: false
    },
    {
      id: "4",
      username: "sarah_design",
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200",
      bio: "Product designer & creative director. Typography, ergonomics, and clean systems. #designsystems",
      location: "London, UK",
      website: "https://sarahchen.design",
      followers: 3100,
      following: 290,
      isFollowing: false
    },
    {
      id: "5",
      username: "bellbird_hq",
      name: "BellBird Official",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
      coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200",
      bio: "The official BellBird account. Welcome to the flock! #bellbird #updates",
      location: "Global / Decentralized",
      website: "https://bellbird.app",
      followers: 15400,
      following: 18,
      isFollowing: true,
      isPremium: true
    }
  ];
  let posts = [
    { id: "101", authorId: "2", content: "Golden hour in the city. Loving the warm light bouncing off the glass facades! \u{1F4F7} #photography #goldenhour", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800", likes: 24, comments: 6, createdAt: new Date(Date.now() - 36e5).toISOString(), likedBy: ["1"] },
    { id: "102", authorId: "1", content: "What a beautiful day to write clean TypeScript code. The #bellbird deep navy and blue theme feels so focused and calm! #webdev", image: null, likes: 12, comments: 4, createdAt: new Date(Date.now() - 72e5).toISOString(), likedBy: [] },
    { id: "103", authorId: "3", content: "Just deployed the new full-text search feature! Now you can find posts, people, hashtags, and media seamlessly like Twitter. Try searching for #bellbird or #react19! \u{1F680} #updates", image: null, likes: 48, comments: 11, createdAt: new Date(Date.now() - 144e5).toISOString(), likedBy: ["1", "2"] },
    { id: "104", authorId: "4", content: "Minimalism isn't the lack of something. It's simply the perfect amount of everything. Designing clean touch interfaces for mobile today! #designsystems #minimalism", image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800", likes: 35, comments: 8, createdAt: new Date(Date.now() - 288e5).toISOString(), likedBy: ["3"] },
    { id: "105", authorId: "5", content: "Welcome to BellBird 1.0! Experience real-time chirps, responsive cross-device navigation, and instant content search across the entire flock. #bellbird #technology", image: null, likes: 92, comments: 19, createdAt: new Date(Date.now() - 432e5).toISOString(), likedBy: ["1", "2", "3", "4"] }
  ];
  let notifications = [
    { id: "n1", type: "like", actorId: "2", postId: "102", read: false, createdAt: new Date(Date.now() - 18e5).toISOString() },
    { id: "n2", type: "follow", actorId: "3", read: false, createdAt: new Date(Date.now() - 36e5).toISOString() },
    { id: "n3", type: "follow", actorId: "2", read: true, createdAt: new Date(Date.now() - 864e5).toISOString() }
  ];
  let messages = [
    { id: "m1", senderId: "2", receiverId: "1", content: "Hey! Welcome to BellBird!", createdAt: new Date(Date.now() - 864e5).toISOString() }
  ];
  let bookmarkedPostIds = ["101", "103"];
  const populatePost = (post) => ({
    ...post,
    author: users.find((u) => u.id === post.authorId),
    isBookmarked: bookmarkedPostIds.includes(post.id)
  });
  const populateNotification = (notif) => ({
    ...notif,
    actor: users.find((u) => u.id === notif.actorId),
    post: notif.postId ? posts.find((p) => p.id === notif.postId) : null
  });
  app.post("/api/auth/login", (req, res) => {
    const { emailOrUsername, password } = req.body || {};
    if (!emailOrUsername || emailOrUsername === "demo@bellbird.app" || emailOrUsername === "bellbird_user") {
      const demoUser = users.find((u) => u.username === "bellbird_user") || users[0];
      return res.json({ user: demoUser, token: "mock-jwt-token" });
    }
    const clean = String(emailOrUsername).trim().toLowerCase().replace(/^@/, "");
    const found = users.find(
      (u) => u.username.toLowerCase() === clean || u.email && u.email.toLowerCase() === clean
    );
    if (found) {
      return res.json({ user: found, token: "jwt_" + found.id + "_" + Date.now() });
    }
    return res.status(401).json({ error: "No account found with this email or username. Please join or check credentials." });
  });
  app.post("/api/auth/register", (req, res) => {
    const { name, username, email, avatar } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Full name is required" });
    }
    const cleanName = String(name).trim();
    let cleanUsername = (username ? String(username) : cleanName.toLowerCase().replace(/[^a-z0-9_]/g, "")).replace(/^@/, "").trim();
    if (!cleanUsername) {
      cleanUsername = "flock_" + Math.floor(1e3 + Math.random() * 9e3);
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      cleanUsername = `${cleanUsername}_${Math.floor(10 + Math.random() * 90)}`;
    }
    const defaultAvatars = [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    ];
    const pickedAvatar = avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];
    const newUser = {
      id: "u_" + Date.now(),
      name: cleanName,
      username: cleanUsername,
      email: email ? String(email).trim() : `${cleanUsername}@bellbird.app`,
      avatar: pickedAvatar,
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
      bio: `Joined BellBird! Passionate about sharing thoughts with the flock.`,
      location: "Global Flock",
      website: "https://bellbird.app",
      followers: 0,
      following: 1,
      isFollowing: false,
      isPremium: false,
      provider: "normal"
    };
    users.unshift(newUser);
    res.json({ user: newUser, token: "jwt_" + newUser.id + "_" + Date.now() });
  });
  app.post("/api/auth/oauth", (req, res) => {
    const { provider, email, name, avatar } = req.body || {};
    if (!provider) {
      return res.status(400).json({ error: "Provider is required" });
    }
    const cleanEmail = email ? String(email).trim().toLowerCase() : "";
    if (cleanEmail) {
      const existing = users.find((u) => u.email && u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.json({ user: existing, token: "jwt_" + existing.id + "_" + Date.now() });
      }
    }
    let defaultName = name ? String(name).trim() : "";
    let defaultHandle = "";
    let defaultAvatar = avatar || "";
    let defaultBio = "";
    if (provider === "google") {
      defaultName = defaultName || (cleanEmail ? cleanEmail.split("@")[0].replace(/[\._]/g, " ") : "Google Member");
      defaultHandle = (cleanEmail ? cleanEmail.split("@")[0] : "google_user").replace(/[^a-z0-9_]/g, "_");
      defaultAvatar = defaultAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
      defaultBio = "Signed in with Google Gmail. Connected to BellBird.";
    } else if (provider === "linkedin") {
      defaultName = defaultName || (cleanEmail ? cleanEmail.split("@")[0].replace(/[\._]/g, " ") : "LinkedIn Professional");
      defaultHandle = (cleanEmail ? cleanEmail.split("@")[0] : "linkedin_pro").replace(/[^a-z0-9_]/g, "_");
      defaultAvatar = defaultAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";
      defaultBio = "Professional networking on BellBird via LinkedIn.";
    } else if (provider === "zoho") {
      defaultName = defaultName || (cleanEmail ? cleanEmail.split("@")[0].replace(/[\._]/g, " ") : "Zoho Workspace Member");
      defaultHandle = (cleanEmail ? cleanEmail.split("@")[0] : "zoho_user").replace(/[^a-z0-9_]/g, "_");
      defaultAvatar = defaultAvatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150";
      defaultBio = "Zoho Mail user active on BellBird.";
    } else {
      defaultName = defaultName || "BellBird Member";
      defaultHandle = "flock_" + Math.floor(Math.random() * 1e4);
      defaultAvatar = defaultAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
      defaultBio = "Exploring the BellBird feed.";
    }
    if (users.some((u) => u.username.toLowerCase() === defaultHandle.toLowerCase())) {
      defaultHandle = `${defaultHandle}_${Math.floor(10 + Math.random() * 90)}`;
    }
    const domain = provider === "google" ? "gmail.com" : provider === "zoho" ? "zohomail.com" : "linkedin.com";
    const oauthUser = {
      id: "u_" + provider + "_" + Date.now(),
      name: defaultName,
      username: defaultHandle,
      email: cleanEmail || `${defaultHandle}@${domain}`,
      avatar: defaultAvatar,
      coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200",
      bio: defaultBio,
      location: "Global",
      website: "https://bellbird.app",
      followers: 14,
      following: 6,
      isFollowing: false,
      isPremium: false,
      provider: String(provider)
    };
    users.unshift(oauthUser);
    res.json({ user: oauthUser, token: "jwt_" + oauthUser.id + "_" + Date.now() });
  });
  app.get("/api/users", (req, res) => {
    res.json(users);
  });
  app.get("/api/users/:id", (req, res) => {
    const rawId = req.params.id;
    if (!rawId || rawId === "undefined" || rawId === "null" || rawId === "me" || rawId === "current") {
      return res.json(users[0]);
    }
    const clean = rawId.replace(/^@/, "").toLowerCase().trim();
    const user = users.find(
      (u) => u.id === rawId || u.id.toLowerCase() === clean || u.username.toLowerCase() === clean
    ) || users[0];
    res.json(user);
  });
  app.patch("/api/users/:id", (req, res) => {
    const userIndex = users.findIndex((u) => u.id === req.params.id);
    if (userIndex === -1) return res.status(404).json({ error: "User not found" });
    users[userIndex] = { ...users[userIndex], ...req.body };
    res.json(users[userIndex]);
  });
  app.post("/api/users/:id/follow", (req, res) => {
    const user = users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.isFollowing = !user.isFollowing;
    if (user.isFollowing) {
      user.followers += 1;
      notifications.unshift({
        id: "n_" + Date.now(),
        type: "follow",
        actorId: "1",
        read: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } else {
      user.followers = Math.max(0, user.followers - 1);
    }
    res.json(user);
  });
  const trendsList = [
    { id: "1", tag: "#bellbird", name: "#BellBird", category: "Technology \xB7 Trending", chirpsCount: 15420 },
    { id: "2", tag: "#react19", name: "#React19", category: "Software Development", chirpsCount: 28940 },
    { id: "3", tag: "#photography", name: "#Photography", category: "Visual Arts \xB7 Trending", chirpsCount: 42100 },
    { id: "4", tag: "#designsystems", name: "#DesignSystems", category: "UI/UX Design", chirpsCount: 9780 },
    { id: "5", tag: "#webdev", name: "#WebDev", category: "Coding \xB7 Trending", chirpsCount: 19350 },
    { id: "6", tag: "#minimalism", name: "#Minimalism", category: "Lifestyle", chirpsCount: 12400 }
  ];
  app.get("/api/search", (req, res) => {
    const rawQuery = (req.query.q || "").trim();
    const query = rawQuery.toLowerCase();
    const queryWithoutHash = query.startsWith("#") ? query.slice(1) : query;
    const tab = (req.query.tab || "top").toLowerCase();
    let matchingPosts = posts.filter((p) => {
      const author = users.find((u) => u.id === p.authorId);
      if (!query) return true;
      const contentLower = p.content.toLowerCase();
      const authorNameLower = author?.name.toLowerCase() || "";
      const authorUserLower = author?.username.toLowerCase() || "";
      return contentLower.includes(query) || contentLower.includes(queryWithoutHash) || authorNameLower.includes(query) || authorUserLower.includes(query);
    });
    if (tab === "media") {
      matchingPosts = matchingPosts.filter((p) => !!p.image);
    }
    if (tab === "latest") {
      matchingPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      matchingPosts.sort((a, b) => b.likes * 2 + b.comments - (a.likes * 2 + a.comments));
    }
    let matchingUsers = users.filter((u) => {
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
  app.get("/api/trends", (req, res) => {
    res.json(trendsList);
  });
  app.get("/api/posts", (req, res) => {
    const sorted = [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sorted.map(populatePost));
  });
  app.post("/api/posts", (req, res) => {
    const { content, image, authorId } = req.body;
    const newPost = {
      id: String(Date.now()),
      authorId: authorId || "1",
      content,
      image: image || null,
      likes: 0,
      comments: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      likedBy: []
    };
    posts.unshift(newPost);
    res.status(201).json(populatePost(newPost));
  });
  app.post("/api/posts/:id/like", (req, res) => {
    const post = posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });
    const userId = "1";
    const isLiked = post.likedBy.includes(userId);
    if (isLiked) {
      post.likedBy = post.likedBy.filter((id) => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }
    res.json(populatePost(post));
  });
  app.get("/api/bookmarks", (req, res) => {
    const bookmarkedPosts = posts.filter((p) => bookmarkedPostIds.includes(p.id)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(bookmarkedPosts.map(populatePost));
  });
  app.post("/api/posts/:id/bookmark", (req, res) => {
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
      bookmarksCount: bookmarkedPostIds.length
    });
  });
  app.delete("/api/bookmarks", (req, res) => {
    bookmarkedPostIds = [];
    res.json({ success: true, count: 0 });
  });
  app.get("/api/notifications", (req, res) => {
    const sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sorted.map(populateNotification));
  });
  app.post("/api/notifications/read", (req, res) => {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    res.json({ success: true });
  });
  app.get("/api/messages/:userId", (req, res) => {
    const userId = req.params.userId;
    const chat = messages.filter((m) => m.senderId === userId && m.receiverId === "1" || m.senderId === "1" && m.receiverId === userId);
    res.json(chat);
  });
  app.get("/api/conversations", (req, res) => {
    res.json([{
      user: users[1],
      lastMessage: messages[messages.length - 1]
    }]);
  });
  app.post("/api/messages", (req, res) => {
    const { receiverId, content, senderId } = req.body;
    const newMessage = {
      id: String(Date.now()),
      senderId: senderId || "1",
      receiverId,
      content,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    messages.push(newMessage);
    res.status(201).json(newMessage);
  });
  const translationCache = /* @__PURE__ */ new Map();
  let rateLimitCooldownUntil = 0;
  const LANGUAGE_NAMES = {
    es: "Spanish (Espa\xF1ol)",
    fr: "French (Fran\xE7ais)",
    de: "German (Deutsch)",
    ja: "Japanese (\u65E5\u672C\u8A9E)",
    hi: "Hindi (\u0939\u093F\u0928\u094D\u0926\u0940)",
    zh: "Chinese (Simplified)",
    ar: "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629)",
    pt: "Portuguese (Portugu\xEAs)",
    it: "Italian (Italiano)",
    ko: "Korean (\uD55C\uAD6D\uC5B4)",
    ru: "Russian (\u0420\u0443\u0441\u0441\u043A\u0438\u0439)",
    nl: "Dutch (Nederlands)",
    en: "English"
  };
  const PRE_TRANSLATED_DATABASE = {
    "Golden hour in the city. Loving the warm light bouncing off the glass facades! \u{1F4F7} #photography #goldenhour": {
      es: "Hora dorada en la ciudad. \xA1Me encanta la luz c\xE1lida reflej\xE1ndose en las fachadas de vidrio! \u{1F4F7} #photography #goldenhour",
      fr: "L'heure dor\xE9e dans la ville. J'adore la lumi\xE8re chaude qui rebondit sur les fa\xE7ades de verre ! \u{1F4F7} #photography #goldenhour",
      de: "Goldene Stunde in der Stadt. Ich liebe das warme Licht, das von den Glasfassaden reflektiert wird! \u{1F4F7} #photography #goldenhour",
      ja: "\u8857\u306E\u30B4\u30FC\u30EB\u30C7\u30F3\u30A2\u30EF\u30FC\u3002\u30AC\u30E9\u30B9\u306E\u30D5\u30A1\u30B5\u30FC\u30C9\u306B\u53CD\u5C04\u3059\u308B\u6E29\u304B\u3044\u5149\u304C\u5927\u597D\u304D\u3067\u3059\uFF01 \u{1F4F7} #photography #goldenhour",
      hi: "\u0936\u0939\u0930 \u092E\u0947\u0902 \u0917\u094B\u0932\u094D\u0921\u0928 \u0911\u0935\u0930\u0964 \u0915\u093E\u0902\u091A \u0915\u0947 \u0905\u0917\u094D\u0930\u092D\u093E\u0917\u094B\u0902 \u0938\u0947 \u091F\u0915\u0930\u093E\u0924\u0940 \u0917\u0930\u094D\u092E \u0930\u094B\u0936\u0928\u0940 \u092C\u0939\u0941\u0924 \u092A\u094D\u092F\u093E\u0930\u0940 \u0932\u0917 \u0930\u0939\u0940 \u0939\u0948! \u{1F4F7} #photography #goldenhour",
      zh: "\u57CE\u5E02\u7684\u9EC4\u91D1\u65F6\u523B\u3002\u8D85\u7231\u53CD\u5C04\u5728\u73BB\u7483\u5E55\u5899\u4E0A\u7684\u6E29\u6696\u5149\u8292\uFF01 \u{1F4F7} #photography #goldenhour",
      ar: "\u0627\u0644\u0633\u0627\u0639\u0629 \u0627\u0644\u0630\u0647\u0628\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u062F\u064A\u0646\u0629. \u0623\u0639\u0634\u0642 \u0627\u0644\u0636\u0648\u0621 \u0627\u0644\u062F\u0627\u0641\u0626 \u0627\u0644\u0645\u0646\u0639\u0643\u0633 \u0639\u0644\u0649 \u0627\u0644\u0648\u0627\u062C\u0647\u0627\u062A \u0627\u0644\u0632\u062C\u0627\u062C\u064A\u0629! \u{1F4F7} #photography #goldenhour",
      pt: "Hora dourada na cidade. Adorando a luz quente refletindo nas fachadas de vidro! \u{1F4F7} #photography #goldenhour",
      it: "L'ora d'oro in citt\xE0. Adoro la luce calda che si riflette sulle facciate di vetro! \u{1F4F7} #photography #goldenhour",
      ko: "\uB3C4\uC2DC\uC758 \uACE8\uB4E0 \uC544\uC6CC. \uC720\uB9AC \uD30C\uC0AC\uB4DC\uC5D0 \uBC18\uC0AC\uB418\uB294 \uB530\uB73B\uD55C \uBE5B\uC774 \uB108\uBB34 \uC88B\uC544\uC694! \u{1F4F7} #photography #goldenhour",
      ru: "\u0417\u043E\u043B\u043E\u0442\u043E\u0439 \u0447\u0430\u0441 \u0432 \u0433\u043E\u0440\u043E\u0434\u0435. \u041E\u0431\u043E\u0436\u0430\u044E \u0442\u0451\u043F\u043B\u044B\u0439 \u0441\u0432\u0435\u0442, \u043E\u0442\u0440\u0430\u0436\u0430\u044E\u0449\u0438\u0439\u0441\u044F \u043E\u0442 \u0441\u0442\u0435\u043A\u043B\u044F\u043D\u043D\u044B\u0445 \u0444\u0430\u0441\u0430\u0434\u043E\u0432! \u{1F4F7} #photography #goldenhour",
      nl: "Gouden uur in de stad. Genieten van het warme licht dat weerkaatst op de glazen gevels! \u{1F4F7} #photography #goldenhour",
      en: "Golden hour in the city. Loving the warm light bouncing off the glass facades! \u{1F4F7} #photography #goldenhour"
    },
    "What a beautiful day to write clean TypeScript code. The #bellbird deep navy and blue theme feels so focused and calm! #webdev": {
      es: "\xA1Qu\xE9 hermoso d\xEDa para escribir c\xF3digo TypeScript limpio! El tema azul marino y azul de #bellbird se siente tan concentrado y tranquilo. #webdev",
      fr: "Quelle belle journ\xE9e pour \xE9crire du code TypeScript propre. Le th\xE8me bleu marine et bleu de #bellbird est tellement concentr\xE9 et apaisant ! #webdev",
      de: "Was f\xFCr ein sch\xF6ner Tag, um sauberen TypeScript-Code zu schreiben. Das dunkelblaue und blaue Design von #bellbird f\xFChlt sich so fokussiert und ruhig an! #webdev",
      ja: "\u30AF\u30EA\u30FC\u30F3\u306ATypeScript\u30B3\u30FC\u30C9\u3092\u66F8\u304F\u306E\u306B\u6700\u9AD8\u306E\u65E5\u3067\u3059\u3002#bellbird \u306E\u30C7\u30A3\u30FC\u30D7\u30CD\u30A4\u30D3\u30FC\u3068\u30D6\u30EB\u30FC\u306E\u30C6\u30FC\u30DE\u306F\u3068\u3066\u3082\u96C6\u4E2D\u3067\u304D\u3066\u843D\u3061\u7740\u304D\u307E\u3059\uFF01 #webdev",
      hi: "\u0938\u093E\u092B-\u0938\u0941\u0925\u0930\u093E \u091F\u093E\u0907\u092A\u0938\u094D\u0915\u094D\u0930\u093F\u092A\u094D\u091F \u0915\u094B\u0921 \u0932\u093F\u0916\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0915\u093F\u0924\u0928\u093E \u0938\u0941\u0902\u0926\u0930 \u0926\u093F\u0928 \u0939\u0948\u0964 #bellbird \u0915\u093E \u0917\u0939\u0930\u093E \u0928\u094C\u0938\u0947\u0928\u093E \u0914\u0930 \u0928\u0940\u0932\u093E \u0925\u0940\u092E \u092C\u0939\u0941\u0924 \u0915\u0947\u0902\u0926\u094D\u0930\u093F\u0924 \u0914\u0930 \u0936\u093E\u0902\u0924 \u0932\u0917\u0924\u093E \u0939\u0948! #webdev",
      zh: "\u7F16\u5199\u5E72\u51C0\u7684 TypeScript \u4EE3\u7801\u7684\u7F8E\u597D\u4E00\u5929\u3002#bellbird \u6DF1\u6D77\u519B\u84DD\u548C\u84DD\u8272\u4E3B\u9898\u8BA9\u4EBA\u611F\u89C9\u683C\u5916\u4E13\u6CE8\u4E0E\u6C89\u9759\uFF01 #webdev",
      ar: "\u064A\u0627 \u0644\u0647 \u0645\u0646 \u064A\u0648\u0645 \u062C\u0645\u064A\u0644 \u0644\u0643\u062A\u0627\u0628\u0629 \u0643\u0648\u062F TypeScript \u0646\u0638\u064A\u0641. \u0627\u0644\u062B\u064A\u0645 \u0627\u0644\u0643\u062D\u0644\u064A \u0648\u0627\u0644\u0623\u0632\u0631\u0642 \u0644\u0640 #bellbird \u064A\u0645\u0646\u062D \u0634\u0639\u0648\u0631\u0627\u064B \u0628\u0627\u0644\u062A\u0631\u0643\u064A\u0632 \u0648\u0627\u0644\u0647\u062F\u0648\u0621! #webdev",
      pt: "Que dia lindo para escrever c\xF3digo TypeScript limpo. O tema marinho e azul escuro do #bellbird \xE9 t\xE3o focado e tranquilo! #webdev",
      it: "Che bella giornata per scrivere codice TypeScript pulito. Il tema blu navy e blu di #bellbird sembra cos\xEC concentrato e calmo! #webdev",
      ko: "\uAE54\uB054\uD55C TypeScript \uCF54\uB4DC\uB97C \uC791\uC131\uD558\uAE30\uC5D0 \uB108\uBB34 \uC88B\uC740 \uB0A0\uC785\uB2C8\uB2E4. #bellbird \uB525 \uB124\uC774\uBE44\uC640 \uBE14\uB8E8 \uD14C\uB9C8\uB294 \uC815\uB9D0 \uC9D1\uC911\uB825 \uC788\uACE0 \uCC28\uBD84\uD558\uAC8C \uB290\uAEF4\uC9D1\uB2C8\uB2E4! #webdev",
      ru: "\u041F\u0440\u0435\u043A\u0440\u0430\u0441\u043D\u044B\u0439 \u0434\u0435\u043D\u044C \u0434\u043B\u044F \u043D\u0430\u043F\u0438\u0441\u0430\u043D\u0438\u044F \u0447\u0438\u0441\u0442\u043E\u0433\u043E \u043A\u043E\u0434\u0430 \u043D\u0430 TypeScript. \u0422\u0451\u043C\u043D\u043E-\u0441\u0438\u043D\u044F\u044F \u0442\u0435\u043C\u0430 #bellbird \u0432\u044B\u0433\u043B\u044F\u0434\u0438\u0442 \u043E\u0447\u0435\u043D\u044C \u0441\u0444\u043E\u043A\u0443\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0439 \u0438 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E\u0439! #webdev",
      nl: "Wat een prachtige dag om schone TypeScript-code te schrijven. Het diepe marineblauwe thema van #bellbird voelt zo gefocust en rustig aan! #webdev",
      en: "What a beautiful day to write clean TypeScript code. The #bellbird deep navy and blue theme feels so focused and calm! #webdev"
    },
    "Just deployed the new full-text search feature! Now you can find posts, people, hashtags, and media seamlessly like Twitter. Try searching for #bellbird or #react19! \u{1F680} #updates": {
      es: "\xA1Acabo de implementar la nueva funci\xF3n de b\xFAsqueda de texto completo! Ahora puedes encontrar publicaciones, personas, hashtags y medios sin problemas como Twitter. \xA1Prueba a buscar #bellbird o #react19! \u{1F680} #updates",
      fr: "La nouvelle fonctionnalit\xE9 de recherche en texte int\xE9gral vient d'\xEAtre d\xE9ploy\xE9e ! Vous pouvez d\xE9sormais trouver facilement des publications, des personnes, des hashtags et des m\xE9dias comme Twitter. Essayez de rechercher #bellbird ou #react19 ! \u{1F680} #updates",
      de: "Die neue Volltextsuche wurde gerade bereitgestellt! Jetzt k\xF6nnen Sie Beitr\xE4ge, Personen, Hashtags und Medien nahtlos wie auf Twitter finden. Probieren Sie die Suche nach #bellbird oder #react19 aus! \u{1F680} #updates",
      ja: "\u65B0\u3057\u3044\u5168\u6587\u691C\u7D22\u6A5F\u80FD\u3092\u30C7\u30D7\u30ED\u30A4\u3057\u307E\u3057\u305F\uFF01Twitter\u306E\u3088\u3046\u306B\u6295\u7A3F\u3001\u30E6\u30FC\u30B6\u30FC\u3001\u30CF\u30C3\u30B7\u30E5\u30BF\u30B0\u3001\u30E1\u30C7\u30A3\u30A2\u3092\u30B7\u30FC\u30E0\u30EC\u30B9\u306B\u898B\u3064\u3051\u308B\u3053\u3068\u304C\u3067\u304D\u307E\u3059\u3002#bellbird \u307E\u305F\u306F #react19 \u3092\u691C\u7D22\u3057\u3066\u307F\u3066\u304F\u3060\u3055\u3044\uFF01 \u{1F680} #updates",
      hi: "\u0928\u092F\u093E \u092A\u0942\u0930\u094D\u0923-\u092A\u093E\u0920 \u0916\u094B\u091C \u092B\u0940\u091A\u0930 \u0905\u092D\u0940 \u0924\u0948\u0928\u093E\u0924 \u0915\u093F\u092F\u093E \u0917\u092F\u093E \u0939\u0948! \u0905\u092C \u0906\u092A \u091F\u094D\u0935\u093F\u091F\u0930 \u0915\u0940 \u0924\u0930\u0939 \u092A\u094B\u0938\u094D\u091F, \u0932\u094B\u0917\u094B\u0902, \u0939\u0948\u0936\u091F\u0948\u0917 \u0914\u0930 \u092E\u0940\u0921\u093F\u092F\u093E \u0915\u094B \u0938\u0939\u091C\u0924\u093E \u0938\u0947 \u0916\u094B\u091C \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964 #bellbird \u092F\u093E #react19 \u0916\u094B\u091C \u0915\u0930 \u0926\u0947\u0916\u0947\u0902! \u{1F680} #updates",
      zh: "\u521A\u521A\u90E8\u7F72\u4E86\u5168\u65B0\u7684\u5168\u6587\u641C\u7D22\u529F\u80FD\uFF01\u73B0\u5728\u4F60\u53EF\u4EE5\u50CF Twitter \u4E00\u6837\u65E0\u7F1D\u67E5\u627E\u5E16\u5B50\u3001\u7528\u6237\u3001\u8BDD\u9898\u6807\u7B7E\u548C\u591A\u5A92\u4F53\u5185\u5BB9\u3002\u5C1D\u8BD5\u641C\u7D22 #bellbird \u6216 #react19 \u5427\uFF01 \u{1F680} #updates",
      ar: "\u062A\u0645 \u0646\u0634\u0631 \u0645\u064A\u0632\u0629 \u0627\u0644\u0628\u062D\u062B \u0628\u0627\u0644\u0646\u0635 \u0627\u0644\u0643\u0627\u0645\u0644 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0644\u0644\u062A\u0648! \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0646\u0634\u0648\u0631\u0627\u062A \u0648\u0627\u0644\u0623\u0634\u062E\u0627\u0635 \u0648\u0627\u0644\u0648\u0633\u0648\u0645 \u0648\u0627\u0644\u0648\u0633\u0627\u0626\u0637 \u0628\u0633\u0644\u0627\u0633\u0629 \u0645\u062B\u0644 \u062A\u0648\u064A\u062A\u0631. \u062C\u0631\u0628 \u0627\u0644\u0628\u062D\u062B \u0639\u0646 #bellbird \u0623\u0648 #react19! \u{1F680} #updates",
      pt: "Acabei de implantar o novo recurso de pesquisa em texto completo! Agora voc\xEA pode encontrar postagens, pessoas, hashtags e m\xEDdias perfeitamente como no Twitter. Experimente pesquisar por #bellbird ou #react19! \u{1F680} #updates",
      it: "Appena implementata la nuova funzionalit\xE0 di ricerca full-text! Ora puoi trovare post, persone, hashtag e media senza problemi come Twitter. Prova a cercare #bellbird o #react19! \u{1F680} #updates",
      ko: "\uC0C8\uB85C\uC6B4 \uC804\uCCB4 \uD14D\uC2A4\uD2B8 \uAC80\uC0C9 \uAE30\uB2A5\uC744 \uBC30\uD3EC\uD588\uC2B5\uB2C8\uB2E4! \uC774\uC81C Twitter\uCC98\uB7FC \uAC8C\uC2DC\uBB3C, \uC0AC\uC6A9\uC790, \uD574\uC2DC\uD0DC\uADF8, \uBBF8\uB514\uC5B4\uB97C \uC6D0\uD65C\uD558\uAC8C \uCC3E\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4. #bellbird \uB610\uB294 #react19 \uB97C \uAC80\uC0C9\uD574 \uBCF4\uC138\uC694! \u{1F680} #updates",
      ru: "\u0422\u043E\u043B\u044C\u043A\u043E \u0447\u0442\u043E \u0440\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u043B\u0438 \u043D\u043E\u0432\u044B\u0439 \u043F\u043E\u043B\u043D\u043E\u0442\u0435\u043A\u0441\u0442\u043E\u0432\u044B\u0439 \u043F\u043E\u0438\u0441\u043A! \u0422\u0435\u043F\u0435\u0440\u044C \u0432\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u044C \u043F\u0443\u0431\u043B\u0438\u043A\u0430\u0446\u0438\u0438, \u043B\u044E\u0434\u0435\u0439, \u0445\u0435\u0448\u0442\u0435\u0433\u0438 \u0438 \u043C\u0435\u0434\u0438\u0430\u0444\u0430\u0439\u043B\u044B \u0442\u0430\u043A \u0436\u0435 \u043B\u0435\u0433\u043A\u043E, \u043A\u0430\u043A \u0432 Twitter. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u043E\u0438\u0441\u043A\u0430\u0442\u044C #bellbird \u0438\u043B\u0438 #react19! \u{1F680} #updates",
      nl: "Zojuist de nieuwe full-text zoekfunctie uitgerold! Nu kun je naadloos berichten, mensen, hashtags en media vinden zoals op Twitter. Probeer te zoeken naar #bellbird of #react19! \u{1F680} #updates",
      en: "Just deployed the new full-text search feature! Now you can find posts, people, hashtags, and media seamlessly like Twitter. Try searching for #bellbird or #react19! \u{1F680} #updates"
    },
    "Minimalism isn't the lack of something. It's simply the perfect amount of everything. Designing clean touch interfaces for mobile today! #designsystems #minimalism": {
      es: "El minimalismo no es la falta de algo. Es simplemente la cantidad perfecta de todo. \xA1Dise\xF1ando interfaces t\xE1ctiles limpias para m\xF3viles hoy! #designsystems #minimalism",
      fr: "Le minimalisme n'est pas le manque de quelque chose. C'est simplement la quantit\xE9 parfaite de tout. Conception d'interfaces tactiles \xE9pur\xE9es pour mobile aujourd'hui ! #designsystems #minimalism",
      de: "Minimalismus ist nicht das Fehlen von etwas. Es ist einfach die perfekte Menge von allem. Heute saubere Touch-Oberfl\xE4chen f\xFCr Mobilger\xE4te gestalten! #designsystems #minimalism",
      ja: "\u30DF\u30CB\u30DE\u30EA\u30BA\u30E0\u3068\u306F\u4F55\u304B\u304C\u6B20\u3051\u3066\u3044\u308B\u3053\u3068\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u5358\u306B\u3059\u3079\u3066\u306E\u5B8C\u74A7\u306A\u91CF\u306E\u3053\u3068\u3067\u3059\u3002\u4ECA\u65E5\u306F\u30E2\u30D0\u30A4\u30EB\u5411\u3051\u306E\u30AF\u30EA\u30FC\u30F3\u306A\u30BF\u30C3\u30C1\u30A4\u30F3\u30BF\u30FC\u30D5\u30A7\u30FC\u30B9\u3092\u30C7\u30B6\u30A4\u30F3\u3057\u3066\u3044\u307E\u3059\uFF01 #designsystems #minimalism",
      hi: "\u0905\u0932\u094D\u092A\u0935\u093E\u0926 \u0915\u093F\u0938\u0940 \u091A\u0940\u091C\u093C \u0915\u0940 \u0915\u092E\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u092F\u0939 \u0915\u0947\u0935\u0932 \u0939\u0930 \u091A\u0940\u091C\u093C \u0915\u0940 \u0938\u091F\u0940\u0915 \u092E\u093E\u0924\u094D\u0930\u093E \u0939\u0948\u0964 \u0906\u091C \u092E\u094B\u092C\u093E\u0907\u0932 \u0915\u0947 \u0932\u093F\u090F \u0938\u094D\u0935\u091A\u094D\u091B \u0938\u094D\u092A\u0930\u094D\u0936 \u0907\u0902\u091F\u0930\u092B\u0947\u0938 \u0921\u093F\u091C\u093E\u0907\u0928 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902! #designsystems #minimalism",
      zh: "\u6781\u7B80\u4E3B\u4E49\u5E76\u975E\u7F3A\u4E4F\uFF0C\u800C\u662F\u6070\u5230\u597D\u5904\u7684\u5B8C\u7F8E\u3002\u4ECA\u5929\u4E3A\u79FB\u52A8\u7AEF\u8BBE\u8BA1\u6E05\u723D\u7684\u89E6\u63A7\u754C\u9762\uFF01 #designsystems #minimalism",
      ar: "\u0627\u0644\u0628\u0633\u0627\u0637\u0629 \u0644\u064A\u0633\u062A \u063A\u064A\u0627\u0628 \u0627\u0644\u0634\u064A\u0621\u060C \u0628\u0644 \u0647\u064A \u0628\u0628\u0633\u0627\u0637\u0629 \u0627\u0644\u0645\u0642\u062F\u0627\u0631 \u0627\u0644\u0645\u062B\u0627\u0644\u064A \u0645\u0646 \u0643\u0644 \u0634\u064A\u0621. \u0623\u0635\u0645\u0645 \u0648\u0627\u062C\u0647\u0627\u062A \u0644\u0645\u0633\u064A\u0629 \u0646\u0638\u064A\u0641\u0629 \u0644\u0644\u0647\u0648\u0627\u062A\u0641 \u0627\u0644\u064A\u0648\u0645! #designsystems #minimalism",
      pt: "Minimalismo n\xE3o \xE9 a falta de algo. \xC9 simplesmente a quantidade perfeita de tudo. Projetando interfaces de toque limpas para celular hoje! #designsystems #minimalism",
      it: "Il minimalismo non \xE8 la mancanza di qualcosa. \xC8 semplicemente la quantit\xE0 perfetta di tutto. Progettare interfacce touch pulite per dispositivi mobili oggi! #designsystems #minimalism",
      ko: "\uBBF8\uB2C8\uBA40\uB9AC\uC998\uC740 \uBB34\uC5B8\uAC00\uC758 \uBD80\uC871\uC774 \uC544\uB2D9\uB2C8\uB2E4. \uB2E8\uC9C0 \uBAA8\uB4E0 \uAC83\uC758 \uC644\uBCBD\uD55C \uC591\uC77C \uBFD0\uC785\uB2C8\uB2E4. \uC624\uB298 \uBAA8\uBC14\uC77C\uC744 \uC704\uD55C \uAE54\uB054\uD55C \uD130\uCE58 \uC778\uD130\uD398\uC774\uC2A4\uB97C \uB514\uC790\uC778\uD569\uB2C8\uB2E4! #designsystems #minimalism",
      ru: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u0438\u0437\u043C \u2014 \u044D\u0442\u043E \u043D\u0435 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u0435 \u0447\u0435\u0433\u043E-\u0442\u043E. \u042D\u0442\u043E \u043F\u0440\u043E\u0441\u0442\u043E \u0438\u0434\u0435\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0432\u0441\u0435\u0433\u043E. \u0421\u0435\u0433\u043E\u0434\u043D\u044F \u043F\u0440\u043E\u0435\u043A\u0442\u0438\u0440\u0443\u044E \u0447\u0438\u0441\u0442\u044B\u0435 \u0441\u0435\u043D\u0441\u043E\u0440\u043D\u044B\u0435 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u044B \u0434\u043B\u044F \u043C\u043E\u0431\u0438\u043B\u044C\u043D\u044B\u0445! #designsystems #minimalism",
      nl: "Minimalisme is niet het gebrek aan iets. Het is simpelweg de perfecte hoeveelheid van alles. Vandaag schone touch-interfaces voor mobiel ontwerpen! #designsystems #minimalism",
      en: "Minimalism isn't the lack of something. It's simply the perfect amount of everything. Designing clean touch interfaces for mobile today! #designsystems #minimalism"
    },
    "Welcome to BellBird 1.0! Experience real-time chirps, responsive cross-device navigation, and instant content search across the entire flock. #bellbird #technology": {
      es: "\xA1Bienvenido a BellBird 1.0! Experimenta trinos en tiempo real, navegaci\xF3n adaptable entre dispositivos y b\xFAsqueda instant\xE1nea de contenido en toda la bandada. #bellbird #technology",
      fr: "Bienvenue sur BellBird 1.0 ! D\xE9couvrez des gazouillis en temps r\xE9el, une navigation r\xE9active multi-appareils et une recherche instantan\xE9e de contenu dans toute la vol\xE9e. #bellbird #technology",
      de: "Willkommen bei BellBird 1.0! Erleben Sie Echtzeit-Chirps, reaktionsschnelle ger\xE4te\xFCbergreifende Navigation und sofortige Inhaltssuche im gesamten Schwarm. #bellbird #technology",
      ja: "BellBird 1.0 \u3078\u3088\u3046\u3053\u305D\uFF01\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u306E\u30C1\u30E3\u30FC\u30D7\u3001\u30EC\u30B9\u30DD\u30F3\u30B7\u30D6\u306A\u30AF\u30ED\u30B9\u30C7\u30D0\u30A4\u30B9\u30CA\u30D3\u30B2\u30FC\u30B7\u30E7\u30F3\u3001\u305D\u3057\u3066\u7FA4\u308C\u5168\u4F53\u306E\u30A4\u30F3\u30B9\u30BF\u30F3\u30C8\u691C\u7D22\u3092\u4F53\u9A13\u3057\u3066\u304F\u3060\u3055\u3044\u3002 #bellbird #technology",
      hi: "BellBird 1.0 \u092E\u0947\u0902 \u0906\u092A\u0915\u093E \u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948! \u0930\u0940\u092F\u0932-\u091F\u093E\u0907\u092E \u091A\u0939\u0915, \u0909\u0924\u094D\u0924\u0930\u0926\u093E\u092F\u0940 \u0915\u094D\u0930\u0949\u0938-\u0921\u093F\u0935\u093E\u0907\u0938 \u0928\u0947\u0935\u093F\u0917\u0947\u0936\u0928 \u0914\u0930 \u092A\u0942\u0930\u0947 \u091D\u0941\u0902\u0921 \u092E\u0947\u0902 \u0924\u094D\u0935\u0930\u093F\u0924 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0916\u094B\u091C \u0915\u093E \u0905\u0928\u0941\u092D\u0935 \u0915\u0930\u0947\u0902\u0964 #bellbird #technology",
      zh: "\u6B22\u8FCE\u6765\u5230 BellBird 1.0\uFF01\u4F53\u9A8C\u5373\u65F6\u9E23\u53EB\u3001\u8DE8\u8BBE\u5907\u81EA\u9002\u5E94\u5BFC\u822A\u4EE5\u53CA\u6574\u4E2A\u9E1F\u7FA4\u7684\u5373\u65F6\u5185\u5BB9\u68C0\u7D22\u3002 #bellbird #technology",
      ar: "\u0645\u0631\u062D\u0628\u064B\u0627 \u0628\u0643\u0645 \u0641\u064A BellBird 1.0! \u062C\u0631\u0628 \u0627\u0644\u062A\u063A\u0631\u064A\u062F\u0627\u062A \u0641\u064A \u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0641\u0639\u0644\u064A \u0648\u0627\u0644\u062A\u0646\u0642\u0644 \u0627\u0644\u0645\u062A\u062C\u0627\u0648\u0628 \u0639\u0628\u0631 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0648\u0627\u0644\u0628\u062D\u062B \u0627\u0644\u0641\u0648\u0631\u064A \u0639\u0646 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0639\u0628\u0631 \u0627\u0644\u0633\u0631\u0628 \u0628\u0623\u0643\u0645\u0644\u0647. #bellbird #technology",
      pt: "Bem-vindo ao BellBird 1.0! Experimente chirps em tempo real, navega\xE7\xE3o responsiva entre dispositivos e pesquisa instant\xE2nea de conte\xFAdo em todo o bando. #bellbird #technology",
      it: "Benvenuto in BellBird 1.0! Sperimenta cinguettii in tempo reale, navigazione reattiva su tutti i dispositivi e ricerca istantanea di contenuti in tutto lo stormo. #bellbird #technology",
      ko: "BellBird 1.0\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4! \uC2E4\uC2DC\uAC04 \uCC98\uD504, \uBC18\uC751\uD615 \uD06C\uB85C\uC2A4 \uB514\uBC14\uC774\uC2A4 \uB0B4\uBE44\uAC8C\uC774\uC158, \uADF8\uB9AC\uACE0 \uBB34\uB9AC \uC804\uCCB4\uC758 \uC989\uAC01\uC801\uC778 \uCF58\uD150\uCE20 \uAC80\uC0C9\uC744 \uACBD\uD5D8\uD574 \uBCF4\uC138\uC694. #bellbird #technology",
      ru: "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 BellBird 1.0! \u041E\u0446\u0435\u043D\u0438\u0442\u0435 \u0447\u0438\u0440\u0438\u043A\u0430\u043D\u044C\u0435 \u0432 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u0440\u0435\u043C\u0435\u043D\u0438, \u0430\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u0443\u044E \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044E \u043D\u0430 \u0432\u0441\u0435\u0445 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430\u0445 \u0438 \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u044B\u0439 \u043F\u043E\u0438\u0441\u043A \u043A\u043E\u043D\u0442\u0435\u043D\u0442\u0430 \u043F\u043E \u0432\u0441\u0435\u0439 \u0441\u0442\u0430\u0435. #bellbird #technology",
      nl: "Welkom bij BellBird 1.0! Ervaar real-time chirps, responsieve navigatie op verschillende apparaten en direct zoeken naar inhoud binnen de hele zwerm. #bellbird #technology",
      en: "Welcome to BellBird 1.0! Experience real-time chirps, responsive cross-device navigation, and instant content search across the entire flock. #bellbird #technology"
    },
    "Product designer & creative thinker. Exploring new interfaces.": {
      es: "Dise\xF1ador de producto y pensador creativo. Explorando nuevas interfaces.",
      fr: "Designer de produit et penseur cr\xE9atif. Exploration de nouvelles interfaces.",
      de: "Produktdesigner und kreativer Denker. Erkundung neuer Schnittstellen.",
      ja: "\u30D7\u30ED\u30C0\u30AF\u30C8\u30C7\u30B6\u30A4\u30CA\u30FC\u517C\u30AF\u30EA\u30A8\u30A4\u30C6\u30A3\u30D6\u30B7\u30F3\u30AB\u30FC\u3002\u65B0\u3057\u3044\u30A4\u30F3\u30BF\u30FC\u30D5\u30A7\u30FC\u30B9\u3092\u63A2\u6C42\u4E2D\u3002",
      hi: "\u0909\u0924\u094D\u092A\u093E\u0926 \u0921\u093F\u091C\u093C\u093E\u0907\u0928\u0930 \u0914\u0930 \u0930\u091A\u0928\u093E\u0924\u094D\u092E\u0915 \u0935\u093F\u091A\u093E\u0930\u0915\u0964 \u0928\u090F \u0907\u0902\u091F\u0930\u092B\u093C\u0947\u0938 \u0915\u0940 \u0916\u094B\u091C\u0964",
      zh: "\u4EA7\u54C1\u8BBE\u8BA1\u5E08\u517C\u521B\u610F\u63A2\u7D22\u8005\u3002\u63A2\u7D22\u5168\u65B0\u4EA4\u4E92\u754C\u9762\u3002",
      ar: "\u0645\u0635\u0645\u0645 \u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0645\u0641\u0643\u0631 \u0625\u0628\u062F\u0627\u0639\u064A. \u0627\u0633\u062A\u0643\u0634\u0627\u0641 \u0648\u0627\u062C\u0647\u0627\u062A \u062C\u062F\u064A\u062F\u0629.",
      pt: "Designer de produtos e pensador criativo. Explorando novas interfaces.",
      it: "Product designer e pensatore creativo. Esplorazione di nuove interfacce.",
      ko: "\uD504\uB85C\uB355\uD2B8 \uB514\uC790\uC774\uB108\uC774\uC790 \uCC3D\uC758\uC801\uC778 \uC0AC\uC0C9\uAC00. \uC0C8\uB85C\uC6B4 \uC778\uD130\uD398\uC774\uC2A4\uB97C \uD0D0\uAD6C\uD569\uB2C8\uB2E4.",
      ru: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432\u044B\u0439 \u0434\u0438\u0437\u0430\u0439\u043D\u0435\u0440 \u0438 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u043C\u044B\u0441\u043B\u0438\u0442\u0435\u043B\u044C. \u0418\u0441\u0441\u043B\u0435\u0434\u0443\u044E \u043D\u043E\u0432\u044B\u0435 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u044B.",
      nl: "Productontwerper en creatief denker. Nieuwe interfaces verkennen.",
      en: "Product designer & creative thinker. Exploring new interfaces."
    },
    "Digital photographer & visual storyteller. Chasing sunsets and city lines.": {
      es: "Fot\xF3grafo digital y narrador visual. Persiguiendo atardeceres y l\xEDneas de la ciudad.",
      fr: "Photographe num\xE9rique et conteur visuel. \xC0 la poursuite des couchers de soleil et des lignes urbaines.",
      de: "Digitalfotograf und visueller Geschichtenerz\xE4hler. Auf der Jagd nach Sonnenunterg\xE4ngen und Stadtlinien.",
      ja: "\u30C7\u30B8\u30BF\u30EB\u30D5\u30A9\u30C8\u30B0\u30E9\u30D5\u30A1\u30FC\u517C\u30D3\u30B8\u30E5\u30A2\u30EB\u30B9\u30C8\u30FC\u30EA\u30FC\u30C6\u30E9\u30FC\u3002\u5915\u65E5\u3068\u8857\u306E\u30E9\u30A4\u30F3\u3092\u8FFD\u3044\u304B\u3051\u3066\u3044\u307E\u3059\u3002",
      hi: "\u0921\u093F\u091C\u093F\u091F\u0932 \u092B\u094B\u091F\u094B\u0917\u094D\u0930\u093E\u092B\u0930 \u0914\u0930 \u0926\u0943\u0936\u094D\u092F \u0915\u0939\u093E\u0928\u0940\u0915\u093E\u0930\u0964 \u0938\u0942\u0930\u094D\u092F\u093E\u0938\u094D\u0924 \u0914\u0930 \u0936\u0939\u0930 \u0915\u0940 \u0930\u0947\u0916\u093E\u0913\u0902 \u0915\u093E \u092A\u0940\u091B\u093E\u0964",
      zh: "\u6570\u7801\u6444\u5F71\u5E08\u4E0E\u89C6\u89C9\u53D9\u4E8B\u8005\u3002\u8FFD\u9010\u65E5\u843D\u4E0E\u57CE\u5E02\u5929\u9645\u7EBF\u3002",
      ar: "\u0645\u0635\u0648\u0631 \u0631\u0642\u0645\u064A \u0648\u0631\u0648\u0627\u0629 \u0628\u0635\u0631\u064A. \u0645\u0637\u0627\u0631\u062F\u0629 \u063A\u0631\u0648\u0628 \u0627\u0644\u0634\u0645\u0633 \u0648\u062E\u0637\u0648\u0637 \u0627\u0644\u0645\u062F\u064A\u0646\u0629.",
      pt: "Fot\xF3grafo digital e contador de hist\xF3rias visual. Perseguindo pores do sol e linhas da cidade.",
      it: "Fotografo digitale e narratore visivo. Inseguendo tramonti e linee della citt\xE0.",
      ko: "\uB514\uC9C0\uD138 \uC0AC\uC9C4\uC791\uAC00\uC774\uC790 \uBE44\uC8FC\uC5BC \uC2A4\uD1A0\uB9AC\uD154\uB7EC. \uB178\uC744\uACFC \uB3C4\uC2DC\uC758 \uC2A4\uCE74\uC774\uB77C\uC778\uC744 \uCAD3\uC2B5\uB2C8\uB2E4.",
      ru: "\u0426\u0438\u0444\u0440\u043E\u0432\u043E\u0439 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444 \u0438 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0430\u0441\u0441\u043A\u0430\u0437\u0447\u0438\u043A. \u041E\u0445\u043E\u0447\u0443\u0441\u044C \u0437\u0430 \u0437\u0430\u043A\u0430\u0442\u0430\u043C\u0438 \u0438 \u043B\u0438\u043D\u0438\u044F\u043C\u0438 \u0433\u043E\u0440\u043E\u0434\u0430.",
      nl: "Digitaal fotograaf en visueel verhalenverteller. Zonsondergangen en stadslijnen najagen.",
      en: "Digital photographer & visual storyteller. Chasing sunsets and city lines."
    },
    "Frontend engineer building with React, Vite & Tailwind. #webdev #react19": {
      es: "Ingeniero frontend construyendo con React, Vite y Tailwind. #webdev #react19",
      fr: "Ing\xE9nieur frontend d\xE9veloppant avec React, Vite & Tailwind. #webdev #react19",
      de: "Frontend-Entwickler, der mit React, Vite und Tailwind entwickelt. #webdev #react19",
      ja: "React\u3001Vite\u3001Tailwind\u3067\u958B\u767A\u3059\u308B\u30D5\u30ED\u30F3\u30C8\u30A8\u30F3\u30C9\u30A8\u30F3\u30B8\u30CB\u30A2\u3002 #webdev #react19",
      hi: "React, Vite \u0914\u0930 Tailwind \u0915\u0947 \u0938\u093E\u0925 \u0928\u093F\u0930\u094D\u092E\u093E\u0923 \u0915\u0930\u0928\u0947 \u0935\u093E\u0932\u093E \u092B\u094D\u0930\u0902\u091F\u090F\u0902\u0921 \u0907\u0902\u091C\u0940\u0928\u093F\u092F\u0930\u0964 #webdev #react19",
      zh: "\u4F7F\u7528 React\u3001Vite \u548C Tailwind \u6784\u5EFA\u7684\u524D\u7AEF\u5DE5\u7A0B\u5E08\u3002 #webdev #react19",
      ar: "\u0645\u0647\u0646\u062F\u0633 \u0648\u0627\u062C\u0647\u0627\u062A \u0623\u0645\u0627\u0645\u064A\u0629 \u064A\u0628\u0646\u064A \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 React \u0648 Vite \u0648 Tailwind. #webdev #react19",
      pt: "Engenheiro frontend construindo com React, Vite e Tailwind. #webdev #react19",
      it: "Ingegnere frontend che sviluppa con React, Vite e Tailwind. #webdev #react19",
      ko: "React, Vite, Tailwind\uB85C \uAC1C\uBC1C\uD558\uB294 \uD504\uB860\uD2B8\uC5D4\uB4DC \uC5D4\uC9C0\uB2C8\uC5B4. #webdev #react19",
      ru: "Frontend-\u0438\u043D\u0436\u0435\u043D\u0435\u0440, \u0441\u043E\u0437\u0434\u0430\u044E\u0449\u0438\u0439 \u043D\u0430 React, Vite \u0438 Tailwind. #webdev #react19",
      nl: "Frontend-engineer die bouwt met React, Vite en Tailwind. #webdev #react19",
      en: "Frontend engineer building with React, Vite & Tailwind. #webdev #react19"
    },
    "Product designer & creative director. Typography, ergonomics, and clean systems. #designsystems": {
      es: "Dise\xF1adora de productos y directora creativa. Tipograf\xEDa, ergonom\xEDa y sistemas limpios. #designsystems",
      fr: "Designer produit et directrice artistique. Typographie, ergonomie et syst\xE8mes \xE9pur\xE9s. #designsystems",
      de: "Produktdesignerin & Kreativdirektorin. Typografie, Ergonomie und saubere Systeme. #designsystems",
      ja: "\u30D7\u30ED\u30C0\u30AF\u30C8\u30C7\u30B6\u30A4\u30CA\u30FC\u517C\u30AF\u30EA\u30A8\u30A4\u30C6\u30A3\u30D6\u30C7\u30A3\u30EC\u30AF\u30BF\u30FC\u3002\u30BF\u30A4\u30DD\u30B0\u30E9\u30D5\u30A3\u3001\u30A8\u30EB\u30B4\u30CE\u30DF\u30AF\u30B9\u3001\u30AF\u30EA\u30FC\u30F3\u306A\u30B7\u30B9\u30C6\u30E0\u3002 #designsystems",
      hi: "\u0909\u0924\u094D\u092A\u093E\u0926 \u0921\u093F\u091C\u093C\u093E\u0907\u0928\u0930 \u0914\u0930 \u0930\u091A\u0928\u093E\u0924\u094D\u092E\u0915 \u0928\u093F\u0926\u0947\u0936\u0915\u0964 \u091F\u093E\u0907\u092A\u094B\u0917\u094D\u0930\u093E\u092B\u0940, \u090F\u0930\u094D\u0917\u094B\u0928\u0949\u092E\u093F\u0915\u094D\u0938 \u0914\u0930 \u0938\u094D\u0935\u091A\u094D\u091B \u0938\u093F\u0938\u094D\u091F\u092E\u0964 #designsystems",
      zh: "\u4EA7\u54C1\u8BBE\u8BA1\u5E08\u517C\u521B\u610F\u603B\u76D1\u3002\u5B57\u4F53\u6392\u7248\u3001\u4EBA\u673A\u5DE5\u5B66\u4E0E\u6574\u6D01\u7CFB\u7EDF\u3002 #designsystems",
      ar: "\u0645\u0635\u0645\u0645\u0629 \u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0645\u062F\u064A\u0631\u0629 \u0625\u0628\u062F\u0627\u0639\u064A\u0629. \u0637\u0628\u0627\u0639\u0629 \u0648\u0628\u064A\u0626\u0629 \u0639\u0645\u0644 \u0648\u0623\u0646\u0638\u0645\u0629 \u0646\u0638\u064A\u0641\u0629. #designsystems",
      pt: "Designer de produtos e diretora criativa. Tipografia, ergonomia e sistemas limpos. #designsystems",
      it: "Product designer e direttrice creativa. Tipografia, ergonomia e sistemi puliti. #designsystems",
      ko: "\uD504\uB85C\uB355\uD2B8 \uB514\uC790\uC774\uB108 \uACB8 \uD06C\uB9AC\uC5D0\uC774\uD2F0\uBE0C \uB514\uB809\uD130. \uD0C0\uC774\uD3EC\uADF8\uB798\uD53C, \uC778\uCCB4\uACF5\uD559, \uAE54\uB054\uD55C \uC2DC\uC2A4\uD15C. #designsystems",
      ru: "\u041F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432\u044B\u0439 \u0434\u0438\u0437\u0430\u0439\u043D\u0435\u0440 \u0438 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440. \u0422\u0438\u043F\u043E\u0433\u0440\u0430\u0444\u0438\u043A\u0430, \u044D\u0440\u0433\u043E\u043D\u043E\u043C\u0438\u043A\u0430 \u0438 \u0447\u0438\u0441\u0442\u044B\u0435 \u0441\u0438\u0441\u0442\u0435\u043C\u044B. #designsystems",
      nl: "Productontwerper & creatief directeur. Typografie, ergonomie en schone systemen. #designsystems",
      en: "Product designer & creative director. Typography, ergonomics, and clean systems. #designsystems"
    },
    "The official BellBird account. Welcome to the flock! #bellbird #updates": {
      es: "La cuenta oficial de BellBird. \xA1Bienvenido a la bandada! #bellbird #updates",
      fr: "Le compte officiel de BellBird. Bienvenue dans la vol\xE9e ! #bellbird #updates",
      de: "Das offizielle BellBird-Konto. Willkommen im Schwarm! #bellbird #updates",
      ja: "BellBird \u516C\u5F0F\u30A2\u30AB\u30A6\u30F3\u30C8\u3002\u7FA4\u308C\u3078\u3088\u3046\u3053\u305D\uFF01 #bellbird #updates",
      hi: "BellBird \u0906\u0927\u093F\u0915\u093E\u0930\u093F\u0915 \u0916\u093E\u0924\u093E\u0964 \u091D\u0941\u0902\u0921 \u092E\u0947\u0902 \u0906\u092A\u0915\u093E \u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948! #bellbird #updates",
      zh: "BellBird \u5B98\u65B9\u8D26\u53F7\u3002\u6B22\u8FCE\u52A0\u5165\u9E1F\u7FA4\uFF01 #bellbird #updates",
      ar: "\u062D\u0633\u0627\u0628 BellBird \u0627\u0644\u0631\u0633\u0645\u064A. \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A \u0627\u0644\u0633\u0631\u0628! #bellbird #updates",
      pt: "A conta oficial do BellBird. Bem-vindo ao bando! #bellbird #updates",
      it: "L'account ufficiale di BellBird. Benvenuto nello stormo! #bellbird #updates",
      ko: "BellBird \uACF5\uC2DD \uACC4\uC815\uC785\uB2C8\uB2E4. \uBB34\uB9AC\uC5D0 \uC624\uC2E0 \uAC83\uC744 \uD658\uC601\uD569\uB2C8\uB2E4! #bellbird #updates",
      ru: "\u041E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 BellBird. \u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 \u0441\u0442\u0430\u044E! #bellbird #updates",
      nl: "Het offici\xEBle BellBird-account. Welkom bij de zwerm! #bellbird #updates",
      en: "The official BellBird account. Welcome to the flock! #bellbird #updates"
    }
  };
  for (const [sourceText, langMap] of Object.entries(PRE_TRANSLATED_DATABASE)) {
    for (const [lang, trans] of Object.entries(langMap)) {
      translationCache.set(`${lang}:${sourceText}`, trans);
    }
  }
  const COMMON_VOCABULARY = {
    es: {
      "hello": "hola",
      "hi": "hola",
      "good morning": "buenos d\xEDas",
      "good night": "buenas noches",
      "welcome": "bienvenido",
      "love": "amor",
      "loving": "amando",
      "happy": "feliz",
      "great": "genial",
      "beautiful": "hermoso",
      "amazing": "incre\xEDble",
      "awesome": "asombroso",
      "today": "hoy",
      "tomorrow": "ma\xF1ana",
      "yesterday": "ayer",
      "city": "ciudad",
      "light": "luz",
      "code": "c\xF3digo",
      "clean": "limpio",
      "new": "nuevo",
      "feature": "funci\xF3n",
      "search": "b\xFAsqueda",
      "posts": "publicaciones",
      "people": "personas",
      "flock": "bandada",
      "explore": "explorar",
      "design": "dise\xF1o",
      "work": "trabajo",
      "team": "equipo",
      "coffee": "caf\xE9",
      "photo": "foto",
      "camera": "c\xE1mara",
      "sky": "cielo",
      "sunset": "atardecer",
      "peace": "paz",
      "quiet": "tranquilo",
      "developer": "desarrollador"
    },
    fr: {
      "hello": "bonjour",
      "hi": "salut",
      "good morning": "bonjour",
      "good night": "bonne nuit",
      "welcome": "bienvenue",
      "love": "amour",
      "loving": "adorant",
      "happy": "heureux",
      "great": "g\xE9nial",
      "beautiful": "magnifique",
      "amazing": "incroyable",
      "awesome": "impressionnant",
      "today": "aujourd'hui",
      "tomorrow": "demain",
      "yesterday": "hier",
      "city": "ville",
      "light": "lumi\xE8re",
      "code": "code",
      "clean": "propre",
      "new": "nouveau",
      "feature": "fonctionnalit\xE9",
      "search": "recherche",
      "posts": "publications",
      "people": "personnes",
      "flock": "vol\xE9e",
      "explore": "explorer",
      "design": "conception",
      "work": "travail"
    },
    de: {
      "hello": "hallo",
      "hi": "hallo",
      "welcome": "willkommen",
      "happy": "gl\xFCcklich",
      "great": "gro\xDFartig",
      "beautiful": "wundersch\xF6n",
      "amazing": "erstaunlich",
      "today": "heute",
      "city": "Stadt",
      "light": "Licht",
      "code": "Code",
      "clean": "sauber",
      "new": "neu",
      "feature": "Funktion",
      "search": "Suche"
    },
    ja: {
      "hello": "\u3053\u3093\u306B\u3061\u306F",
      "welcome": "\u3088\u3046\u3053\u305D",
      "happy": "\u5B09\u3057\u3044",
      "great": "\u7D20\u6674\u3089\u3057\u3044",
      "beautiful": "\u7F8E\u3057\u3044",
      "amazing": "\u9A5A\u304D",
      "today": "\u4ECA\u65E5",
      "city": "\u90FD\u5E02",
      "light": "\u5149",
      "code": "\u30B3\u30FC\u30C9",
      "clean": "\u30AF\u30EA\u30FC\u30F3",
      "new": "\u65B0\u3057\u3044",
      "feature": "\u6A5F\u80FD",
      "search": "\u691C\u7D22"
    },
    zh: {
      "hello": "\u4F60\u597D",
      "welcome": "\u6B22\u8FCE",
      "happy": "\u5F00\u5FC3",
      "great": "\u592A\u68D2\u4E86",
      "beautiful": "\u7F8E\u4E3D",
      "amazing": "\u4EE4\u4EBA\u60CA\u53F9",
      "today": "\u4ECA\u5929",
      "city": "\u57CE\u5E02",
      "light": "\u5149\u8292",
      "code": "\u4EE3\u7801",
      "clean": "\u6574\u6D01",
      "new": "\u5168\u65B0",
      "feature": "\u529F\u80FD",
      "search": "\u641C\u7D22"
    },
    pt: {
      "hello": "ol\xE1",
      "welcome": "bem-vindo",
      "happy": "feliz",
      "great": "\xF3timo",
      "beautiful": "lindo",
      "amazing": "incr\xEDvel",
      "today": "hoje",
      "city": "cidade",
      "light": "luz",
      "code": "c\xF3digo",
      "clean": "limpo",
      "new": "novo",
      "feature": "recurso",
      "search": "busca"
    },
    it: {
      "hello": "ciao",
      "welcome": "benvenuto",
      "happy": "felice",
      "great": "fantastico",
      "beautiful": "bellissimo",
      "amazing": "incredibile",
      "today": "oggi",
      "city": "citt\xE0",
      "light": "luce",
      "code": "codice",
      "clean": "pulito",
      "new": "nuovo",
      "feature": "funzionalit\xE0",
      "search": "cerca"
    },
    ko: {
      "hello": "\uC548\uB155\uD558\uC138\uC694",
      "welcome": "\uD658\uC601\uD569\uB2C8\uB2E4",
      "happy": "\uD589\uBCF5\uD55C",
      "great": "\uBA4B\uC9C4",
      "beautiful": "\uC544\uB984\uB2E4\uC6B4",
      "amazing": "\uB180\uB77C\uC6B4",
      "today": "\uC624\uB298",
      "city": "\uB3C4\uC2DC",
      "light": "\uBE5B",
      "code": "\uCF54\uB4DC",
      "clean": "\uAE54\uB054\uD55C",
      "new": "\uC0C8\uB85C\uC6B4",
      "feature": "\uAE30\uB2A5",
      "search": "\uAC80\uC0C9"
    },
    ru: {
      "hello": "\u043F\u0440\u0438\u0432\u0435\u0442",
      "welcome": "\u0434\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C",
      "happy": "\u0441\u0447\u0430\u0441\u0442\u043B\u0438\u0432",
      "great": "\u043E\u0442\u043B\u0438\u0447\u043D\u043E",
      "beautiful": "\u043F\u0440\u0435\u043A\u0440\u0430\u0441\u043D\u043E",
      "amazing": "\u043F\u043E\u0442\u0440\u044F\u0441\u0430\u044E\u0449\u0435",
      "today": "\u0441\u0435\u0433\u043E\u0434\u043D\u044F",
      "city": "\u0433\u043E\u0440\u043E\u0434",
      "light": "\u0441\u0432\u0435\u0442",
      "code": "\u043A\u043E\u0434",
      "clean": "\u0447\u0438\u0441\u0442\u044B\u0439",
      "new": "\u043D\u043E\u0432\u044B\u0439",
      "feature": "\u0444\u0443\u043D\u043A\u0446\u0438\u044F",
      "search": "\u043F\u043E\u0438\u0441\u043A"
    }
  };
  const smartFallbackTranslate = (text, targetLanguage) => {
    if (targetLanguage === "en") return text;
    if (PRE_TRANSLATED_DATABASE[text]?.[targetLanguage]) {
      return PRE_TRANSLATED_DATABASE[text][targetLanguage];
    }
    const vocab = COMMON_VOCABULARY[targetLanguage] || {};
    const tokens = text.split(/(\s+|[.,!?;:()]+|#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+|https?:\/\/\S+)/g);
    let translated = tokens.map((tok) => {
      if (!tok || tok.startsWith("#") || tok.startsWith("@") || tok.startsWith("http")) {
        return tok;
      }
      const lower = tok.toLowerCase();
      if (vocab[lower]) {
        if (tok[0] === tok[0].toUpperCase()) {
          return vocab[lower].charAt(0).toUpperCase() + vocab[lower].slice(1);
        }
        return vocab[lower];
      }
      return tok;
    }).join("");
    return translated || text;
  };
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage = "es" } = req.body;
      if (!text || typeof text !== "string" || !text.trim()) {
        return res.json({ originalText: "", translatedText: "", targetLanguage });
      }
      const trimmed = text.trim();
      const cacheKey = `${targetLanguage}:${trimmed}`;
      if (translationCache.has(cacheKey)) {
        return res.json({
          originalText: trimmed,
          translatedText: translationCache.get(cacheKey),
          targetLanguage,
          cached: true
        });
      }
      if (PRE_TRANSLATED_DATABASE[trimmed]?.[targetLanguage]) {
        const trans = PRE_TRANSLATED_DATABASE[trimmed][targetLanguage];
        translationCache.set(cacheKey, trans);
        return res.json({
          originalText: trimmed,
          translatedText: trans,
          targetLanguage,
          pretranslated: true
        });
      }
      const now = Date.now();
      if (!ai || now < rateLimitCooldownUntil) {
        const fallbackText = smartFallbackTranslate(trimmed, targetLanguage);
        translationCache.set(cacheKey, fallbackText);
        return res.json({
          originalText: trimmed,
          translatedText: fallbackText,
          targetLanguage,
          cooldown: now < rateLimitCooldownUntil,
          fallback: true
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
          model: "gemini-3.8-flash",
          contents: prompt
        });
        const translatedText = response.text?.trim() || trimmed;
        translationCache.set(cacheKey, translatedText);
        return res.json({
          originalText: trimmed,
          translatedText,
          targetLanguage,
          model: "gemini-3.8-flash"
        });
      } catch (geminiErr) {
        const errMsg = String(geminiErr?.message || geminiErr);
        const isQuotaExceeded = geminiErr?.status === "RESOURCE_EXHAUSTED" || geminiErr?.code === 429 || errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED");
        if (isQuotaExceeded) {
          rateLimitCooldownUntil = Date.now() + 3e4;
          console.warn("[Translate] Gemini free-tier quota reached (429); active cooldown engaged for 30s. Using local smart translation engine.");
        } else {
          console.warn("[Translate] Upstream translation warning:", errMsg.slice(0, 150));
        }
        const fallbackText = smartFallbackTranslate(trimmed, targetLanguage);
        translationCache.set(cacheKey, fallbackText);
        return res.json({
          originalText: trimmed,
          translatedText: fallbackText,
          targetLanguage,
          fallback: true
        });
      }
    } catch (err) {
      console.warn("[Translate] Handled error in translation router:", err?.message || err);
      const fallbackText = smartFallbackTranslate(req.body?.text || "", req.body?.targetLanguage || "es");
      return res.json({
        originalText: req.body?.text || "",
        translatedText: fallbackText,
        targetLanguage: req.body?.targetLanguage || "es",
        fallback: true
      });
    }
  });
  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    const clientPath = path.resolve(distPath, "client");
    const staticRoot = fs.existsSync(clientPath) ? clientPath : distPath;
    const indexPath = fs.existsSync(path.join(staticRoot, "index.html")) ? path.join(staticRoot, "index.html") : path.join(distPath, "index.html");
    app.use(express.static(staticRoot));
    app.use((_req, res) => {
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Not Found");
      }
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
