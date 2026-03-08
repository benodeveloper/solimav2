CREATE TABLE `sync_tasks` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`task_type` varchar(50) NOT NULL,
	`status` varchar(50) DEFAULT 'pending',
	`progress` int DEFAULT 0,
	`total_items` int DEFAULT 0,
	`current_item` varchar(255),
	`logs` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sync_tasks_id` PRIMARY KEY(`id`)
);
