"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function FloatingLaunchButton() {
  return (
    <motion.div
      className="fixed bottom-8 right-8 z-40"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5
      }}
    >
      <Link href="/submit">
        <motion.div
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.92 }}
          className="relative"
        >
          <button
            className="relative flex flex-col items-end justify-between text-white text-sm border border-primary/20 h-[65px] px-3 pt-3 pb-2 rounded-[15px_15px_12px_12px] cursor-pointer transition-all duration-100 select-none overflow-visible"
            style={{
              willChange: 'transform',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundImage: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%), linear-gradient(to right, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0)), linear-gradient(to bottom, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0))',
              backgroundPosition: 'center, bottom right, bottom right',
              backgroundSize: '100% 100%, 100% 100%, 100% 100%',
              backgroundRepeat: 'no-repeat',
              boxShadow: 'inset -4px -10px 0px rgba(255, 255, 255, 0.3), inset -4px -8px 0px rgba(99, 102, 241, 0.4), 0px 2px 1px rgba(99, 102, 241, 0.4), 0px 2px 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(139, 92, 246, 0.3)',
              transform: 'perspective(70px) rotateX(5deg) rotateY(0deg)',
            }}
            onMouseDown={(e) => {
              const target = e.currentTarget;
              target.style.transform = 'perspective(80px) rotateX(5deg) rotateY(1deg) translateY(3px) scale(0.96)';
              target.style.height = '64px';
              target.style.border = '0.25px solid rgba(99, 102, 241, 0.3)';
              target.style.boxShadow = 'inset -4px -8px 0px rgba(255, 255, 255, 0.2), inset -4px -6px 0px rgba(99, 102, 241, 0.6), 0px 1px 0px rgba(99, 102, 241, 0.5), 0px 1px 0px rgba(255, 255, 255, 0.2), 0 0 15px rgba(139, 92, 246, 0.4)';
            }}
            onMouseUp={(e) => {
              const target = e.currentTarget;
              target.style.transform = 'perspective(70px) rotateX(5deg) rotateY(0deg)';
              target.style.height = '65px';
              target.style.border = '0.5px solid rgba(99, 102, 241, 0.2)';
              target.style.boxShadow = 'inset -4px -10px 0px rgba(255, 255, 255, 0.3), inset -4px -8px 0px rgba(99, 102, 241, 0.4), 0px 2px 1px rgba(99, 102, 241, 0.4), 0px 2px 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(139, 92, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget;
              target.style.transform = 'perspective(70px) rotateX(5deg) rotateY(0deg)';
              target.style.height = '65px';
              target.style.border = '0.5px solid rgba(99, 102, 241, 0.2)';
              target.style.boxShadow = 'inset -4px -10px 0px rgba(255, 255, 255, 0.3), inset -4px -8px 0px rgba(99, 102, 241, 0.4), 0px 2px 1px rgba(99, 102, 241, 0.4), 0px 2px 1px rgba(255, 255, 255, 0.1), 0 0 20px rgba(139, 92, 246, 0.3)';
            }}
          >
            <div 
              className="absolute inset-0 -z-10 rounded-[15px] pointer-events-none transition-all duration-100"
              style={{
                backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(99, 102, 241, 0.3))',
                boxShadow: 'inset 4px 0px 0px rgba(255, 255, 255, 0.15), inset 4px -8px 0px rgba(99, 102, 241, 0.3)',
              }}
            />
            
            <div 
              className="absolute inset-0 -z-10 rounded-[15px] pointer-events-none transition-all duration-100"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0)), linear-gradient(to bottom, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0))',
                backgroundPosition: 'bottom right, bottom right',
                backgroundSize: '100% 100%, 100% 100%',
                backgroundRepeat: 'no-repeat',
              }}
            />

            <svg 
              stroke="#ffffff" 
              viewBox="0 0 80 80" 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-[15px] h-[15px]"
              fill="#ffffff"
            >
              <g>
                <path d="M64,48L64,48h-8V32h8c8.836,0,16-7.164,16-16S72.836,0,64,0c-8.837,0-16,7.164-16,16v8H32v-8c0-8.836-7.164-16-16-16 S0,7.164,0,16s7.164,16,16,16h8v16h-8l0,0l0,0C7.164,48,0,55.164,0,64s7.164,16,16,16c8.837,0,16-7.164,16-16l0,0v-8h16v7.98 c0,0.008-0.001,0.014-0.001,0.02c0,8.836,7.164,16,16,16s16-7.164,16-16S72.836,48.002,64,48z M64,8c4.418,0,8,3.582,8,8 s-3.582,8-8,8h-8v-8C56,11.582,59.582,8,64,8z M8,16c0-4.418,3.582-8,8-8s8,3.582,8,8v8h-8C11.582,24,8,20.417,8,16z M16,72 c-4.418,0-8-3.582-8-8s3.582-8,8-8l0,0h8v8C24,68.418,20.418,72,16,72z M32,48V32h16v16H32z M64,72c-4.418,0-8-3.582-8-8l0,0v-8 h7.999c4.418,0,8,3.582,8,8S68.418,72,64,72z" />
              </g>
            </svg>
            
            <span className="relative z-10">launch</span>
          </button>
        </motion.div>
      </Link>
    </motion.div>
  );
}