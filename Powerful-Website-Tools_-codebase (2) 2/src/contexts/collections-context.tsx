"use client";

import * as React from "react";

export type Collection = {
  id: string;
  name: string;
  description: string;
  toolIds: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type CollectionsContextType = {
  collections: Collection[];
  createCollection: (name: string, description: string, isPublic: boolean) => void;
  deleteCollection: (id: string) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  addToolToCollection: (collectionId: string, toolId: string) => void;
  removeToolFromCollection: (collectionId: string, toolId: string) => void;
  getCollection: (id: string) => Collection | undefined;
};

const CollectionsContext = React.createContext<CollectionsContextType | undefined>(undefined);

export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const [collections, setCollections] = React.useState<Collection[]>(() => {
    // Load from localStorage on client
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tool-collections");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Save to localStorage whenever collections change
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tool-collections", JSON.stringify(collections));
    }
  }, [collections]);

  const createCollection = React.useCallback(
    (name: string, description: string, isPublic: boolean) => {
      const newCollection: Collection = {
        id: `collection-${Date.now()}`,
        name,
        description,
        toolIds: [],
        isPublic,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setCollections((prev) => [...prev, newCollection]);
    },
    []
  );

  const deleteCollection = React.useCallback((id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updateCollection = React.useCallback(
    (id: string, updates: Partial<Collection>) => {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
        )
      );
    },
    []
  );

  const addToolToCollection = React.useCallback(
    (collectionId: string, toolId: string) => {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId && !c.toolIds.includes(toolId)
            ? { ...c, toolIds: [...c.toolIds, toolId], updatedAt: new Date() }
            : c
        )
      );
    },
    []
  );

  const removeToolFromCollection = React.useCallback(
    (collectionId: string, toolId: string) => {
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId
            ? {
                ...c,
                toolIds: c.toolIds.filter((id) => id !== toolId),
                updatedAt: new Date(),
              }
            : c
        )
      );
    },
    []
  );

  const getCollection = React.useCallback(
    (id: string) => {
      return collections.find((c) => c.id === id);
    },
    [collections]
  );

  const value = React.useMemo(
    () => ({
      collections,
      createCollection,
      deleteCollection,
      updateCollection,
      addToolToCollection,
      removeToolFromCollection,
      getCollection,
    }),
    [
      collections,
      createCollection,
      deleteCollection,
      updateCollection,
      addToolToCollection,
      removeToolFromCollection,
      getCollection,
    ]
  );

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = React.useContext(CollectionsContext);
  if (!context) {
    throw new Error("useCollections must be used within CollectionsProvider");
  }
  return context;
}