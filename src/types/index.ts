export type UserRole = 'candidate' | 'admin' | 'directorate';

export interface UserSession {
  userId: string;
  email: string;
  role: UserRole;
  candidateId?: string;
  iat?: number;
  exp?: number;
}

export interface CandidateRecord {
  id: string; // e.g., 'DT-2026-TV82L', 'DT-2026-001'
  userId: string; // Internal owner foreign key
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  program: string;
  batch: string;
  status: 'Active & In Progress' | 'Completed' | 'Suspended';
  gpa_score: string;
  evaluationNotes: string; // Sensitive internal Directorate review
  certificateHash: string;
  deadline: string;
  daysLeft: number;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RateLimitEntry {
  count: number;
  startTime: number;
}

export interface MaskedCandidateRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  program: string;
  batch: string;
  status: string;
  certificateHash: string;
  verified: boolean;
}
