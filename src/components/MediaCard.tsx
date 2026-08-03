import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MediaItem } from '../types';
import { Download, ExternalLink, Image as ImageIcon, Video, Check, Copy } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../lib/supabase';

interface MediaCardProps {
  key?: string | number;
  item: MediaItem;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
}

export function MediaCard({ item, isSelected, onSelect }: MediaCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/signin');
      return;
    }
    if (downloading) return;

    
    setDownloading(true);
    setProgress(0);
    try {
      const response = await axios.get(item.url, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });
      saveAs(response.data, item.filename);

      if (user) {
        const client = getSupabase();
        await client.from('downloads').insert({
          user_id: user.id,
          title: item.filename,
          url: item.url,
          filename: item.filename,
          mime_type: response.headers['content-type'] || 'application/octet-stream',
          asset_type: item.type,
          size_bytes: response.data?.size ?? null,
          metadata: {
            source: item.url,
            downloaded_at: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download file. It may be restricted.");
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative flex flex-col bg-white  rounded-2xl overflow-hidden border shadow-sm transition-all hover:shadow-xl",
        isSelected ? "border-pink-500 ring-1 ring-pink-500" : "border-slate-200 "
      )}
    >
      <div 
        className="relative aspect-video bg-slate-100  overflow-hidden cursor-pointer"
        onClick={() => onSelect(item.id, !isSelected)}
      >
        <img 
          src={item.thumbnail} 
          alt={item.filename}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Type Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-md rounded-md text-pink-600 text-xs font-medium flex items-center gap-1.5">
          {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
          <span className="capitalize">{item.type}</span>
        </div>

        {/* Checkbox */}
        <div className="absolute top-3 left-3">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors",
            isSelected ? "bg-pink-500 border-pink-500 text-white" : "bg-white/50 border-pink-500/50 text-transparent"
          )}>
            <Check className="w-4 h-4" />
          </div>
        </div>

        {/* Overlay Progress */}
        {downloading && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm">
             <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle className="text-pink-600/20 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                  <circle className="text-pink-600 progress-ring__circle stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (progress / 100) * 251.2} style={{ transition: 'stroke-dashoffset 0.3s' }}></circle>
                </svg>
                <span className="absolute text-pink-600 text-xs font-bold">{progress}%</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-medium text-slate-900  truncate" title={item.filename}>
          {item.filename}
        </h3>
        
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 ">
          <span>{item.type.toUpperCase()}</span>
          {item.resolution && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300 " />
              <span>{item.resolution}</span>
            </>
          )}
          {item.size && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300 " />
              <span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
            </>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100  flex items-center gap-2">
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 bg-pink-50  text-pink-600  hover:bg-pink-100  py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Download'}
          </button>
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-slate-500 hover:bg-slate-100  rounded-lg transition-colors"
            title="Preview"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button 
            onClick={handleCopyLink}
            className="p-2 text-slate-500 hover:bg-slate-100  rounded-lg transition-colors"
            title="Copy Link"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
