CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` integer,
	`user_id` text NOT NULL,
	`rating` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `saved_tools` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`tool_id` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `similar_tools` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` integer,
	`similar_tool_id` integer,
	`relevance_score` integer DEFAULT 50,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`similar_tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tool_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` integer,
	`viewed_at` text NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tools` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`url` text NOT NULL,
	`image` text,
	`category` text NOT NULL,
	`pricing` text NOT NULL,
	`type` text NOT NULL,
	`features` text,
	`popularity` integer DEFAULT 0,
	`is_featured` integer DEFAULT false,
	`status` text DEFAULT 'pending',
	`submitted_by_user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
