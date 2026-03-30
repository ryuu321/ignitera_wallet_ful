export interface User {
  id: string;
  name: string;
  role: 'PLAYER' | 'MANAGER';
  skills: string[];
  balanceFlow: number;
  balanceStock: number;
  score: number;
}

export interface Task {
  id: string;
  title: string;
  requester: string;
  assignee?: string;
  reward: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
}

export const mockUsers: User[] = [
  { id: '1', name: 'Anonymous-Shadow-22', role: 'PLAYER', skills: ['React', 'Next.js'], balanceFlow: 500, balanceStock: 120, score: 85.5 },
  { id: '2', name: 'Anonymous-Vort-09', role: 'MANAGER', skills: ['Product Design', 'Agile'], balanceFlow: 2000, balanceStock: 450, score: 92.1 },
  { id: '3', name: 'Anonymous-Glim-15', role: 'PLAYER', skills: ['Python', 'SQL'], balanceFlow: 800, balanceStock: 80, score: 78.0 },
];

export const mockTasks: Task[] = [
  { id: 't1', title: 'Internal UI Refactor', requester: 'Anonymous-Vort-09', reward: 300, status: 'OPEN' },
  { id: 't2', title: 'API Documentation Update', requester: 'Anonymous-Vort-09', assignee: 'Anonymous-Shadow-22', reward: 150, status: 'IN_PROGRESS' },
  { id: 't3', title: 'User Analytics Dashboard', requester: 'Anonymous-Vort-09', reward: 500, status: 'OPEN' },
];

export const kpiData = {
  circulation: [20, 45, 30, 80, 55, 90, 120], // Last 7 days
  completionRate: 78.5,
  dispersion: 0.82,
};
