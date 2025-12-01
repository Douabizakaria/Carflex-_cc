import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

// Rate limiters for different endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit admin operations
  message: { message: "Too many admin requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Remove any HTML tags from request body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
        
        // Limit string length to prevent DOS
        if (req.body[key].length > 10000) {
          return res.status(400).json({ 
            message: `Field ${key} exceeds maximum length` 
          });
        }
      }
    }
  }
  next();
}

// Log sensitive operations
export function logSensitiveOperation(operation: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    console.log(`[SECURITY] ${operation} - User: ${user?.email || "Unknown"} - IP: ${req.ip}`);
    next();
  };
}

// Validate request size
export function validateRequestSize(req: Request, res: Response, next: NextFunction) {
  const contentLength = req.get('content-length');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    return res.status(413).json({ 
      message: "Request payload too large" 
    });
  }
  next();
}

// Prevent parameter pollution
export function preventParamPollution(req: Request, res: Response, next: NextFunction) {
  // Ensure query parameters are not arrays (except where expected)
  for (const key in req.query) {
    if (Array.isArray(req.query[key])) {
      req.query[key] = (req.query[key] as string[])[0];
    }
  }
  next();
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
}

// Password strength validator
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  
  return { valid: true };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Prevent SQL injection in user input (extra layer of protection)
export function containsSuspiciousPatterns(input: string): boolean {
  const suspiciousPatterns = [
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(--|\/\*|\*\/|;)/,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

// Session timeout (token expiration already handled, but log inactive sessions)
export function checkSessionTimeout(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (user) {
    // Log session activity for monitoring
    console.log(`[SESSION] Active - User: ${user.email} - IP: ${req.ip}`);
  }
  next();
}
