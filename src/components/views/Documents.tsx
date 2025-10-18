import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Upload, FileText, CheckCircle, Clock, XCircle, Download } from 'lucide-react';

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  verification_status: string;
  uploaded_at: string;
  ai_parsed_data: any;
}

export function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        alert('Storage upload failed. Using mock document URL for demo.');
        const mockUrl = `https://example.com/documents/${fileName}`;

        const { error: insertError } = await supabase.from('documents').insert({
          user_id: user.id,
          document_type: documentType,
          file_name: file.name,
          file_url: mockUrl,
          file_size: file.size,
          verification_status: 'pending',
        });

        if (insertError) throw insertError;
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase.from('documents').insert({
          user_id: user.id,
          document_type: documentType,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          verification_status: 'pending',
        });

        if (insertError) throw insertError;
      }

      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: 'document_uploaded',
        event_data: { document_type: documentType, file_name: file.name },
      });

      loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const documentTypes = [
    { id: 'transcript', label: 'Academic Transcript', icon: '📄' },
    { id: 'id_proof', label: 'ID Proof', icon: '🪪' },
    { id: 'income_certificate', label: 'Income Certificate', icon: '💰' },
    { id: 'recommendation_letter', label: 'Recommendation Letter', icon: '✉️' },
    { id: 'essay', label: 'Essay/Statement', icon: '📝' },
    { id: 'other', label: 'Other Documents', icon: '📎' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600 mt-2">
          Upload and manage your application documents
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTypes.map((type) => {
          const docCount = documents.filter(d => d.document_type === type.id).length;

          return (
            <div key={type.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="text-3xl mb-3">{type.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{type.label}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {docCount} {docCount === 1 ? 'file' : 'files'} uploaded
              </p>
              <label className="block">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, type.id)}
                  disabled={uploading}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer disabled:bg-blue-400">
                  <Upload className="w-4 h-4" />
                  Upload
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {documents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Documents</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {doc.file_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 capitalize">
                          {doc.document_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {formatFileSize(doc.file_size)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(doc.verification_status)}`}>
                          {getStatusIcon(doc.verification_status)}
                          <span className="text-xs font-semibold capitalize">
                            {doc.verification_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
