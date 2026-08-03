import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {
    setIsFirstMount(false);
  }, []);

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: isFirstMount ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex-1 flex flex-col w-full h-full"
    >
      {children}
    </motion.div>
  );
}

export function RouteLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
    </div>
  );
}
