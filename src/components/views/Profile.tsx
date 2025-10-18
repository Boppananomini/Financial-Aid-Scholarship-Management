import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { User, Save, AlertCircle } from 'lucide-react';

export function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    gpa: '',
    major: '',
    university: '',
    graduation_year: '',
    household_income: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        gpa: profile.gpa?.toString() || '',
        major: profile.major || '',
        university: profile.university || '',
        graduation_year: profile.graduation_year?.toString() || '',
        household_income: profile.household_income?.toString() || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData: any = {
        full_name: formData.full_name,
        email: formData.email,
        major: formData.major || null,
        university: formData.university || null,
      };

      if (formData.gpa) {
        const gpaNum = parseFloat(formData.gpa);
        if (gpaNum >= 0 && gpaNum <= 4.0) {
          updateData.gpa = gpaNum;
        }
      }

      if (formData.graduation_year) {
        updateData.graduation_year = parseInt(formData.graduation_year);
      }

      if (formData.household_income) {
        updateData.household_income = parseFloat(formData.household_income);
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile?.id);

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-3 rounded-xl">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>
      </div>

      {message.text && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <AlertCircle className="w-5 h-5" />
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                University
              </label>
              <input
                id="university"
                name="university"
                type="text"
                value={formData.university}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Harvard University"
              />
            </div>

            <div>
              <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-2">
                Major
              </label>
              <input
                id="major"
                name="major"
                type="text"
                value={formData.major}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Computer Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gpa" className="block text-sm font-medium text-gray-700 mb-2">
                GPA (0.00 - 4.00)
              </label>
              <input
                id="gpa"
                name="gpa"
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={formData.gpa}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3.75"
              />
            </div>

            <div>
              <label htmlFor="graduation_year" className="block text-sm font-medium text-gray-700 mb-2">
                Expected Graduation Year
              </label>
              <input
                id="graduation_year"
                name="graduation_year"
                type="number"
                min="2024"
                max="2035"
                value={formData.graduation_year}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2026"
              />
            </div>
          </div>

          <div>
            <label htmlFor="household_income" className="block text-sm font-medium text-gray-700 mb-2">
              Annual Household Income (USD)
            </label>
            <input
              id="household_income"
              name="household_income"
              type="number"
              min="0"
              value={formData.household_income}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="50000"
            />
            <p className="text-sm text-gray-500 mt-1">
              This helps us match you with need-based scholarships
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Why complete your profile?
        </h3>
        <ul className="text-sm text-blue-700 space-y-2 ml-7">
          <li>Get personalized scholarship recommendations</li>
          <li>AI can better assess your eligibility</li>
          <li>Faster application completion with pre-filled data</li>
          <li>Access to need-based and merit-based opportunities</li>
        </ul>
      </div>
    </div>
  );
}
