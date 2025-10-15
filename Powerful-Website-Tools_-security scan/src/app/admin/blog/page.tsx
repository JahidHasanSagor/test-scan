"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Star,
  FileText,
  Search,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Undo,
  Redo,
} from "lucide-react";

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  status: string;
  featured: boolean;
  viewCount: number;
  readTime: string;
  publishedAt: string | null;
  category: { id: number; name: string } | null;
  tags: Array<{ id: number; name: string }>;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

type Tag = {
  id: number;
  name: string;
  slug: string;
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Tiptap Editor Component
function TiptapEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextStyle,
      Color,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-muted" : ""}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "bg-muted" : ""}
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      {/* Editor */}
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none p-4 min-h-[400px] focus:outline-none"
      />
    </div>
  );
}

export default function AdminBlogPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showEditor, setShowEditor] = React.useState(false);
  const [editingPost, setEditingPost] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "published" | "draft">("all");

  // Form state
  const [title, setTitle] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [content, setContent] = React.useState("");
  const [featuredImage, setFeaturedImage] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [selectedTags, setSelectedTags] = React.useState<number[]>([]);
  const [status, setStatus] = React.useState<"draft" | "published">("draft");
  const [featured, setFeatured] = React.useState(false);
  const [readTime, setReadTime] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Redirect if not admin
  React.useEffect(() => {
    if (!isPending && (!session || session.user.role !== "admin")) {
      toast.error("Admin access required");
      router.push("/");
    }
  }, [session, isPending, router]);

  // Fetch posts
  const fetchPosts = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/blog?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Fetch categories and tags
  React.useEffect(() => {
    async function fetchMetadata() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch("/api/blog/categories"),
          fetch("/api/blog/tags"),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
        if (tagRes.ok) {
          const tagData = await tagRes.json();
          setTags(tagData);
        }
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    }
    fetchMetadata();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setFeaturedImage("");
    setCategoryId("");
    setSelectedTags([]);
    setStatus("draft");
    setFeatured(false);
    setReadTime("");
    setEditingPost(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setShowEditor(true);
  };

  const handleEdit = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/blog/${post.slug}`);
      if (res.ok) {
        const data = await res.json();
        const fullPost = data.post;
        
        setTitle(fullPost.title);
        setSlug(fullPost.slug);
        setExcerpt(fullPost.excerpt);
        setContent(fullPost.content);
        setFeaturedImage(fullPost.featuredImage || "");
        setCategoryId(fullPost.categoryId?.toString() || "");
        setSelectedTags(fullPost.tags.map((t: any) => t.id));
        setStatus(fullPost.status);
        setFeatured(fullPost.featured);
        setReadTime(fullPost.readTime);
        setEditingPost(fullPost.id);
        setShowEditor(true);
      }
    } catch (error) {
      console.error("Failed to load post:", error);
      toast.error("Failed to load post");
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !excerpt.trim() || !content.trim() || !categoryId || !readTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: title.trim(),
        slug: slug || generateSlug(title),
        excerpt: excerpt.trim(),
        content: content.trim(),
        featuredImage: featuredImage.trim() || null,
        categoryId: parseInt(categoryId),
        status,
        featured,
        readTime: readTime.trim(),
        authorId: session?.user.id,
      };

      let res;
      if (editingPost) {
        // Update existing post
        const post = posts.find((p) => p.id === editingPost);
        if (!post) {
          toast.error("Post not found");
          return;
        }
        res = await fetch(`/api/blog?slug=${post.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });
      } else {
        // Create new post
        res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData),
        });
      }

      if (res.ok) {
        toast.success(editingPost ? "Post updated successfully" : "Post created successfully");
        setShowEditor(false);
        resetForm();
        fetchPosts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save post");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/blog?slug=${post.slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Post deleted successfully");
        fetchPosts();
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!editingPost) {
      setSlug(generateSlug(newTitle));
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const filteredPosts = posts.filter((post) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (isPending || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Blog Management</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage blog posts
            </p>
          </div>
          <Button onClick={() => router.push("/admin")} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        {!showEditor ? (
          <>
            {/* Filters and Actions */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={statusFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={statusFilter === "published" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("published")}
                    >
                      Published
                    </Button>
                    <Button
                      variant={statusFilter === "draft" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter("draft")}
                    >
                      Drafts
                    </Button>
                    <Button onClick={handleCreateNew} className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts List */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  <p className="text-muted-foreground">Loading posts...</p>
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium">No posts found</p>
                  <p className="text-sm text-muted-foreground">
                    Create your first blog post to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="mb-2 flex items-center gap-2">
                            <h3 className="font-display text-lg font-semibold truncate">
                              {post.title}
                            </h3>
                            {post.featured && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                            {post.excerpt}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant={post.status === "published" ? "default" : "secondary"}>
                              {post.status}
                            </Badge>
                            {post.category && (
                              <Badge variant="outline">{post.category.name}</Badge>
                            )}
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.viewCount} views
                            </div>
                            <span>•</span>
                            <span>{post.readTime}</span>
                            {post.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{post.tags.length} tags</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(post)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Editor View */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingPost ? "Edit Post" : "Create New Post"}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => {
                  setShowEditor(false);
                  resetForm();
                }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                />
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="post-url-slug"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Auto-generated from title, but you can customize it
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short description (100-150 words)"
                  rows={3}
                />
              </div>

              {/* Content */}
              <div>
                <Label>Content *</Label>
                <div className="mt-2">
                  <TiptapEditor content={content} onChange={setContent} />
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Category and Read Time */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="readTime">Read Time *</Label>
                  <Input
                    id="readTime"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="e.g., 5 min read"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedTags.includes(tag.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status and Featured */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Label>Status</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={status === "draft" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatus("draft")}
                    >
                      Draft
                    </Button>
                    <Button
                      type="button"
                      variant={status === "published" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatus("published")}
                    >
                      Published
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Label>Featured</Label>
                  <Button
                    type="button"
                    variant={featured ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeatured(!featured)}
                    className="gap-2"
                  >
                    <Star className={featured ? "fill-current" : ""} />
                    {featured ? "Featured" : "Not Featured"}
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-border pt-6">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditor(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}