import React from 'react';
import { PageTransition } from '../components/PageTransition';
import { Download, HardDrive, Image as ImageIcon, FileVideo } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function Downloads() {
  const { user } = useAuth();

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

        {/* Empty State for prototype */}
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
      </div>
    </PageTransition>
  );
}
