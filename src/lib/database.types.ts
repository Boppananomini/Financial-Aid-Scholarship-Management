export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          gpa: number | null
          major: string | null
          university: string | null
          graduation_year: number | null
          household_income: number | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          gpa?: number | null
          major?: string | null
          university?: string | null
          graduation_year?: number | null
          household_income?: number | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          gpa?: number | null
          major?: string | null
          university?: string | null
          graduation_year?: number | null
          household_income?: number | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      scholarships: {
        Row: {
          id: string
          title: string
          description: string
          amount: number
          deadline: string
          eligibility_criteria: Json
          requirements: string[]
          category: string
          provider: string
          apply_url: string | null
          is_active: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          amount: number
          deadline: string
          eligibility_criteria?: Json
          requirements?: string[]
          category: string
          provider: string
          apply_url?: string | null
          is_active?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          amount?: number
          deadline?: string
          eligibility_criteria?: Json
          requirements?: string[]
          category?: string
          provider?: string
          apply_url?: string | null
          is_active?: boolean
          created_at?: string
          created_by?: string | null
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          scholarship_id: string
          status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          submitted_at: string | null
          notes: string | null
          ai_eligibility_score: number | null
          ai_recommendations: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scholarship_id: string
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          submitted_at?: string | null
          notes?: string | null
          ai_eligibility_score?: number | null
          ai_recommendations?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scholarship_id?: string
          status?: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
          submitted_at?: string | null
          notes?: string | null
          ai_eligibility_score?: number | null
          ai_recommendations?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          application_id: string | null
          document_type: string
          file_name: string
          file_url: string
          file_size: number
          ai_parsed_data: Json
          verification_status: 'pending' | 'verified' | 'rejected'
          uploaded_at: string
        }
        Insert: {
          id?: string
          user_id: string
          application_id?: string | null
          document_type: string
          file_name: string
          file_url: string
          file_size: number
          ai_parsed_data?: Json
          verification_status?: 'pending' | 'verified' | 'rejected'
          uploaded_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          application_id?: string | null
          document_type?: string
          file_name?: string
          file_url?: string
          file_size?: number
          ai_parsed_data?: Json
          verification_status?: 'pending' | 'verified' | 'rejected'
          uploaded_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          scholarship_id: string
          reminder_date: string
          message: string
          is_sent: boolean
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scholarship_id: string
          reminder_date: string
          message: string
          is_sent?: boolean
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scholarship_id?: string
          reminder_date?: string
          message?: string
          is_sent?: boolean
          sent_at?: string | null
          created_at?: string
        }
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          messages: Json
          context: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          messages?: Json
          context?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          messages?: Json
          context?: Json
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_data?: Json
          created_at?: string
        }
      }
    }
  }
}
