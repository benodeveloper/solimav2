CREATE TABLE `channels` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`num` int,
	`is_adult` boolean DEFAULT false,
	`status` varchar(50) DEFAULT 'active',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `channels_id` PRIMARY KEY(`id`)
);
