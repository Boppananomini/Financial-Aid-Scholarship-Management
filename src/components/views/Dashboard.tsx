import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  DollarSign,
  FileText,
  TrendingUp,
  Clock,
  Award,
  Target
} from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    totalPotentialFunding: 0,
    upcomingDeadlines: 0,
    documentsUploaded: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [applicationsRes, scholarshipsRes, documentsRes] = await Promise.all([
        supabase
          .from('applications')
          .select('*, scholarships(*)')
          .eq('user_id', user.id),
        supabase
          .from('scholarships')
          .select('*')
          .eq('is_active', true)
          .gte('deadline', new Date().toISOString().split('T')[0]),
        supabase
          .from('documents')
          .select('id')
          .eq('user_id', user.id),
      ]);

      const applications = applicationsRes.data || [];
      const documents = documentsRes.data || [];

      const approvedApps = applications.filter(app => app.status === 'approved');
      const pendingApps = applications.filter(app =>
        app.status === 'submitted' || app.status === 'under_review'
      );

      const totalFunding = approvedApps.reduce((sum, app) => {
        return sum + (app.scholarships?.amount || 0);
      }, 0);

      const upcomingDeadlines = applications.filter(app => {
        if (!app.scholarships?.deadline) return false;
        const deadline = new Date(app.scholarships.deadline);
        const now = new Date();
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7 && daysUntil >= 0;
      }).length;

      setStats({
        totalApplications: applications.length,
        approvedApplications: approvedApps.length,
        pendingApplications: pendingApps.length,
        totalPotentialFunding: totalFunding,
        upcomingDeadlines,
        documentsUploaded: documents.length,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Approved',
      value: stats.approvedApplications,
      icon: Award,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Pending Review',
      value: stats.pendingApplications,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Total Funding',
      value: `$${stats.totalPotentialFunding.toLocaleString()}`,
      icon: DollarSign,
      color: 'emerald',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      icon: Target,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      label: 'Documents',
      value: stats.documentsUploaded,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Your financial aid journey at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <p className="font-medium text-blue-900">Find New Scholarships</p>
              <p className="text-sm text-blue-600">Discover opportunities that match your profile</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <p className="font-medium text-green-900">Upload Documents</p>
              <p className="text-sm text-green-600">Add transcripts and required documents</p>
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <p className="font-medium text-purple-900">Ask AI Assistant</p>
              <p className="text-sm text-purple-600">Get personalized scholarship advice</p>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.totalApplications === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No activity yet</p>
                <p className="text-sm mt-1">Start by finding scholarships that match you</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Application submitted</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Document verified</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Profile updated</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
