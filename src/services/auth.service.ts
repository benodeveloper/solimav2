import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

/**
 * Service for handling authentication logic.
 * Author: benodeveloper
 */
export class AuthService {
  /**
   * Finds a user by email.
   */
  static async getUserByEmail(email: string) {
    const results = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return results[0] || null;
  }

  /**
   * Verifies user credentials.
   */
  static async verifyCredentials(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Creates a new user.
   */
  static async createUser(data: any) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const [result] = await db.insert(users).values({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });
    return result;
  }
}
