import React from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { profile, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className="text-sm text-gray-600">
            {profile?.university || 'Complete your profile to get started'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {profile?.email}
              </span>
            </div>

            <button
              onClick={() => signOut()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
