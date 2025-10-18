/*
  # SmartScholar Database Schema
  
  ## Overview
  Complete database schema for SmartScholar - AI-powered financial aid and scholarship management system
  
  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - Student full name
  - `gpa` (numeric) - Grade point average
  - `major` (text) - Field of study
  - `university` (text) - Current institution
  - `graduation_year` (integer) - Expected graduation year
  - `household_income` (numeric) - Annual household income for need-based aid
  - `is_admin` (boolean) - Admin flag
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. scholarships
  - `id` (uuid, primary key) - Unique scholarship identifier
  - `title` (text) - Scholarship name
  - `description` (text) - Detailed description
  - `amount` (numeric) - Award amount
  - `deadline` (date) - Application deadline
  - `eligibility_criteria` (jsonb) - Structured eligibility requirements
  - `requirements` (text[]) - List of required documents
  - `category` (text) - Scholarship category (merit, need-based, etc.)
  - `provider` (text) - Organization offering the scholarship
  - `apply_url` (text) - External application link
  - `is_active` (boolean) - Whether scholarship is currently available
  - `created_at` (timestamptz) - Record creation timestamp
  - `created_by` (uuid) - Admin who created the record
  
  ### 3. applications
  - `id` (uuid, primary key) - Unique application identifier
  - `user_id` (uuid, foreign key) - Student who applied
  - `scholarship_id` (uuid, foreign key) - Scholarship applied to
  - `status` (text) - Application status (draft, submitted, under_review, approved, rejected)
  - `submitted_at` (timestamptz) - Submission timestamp
  - `notes` (text) - Student notes
  - `ai_eligibility_score` (numeric) - AI-calculated match score
  - `ai_recommendations` (text) - AI-generated advice
  - `created_at` (timestamptz) - Application creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 4. documents
  - `id` (uuid, primary key) - Unique document identifier
  - `user_id` (uuid, foreign key) - Document owner
  - `application_id` (uuid, foreign key, nullable) - Related application
  - `document_type` (text) - Type (transcript, id_proof, income_certificate, etc.)
  - `file_name` (text) - Original file name
  - `file_url` (text) - Storage URL
  - `file_size` (integer) - File size in bytes
  - `ai_parsed_data` (jsonb) - AI-extracted information
  - `verification_status` (text) - Verification status (pending, verified, rejected)
  - `uploaded_at` (timestamptz) - Upload timestamp
  
  ### 5. reminders
  - `id` (uuid, primary key) - Unique reminder identifier
  - `user_id` (uuid, foreign key) - User to remind
  - `scholarship_id` (uuid, foreign key) - Related scholarship
  - `reminder_date` (timestamptz) - When to send reminder
  - `message` (text) - Reminder message
  - `is_sent` (boolean) - Whether reminder was sent
  - `sent_at` (timestamptz, nullable) - When reminder was sent
  - `created_at` (timestamptz) - Reminder creation timestamp
  
  ### 6. ai_conversations
  - `id` (uuid, primary key) - Unique conversation identifier
  - `user_id` (uuid, foreign key) - User having the conversation
  - `messages` (jsonb) - Array of conversation messages
  - `context` (jsonb) - Conversation context and metadata
  - `created_at` (timestamptz) - Conversation start timestamp
  - `updated_at` (timestamptz) - Last message timestamp
  
  ### 7. analytics_events
  - `id` (uuid, primary key) - Unique event identifier
  - `user_id` (uuid, foreign key) - User who triggered event
  - `event_type` (text) - Event type (scholarship_viewed, application_started, etc.)
  - `event_data` (jsonb) - Additional event metadata
  - `created_at` (timestamptz) - Event timestamp
  
  ## Security
  
  - Enable Row Level Security (RLS) on all tables
  - Users can only access their own data (profiles, applications, documents, reminders, conversations, analytics)
  - Scholarships are readable by all authenticated users
  - Admins have full access to manage scholarships and view analytics
  - Documents require ownership verification
  - AI conversations are private to each user
  
  ## Indexes
  
  - Created indexes on foreign keys for optimal query performance
  - Added indexes on frequently queried fields (deadline, status, user_id)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  gpa numeric(3, 2),
  major text,
  university text,
  graduation_year integer,
  household_income numeric(12, 2),
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  deadline date NOT NULL,
  eligibility_criteria jsonb DEFAULT '{}',
  requirements text[] DEFAULT '{}',
  category text NOT NULL,
  provider text NOT NULL,
  apply_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  submitted_at timestamptz,
  notes text,
  ai_eligibility_score numeric(5, 2),
  ai_recommendations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, scholarship_id)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer NOT NULL,
  ai_parsed_data jsonb DEFAULT '{}',
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  uploaded_at timestamptz DEFAULT now()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id uuid NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  reminder_date timestamptz NOT NULL,
  message text NOT NULL,
  is_sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create ai_conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages jsonb DEFAULT '[]',
  context jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_scholarship_id ON applications(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_is_active ON scholarships(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for scholarships
CREATE POLICY "Anyone can view active scholarships"
  ON scholarships FOR SELECT
  TO authenticated
  USING (is_active = true OR created_by = auth.uid());

CREATE POLICY "Admins can insert scholarships"
  ON scholarships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update scholarships"
  ON scholarships FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete scholarships"
  ON scholarships FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- RLS Policies for applications
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
  ON applications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for reminders
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view own conversations"
  ON ai_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON ai_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON ai_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON ai_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for analytics_events
CREATE POLICY "Users can view own analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();