CREATE TABLE `sources` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`streamable_id` int NOT NULL,
	`streamable_type` varchar(255) NOT NULL,
	`stream_id` varchar(255) NOT NULL,
	`label` varchar(255),
	`stream_name` varchar(255),
	`lang` varchar(50),
	`quality` varchar(50),
	`extension` varchar(20) DEFAULT 'm3u8',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sources_id` PRIMARY KEY(`id`)
);
