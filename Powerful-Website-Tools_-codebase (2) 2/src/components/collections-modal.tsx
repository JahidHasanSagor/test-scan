"use client";

import * as React from "react";
import { Plus, FolderOpen, Lock, Globe, Trash2, Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useCollections, type Collection } from "@/contexts/collections-context";

export function CollectionsModal({ toolId, toolTitle }: { toolId?: string; toolTitle?: string }) {
  const { collections, createCollection, deleteCollection, addToolToCollection, removeToolFromCollection } = useCollections();
  const [open, setOpen] = React.useState(false);
  const [showNewForm, setShowNewForm] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    createCollection(name.trim(), description.trim(), isPublic);
    setName("");
    setDescription("");
    setIsPublic(false);
    setShowNewForm(false);
  };

  const handleToggleTool = (collectionId: string) => {
    if (!toolId) return;
    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;

    if (collection.toolIds.includes(toolId)) {
      removeToolFromCollection(collectionId, toolId);
    } else {
      addToolToCollection(collectionId, toolId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderOpen className="mr-2 h-4 w-4" />
          {toolId ? "Add to Collection" : "Manage Collections"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {toolId ? `Add "${toolTitle}" to Collection` : "Manage Collections"}
          </DialogTitle>
          <DialogDescription>
            {toolId
              ? "Select a collection or create a new one to organize your favorite tools."
              : "Create and manage your tool collections."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Existing Collections */}
          {collections.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Your Collections</h3>
              <div className="space-y-2">
                {collections.map((collection) => {
                  const isInCollection = toolId ? collection.toolIds.includes(toolId) : false;
                  return (
                    <div
                      key={collection.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`mt-1 rounded-md p-2 ${
                            isInCollection ? "bg-primary text-primary-foreground" : "bg-secondary"
                          }`}
                        >
                          <FolderOpen className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{collection.name}</p>
                            <Badge variant="secondary" className="text-xs">
                              {collection.toolIds.length}
                            </Badge>
                            {collection.isPublic ? (
                              <Globe className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          {collection.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {collection.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {toolId && (
                          <Button
                            variant={isInCollection ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToggleTool(collection.id)}
                          >
                            {isInCollection ? "Remove" : "Add"}
                          </Button>
                        )}
                        {!toolId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCollection(collection.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No collections yet. Create your first one!</p>
            </div>
          )}

          {/* New Collection Form */}
          {showNewForm ? (
            <div className="space-y-4 rounded-lg border border-border p-4 bg-secondary/30">
              <h3 className="text-sm font-medium">Create New Collection</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Collection Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Design Tools, Marketing Apps"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this collection for?"
                    rows={2}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="public" className="text-sm">
                    Make this collection public
                  </Label>
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={!name.trim()} className="flex-1">
                  Create Collection
                </Button>
                <Button variant="outline" onClick={() => setShowNewForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowNewForm(true)} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create New Collection
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}