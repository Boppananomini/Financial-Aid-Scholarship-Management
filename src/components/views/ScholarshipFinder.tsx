import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Search, DollarSign, Calendar, Award, ExternalLink, Plus } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Scholarship = Database['public']['Tables']['scholarships']['Row'];

export function ScholarshipFinder() {
  const { user, profile } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [applications, setApplications] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadScholarships();
    loadApplications();
  }, []);

  useEffect(() => {
    filterScholarships();
  }, [searchQuery, selectedCategory, scholarships]);

  const loadScholarships = async () => {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('is_active', true)
        .gte('deadline', new Date().toISOString().split('T')[0])
        .order('deadline', { ascending: true });

      if (error) throw error;
      setScholarships(data || []);
    } catch (error) {
      console.error('Error loading scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('applications')
      .select('scholarship_id')
      .eq('user_id', user.id);

    if (data) {
      setApplications(new Set(data.map(app => app.scholarship_id)));
    }
  };

  const filterScholarships = () => {
    let filtered = scholarships;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.provider.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    setFilteredScholarships(filtered);
  };

  const categories = Array.from(new Set(scholarships.map((s) => s.category)));

  const applyToScholarship = async (scholarshipId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('applications').insert({
        user_id: user.id,
        scholarship_id: scholarshipId,
        status: 'draft',
      });

      if (error) throw error;

      setApplications(new Set([...applications, scholarshipId]));

      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: 'application_started',
        event_data: { scholarship_id: scholarshipId },
      });
    } catch (error: any) {
      if (error.code === '23505') {
        alert('You have already applied to this scholarship');
      } else {
        console.error('Error applying:', error);
        alert('Failed to start application');
      }
    }
  };

  const calculateMatch = (scholarship: Scholarship) => {
    if (!profile) return 0;

    let score = 0;
    const criteria = scholarship.eligibility_criteria as any;

    if (criteria.min_gpa && profile.gpa && profile.gpa >= criteria.min_gpa) {
      score += 30;
    }

    if (criteria.majors && profile.major) {
      if (criteria.majors.includes(profile.major)) {
        score += 30;
      }
    }

    if (criteria.max_income && profile.household_income) {
      if (profile.household_income <= criteria.max_income) {
        score += 40;
      }
    }

    return Math.min(score, 100);
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
        <h1 className="text-3xl font-bold text-gray-900">Find Scholarships</h1>
        <p className="text-gray-600 mt-2">
          Discover opportunities that match your profile
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholarships by title, provider, or keywords..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredScholarships.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No scholarships found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          filteredScholarships.map((scholarship) => {
            const matchScore = calculateMatch(scholarship);
            const hasApplied = applications.has(scholarship.id);
            const daysUntilDeadline = Math.ceil(
              (new Date(scholarship.deadline).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <div
                key={scholarship.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {scholarship.title}
                        </h3>
                        <p className="text-sm text-gray-600">{scholarship.provider}</p>
                      </div>
                      {matchScore > 0 && (
                        <div className="bg-green-100 px-3 py-1 rounded-full">
                          <p className="text-sm font-semibold text-green-700">
                            {matchScore}% Match
                          </p>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {scholarship.description}
                    </p>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-gray-900">
                          ${scholarship.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Due: {new Date(scholarship.deadline).toLocaleDateString()}
                        </span>
                        {daysUntilDeadline <= 7 && (
                          <span className="text-red-600 font-semibold">
                            ({daysUntilDeadline} days left)
                          </span>
                        )}
                      </div>
                      <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                        {scholarship.category}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {hasApplied ? (
                        <button
                          disabled
                          className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
                        >
                          Applied
                        </button>
                      ) : (
                        <button
                          onClick={() => applyToScholarship(scholarship.id)}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Start Application
                        </button>
                      )}
                      {scholarship.apply_url && (
                        <a
                          href={scholarship.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          External Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
