import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

/** Hash password menggunakan bcrypt */
export async function hash(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Verifikasi password dengan hash bcrypt */
export async function verifyHash(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Bentuk payload JWT yang aman */
interface SessionPayload extends JwtPayload {
  sub: string;      // user id
  email?: string;
  role?: string;
}

/** Buat token JWT untuk sesi pengguna */
export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
}
