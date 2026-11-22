import { CandidateRecord, UserRole } from '../types';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string; // Plaintext or hashed for demonstration
  role: UserRole;
  candidateId?: string;
}

class DatabaseStore {
  private users: Map<string, UserAccount> = new Map();
  private candidates: Map<string, CandidateRecord> = new Map();

  constructor() {
    this.seed();
  }

  public seed(): void {
    this.users.clear();
    this.candidates.clear();

    // 1. Candidate User A (Primary Student: Seebiraj V)
    this.users.set('user-101', {
      id: 'user-101',
      email: 'jeeviseebi007@gmail.com',
      passwordHash: 'CyberSecPass2026!@#',
      role: 'candidate',
      candidateId: 'DT-2026-TV82L'
    });

    // 2. Candidate User B (Victim Student: Alice Johnson)
    this.users.set('user-102', {
      id: 'user-102',
      email: 'alice.johnson@targetbank.com',
      passwordHash: 'AliceP@ssw0rd!2026',
      role: 'candidate',
      candidateId: 'DT-2026-001'
    });

    // 3. Candidate User C (Victim Student: Bob Miller)
    this.users.set('user-103', {
      id: 'user-103',
      email: 'bob.miller@enterprise.io',
      passwordHash: 'BobSecurePass789#',
      role: 'candidate',
      candidateId: 'DT-2026-002'
    });

    // 4. Directorate Administrator (Authorized to view all records)
    this.users.set('user-admin', {
      id: 'user-admin',
      email: 'directorate@datheon.tech',
      passwordHash: 'AdminMasterKey2026!@#',
      role: 'directorate'
    });

    // Seed candidate records
    this.candidates.set('DT-2026-TV82L', {
      id: 'DT-2026-TV82L',
      userId: 'user-101',
      fullName: 'Seebiraj V',
      email: 'jeeviseebi007@gmail.com',
      phone: '+91 98765 43210',
      institution: 'Jeppiaar institute of technology',
      program: 'Application Security & API Pentesting Internship',
      batch: 'Batch 01',
      status: 'Active & In Progress',
      gpa_score: '9.4 / 10',
      evaluationNotes: 'High-performing candidate. All preliminary authorization and networking gates cleared. Offer letter dispatched.',
      certificateHash: '0x8f2c3d4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
      deadline: 'Fri, Dec 18, 2026',
      daysLeft: 27,
      createdAt: '2026-11-20T00:00:00.000Z'
    });

    this.candidates.set('DT-2026-001', {
      id: 'DT-2026-001',
      userId: 'user-102',
      fullName: 'Alice Johnson',
      email: 'alice.johnson@targetbank.com',
      phone: '+1 (555) 234-5678',
      institution: 'Stanford University',
      program: 'Cloud Security Engineering Track',
      batch: 'Batch 01',
      status: 'Active & In Progress',
      gpa_score: '3.85 / 4.0',
      evaluationNotes: 'Confidential review: Undergoing background verification for cloud infrastructure access.',
      certificateHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      deadline: 'Fri, Dec 18, 2026',
      daysLeft: 27,
      createdAt: '2026-11-18T00:00:00.000Z'
    });

    this.candidates.set('DT-2026-002', {
      id: 'DT-2026-002',
      userId: 'user-103',
      fullName: 'Bob Miller',
      email: 'bob.miller@enterprise.io',
      phone: '+44 20 7946 0912',
      institution: 'Imperial College London',
      program: 'DevSecOps & Zero-Trust Architecture',
      batch: 'Batch 01',
      status: 'Active & In Progress',
      gpa_score: 'First Class Honours',
      evaluationNotes: 'Confidential salary negotiation: Offered $125,000 AppSec consulting retention bonus.',
      certificateHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
      deadline: 'Fri, Dec 18, 2026',
      daysLeft: 27,
      createdAt: '2026-11-19T00:00:00.000Z'
    });
  }

  // --- VULNERABLE DATA ACCESS PATTERNS (Task 1 Anti-Pattern) ---
  /**
   * Blind Lookup: Queries database by ID alone without tenant or session context.
   * This is the exact root-cause of OWASP API1:2023 - Broken Object Level Authorization (BOLA/IDOR).
   */
  public findByIdBlind(candidateId: string): CandidateRecord | undefined {
    return this.candidates.get(candidateId);
  }

  // --- HARDENED ZERO-TRUST ACCESS PATTERNS (Task 2 Defensive Design) ---
  /**
   * Defensive Ownership Lookup:
   * Cross-references the requested resource identifier against BOTH:
   * 1. The resource identifier (id)
   * 2. The session subject (userId or email)
   * 3. Directorate/Admin role bypass with audit logging
   */
  public findByIdWithOwnership(
    candidateId: string,
    sessionUserId: string,
    role: UserRole
  ): CandidateRecord | null {
    const record = this.candidates.get(candidateId);
    if (!record) {
      return null;
    }

    // Administrators and Directorates have audited administrative access
    if (role === 'admin' || role === 'directorate') {
      return record;
    }

    // Strict multi-tenant owner check: Does this record belong to the calling user?
    if (record.userId === sessionUserId) {
      return record;
    }

    // Ownership violation! Return null to allow controller to reject gracefully.
    return null;
  }

  // --- User Auth & Public Lookups ---
  public findUserByEmail(email: string): UserAccount | undefined {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  public findUserById(userId: string): UserAccount | undefined {
    return this.users.get(userId);
  }

  public getAllCandidatesBlind(): CandidateRecord[] {
    return Array.from(this.candidates.values());
  }
}

export const db = new DatabaseStore();
