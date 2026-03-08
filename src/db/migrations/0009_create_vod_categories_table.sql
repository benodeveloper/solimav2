CREATE TABLE `vod_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` varchar(255) NOT NULL,
	`category_name` varchar(255) NOT NULL,
	`parent_id` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vod_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `vod_categories_category_id_unique` UNIQUE(`category_id`)
);
