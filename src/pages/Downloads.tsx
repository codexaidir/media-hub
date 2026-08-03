import React, { useEffect, useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { Download, HardDrive, Image as ImageIcon, FileVideo } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getSupabase } from '../lib/supabase';

export function Downloads() {
  const { user } = useAuth();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadDownloads = async () => {
      const client = getSupabase();
      const { data, error } = await client.from('downloads').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (!error) {
        setDownloads(data ?? []);
      }
      setLoading(false);
    };

    void loadDownloads();
  }, [user?.id]);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Downloads</h1>
            <p className="text-slate-500 mt-1">Manage your extracted media files</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-full text-sm font-medium">
            <HardDrive className="w-4 h-4" />
            0 GB Used
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-slate-500">Loading your downloads...</div>
        ) : downloads.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Download className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No downloads yet</h2>
            <p className="text-slate-500 max-w-sm mb-8">
              Extract media from any URL and your downloaded files will appear here securely.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <ImageIcon className="w-4 h-4" /> Images
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FileVideo className="w-4 h-4" /> Videos
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {downloads.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{item.filename}</p>
                  <p className="text-sm text-slate-500">{item.asset_type} • {item.mime_type || 'unknown type'}</p>
                </div>
                <div className="text-sm text-slate-500">
                  {new Date(item.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
