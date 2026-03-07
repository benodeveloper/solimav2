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

export const media = mysqlTable('media', {
  id: serial('id').primaryKey(),
  model_type: varchar('model_type', { length: 255 }).notNull(), // e.g., 'channels'
  model_id: int('model_id').notNull(),
  collection_name: varchar('collection_name', { length: 255 }).notNull(), // e.g., 'logo'
  name: varchar('name', { length: 255 }).notNull(),
  file_name: varchar('file_name', { length: 255 }).notNull(),
  mime_type: varchar('mime_type', { length: 255 }),
  disk: varchar('disk', { length: 255 }).default('public'),
  size: int('size').notNull(),
  manipulations: text('manipulations'), // JSON string for image manipulations
  custom_properties: text('custom_properties'), // JSON string for extra metadata
  generated_conversions: text('generated_conversions'), // JSON string for conversion info
  order_column: int('order_column'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
