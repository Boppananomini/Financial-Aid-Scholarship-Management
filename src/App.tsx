import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/views/Dashboard';
import { ScholarshipFinder } from './components/views/ScholarshipFinder';
import { AIAssistant } from './components/views/AIAssistant';
import { Applications } from './components/views/Applications';
import { Documents } from './components/views/Documents';
import { Calendar } from './components/views/Calendar';
import { Analytics } from './components/views/Analytics';
import { Profile } from './components/views/Profile';
import { AdminPanel } from './components/views/AdminPanel';

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {isLogin ? (
        <LoginForm onToggleMode={() => setIsLogin(false)} />
      ) : (
        <SignUpForm onToggleMode={() => setIsLogin(true)} />
      )}
    </div>
  );
}

function MainApp() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading SmartScholar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'scholarships':
        return <ScholarshipFinder />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'applications':
        return <Applications />;
      case 'documents':
        return <Documents />;
      case 'calendar':
        return <Calendar />;
      case 'analytics':
        return <Analytics />;
      case 'profile':
        return <Profile />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isAdmin={profile?.is_admin || false}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
