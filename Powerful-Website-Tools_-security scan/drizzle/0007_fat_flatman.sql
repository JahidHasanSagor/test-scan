CREATE TABLE `aggregated_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` integer NOT NULL,
	`category` text NOT NULL,
	`metric_scores` text,
	`overall_average` real,
	`total_reviews` integer DEFAULT 0,
	`verified_reviews` integer DEFAULT 0,
	`editorial_reviews` integer DEFAULT 0,
	`confidence_score` real,
	`last_calculated_at` text,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `aggregated_scores_tool_id_unique` ON `aggregated_scores` (`tool_id`);--> statement-breakpoint
CREATE TABLE `editorial_scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` integer,
	`category` text NOT NULL,
	`metric_scores` text,
	`editor_id` text,
	`notes` text,
	`is_active` integer DEFAULT true,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`editor_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `genre_criteria` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`metric_key` text NOT NULL,
	`metric_label` text NOT NULL,
	`metric_icon` text,
	`metric_color` text,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `structured_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` integer,
	`user_id` text,
	`category` text NOT NULL,
	`metric_scores` text,
	`metric_comments` text,
	`overall_rating` integer,
	`review_text` text,
	`reviewer_type` text DEFAULT 'user',
	`is_verified` integer DEFAULT false,
	`status` text DEFAULT 'pending',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
