CREATE TABLE `vod_streams` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`num` int,
	`name` text NOT NULL,
	`stream_type` varchar(50) DEFAULT 'movie',
	`stream_id` int,
	`stream_icon` text,
	`rating` varchar(50),
	`rating_5based` varchar(50),
	`tmdb` varchar(50),
	`trailer` varchar(255),
	`added` int,
	`is_adult` tinyint DEFAULT 0,
	`category_id` int,
	`category_ids` json,
	`container_extension` varchar(20),
	`custom_sid` varchar(255),
	`direct_source` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vod_streams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `vod_streams` ADD CONSTRAINT `vod_streams_category_id_vod_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `vod_categories`(`id`) ON DELETE no action ON UPDATE no action;