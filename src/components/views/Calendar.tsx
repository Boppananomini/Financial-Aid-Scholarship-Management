import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar as CalendarIcon, Bell, AlertCircle } from 'lucide-react';

interface Deadline {
  id: string;
  scholarship_title: string;
  scholarship_provider: string;
  deadline: string;
  application_status: string;
  daysUntil: number;
}

export function Calendar() {
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeadlines();
  }, [user]);

  const loadDeadlines = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          scholarships (
            id,
            title,
            provider,
            deadline
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const deadlinesData: Deadline[] = (data || [])
        .filter(app => app.scholarships && app.status !== 'rejected' && app.status !== 'approved')
        .map(app => {
          const scholarship = app.scholarships as any;
          const deadline = new Date(scholarship.deadline);
          const now = new Date();
          const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          return {
            id: app.id,
            scholarship_title: scholarship.title,
            scholarship_provider: scholarship.provider,
            deadline: scholarship.deadline,
            application_status: app.status,
            daysUntil,
          };
        })
        .sort((a, b) => a.daysUntil - b.daysUntil);

      setDeadlines(deadlinesData);
    } catch (error) {
      console.error('Error loading deadlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (scholarshipId: string, title: string, deadline: string) => {
    if (!user) return;

    const reminderDate = new Date(deadline);
    reminderDate.setDate(reminderDate.getDate() - 3);

    try {
      await supabase.from('reminders').insert({
        user_id: user.id,
        scholarship_id: scholarshipId,
        reminder_date: reminderDate.toISOString(),
        message: `Reminder: ${title} deadline is in 3 days!`,
      });

      alert('Reminder created successfully!');
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Failed to create reminder');
    }
  };

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil < 0) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (daysUntil <= 3) return 'bg-red-100 text-red-700 border-red-300';
    if (daysUntil <= 7) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (daysUntil <= 14) return 'bg-blue-100 text-blue-700 border-blue-300';
    return 'bg-green-100 text-green-700 border-green-300';
  };

  const getUrgencyLabel = (daysUntil: number) => {
    if (daysUntil < 0) return 'Expired';
    if (daysUntil === 0) return 'Due Today';
    if (daysUntil === 1) return 'Due Tomorrow';
    if (daysUntil <= 7) return `${daysUntil} days left`;
    return `${daysUntil} days left`;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deadline Calendar</h1>
          <p className="text-gray-600 mt-2">Track upcoming scholarship deadlines</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {deadlines.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming deadlines</h3>
          <p className="text-gray-600">
            Apply to scholarships to track their deadlines here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {deadlines.filter(d => d.daysUntil >= 0).length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Deadlines</h2>
              <div className="space-y-3">
                {deadlines
                  .filter(d => d.daysUntil >= 0)
                  .map((deadline) => (
                    <div
                      key={deadline.id}
                      className={`border-2 rounded-xl p-6 ${getUrgencyColor(deadline.daysUntil)} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {deadline.daysUntil <= 7 && (
                              <AlertCircle className="w-5 h-5" />
                            )}
                            <h3 className="text-lg font-bold">
                              {deadline.scholarship_title}
                            </h3>
                          </div>
                          <p className="text-sm mb-3">{deadline.scholarship_provider}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-semibold">
                              Due: {new Date(deadline.deadline).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="px-3 py-1 bg-white rounded-full font-semibold capitalize">
                              {deadline.application_status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold mb-2">
                            {deadline.daysUntil}
                          </div>
                          <div className="text-sm font-semibold mb-3">
                            {getUrgencyLabel(deadline.daysUntil)}
                          </div>
                          <button
                            onClick={() => createReminder(
                              deadline.id,
                              deadline.scholarship_title,
                              deadline.deadline
                            )}
                            className="flex items-center gap-2 px-3 py-1 bg-white hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Bell className="w-4 h-4" />
                            Remind Me
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {deadlines.filter(d => d.daysUntil < 0).length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Past Deadlines</h2>
              <div className="space-y-3">
                {deadlines
                  .filter(d => d.daysUntil < 0)
                  .map((deadline) => (
                    <div
                      key={deadline.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-700 mb-1">
                            {deadline.scholarship_title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {deadline.scholarship_provider}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Deadline was {new Date(deadline.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-gray-200 rounded-full">
                          <span className="text-sm font-semibold text-gray-700">Expired</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
