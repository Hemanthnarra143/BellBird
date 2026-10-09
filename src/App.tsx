import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useStore';
import Layout from './components/Layout';
import Feed from './pages/Feed';
import Search from './pages/Search';
import Bookmarks from './pages/Bookmarks';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import Auth from './pages/Auth';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected App Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Feed />} />
          <Route path="search" element={<Search />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="profile/:id?" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="messages" element={<Messages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
