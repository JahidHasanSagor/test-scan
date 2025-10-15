import { sqliteTable, integer, text, real, unique } from 'drizzle-orm/sqlite-core';

export const tools = sqliteTable('tools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  url: text('url').notNull(),
  image: text('image'),
  category: text('category').notNull(),
  pricing: text('pricing').notNull(),
  type: text('type').notNull(),
  features: text('features', { mode: 'json' }),
  popularity: integer('popularity').default(0),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  isToolOfTheWeek: integer('is_tool_of_the_week', { mode: 'boolean' }).default(false),
  status: text('status').default('pending'),
  submittedByUserId: text('submitted_by_user_id'),
  contentQuality: integer('content_quality').default(5),
  speedEfficiency: integer('speed_efficiency').default(5),
  creativeFeatures: integer('creative_features').default(5),
  integrationOptions: integer('integration_options').default(5),
  learningCurve: integer('learning_curve').default(5),
  valueForMoney: integer('value_for_money').default(5),
  isPremium: integer('is_premium', { mode: 'boolean' }).default(false),
  videoUrl: text('video_url'),
  extendedDescription: text('extended_description'),
  ctaText: text('cta_text'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id').references(() => tools.id),
  userId: text('user_id').notNull(),
  rating: integer('rating').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

export const similarTools = sqliteTable('similar_tools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id').references(() => tools.id),
  similarToolId: integer('similar_tool_id').references(() => tools.id),
  relevanceScore: integer('relevance_score').default(50),
});

export const savedTools = sqliteTable('saved_tools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  toolId: integer('tool_id').references(() => tools.id),
  createdAt: text('created_at').notNull(),
});

export const toolViews = sqliteTable('tool_views', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id').references(() => tools.id),
  viewedAt: text('viewed_at').notNull(),
});

export const toolComparisons = sqliteTable('tool_comparisons', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id),
  toolIds: text('tool_ids', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
});

// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Add blog system tables at the end
export const blogCategories = sqliteTable('blog_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
});

export const blogTags = sqliteTable('blog_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: text('created_at').notNull(),
});

export const blogPosts = sqliteTable('blog_posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  featuredImage: text('featured_image'),
  authorId: text('author_id').references(() => user.id),
  categoryId: integer('category_id').references(() => blogCategories.id),
  status: text('status').notNull().default('draft'),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  viewCount: integer('view_count').default(0),
  readTime: text('read_time').notNull(),
  publishedAt: text('published_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const blogPostTags = sqliteTable('blog_post_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => blogPosts.id),
  tagId: integer('tag_id').references(() => blogTags.id),
  createdAt: text('created_at').notNull(),
});

export const blogComments = sqliteTable('blog_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('post_id').references(() => blogPosts.id),
  userId: text('user_id').references(() => user.id),
  authorName: text('author_name'),
  authorEmail: text('author_email'),
  content: text('content').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Global settings table to track system-wide metrics
export const globalSettings = sqliteTable('global_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  settingKey: text('setting_key').notNull().unique(),
  settingValue: text('setting_value').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// User submission tracking table
export const userSubmissionTracking = sqliteTable('user_submission_tracking', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id),
  firstSubmissionFreeUsed: integer('first_submission_free_used', { mode: 'boolean' }).default(false).notNull(),
  totalSubmissionsCount: integer('total_submissions_count').default(0).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add spider chart scoring system tables at the end

export const genreCriteria = sqliteTable('genre_criteria', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  category: text('category').notNull(),
  metricKey: text('metric_key').notNull(),
  metricLabel: text('metric_label').notNull(),
  metricIcon: text('metric_icon'),
  metricColor: text('metric_color'),
  displayOrder: integer('display_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const structuredReviews = sqliteTable('structured_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id').references(() => tools.id),
  userId: text('user_id').references(() => user.id),
  category: text('category').notNull(),
  metricScores: text('metric_scores', { mode: 'json' }),
  metricComments: text('metric_comments', { mode: 'json' }),
  overallRating: integer('overall_rating'),
  reviewText: text('review_text'),
  reviewerType: text('reviewer_type').default('user'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  status: text('status').default('pending'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const aggregatedScores = sqliteTable('aggregated_scores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id').notNull().unique().references(() => tools.id),
  category: text('category').notNull(),
  metricScores: text('metric_scores', { mode: 'json' }),
  overallAverage: real('overall_average'),
  totalReviews: integer('total_reviews').default(0),
  verifiedReviews: integer('verified_reviews').default(0),
  editorialReviews: integer('editorial_reviews').default(0),
  confidenceScore: real('confidence_score'),
  lastCalculatedAt: text('last_calculated_at'),
  updatedAt: text('updated_at').notNull(),
});

export const editorialScores = sqliteTable('editorial_scores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id').references(() => tools.id),
  category: text('category').notNull(),
  metricScores: text('metric_scores', { mode: 'json' }),
  editorId: text('editor_id').references(() => user.id),
  notes: text('notes'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Add forum system tables at the end
export const communityThreads = sqliteTable('community_threads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category'),
  upvotes: integer('upvotes').default(0).notNull(),
  downvotes: integer('downvotes').default(0).notNull(),
  commentCount: integer('comment_count').default(0).notNull(),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false).notNull(),
  status: text('status').default('active').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const communityComments = sqliteTable('community_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  threadId: integer('thread_id').notNull().references(() => communityThreads.id),
  parentCommentId: integer('parent_comment_id').references(() => communityComments.id),
  userId: text('user_id').notNull().references(() => user.id),
  content: text('content').notNull(),
  upvotes: integer('upvotes').default(0).notNull(),
  downvotes: integer('downvotes').default(0).notNull(),
  replyCount: integer('reply_count').default(0).notNull(),
  status: text('status').default('active').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const communityThreadVotes = sqliteTable('community_thread_votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  threadId: integer('thread_id').notNull().references(() => communityThreads.id),
  userId: text('user_id').notNull().references(() => user.id),
  voteType: text('vote_type').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  uniqueVote: unique().on(table.threadId, table.userId),
}));

export const communityCommentVotes = sqliteTable('community_comment_votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  commentId: integer('comment_id').notNull().references(() => communityComments.id),
  userId: text('user_id').notNull().references(() => user.id),
  voteType: text('vote_type').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  uniqueVote: unique().on(table.commentId, table.userId),
}));

// Add hierarchical taxonomy tables at the end
export const mainCategories = sqliteTable('main_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  displayOrder: integer('display_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  toolCount: integer('tool_count').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const subCategories = sqliteTable('sub_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mainCategoryId: integer('main_category_id').notNull().references(() => mainCategories.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  toolCount: integer('tool_count').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const toolTypes = sqliteTable('tool_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  subCategoryId: integer('sub_category_id').notNull().references(() => subCategories.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  toolCount: integer('tool_count').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const toolTaxonomy = sqliteTable('tool_taxonomy', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id').notNull().references(() => tools.id),
  mainCategoryId: integer('main_category_id').notNull().references(() => mainCategories.id),
  subCategoryId: integer('sub_category_id').references(() => subCategories.id),
  toolTypeId: integer('tool_type_id').references(() => toolTypes.id),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

export const toolInteractions = sqliteTable('tool_interactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id').notNull().references(() => tools.id),
  userId: text('user_id'),
  sessionId: text('session_id').notNull(),
  interactionType: text('interaction_type').notNull(),
  mainCategoryId: integer('main_category_id').references(() => mainCategories.id),
  subCategoryId: integer('sub_category_id').references(() => subCategories.id),
  toolTypeId: integer('tool_type_id').references(() => toolTypes.id),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull(),
});

// Add taxonomy system tables at the end
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  parentId: integer('parent_id').references((): any => categories.id),
  description: text('description'),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0),
  toolCount: integer('tool_count').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  usageCount: integer('usage_count').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const toolCategories = sqliteTable('tool_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id').notNull().references(() => tools.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

export const toolTags = sqliteTable('tool_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id').notNull().references(() => tools.id),
  tagId: integer('tag_id').notNull().references(() => tags.id),
  createdAt: text('created_at').notNull(),
});

export const toolInteractionsNew = sqliteTable('tool_interactions_new', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id').notNull().references(() => tools.id),
  userId: text('user_id'),
  sessionId: text('session_id').notNull(),
  interactionType: text('interaction_type').notNull(),
  categoryId: integer('category_id').references(() => categories.id),
  createdAt: text('created_at').notNull(),
});