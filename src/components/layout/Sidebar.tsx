import React from 'react';
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  FileText,
  BarChart3,
  Calendar,
  Upload,
  Settings,
  Shield
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin: boolean;
}

export function Sidebar({ currentView, onViewChange, isAdmin }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scholarships', label: 'Find Scholarships', icon: Search },
    { id: 'ai-assistant', label: 'AI Assistant', icon: MessageSquare },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Upload },
    { id: 'calendar', label: 'Deadlines', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: Shield });
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-600">SmartScholar</h1>
        <p className="text-sm text-gray-600 mt-1">AI-Powered Aid Assistant</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
