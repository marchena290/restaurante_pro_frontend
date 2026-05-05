import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InputSanitizerService {
  // Regex to detect common SQL/meta-injection patterns and dangerous sequences
  private suspicious = /(;|--|\/\*|\*\/|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|UNION|TRUNCATE|MERGE|CALL|DECLARE|BEGIN)\b|\b(INFORMATION_SCHEMA)\b|\b(CHAR\()|\b(SLEEP\()|\b(BENCHMARK\()|\b(0x[0-9a-fA-F]+)\b)/i;

  isSafeString(value: string | null | undefined): boolean {
    if (!value && value !== '') return true; // treat null/undefined as safe at this level
    const v = String(value);
    // remove harmless whitespace/newlines for checking
    const compact = v.replace(/[\r\n\t]/g, ' ').trim();
    if (!compact) return true;
    // reject if suspicious patterns exist
    if (this.suspicious.test(compact)) return false;
    // reject some classic tautologies
    const lower = compact.toLowerCase();
    if (lower.includes("' or '") || lower.includes('" or "') || /or\s+1=1/.test(lower)) return false;
    return true;
  }

  sanitizeString(value: string | null | undefined): string {
    if (value === null || value === undefined) return '';
    // Basic sanitization: trim and remove control chars
    let v = String(value).trim();
    v = v.replace(/[\x00-\x1F\x7F]/g, '');
    // Optionally remove suspicious SQL tokens (conservative removal)
    v = v.replace(/(;|--|\/\*|\*\/)/g, '');
    return v;
  }
}
