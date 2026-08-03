import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Download, CheckSquare, Square, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';
import { MediaCard } from '../components/MediaCard';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export function Results() {
  const { url, mediaItems, setUrl } = useAppContext();
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!url) {
      navigate('/');
    }
  }, [url, navigate]);

  const toggleSelectAll = () => {
    if (selectedIds.size === mediaItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(mediaItems.map(item => item.id)));
    }
  };

  const handleSelect = (id: string, selected: boolean) => {
    const next = new Set(selectedIds);
    if (selected) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDownload = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    if (selectedIds.size === 0 || isZipping) return;
    
    setIsZipping(true);
    setZipProgress(0);
    const zip = new JSZip();
    
    const itemsToDownload = mediaItems.filter(item => selectedIds.has(item.id));
    let completed = 0;

    try {
      // Download files in parallel with a limit, or simple loop for now
      for (const item of itemsToDownload) {
        try {
          const response = await axios.get(item.url, { responseType: 'blob' });
          zip.file(item.filename, response.data);
        } catch (e) {
          console.error(`Failed to fetch ${item.filename}`, e);
          // could add to a failed list
        }
        completed++;
        setZipProgress(Math.round((completed / itemsToDownload.length) * 50)); // 50% for fetching
      }

      const content = await zip.generateAsync(
        { type: 'blob' },
        (metadata) => {
          setZipProgress(50 + Math.round(metadata.percent / 2)); // 50% for zipping
        }
      );
      
      saveAs(content, `extractor-${new URL(url).hostname}.zip`);
    } catch (error) {
      console.error("Bulk download failed", error);
      alert("An error occurred during bulk download.");
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  if (!url) return null;

  return (
    <div className="min-h-screen bg-pink-50  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/60  backdrop-blur-xl p-4 rounded-3xl border border-slate-200  shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2.5 bg-white  rounded-xl shadow-sm border border-slate-100  hover:bg-pink-50  transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 " />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 ">Analysis Complete</h1>
              <p className="text-sm text-slate-500 truncate max-w-[200px] md:max-w-md" title={url}>
                {url}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {mediaItems.length > 0 && (
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-4 py-2.5 bg-white  border border-slate-200  rounded-xl text-sm font-medium text-slate-700  hover:bg-pink-50  transition-colors"
              >
                {selectedIds.size === mediaItems.length ? (
                  <><CheckSquare className="w-4 h-4 text-pink-500" /> Deselect All</>
                ) : (
                  <><Square className="w-4 h-4 text-slate-400" /> Select All</>
                )}
              </button>
            )}

            <button
              onClick={() => { setUrl(''); navigate('/'); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white  border border-slate-200  rounded-xl text-sm font-medium text-slate-700  hover:bg-pink-50  transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Analyze Another
            </button>

            {mediaItems.length > 0 && (
              <button
                onClick={handleBulkDownload}
                disabled={selectedIds.size === 0 || isZipping}
                className="flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white rounded-xl text-sm font-semibold shadow-lg shadow-pink-500/25 transition-all relative overflow-hidden"
              >
                <Download className="w-4 h-4 relative z-10" />
                <span className="relative z-10">
                  {isZipping ? `Zipping... ${zipProgress}%` : `Download Selected (${selectedIds.size})`}
                </span>
                {isZipping && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-pink-800 transition-all duration-300 ease-out"
                    style={{ width: `${zipProgress}%` }}
                  />
                )}
              </button>
            )}
          </div>
        </header>

        {mediaItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <RefreshCcw className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No media found</h2>
            <p className="text-slate-500 max-w-sm mb-8">
              We couldn't detect any downloadable images or videos on this page. Some sites block extraction or load media dynamically.
            </p>
            <button
              onClick={() => { setUrl(''); navigate('/'); }}
              className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Try Another URL
            </button>
          </div>
        ) : (
          <>
            {/* Results Grid */}
            <div className="mb-6 flex items-center justify-between">
               <h2 className="text-lg font-semibold text-slate-800 ">
                 Found {mediaItems.length} media items
               </h2>
               <div className="text-sm text-slate-500">
                 {selectedIds.size} selected
               </div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {mediaItems.map((item) => (
                <MediaCard 
                  key={item.id} 
                  item={item} 
                  isSelected={selectedIds.has(item.id)}
                  onSelect={handleSelect}
                />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
