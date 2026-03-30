/**
 * Master Skill List for Ignitera Wallet
 * To prevent typos and redundant tag creation.
 */

export const MASTER_SKILLS = [
  'Next.js',
  'React',
  'TypeScript',
  'Python',
  'AWS',
  'Azure',
  'PostgreSQL',
  'Solidity',
  'Machine Learning',
  'UI Design',
  'UX Strategy',
  'Project Management',
  'Systems Architecture',
  'Cyber Security',
  'Agile Coaching',
  'Marketing Data Science',
  'Branding',
  'Customer Success'
] as const;

export type MasterSkill = typeof MASTER_SKILLS[number];
