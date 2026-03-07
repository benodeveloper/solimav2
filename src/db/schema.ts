import { mysqlTable, serial, varchar, timestamp, text, int, boolean } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const channels = mysqlTable('channels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  num: int('num'),
  is_adult: boolean("is_adult").default(false),
  status: varchar('status', { length: 50 }).default('active'), // active, inactive, archived
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
