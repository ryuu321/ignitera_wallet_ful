/**
 * Master Skill List with Categories
 */

export const SKILL_CATEGORIES: { [key: string]: string[] } = {
  'Development': [
    'Next.js',
    'React',
    'TypeScript',
    'Python',
    'PostgreSQL',
    'Solidity',
    'Systems Architecture'
  ],
  'Design': [
    'UI Design',
    'UX Strategy',
    'Branding'
  ],
  'AI & Data': [
    'Machine Learning',
    'Marketing Data Science'
  ],
  'Cloud & Security': [
    'AWS',
    'Azure',
    'Cyber Security'
  ],
  'Management': [
    'Project Management',
    'Agile Coaching',
    'Customer Success'
  ]
};

export const MASTER_SKILLS = Object.values(SKILL_CATEGORIES).flat();
