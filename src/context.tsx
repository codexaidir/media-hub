import React, { createContext, useContext, useState } from 'react';
import { MediaItem } from './types';

interface AppContextType {
  url: string;
  setUrl: (url: string) => void;
  mediaItems: MediaItem[];
  setMediaItems: (items: MediaItem[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [url, setUrl] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  return (
    <AppContext.Provider value={{ url, setUrl, mediaItems, setMediaItems }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
