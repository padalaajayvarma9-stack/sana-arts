import React from 'react';
import { motion } from 'motion/react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '', delay = 0, id }) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 35, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.16, 1, 0.3, 1], // Custom designer cubic-bezier for snappy, premium deceleration
      }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#080808]/45 backdrop-blur-xl p-8 md:p-12 shadow-[0_24px_50px_-15px_rgba(0,0,0,0.8)] hover:border-white/20 transition-colors duration-500 ${className}`}
    >
      {/* Soft internal gloss gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
      
      {/* Corner high-specular reflective highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      
      {/* Child element slot */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
