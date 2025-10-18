# SmartScholar - AI-Powered Financial Aid & Scholarship Management

SmartScholar is a comprehensive, AI-driven platform designed to help students discover, apply for, and manage financial aid and scholarships. Built with React, TypeScript, Supabase, and integrated AI capabilities.

## Features

### For Students

- **Intelligent Dashboard**: Real-time overview of applications, funding opportunities, and upcoming deadlines
- **AI Assistant**: Conversational AI powered by OpenAI to answer questions about financial aid, eligibility, and application strategies
- **Smart Scholarship Finder**: Search and filter scholarships with AI-powered match scoring based on your profile
- **Application Tracker**: Monitor all your scholarship applications with status updates and recommendations
- **Document Management**: Upload and organize required documents with AI parsing capabilities
- **Deadline Calendar**: Visual timeline of upcoming deadlines with automatic reminder system
- **Analytics Dashboard**: Track your success rate, funding secured, and application performance
- **Profile Management**: Maintain your academic profile for personalized scholarship recommendations

### For Administrators

- **Admin Panel**: Manage scholarships, view user analytics, and oversee platform operations
- **Scholarship Management**: Create, edit, and deactivate scholarship opportunities
- **User Analytics**: Monitor user engagement and platform usage

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend & Database
- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** database with Row Level Security
- **Supabase Edge Functions** for serverless API endpoints

### AI Integration
- **OpenAI GPT-3.5** for conversational AI assistant
- AI-powered eligibility matching and recommendations

## Database Schema

### Tables

1. **profiles** - User profiles with academic information
2. **scholarships** - Scholarship opportunities with eligibility criteria
3. **applications** - Student applications with status tracking
4. **documents** - Uploaded documents with verification status
5. **reminders** - Automated deadline reminders
6. **ai_conversations** - Chat history with AI assistant
7. **analytics_events** - User activity tracking

All tables include comprehensive Row Level Security policies to ensure data privacy.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment variables are pre-configured in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Key Features Explained

### AI-Powered Matching

The platform uses intelligent algorithms to match students with scholarships based on:
- GPA requirements
- Major/field of study
- Household income (for need-based aid)
- Other eligibility criteria

### Automated Reminders

Students can set reminders for upcoming deadlines. The system tracks:
- Application deadlines
- Document submission dates
- Review timelines

### Document Verification

Upload documents with AI parsing to extract:
- GPA from transcripts
- Income information from certificates
- Relevant dates and credentials

### Real-time Analytics

Track your scholarship journey with metrics including:
- Total applications submitted
- Success rate
- Funding secured
- Application status distribution

## Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Admins have elevated permissions for platform management
- Authentication handled securely by Supabase Auth
- All API requests require authentication

## Edge Functions

### ai-chat

Handles conversational AI interactions using OpenAI's API. Provides:
- Scholarship guidance
- Application advice
- Eligibility explanations
- Platform navigation help

**Note**: The AI assistant gracefully handles missing OpenAI API configuration and provides helpful fallback responses.

## Sample Data

The platform includes 15 pre-populated scholarships covering:
- Merit-based scholarships
- Need-based grants
- Major-specific opportunities
- Diversity scholarships
- Athletic scholarships

## User Roles

### Student (Default)
- Browse and apply for scholarships
- Track applications
- Upload documents
- Chat with AI assistant
- View analytics

### Admin
- All student features
- Create and manage scholarships
- View all users
- Access platform analytics

## Best Practices

1. **Complete Your Profile**: Fill out all profile information for better scholarship matches
2. **Upload Documents Early**: Keep transcripts and certificates ready
3. **Set Reminders**: Never miss a deadline with automated reminders
4. **Use AI Assistant**: Get personalized guidance and application tips
5. **Track Progress**: Monitor your applications and success rate

## Future Enhancements

Potential features for expansion:
- Email notifications via SendGrid/SMTP
- Google Calendar integration
- Document OCR with advanced parsing
- Mobile app version
- Scholarship success prediction ML models
- Integration with university financial aid offices
- Automated essay review and feedback

## Support

For questions or issues:
- Use the AI Assistant within the platform
- Check application logs in browser console
- Review Supabase dashboard for backend issues

## License

This project is built as a demonstration of AI-powered educational technology.

---

Built with modern web technologies to democratize access to educational funding.
