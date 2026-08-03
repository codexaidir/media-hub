import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Link as LinkIcon, Instagram, Youtube, Facebook, Twitter, Trash2, Globe2, Zap, Shield, Cpu, Layers, Download, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';
import { AnalysisOverlay } from '../components/AnalysisOverlay';
import { AnalysisStage, MediaItem } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim() || '';

export function Home() {
  const { url, setUrl, setMediaItems } = useAppContext();
  const navigate = useNavigate();
  const [stage, setStage] = useState<AnalysisStage>('idle');
  const [message, setMessage] = useState('');
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('recentUrls');
    if (saved) {
      try {
        setRecentUrls(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveRecentUrl = (newUrl: string) => {
    const updated = [newUrl, ...recentUrls.filter(u => u !== newUrl)].slice(0, 5);
    setRecentUrls(updated);
    localStorage.setItem('recentUrls', JSON.stringify(updated));
  };

  const handleAnalyze = async () => {
    if (!url || !url.startsWith('http')) {
      alert('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setStage('stage1');
    setMessage('Connecting to server...');
    setMediaItems([]);
    saveRecentUrl(url);

    const controller = new AbortController();
    abortRef.current = controller;

    // Simulated progress stages while Edge Function processes
    const t1 = setTimeout(() => { if (!controller.signal.aborted) { setStage('stage2'); setMessage('Scanning page...'); } }, 1500);
    const t2 = setTimeout(() => { if (!controller.signal.aborted) { setStage('stage3'); setMessage('Finding downloadable media...'); } }, 3000);
    const t3 = setTimeout(() => { if (!controller.signal.aborted) { setStage('stage4'); setMessage('Preparing results...'); } }, 4500);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal,
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setStage('stage5');
      setMessage('Completed');
      setMediaItems(data.media ?? []);
      setTimeout(() => {
        setStage('idle');
        navigate('/results');
      }, 1500);
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (controller.signal.aborted) return;
      setStage('error');
      setMessage(err.message || 'Connection lost. Please try again.');
    } finally {
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setStage('idle');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Check if it's text/url
    const urlData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text/uri-list');
    if (urlData) {
      setUrl(urlData.trim());
    }
  };

  return (
    <div className="w-full relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[600px] overflow-hidden pointer-events-none -z-10">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-400/10  blur-[120px]" />
         <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-400/10  blur-[120px]" />
      </div>

      <section className="pt-24 pb-16 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900  tracking-tight mb-4">
              Extract Media Instantly
            </h1>
            <p className="text-base md:text-lg text-slate-600  max-w-2xl mx-auto">
              Analyze any supported URL to securely extract authorized high-resolution images, videos, and media assets.
            </p>
          </div>

          <div 
            className={`relative flex items-center bg-white shadow-xl border rounded-2xl overflow-hidden transition-all ${
              isDragging ? 'border-pink-500 ring-4 ring-pink-500/20' : 'border-slate-200 hover:border-slate-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <LinkIcon className="absolute left-5 w-5 h-5 text-slate-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste URL to extract..."
              className="w-full pl-14 pr-[140px] py-4 bg-transparent outline-none text-slate-900 placeholder:text-slate-500 text-base md:text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {url ? (
                <button 
                  onClick={() => setUrl('')}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={handlePaste}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium uppercase tracking-wider transition-colors"
                >
                  Paste
                </button>
              )}
              <button
                onClick={handleAnalyze}
                disabled={!url || stage !== 'idle'}
                className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-medium rounded-lg transition-colors shadow-sm active:scale-95 flex items-center gap-2"
              >
                Go
              </button>
            </div>
          </div>

          {recentUrls.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm font-medium text-slate-500  mr-2">Recent:</span>
                {recentUrls.map((rUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setUrl(rUrl)}
                    className="max-w-[150px] truncate px-3 py-1.5 bg-white  border border-slate-200  hover:border-slate-300  text-slate-600  text-xs rounded-lg transition-colors"
                  >
                    {rUrl}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* Platforms Section */}
      <section id="supported" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold uppercase tracking-widest text-pink-600 mb-3">Seamless Integrations</h2>
            <p className="text-2xl font-bold text-slate-900">Extract media from your favorite platforms</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Instagram, name: 'Instagram', color: 'hover:text-pink-500' },
              { icon: Youtube, name: 'YouTube', color: 'hover:text-red-500' },
              { icon: Facebook, name: 'Facebook', color: 'hover:text-blue-600' },
              { icon: Twitter, name: 'X (Twitter)', color: 'hover:text-slate-900' },
              { icon: Globe2, name: 'Any Website', color: 'hover:text-pink-500' },
            ].map((Platform, index) => (
              <div key={index} className={`flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 transition-all cursor-default ${Platform.color} hover:border-pink-100 hover:shadow-md hover:-translate-y-1`}>
                <Platform.icon className="w-10 h-10 text-slate-400 mb-3 transition-colors duration-300 group-hover:text-current" />
                <span className="text-sm font-semibold text-slate-700">{Platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-sm font-bold uppercase tracking-widest text-pink-600 mb-3">Engineered for Performance</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Everything you need to extract media</h3>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Media Hub combines intelligent heuristics with a lightning-fast processing engine to deliver exactly what you're looking for.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "Lightning Fast Extraction",
              description: "Our optimized edge network processes requests in milliseconds, delivering media directly to your browser without unnecessary delays."
            },
            {
              icon: Cpu,
              title: "Smart Content Detection",
              description: "Advanced algorithms filter out ads, tracking pixels, and decorative UI elements to find the primary, high-resolution media."
            },
            {
              icon: Layers,
              title: "Bulk Zip Downloads",
              description: "Found an entire gallery? Select multiple assets and package them into a single, organized ZIP file with one click."
            },
            {
              icon: Search,
              title: "Deep Meta Parsing",
              description: "We don't just scrape the surface. Media Hub analyzes Open Graph tags, JSON-LD, and hidden source attributes for maximum coverage."
            },
            {
              icon: Shield,
              title: "Privacy First",
              description: "All media extraction and ZIP generation happens directly in your browser. We never store or log the files you download."
            },
            {
              icon: Download,
              title: "Original Quality",
              description: "We bypass standard compression proxies to locate the absolute highest resolution available on the source server."
            }
          ].map((feature, i) => (
            <div key={i} className="group p-8 bg-white rounded-3xl border border-slate-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300">
              <div className="w-14 h-14 bg-pink-50 text-pink-600 flex items-center justify-center rounded-2xl mb-6 group-hover:bg-pink-600 group-hover:text-white transition-colors duration-300">
                <feature.icon className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-pink-600 mb-3">Simple Pricing</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Start extracting for free</h3>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Whether you're a casual user or a professional archivist, we have a plan designed specifically for your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <div className="mb-6">
                <h4 className="text-xl font-bold text-slate-900 mb-2">Basic</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">$0</span>
                  <span className="text-slate-500 font-medium">/ forever</span>
                </div>
                <p className="text-slate-500 mt-4">Perfect for casual extractions and personal use.</p>
              </div>
              <div className="flex-1 space-y-4 mb-8">
                {['Extract from generic websites', 'Up to 3 extractions per day free', 'Standard resolution limits', 'Basic format support (JPG, MP4)'].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700">{feat}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl transition-colors">
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                Most Popular
              </div>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-white mb-2">Pro</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">$5</span>
                  <span className="text-slate-400 font-medium">/ month</span>
                </div>
                <p className="text-slate-400 mt-4">For power users who need bulk tools and high quality.</p>
              </div>
              <div className="flex-1 space-y-4 mb-8">
                {['Unlimited daily extractions', 'Social media platform support', 'Bulk ZIP downloading', 'Highest available resolution', 'Priority processing queue'].map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                    <span className="text-slate-200">{feat}</span>
                  </div>
                ))}
              </div>
              <button className="w-full py-3.5 px-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-pink-600/20">
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-6">
          <div className="bg-pink-50  p-6 rounded-2xl border border-slate-100 ">
            <h3 className="text-lg font-semibold text-slate-900  mb-2">Is it free to use?</h3>
            <p className="text-slate-600  text-sm leading-relaxed">
              Yes, the basic extraction features are completely free to use for personal purposes.
            </p>
          </div>
          <div className="bg-pink-50  p-6 rounded-2xl border border-slate-100 ">
            <h3 className="text-lg font-semibold text-slate-900  mb-2">Can I download private content?</h3>
            <p className="text-slate-600  text-sm leading-relaxed">
              Yes with a Pro Plan only. Media Hub can extract media from publicly/privately accessible pages or content that are available on any platform.
            </p>
          </div>
          <div className="bg-pink-50  p-6 rounded-2xl border border-slate-100 ">
            <h3 className="text-lg font-semibold text-slate-900  mb-2">What happens to my data?</h3>
            <p className="text-slate-600  text-sm leading-relaxed">
              We process extractions on-the-fly. We do not store or host any of the media you download. It is transferred directly to your device.
            </p>
          </div>
        </div>
      </section>

      <AnalysisOverlay stage={stage} message={message} onCancel={handleCancel} />
    </div>
  );
}
