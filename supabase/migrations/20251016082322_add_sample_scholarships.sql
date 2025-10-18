/*
  # Add Sample Scholarships
  
  ## Overview
  Populates the database with sample scholarship data to demonstrate the platform functionality
  
  ## Changes
  1. Inserts 15 diverse scholarship opportunities with varying:
     - Categories (merit, need-based, major-specific, diversity)
     - Award amounts ($1,000 - $25,000)
     - Deadlines (spread across upcoming months)
     - Eligibility criteria
  
  ## Purpose
  Provides immediate, realistic data for users to explore and interact with the platform
*/

INSERT INTO scholarships (title, description, amount, deadline, category, provider, eligibility_criteria, requirements, is_active, apply_url) VALUES
(
  'Excellence in STEM Scholarship',
  'A competitive scholarship for students pursuing degrees in Science, Technology, Engineering, or Mathematics. This scholarship recognizes academic excellence and commitment to STEM fields.',
  5000,
  '2025-12-15',
  'merit',
  'National STEM Foundation',
  '{"min_gpa": 3.5, "majors": ["Computer Science", "Engineering", "Mathematics", "Physics", "Chemistry", "Biology"]}',
  ARRAY['Transcript', 'Essay', 'Recommendation Letter'],
  true,
  'https://example.com/stem-scholarship'
),
(
  'Community Leadership Award',
  'For students who have demonstrated exceptional leadership in their communities through volunteer work and civic engagement.',
  3000,
  '2025-11-30',
  'merit',
  'American Community Foundation',
  '{"min_gpa": 3.0}',
  ARRAY['Essay', 'Community Service Documentation', 'Recommendation Letter'],
  true,
  null
),
(
  'First Generation College Student Grant',
  'Supporting first-generation college students in their pursuit of higher education with financial assistance and mentorship opportunities.',
  7500,
  '2026-01-20',
  'need',
  'Education Access Alliance',
  '{"max_income": 60000}',
  ARRAY['Income Certificate', 'Personal Statement', 'Academic Records'],
  true,
  'https://example.com/first-gen-grant'
),
(
  'Women in Technology Scholarship',
  'Empowering women pursuing careers in technology fields with financial support and networking opportunities.',
  10000,
  '2025-12-01',
  'diversity',
  'Tech Diversity Initiative',
  '{"min_gpa": 3.2, "majors": ["Computer Science", "Information Technology", "Software Engineering", "Data Science"]}',
  ARRAY['Transcript', 'Personal Essay', 'Portfolio or Project'],
  true,
  null
),
(
  'Athletic Excellence Scholarship',
  'For student-athletes who excel both in their sport and academics, supporting their dual commitment to athletics and education.',
  8000,
  '2025-11-15',
  'athletic',
  'National Sports Association',
  '{"min_gpa": 2.8}',
  ARRAY['Athletic Resume', 'Coach Recommendation', 'Academic Transcript'],
  true,
  'https://example.com/athletic-scholarship'
),
(
  'Future Educators Grant',
  'Supporting students committed to careers in education with funding and resources to become impactful teachers.',
  4500,
  '2026-02-01',
  'major-specific',
  'Teachers of Tomorrow Fund',
  '{"min_gpa": 3.0, "majors": ["Education", "Teaching", "Curriculum Development"]}',
  ARRAY['Transcript', 'Teaching Philosophy Essay', 'Recommendation Letter'],
  true,
  null
),
(
  'Innovation and Entrepreneurship Award',
  'For students with innovative business ideas or entrepreneurial ventures, providing seed funding and mentorship.',
  15000,
  '2025-12-31',
  'merit',
  'Young Entrepreneurs Foundation',
  '{"min_gpa": 3.3}',
  ARRAY['Business Plan', 'Video Pitch', 'Recommendation Letters'],
  true,
  'https://example.com/entrepreneur-award'
),
(
  'Environmental Stewardship Scholarship',
  'Supporting students passionate about environmental science, sustainability, and conservation efforts.',
  6000,
  '2026-01-15',
  'major-specific',
  'Green Future Alliance',
  '{"min_gpa": 3.4, "majors": ["Environmental Science", "Sustainability", "Biology", "Ecology"]}',
  ARRAY['Transcript', 'Environmental Project Description', 'Recommendation Letter'],
  true,
  null
),
(
  'Arts and Creative Expression Grant',
  'For talented students in visual arts, music, theater, or creative writing who demonstrate exceptional artistic ability.',
  5500,
  '2025-11-20',
  'major-specific',
  'National Arts Council',
  '{"min_gpa": 2.5, "majors": ["Fine Arts", "Music", "Theater", "Creative Writing", "Design"]}',
  ARRAY['Portfolio', 'Artist Statement', 'Recommendation Letter'],
  true,
  'https://example.com/arts-grant'
),
(
  'Healthcare Heroes Scholarship',
  'Supporting future healthcare professionals committed to serving communities and advancing medical care.',
  12000,
  '2025-12-20',
  'major-specific',
  'Healthcare Education Foundation',
  '{"min_gpa": 3.6, "majors": ["Nursing", "Medicine", "Healthcare Administration", "Public Health"]}',
  ARRAY['Transcript', 'Healthcare Experience Essay', 'Clinical Supervisor Recommendation'],
  true,
  null
),
(
  'Underrepresented Minorities in Business',
  'Promoting diversity in business fields by supporting underrepresented minority students pursuing business degrees.',
  9000,
  '2026-01-10',
  'diversity',
  'Inclusive Business Leaders',
  '{"min_gpa": 3.0, "majors": ["Business Administration", "Finance", "Marketing", "Management"]}',
  ARRAY['Transcript', 'Diversity Statement', 'Recommendation Letter'],
  true,
  'https://example.com/business-diversity'
),
(
  'Rural Student Success Grant',
  'Providing opportunities for students from rural communities to access higher education and career advancement.',
  4000,
  '2025-11-25',
  'need',
  'Rural Education Initiative',
  '{"max_income": 55000}',
  ARRAY['Income Documentation', 'Rural Community Verification', 'Personal Statement'],
  true,
  null
),
(
  'Research Excellence Fellowship',
  'For undergraduate researchers making significant contributions to their fields through original research projects.',
  20000,
  '2026-02-15',
  'merit',
  'Academic Research Foundation',
  '{"min_gpa": 3.8}',
  ARRAY['Research Proposal', 'Faculty Sponsor Letter', 'Academic Transcript', 'Research Publications'],
  true,
  'https://example.com/research-fellowship'
),
(
  'Veterans Education Assistance',
  'Supporting military veterans and their families in pursuing higher education and career transitions.',
  10000,
  '2025-12-10',
  'diversity',
  'Veterans Education Fund',
  '{}',
  ARRAY['Military Service Documentation', 'Personal Statement', 'Academic Records'],
  true,
  null
),
(
  'Global Citizens Scholarship',
  'For students with international experience or commitment to global issues and cross-cultural understanding.',
  7000,
  '2026-01-05',
  'merit',
  'International Education Alliance',
  '{"min_gpa": 3.3}',
  ARRAY['Transcript', 'International Experience Essay', 'Language Proficiency Certificate', 'Recommendation Letter'],
  true,
  'https://example.com/global-scholarship'
)
ON CONFLICT (id) DO NOTHING;