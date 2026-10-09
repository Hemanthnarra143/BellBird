import React, { useState } from 'react';
import { Bird, Mail, Lock, User, AtSign, Eye, EyeOff, CheckCircle2, ArrowRight, Sparkles, X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

// Official Brand SVG Icons
function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LinkedInIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function ZohoMailIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      {/* Zoho 4 Colored Cubes */}
      <rect x="2" y="2" width="13" height="13" rx="3" fill="#E42528" />
      <rect x="17" y="2" width="13" height="13" rx="3" fill="#22A45C" />
      <rect x="2" y="17" width="13" height="13" rx="3" fill="#0E82D5" />
      <rect x="17" y="17" width="13" height="13" rx="3" fill="#F8B122" />
      {/* Mail Envelope Outline inside */}
      <path
        d="M7 7.5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1zm0 2.2l9 6 9-6"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Auth() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // Mode: 'join' (Sign Up / Register) or 'login' (Sign In)
  const [mode, setMode] = useState<'join' | 'login'>('join');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Provider Modal State for realistic interactive flow
  const [providerModal, setProviderModal] = useState<{
    open: boolean;
    provider: 'google' | 'linkedin' | 'zoho';
    title: string;
    suggestedEmail: string;
    suggestedName: string;
  } | null>(null);

  // Switch modes cleanly
  const handleModeSwitch = (newMode: 'join' | 'login') => {
    setMode(newMode);
    setErrorMessage(null);
  };

  // Normal Join (Sign Up) Submit
  const handleNormalJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create account.');
      }

      if (data.user) {
        login(data.user, data.token || 'jwt-normal-join');
        navigate('/');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Something went wrong during sign up.');
    } finally {
      setLoading(false);
    }
  };

  // Normal Log In Submit
  const handleNormalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Invalid credentials or user not found.');
      }

      if (data.user) {
        login(data.user, data.token || 'jwt-normal-login');
        navigate('/');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Provider Flow
  const openProviderFlow = (provider: 'google' | 'linkedin' | 'zoho') => {
    if (provider === 'google') {
      setProviderModal({
        open: true,
        provider: 'google',
        title: 'Sign in with Google Gmail',
        suggestedEmail: 'vanaraspices@gmail.com',
        suggestedName: 'Vanara Spices',
      });
    } else if (provider === 'linkedin') {
      setProviderModal({
        open: true,
        provider: 'linkedin',
        title: 'Sign in with LinkedIn',
        suggestedEmail: 'alex.networker@linkedin.com',
        suggestedName: 'Alex Rivera (Tech Lead)',
      });
    } else if (provider === 'zoho') {
      setProviderModal({
        open: true,
        provider: 'zoho',
        title: 'Sign in with Zoho Mail',
        suggestedEmail: 'user@zohomail.com',
        suggestedName: 'Zoho Workspace Member',
      });
    }
  };

  // Complete Provider Auth
  const handleCompleteOAuth = async (selectedEmail: string, selectedName: string) => {
    if (!providerModal) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerModal.provider,
          email: selectedEmail,
          name: selectedName,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `Failed to sign in with ${providerModal.provider}`);
      }

      if (data.user) {
        setProviderModal(null);
        login(data.user, data.token || `jwt-${providerModal.provider}`);
        navigate('/');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing join
  const handleQuickFillJoin = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFullName('Sky Walker');
    setUsername(`sky_walker${randomNum}`);
    setEmail(`sky${randomNum}@bellbird.app`);
    setPassword('BellBird2026!');
  };

  // Quick fill demo user for login
  const handleQuickDemoLogin = () => {
    setEmail('demo@bellbird.app');
    setPassword('••••••••');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50/40 p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden border border-gray-100 transition-all">
        {/* Header with Centered Logo */}
        <div className="pt-8 pb-4 px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center ring-8 ring-blue-50/50 shadow-inner">
              <Bird size={36} className="text-[#1769FF]" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] tracking-tight">
            {mode === 'join' ? 'Join BellBird' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'join'
              ? 'Connect with your flock today in real-time.'
              : 'Log in to your BellBird account.'}
          </p>

          {/* Mode Tabs: Join vs Login */}
          <div className="mt-6 p-1 bg-gray-100/90 rounded-2xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleModeSwitch('join')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'join'
                  ? 'bg-white text-[#1769FF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Join (Create Account)
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#1769FF] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Log In
            </button>
          </div>
        </div>

        <div className="px-8 pb-8 pt-2">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Social / SSO Auth Options */}
          <div className="space-y-2.5">
            {/* Google Gmail Option */}
            <button
              type="button"
              onClick={() => openProviderFlow('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50/80 active:scale-[0.99] font-semibold text-gray-800 text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>Continue with Google Gmail</span>
            </button>

            {/* LinkedIn Option */}
            <button
              type="button"
              onClick={() => openProviderFlow('linkedin')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50/80 active:scale-[0.99] font-semibold text-gray-800 text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <LinkedInIcon className="w-5 h-5 shrink-0" />
              <span>Continue with LinkedIn</span>
            </button>

            {/* Zoho Mail Option */}
            <button
              type="button"
              onClick={() => openProviderFlow('zoho')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50/80 active:scale-[0.99] font-semibold text-gray-800 text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <ZohoMailIcon className="w-5 h-5 shrink-0" />
              <span>Continue with Zoho Mail</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative inline-block bg-white px-3 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Or with email
            </div>
          </div>

          {/* Join (Sign Up) Form */}
          {mode === 'join' && (
            <form onSubmit={handleNormalJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1769FF] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. alex_m"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1769FF] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1769FF] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1769FF] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Normal Join Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#1769FF] text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-600 active:scale-[0.99] transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Join BellBird</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Quick Fill Join helper */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleQuickFillJoin}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Auto-fill sample profile for testing</span>
                </button>
              </div>
            </form>
          )}

          {/* Log In Form */}
          {mode === 'login' && (
            <form onSubmit={handleNormalLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email or @username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1769FF] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('demo@bellbird.app');
                      setPassword('••••••••');
                    }}
                    className="text-xs text-[#1769FF] hover:underline cursor-pointer"
                  >
                    Use demo password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1769FF] focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Normal Log In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#1769FF] text-white py-3.5 rounded-xl font-bold text-base hover:bg-blue-600 active:scale-[0.99] transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Log In to BellBird</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Quick Fill Demo */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Prefill demo account credentials</span>
                </button>
              </div>
            </form>
          )}

          {/* Switch Prompt */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            {mode === 'join' ? (
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('login')}
                  className="font-bold text-[#1769FF] hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('join')}
                  className="font-bold text-[#1769FF] hover:underline cursor-pointer"
                >
                  Join BellBird
                </button>
              </p>
            )}
          </div>

          <div className="mt-4 text-center text-xs text-gray-400 leading-relaxed">
            By continuing, you agree to BellBird's Terms of Service and acknowledge our Privacy Policy.
          </div>
        </div>
      </div>

      {/* Provider Interactive Chooser Modal */}
      {providerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-gray-100 relative">
            <button
              type="button"
              onClick={() => setProviderModal(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 rounded-lg p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                {providerModal.provider === 'google' && <GoogleIcon className="w-6 h-6" />}
                {providerModal.provider === 'linkedin' && <LinkedInIcon className="w-6 h-6" />}
                {providerModal.provider === 'zoho' && <ZohoMailIcon className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{providerModal.title}</h3>
                <p className="text-xs text-gray-500">Choose an account to continue</p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {/* Primary Detected Account Option */}
              <button
                type="button"
                onClick={() =>
                  handleCompleteOAuth(providerModal.suggestedEmail, providerModal.suggestedName)
                }
                className="w-full p-3.5 rounded-xl border-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-left flex items-center justify-between transition-all group cursor-pointer"
              >
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-gray-900 group-hover:text-[#1769FF]">
                    {providerModal.suggestedName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{providerModal.suggestedEmail}</div>
                </div>
                <CheckCircle2 size={18} className="text-[#1769FF] shrink-0" />
              </button>

              {/* Alternate Demo / Custom Option */}
              <button
                type="button"
                onClick={() => {
                  const custom = prompt(
                    `Enter custom ${providerModal.provider === 'google' ? 'Gmail' : providerModal.provider === 'zoho' ? 'Zoho Mail' : 'LinkedIn'} email:`,
                    providerModal.suggestedEmail
                  );
                  if (custom && custom.trim()) {
                    handleCompleteOAuth(custom.trim(), custom.split('@')[0]);
                  }
                }}
                className="w-full p-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-left text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
              >
                Use another {providerModal.provider === 'google' ? 'Google' : providerModal.provider === 'zoho' ? 'Zoho Mail' : 'LinkedIn'} account...
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProviderModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-semibold text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCompleteOAuth(providerModal.suggestedEmail, providerModal.suggestedName)
                }
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-[#1769FF] hover:bg-blue-600 font-bold text-xs text-white shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? 'Connecting...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
