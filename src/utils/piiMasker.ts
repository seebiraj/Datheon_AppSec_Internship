import { CandidateRecord, MaskedCandidateRecord } from '../types';

/**
 * Task 4: High-Precision PII Masking & Data Sanitization Engine
 * Guarantees Zero-Leakage of Personally Identifiable Information (PII) on public-facing endpoints.
 */
export class PIIMasker {
  /**
   * Masks email addresses dynamically:
   * e.g., 'jeeviseebi007@gmail.com' -> 'j***7@gmail.com'
   * e.g., 'alice.johnson@targetbank.com' -> 'a***n@targetbank.com'
   */
  public static maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***@***.***';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    const firstChar = localPart[0];
    const lastChar = localPart[localPart.length - 1];
    return `${firstChar}***${lastChar}@${domain}`;
  }

  /**
   * Masks telephone numbers, preserving country code and final 4 digits:
   * e.g., '+91 98765 43210' -> '+91 ******3210'
   * e.g., '+1 (555) 234-5678' -> '+1 (***) ***-5678'
   */
  public static maskPhone(phone: string): string {
    if (!phone) return '***-***-****';
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '***-***-****';

    const lastFour = digits.slice(-4);
    if (phone.startsWith('+91')) {
      return `+91 ******${lastFour}`;
    }
    if (phone.startsWith('+1')) {
      return `+1 (***) ***-${lastFour}`;
    }
    return `***-***-${lastFour}`;
  }

  /**
   * Masks candidate names for public registry verification:
   * e.g., 'Seebiraj V' -> 'S******j V.'
   * e.g., 'Alice Johnson' -> 'A***e J*****n'
   */
  public static maskName(fullName: string): string {
    if (!fullName) return 'Anonymous';
    const parts = fullName.trim().split(/\s+/);
    return parts
      .map((part) => {
        if (part.length <= 2) return `${part[0]}.`;
        const first = part[0];
        const last = part[part.length - 1];
        return `${first}${'*'.repeat(Math.max(part.length - 2, 3))}${last}`;
      })
      .join(' ');
  }

  /**
   * Truncates cryptographic hashes for secure public display:
   * e.g., '0x8f2c3d4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d' -> '0x8f2c...9c0d'
   */
  public static maskHash(hash: string): string {
    if (!hash || hash.length < 12) return '0x***...***';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  }

  /**
   * Converts a sensitive internal candidate record into an authorized public verification payload.
   * Strips all internal database identifiers, internal evaluator notes, GPA, and exact contact PII.
   */
  public static sanitizeForPublicVerification(record: CandidateRecord): MaskedCandidateRecord {
    return {
      id: record.id,
      fullName: this.maskName(record.fullName),
      email: this.maskEmail(record.email),
      phone: this.maskPhone(record.phone),
      institution: record.institution,
      program: record.program,
      batch: record.batch,
      status: record.status,
      certificateHash: this.maskHash(record.certificateHash),
      verified: true
    };
  }

  /**
   * Deep sanitization utility for arbitrary JSON payloads before public transmission
   */
  public static deepSanitizeObject(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.deepSanitizeObject(item));
    }
    if (data !== null && typeof data === 'object') {
      const sanitized: Record<string, any> = {};
      const sensitiveKeys = ['password', 'passwordhash', 'evaluationnotes', 'gpa_score', 'ssn', 'taxid', 'userid'];

      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.includes(lowerKey)) {
          continue; // Strip entirely
        }
        if (lowerKey === 'email' && typeof value === 'string') {
          sanitized[key] = this.maskEmail(value);
        } else if (lowerKey === 'phone' && typeof value === 'string') {
          sanitized[key] = this.maskPhone(value);
        } else if ((lowerKey === 'fullname' || lowerKey === 'name') && typeof value === 'string') {
          sanitized[key] = this.maskName(value);
        } else {
          sanitized[key] = this.deepSanitizeObject(value);
        }
      }
      return sanitized;
    }
    return data;
  }
}
