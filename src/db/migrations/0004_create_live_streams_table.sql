CREATE TABLE `live_streams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`num` int,
	`name` varchar(255) NOT NULL,
	`stream_type` varchar(50),
	`stream_id` varchar(255) NOT NULL,
	`stream_icon` text,
	`epg_channel_id` varchar(255),
	`added` varchar(255),
	`is_adult` boolean DEFAULT false,
	`category_id` int,
	`category_ids` json,
	`custom_sid` varchar(255),
	`direct_source` text,
	`tv_archive_duration` int DEFAULT 0,
	`tv_archive` tinyint DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `live_streams_id` PRIMARY KEY(`id`),
	CONSTRAINT `live_streams_stream_id_unique` UNIQUE(`stream_id`)
);
--> statement-breakpoint
ALTER TABLE `live_streams` ADD CONSTRAINT `live_streams_category_id_live_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `live_categories`(`id`) ON DELETE no action ON UPDATE no action;