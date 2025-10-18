import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, CheckCircle, Clock, XCircle, Edit, Trash2 } from 'lucide-react';

interface ApplicationWithScholarship {
  id: string;
  status: string;
  submitted_at: string | null;
  notes: string | null;
  ai_eligibility_score: number | null;
  ai_recommendations: string | null;
  created_at: string;
  scholarships: {
    title: string;
    provider: string;
    amount: number;
    deadline: string;
  } | null;
}

export function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadApplications();
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          scholarships (
            title,
            provider,
            amount,
            deadline
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data as ApplicationWithScholarship[]);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const updateData: any = { status };
      if (status === 'submitted' && !applications.find(app => app.id === id)?.submitted_at) {
        updateData.submitted_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      loadApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadApplications();
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'under_review':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Edit className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-700';
      case 'submitted':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const statusCounts = {
    all: applications.length,
    draft: applications.filter(app => app.status === 'draft').length,
    submitted: applications.filter(app => app.status === 'submitted').length,
    under_review: applications.filter(app => app.status === 'under_review').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
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
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-2">Track and manage your scholarship applications</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status.replace('_', ' ').toUpperCase()} ({count})
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? 'Start by finding scholarships that match your profile'
              : `You don't have any ${filter.replace('_', ' ')} applications`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {app.scholarships?.title || 'Scholarship'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {app.scholarships?.provider}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full flex items-center gap-2 ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="text-sm font-semibold capitalize">
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {app.scholarships && (
                    <div className="flex gap-4 mb-3 text-sm text-gray-600">
                      <span className="font-semibold">
                        Amount: ${app.scholarships.amount.toLocaleString()}
                      </span>
                      <span>
                        Deadline: {new Date(app.scholarships.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {app.ai_eligibility_score && (
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          AI Match Score:
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {app.ai_eligibility_score}%
                        </span>
                      </div>
                      {app.ai_recommendations && (
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                          {app.ai_recommendations}
                        </p>
                      )}
                    </div>
                  )}

                  {app.notes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium">Notes:</span> {app.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    {app.status === 'draft' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(app.id, 'submitted')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                        >
                          Submit Application
                        </button>
                        <button
                          onClick={() => deleteApplication(app.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {app.submitted_at && (
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
