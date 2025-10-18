import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TrendingUp, Award, DollarSign, Target, Calendar as CalendarIcon } from 'lucide-react';

export function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFound: 0,
    totalApplied: 0,
    totalApproved: 0,
    totalFunding: 0,
    successRate: 0,
    avgProcessingTime: 0,
  });
  const [monthlyActivity, setMonthlyActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const [applicationsRes, scholarshipsRes, eventsRes] = await Promise.all([
        supabase
          .from('applications')
          .select('*, scholarships(*)')
          .eq('user_id', user.id),
        supabase
          .from('scholarships')
          .select('id')
          .eq('is_active', true),
        supabase
          .from('analytics_events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      const applications = applicationsRes.data || [];
      const scholarships = scholarshipsRes.data || [];
      const events = eventsRes.data || [];

      const approved = applications.filter(app => app.status === 'approved');
      const totalFunding = approved.reduce((sum, app) => sum + (app.scholarships?.amount || 0), 0);
      const successRate = applications.length > 0
        ? (approved.length / applications.length) * 100
        : 0;

      const activityByMonth: Record<string, number> = {};
      events.forEach(event => {
        const month = new Date(event.created_at).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
        activityByMonth[month] = (activityByMonth[month] || 0) + 1;
      });

      setStats({
        totalFound: scholarships.length,
        totalApplied: applications.length,
        totalApproved: approved.length,
        totalFunding,
        successRate: Math.round(successRate),
        avgProcessingTime: 14,
      });

      setMonthlyActivity(
        Object.entries(activityByMonth).map(([month, count]) => ({
          month,
          count,
        }))
      );
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Your scholarship journey insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.totalFound}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Scholarships Found</h3>
          <p className="text-sm text-gray-500 mt-1">Available opportunities</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.totalApplied}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Applications Submitted</h3>
          <p className="text-sm text-gray-500 mt-1">Total applications</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.totalApproved}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Scholarships Won</h3>
          <p className="text-sm text-gray-500 mt-1">Approved applications</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">
              ${stats.totalFunding.toLocaleString()}
            </span>
          </div>
          <h3 className="font-semibold text-gray-700">Total Funding</h3>
          <p className="text-sm text-gray-500 mt-1">Money awarded</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.successRate}%</span>
          </div>
          <h3 className="font-semibold text-gray-700">Success Rate</h3>
          <p className="text-sm text-gray-500 mt-1">Application approval rate</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.avgProcessingTime}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Avg. Processing Days</h3>
          <p className="text-sm text-gray-500 mt-1">Typical response time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Timeline</h2>
          {monthlyActivity.length > 0 ? (
            <div className="space-y-3">
              {monthlyActivity.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 w-24">
                    {item.month}
                  </span>
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-2"
                        style={{
                          width: `${Math.min((item.count / Math.max(...monthlyActivity.map(i => i.count))) * 100, 100)}%`,
                        }}
                      >
                        <span className="text-xs font-semibold text-white">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No activity data yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Insights</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Application Strategy</h3>
              <p className="text-sm text-blue-700">
                {stats.totalApplied === 0
                  ? 'Start applying to scholarships to see insights'
                  : stats.successRate > 50
                  ? 'Excellent! Your application quality is high.'
                  : 'Consider improving your application materials for better results.'}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Funding Progress</h3>
              <p className="text-sm text-green-700">
                {stats.totalFunding === 0
                  ? 'Keep applying to secure your first scholarship'
                  : `Great progress! You've secured $${stats.totalFunding.toLocaleString()}.`}
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Next Steps</h3>
              <p className="text-sm text-purple-700">
                {stats.totalApplied < 5
                  ? 'Apply to at least 5 scholarships to increase your chances'
                  : 'Continue tracking deadlines and following up on pending applications'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
