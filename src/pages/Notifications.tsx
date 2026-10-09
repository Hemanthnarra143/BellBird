import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, UserPlus, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setNotifications(data);
        
        // Mark as read
        await fetch('/api/notifications/read', { method: 'POST' });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);

  return (
    <div className="w-full bg-white pb-20 min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4">
        <h1 className="text-xl font-bold text-[#0A192F]">Notifications</h1>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="w-8 h-8 border-4 border-[#1769FF] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
          <Bell size={48} className="text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-1">Nothing to see here — yet</p>
          <p>When someone interacts with you, you'll find it here.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={clsx(
                "p-4 flex gap-4 transition-colors hover:bg-gray-50/50 cursor-pointer",
                !notif.read && "bg-blue-50/30"
              )}
            >
              <div className="flex-shrink-0 pt-1">
                {notif.type === 'like' ? (
                  <Heart size={28} className="text-red-500" fill="currentColor" />
                ) : (
                  <UserPlus size={28} className="text-[#1769FF]" fill="currentColor" />
                )}
              </div>
              <div className="flex-1">
                <Link to={`/profile/${notif.actor.id}`}>
                  <img 
                    src={notif.actor.avatar} 
                    className="w-8 h-8 rounded-full mb-2" 
                    alt={notif.actor.name} 
                  />
                </Link>
                <div className="text-[15px]">
                  <Link to={`/profile/${notif.actor.id}`} className="font-bold hover:underline">
                    {notif.actor.name}
                  </Link>
                  <span className="text-gray-600">
                    {notif.type === 'like' ? ' liked your post' : ' followed you'}
                  </span>
                </div>
                {notif.post && (
                  <p className="text-gray-500 mt-2 text-sm">
                    {notif.post.content.length > 60 
                      ? notif.post.content.substring(0, 60) + '...'
                      : notif.post.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
