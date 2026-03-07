import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

let dbInstance: any = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // During build time, we might not have the DATABASE_URL.
    // We return a proxy or handle it gracefully if it's not a build environment.
    if (process.env.NODE_ENV === 'production' && !process.env.CI) {
      throw new Error('DATABASE_URL is not defined');
    }
    // Return a dummy or throw later when actually used
    return null;
  }

  const poolConnection = mysql.createPool(connectionString);
  dbInstance = drizzle(poolConnection, { schema, mode: 'default' });
  return dbInstance;
}

// Export a proxy or just the function
export const db = new Proxy({} as any, {
  get(target, prop) {
    const instance = getDb();
    if (!instance) {
      throw new Error('Database not initialized. Check DATABASE_URL.');
    }
    return instance[prop];
  }
});
