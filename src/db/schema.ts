import { mysqlTable, serial, varchar, timestamp, text, int, boolean, json, tinyint } from 'drizzle-orm/mysql-core';

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

export const liveCategories = mysqlTable('live_categories', {
  id: int('id').primaryKey().autoincrement(),
  category_id: varchar('category_id', { length: 255 }).notNull().unique(),
  category_name: varchar('category_name', { length: 255 }).notNull(),
  parent_id: varchar('parent_id', { length: 255 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const liveStreams = mysqlTable('live_streams', {
  id: int('id').primaryKey().autoincrement(),
  num: int('num'),
  name: varchar('name', { length: 255 }).notNull(),
  stream_type: varchar('stream_type', { length: 50 }),
  stream_id: varchar('stream_id', { length: 255 }).notNull().unique(),
  stream_icon: text('stream_icon'),
  epg_channel_id: varchar('epg_channel_id', { length: 255 }),
  added: varchar('added', { length: 255 }),
  is_adult: boolean('is_adult').default(false),
  category_id: int('category_id').references(() => liveCategories.id),
  category_ids: json("category_ids").$type<number[]>(),
  custom_sid: varchar("custom_sid", { length: 255 }),
  direct_source: text("direct_source"),
  tv_archive_duration: int("tv_archive_duration").default(0),
  tv_archive: tinyint("tv_archive").default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const credentials = mysqlTable("credentials", {
  id: serial("id").primaryKey(),
  host: varchar("host", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  fetched_at: timestamp("fetched_at").defaultNow(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
  expires_at: timestamp("expires_at").notNull(),
});

export const syncTasks = mysqlTable('sync_tasks', {
  id: serial('id').primaryKey(),
  task_type: varchar('task_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  progress: int('progress').default(0),
  total_items: int('total_items').default(0),
  current_item: varchar('current_item', { length: 255 }),
  logs: text('logs'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Channel = typeof channels.$inferSelect;
export type NewChannel = typeof channels.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type LiveCategory = typeof liveCategories.$inferSelect;
export type NewLiveCategory = typeof liveCategories.$inferInsert;
export type LiveStream = typeof liveStreams.$inferSelect;
export type NewLiveStream = typeof liveStreams.$inferInsert;
export type Credential = typeof credentials.$inferSelect;
export type NewCredential = typeof credentials.$inferInsert;
export type SyncTask = typeof syncTasks.$inferSelect;
export type NewSyncTask = typeof syncTasks.$inferInsert;
