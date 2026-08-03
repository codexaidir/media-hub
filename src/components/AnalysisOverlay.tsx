import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisStage } from '../types';
import { Globe2, FileSearch, Box, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface AnalysisOverlayProps {
  stage: AnalysisStage;
  message: string;
  onCancel: () => void;
}

const Confetti = () => {
  // Simple CSS confetti
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
       {Array.from({ length: 50 }).map((_, i) => (
         <motion.div
           key={i}
           initial={{ y: -50, x: 0, opacity: 1, rotate: 0 }}
           animate={{
             y: window.innerHeight,
             x: (Math.random() - 0.5) * 500,
             opacity: 0,
             rotate: Math.random() * 360
           }}
           transition={{ duration: 2 + Math.random() * 2, ease: "linear" }}
           className={cn(
             "w-2 h-6 absolute top-0",
             ["bg-pink-500", "bg-pink-500", "bg-pink-500", "bg-pink-500", "bg-pink-500"][Math.floor(Math.random() * 5)]
           )}
           style={{ left: `${Math.random() * 100}%` }}
         />
       ))}
    </div>
  )
}

export function AnalysisOverlay({ stage, message, onCancel }: AnalysisOverlayProps) {
  if (stage === 'idle') return null;

  const renderIcon = () => {
    switch (stage) {
      case 'stage1':
        return (
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <Globe2 className="w-24 h-24 text-pink-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </motion.div>
        );
      case 'stage2':
        return (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <FileSearch className="w-24 h-24 text-pink-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          </motion.div>
        );
      case 'stage3':
         return (
          <motion.div
            animate={{ y: [-10, 10, -10], rotateZ: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Box className="w-24 h-24 text-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
          </motion.div>
        );
      case 'stage4':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-24 h-24 text-pink-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          </motion.div>
        );
      case 'stage5':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
             <CheckCircle2 className="w-24 h-24 text-pink-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          </motion.div>
        )
      case 'error':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
             <XCircle className="w-24 h-24 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          </motion.div>
        )
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md"
      >
        {stage === 'stage5' && <Confetti />}
        
        <div className="relative flex flex-col items-center justify-center p-12 bg-white/90  backdrop-blur-2xl rounded-3xl border border-pink-200  shadow-2xl">
          <div className="mb-8 h-32 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage}
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                transition={{ duration: 0.5 }}
              >
                {renderIcon()}
              </motion.div>
            </AnimatePresence>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.h2
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-medium text-slate-800  tracking-tight"
            >
              {message}
            </motion.h2>
          </AnimatePresence>

          {stage !== 'stage5' && (
            <button
              onClick={onCancel}
              className="mt-8 px-6 py-2 rounded-full bg-pink-100  hover:bg-pink-200  text-slate-600  transition-colors font-medium text-sm border border-transparent hover:border-black/5 "
            >
              {stage === 'error' ? 'Close' : 'Cancel Analysis'}
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
