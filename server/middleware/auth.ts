import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import type { User } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || "carflex-secret-key-change-in-production";

export interface AuthRequest extends Request {
  user?: User;
  userId?: string;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  const user = await storage.getUser(decoded.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  req.user = user;
  req.userId = user.id;
  next();
}

export async function optionalAuthMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (decoded) {
      const user = await storage.getUser(decoded.userId);
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
  }

  next();
}
