import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Github, Twitter, Layers, ShieldCheck, Zap, User as UserIcon, Download, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-pink-50 ">
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Box className="w-6 h-6 text-pink-600 " />
            <span className="font-bold text-lg text-slate-900 ">Media Hub</span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 ">
              <a href="#features" className="hover:text-pink-600  transition-colors">Features</a>
              <a href="#supported" className="hover:text-pink-600  transition-colors">Platforms</a>
              <a href="#pricing" className="hover:text-pink-600  transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-pink-600  transition-colors">FAQ</a>
            </nav>
            
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                >
                  <div className="w-8 h-8 bg-pink-100 text-pink-700 rounded-lg flex items-center justify-center font-bold text-sm uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 mb-2">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      
                      <Link 
                        to={`/${user.id}`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link 
                        to="/downloads"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        My Downloads
                      </Link>
                      
                      <div className="h-px bg-slate-100 my-2"></div>
                      
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/signin" className="px-4 py-2 text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 rounded-lg transition-colors shadow-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-slate-200  bg-white  py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Box className="w-6 h-6 text-pink-600 " />
              <span className="font-bold text-lg text-slate-900 ">Media Hub</span>
            </Link>
            <p className="text-slate-500  text-sm max-w-xs leading-relaxed">
              The professional tool to extract and download authorized media assets from top platforms instantly. Ensure you have the right to download any content.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900  mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-slate-500 ">
              <li><a href="#features" className="hover:text-pink-600  transition-colors">Features</a></li>
              <li><a href="#supported" className="hover:text-pink-600  transition-colors">Platforms</a></li>
              <li><a href="#pricing" className="hover:text-pink-600  transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-500 ">
              <li><Link to="/terms" className="hover:text-pink-600 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-pink-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/dmca" className="hover:text-pink-600 transition-colors">DMCA</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-200  flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 ">
          <p>&copy; {new Date().getFullYear()} Media Hub. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
             <a href="#" className="hover:text-slate-700  transition-colors"><Twitter className="w-4 h-4" /></a>
             <a href="#" className="hover:text-slate-700  transition-colors"><Github className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
