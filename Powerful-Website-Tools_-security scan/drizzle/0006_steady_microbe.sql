CREATE TABLE `tool_comparisons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`tool_ids` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `tools` ADD `content_quality` integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE `tools` ADD `speed_efficiency` integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE `tools` ADD `creative_features` integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE `tools` ADD `integration_options` integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE `tools` ADD `learning_curve` integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE `tools` ADD `value_for_money` integer DEFAULT 5;