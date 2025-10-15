"use client";

import * as React from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
}

export const ClientOnly: React.FC<ClientOnlyProps> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <>{children}</>;
};