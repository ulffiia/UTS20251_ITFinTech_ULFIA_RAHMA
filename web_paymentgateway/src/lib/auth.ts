import bcrypt from 'bcryptjs';

export async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyHash(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: any): string {
  // Implementasi JWT signing
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
}