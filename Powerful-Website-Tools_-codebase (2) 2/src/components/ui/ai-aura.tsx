import * as React from "react";
import { motion } from "framer-motion";

interface AiAuraProps {
  children: React.ReactNode;
  enabled?: boolean;
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export function AiAura({ children, enabled = true, intensity = "medium", className = "" }: AiAuraProps) {
  if (!enabled) {
    return <>{children}</>;
  }

  const glowIntensity = {
    low: "0 0 10px var(--color-ai-aura), 0 0 20px var(--color-ai-aura)",
    medium: "0 0 20px var(--color-ai-aura), 0 0 40px var(--color-ai-aura)",
    high: "0 0 30px var(--color-ai-aura), 0 0 60px var(--color-ai-aura), 0 0 90px var(--color-ai-aura)"
  };

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        boxShadow: glowIntensity[intensity],
        borderColor: "var(--color-ai-glow)",
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
}

interface ParticleFieldProps {
  enabled?: boolean;
  particleCount?: number;
  className?: string;
}

export function ParticleField({ enabled = true, particleCount = 20, className = "" }: ParticleFieldProps) {
  if (!enabled) {
    return null;
  }

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5
  }));

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-r from-purple-400/30 to-blue-400/30 blur-sm"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}