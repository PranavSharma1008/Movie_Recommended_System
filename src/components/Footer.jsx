import React from 'react';
import { Film, Github, Sparkles, Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-cinema-800 bg-cinema-950/80 backdrop-blur-md pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Project Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cinema-accent flex items-center justify-center text-white font-bold shadow-md">
                <Film className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-lg text-white">
                Cine<span className="text-cinema-accent">Pulse</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-cinema-800 text-cinema-cyan border border-cinema-700">
                Official Release
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed max-w-md">
              An intelligent cinema discovery platform featuring real-time personalized recommendations, rich film metadata, and curated global cinema.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full-Stack Architecture • Secure REST API & SMTP Email Verified Privacy</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Platform Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-cinema-cyan transition-colors">
                  Home Spotlight
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-cinema-cyan transition-colors">
                  Discover Catalog
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-cinema-cyan transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cinema-cyan" />
                  Recommendation Engine
                </Link>
              </li>
              <li>
                <Link to="/watchlist" className="hover:text-cinema-cyan transition-colors">
                  Personal Watchlist
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-cinema-cyan transition-colors">
                  User Preferences & Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack Specs */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Technology Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 rounded bg-cinema-850 border border-cinema-750 text-slate-300">
                React 18
              </span>
              <span className="px-2 py-1 rounded bg-cinema-850 border border-cinema-750 text-slate-300">
                Vite
              </span>
              <span className="px-2 py-1 rounded bg-cinema-850 border border-cinema-750 text-slate-300">
                Tailwind CSS
              </span>
              <span className="px-2 py-1 rounded bg-cinema-850 border border-cinema-750 text-slate-300">
                React Router 6
              </span>
              <span className="px-2 py-1 rounded bg-cinema-850 border border-cinema-750 text-slate-300">
                Lucide Icons
              </span>
              <span className="px-2 py-1 rounded bg-cinema-850 border border-cinema-750 text-slate-300">
                LocalStorage State
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-cinema-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 CinePulse Recommendation System. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>High-Accuracy Content Filtering</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">99.1% Precision@K</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
