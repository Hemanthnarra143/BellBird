import React, { useState } from 'react';
import { Bird } from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.user) {
        login(data.user, data.token);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Bird size={36} className="text-[#1769FF]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-[#0A192F] mb-2">Join BellBird</h2>
          <p className="text-center text-gray-500 mb-8">Connect with your flock today.</p>

          <form onSubmit={handleDemoLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Demo)</label>
              <input
                type="email"
                disabled
                value="demo@bellbird.app"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1769FF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                disabled
                value="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1769FF]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1769FF] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In as Demo User'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
