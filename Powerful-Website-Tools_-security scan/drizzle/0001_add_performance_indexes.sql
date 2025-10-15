-- Performance indexes for production optimization
-- Run this migration to improve query performance at scale

-- Tools table indexes
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_featured ON tools(is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_tool_of_week ON tools(is_tool_of_week);
CREATE INDEX IF NOT EXISTS idx_tools_popularity ON tools(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON tools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_main_category ON tools(main_category_id);
CREATE INDEX IF NOT EXISTS idx_tools_sub_category ON tools(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_tools_tool_type ON tools(tool_type_id);
CREATE INDEX IF NOT EXISTS idx_tools_submitted_by ON tools(submitted_by);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tools_status_featured ON tools(status, is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_status_popularity ON tools(status, popularity DESC);
CREATE INDEX IF NOT EXISTS idx_tools_status_created ON tools(status, created_at DESC);

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_tool_id ON reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Structured reviews indexes
CREATE INDEX IF NOT EXISTS idx_structured_reviews_tool ON structured_reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_structured_reviews_user ON structured_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_structured_reviews_approved ON structured_reviews(is_approved);

-- Community threads indexes
CREATE INDEX IF NOT EXISTS idx_community_threads_author ON community_threads(author_id);
CREATE INDEX IF NOT EXISTS idx_community_threads_created ON community_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_threads_votes ON community_threads(vote_count DESC);

-- Community comments indexes
CREATE INDEX IF NOT EXISTS idx_community_comments_thread ON community_comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent ON community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author ON community_comments(author_id);

-- Saved tools indexes
CREATE INDEX IF NOT EXISTS idx_saved_tools_user ON saved_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_tools_tool ON saved_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_saved_tools_user_tool ON saved_tools(user_id, tool_id);

-- Tool interactions indexes
CREATE INDEX IF NOT EXISTS idx_tool_interactions_tool ON tool_interactions(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_interactions_user ON tool_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_interactions_type ON tool_interactions(interaction_type);

-- Session indexes for auth performance
CREATE INDEX IF NOT EXISTS idx_session_user_id ON session(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_session_expires_at ON session(expires_at);