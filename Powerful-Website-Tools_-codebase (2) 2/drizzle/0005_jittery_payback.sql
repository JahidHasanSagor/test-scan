CREATE TABLE `global_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setting_key` text NOT NULL,
	`setting_value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `global_settings_setting_key_unique` ON `global_settings` (`setting_key`);--> statement-breakpoint
CREATE TABLE `user_submission_tracking` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`first_submission_free_used` integer DEFAULT false NOT NULL,
	`total_submissions_count` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_submission_tracking_user_id_unique` ON `user_submission_tracking` (`user_id`);