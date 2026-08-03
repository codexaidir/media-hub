import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Calendar, Activity } from 'lucide-react';

export function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();

  // Basic check to ensure users can only see their own profile,
  // or it acts as a public profile if needed.
  // For this prototype, we'll just show the profile if the IDs match, otherwise show a generic not found.
  
  if (user?.id !== userId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
        <p className="text-slate-500">The requested user profile does not exist or is private.</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Cover Photo Area */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-pink-400 to-pink-600"></div>
          
          <div className="px-6 sm:px-10 pb-10">
            {/* Avatar */}
            <div className="relative flex justify-between items-end -mt-12 sm:-mt-16 mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-2xl p-1.5 shadow-md">
                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-slate-400 uppercase">
                    {user?.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="pb-2">
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-500 text-sm">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined recently
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-slate-100 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex items-center gap-3 mb-2 text-slate-500 font-medium text-sm">
                  <Activity className="w-4 h-4" />
                  Total Extractions
                </div>
                <div className="text-3xl font-bold text-slate-900">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
