CREATE TABLE `main_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`icon` text,
	`color` text,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`tool_count` integer DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `main_categories_slug_unique` ON `main_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `sub_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`main_category_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`tool_count` integer DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`main_category_id`) REFERENCES `main_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sub_categories_slug_unique` ON `sub_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `tool_interactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` integer NOT NULL,
	`user_id` text,
	`session_id` text NOT NULL,
	`interaction_type` text NOT NULL,
	`main_category_id` integer,
	`sub_category_id` integer,
	`tool_type_id` integer,
	`ip_address` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`main_category_id`) REFERENCES `main_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tool_type_id`) REFERENCES `tool_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tool_taxonomy` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` integer NOT NULL,
	`main_category_id` integer NOT NULL,
	`sub_category_id` integer,
	`tool_type_id` integer,
	`is_primary` integer DEFAULT false,
	`created_at` text NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`main_category_id`) REFERENCES `main_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tool_type_id`) REFERENCES `tool_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tool_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sub_category_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`tool_count` integer DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tool_types_slug_unique` ON `tool_types` (`slug`);