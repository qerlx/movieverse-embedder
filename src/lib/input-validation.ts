import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Input validation schemas
export const searchSchema = z.object({
  query: z.string()
    .trim()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, 'Invalid characters in search query'),
  page: z.number().int().min(1).max(1000).optional().default(1),
});

export const movieIdSchema = z.object({
  id: z.number().int().positive('Invalid movie ID'),
});

export const episodeSchema = z.object({
  showId: z.number().int().positive(),
  season: z.number().int().min(1),
  episode: z.number().int().min(1),
});

export const userProfileSchema = z.object({
  displayName: z.string()
    .trim()
    .min(1, 'Display name required')
    .max(50, 'Display name too long')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Invalid characters in display name'),
  email: z.string().email('Invalid email address').optional(),
});

export const watchProgressSchema = z.object({
  mediaId: z.string().trim().min(1),
  mediaType: z.enum(['movie', 'tv']),
  progress: z.number().min(0).max(100),
  title: z.string().trim().min(1).max(200),
});

// Sanitization functions
export const sanitizeHtml = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
  });
};

export const sanitizeText = (input: string): string => {
  return input
    .trim()
    .replace(/[<>\"'&]/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;',
      };
      return map[char];
    });
};

// Rate limiting for API calls
class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxCalls: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.calls.has(key)) {
      this.calls.set(key, []);
    }
    
    const callTimes = this.calls.get(key)!;
    const recentCalls = callTimes.filter(time => time > windowStart);
    
    if (recentCalls.length >= maxCalls) {
      return false;
    }
    
    recentCalls.push(now);
    this.calls.set(key, recentCalls);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// Validation middleware
export const validateInput = <T>(schema: z.ZodSchema<T>, input: unknown): T => {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error('Invalid input');
  }
};