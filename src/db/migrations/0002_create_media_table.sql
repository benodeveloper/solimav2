CREATE TABLE `media` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`model_type` varchar(255) NOT NULL,
	`model_id` int NOT NULL,
	`collection_name` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`mime_type` varchar(255),
	`disk` varchar(255) DEFAULT 'public',
	`size` int NOT NULL,
	`manipulations` text,
	`custom_properties` text,
	`generated_conversions` text,
	`order_column` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
