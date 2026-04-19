import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, User, Briefcase, Building2, ChevronRight, MessageSquare, Filter, X } from 'lucide-react';
import { motion } from 'motion/react';
import { searchUsers } from '../../services/userService';
import { UserProfile } from '../../types';

interface SearchProps {
  onSelectUser?: (userId: string) => void;
  onMessageUser?: (userId: string) => void;
}

export default function Search({ onSelectUser, onMessageUser }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    primaryField: '',
    company: '',
    nicheGroup: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1 || Object.values(filters).some(v => v)) {
        setLoading(true);
        try {
          const users = await searchUsers(searchTerm, filters);
          setResults(users);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filters]);

  const clearFilters = () => {
    setFilters({ primaryField: '', company: '', nicheGroup: '' });
  };

  return (
    <div className="h-full bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col p-4 sm:p-14 overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto w-full space-y-8 sm:space-y-12">
        <div className="space-y-3 sm:space-y-4 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-text)] uppercase">Directory</h1>
          <p className="text-[var(--color-text)] opacity-40 text-base sm:text-lg font-medium tracking-tight px-4 sm:px-0">Access the collective index by identity, sector, or institution.</p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="relative flex-1 neu-concave rounded-2xl sm:rounded-[2rem] p-1.5 sm:p-2 flex items-center">
              <div className="pl-4 sm:pl-6 pr-3 sm:pr-4 text-[var(--color-text)] opacity-20">
                <SearchIcon size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Identity, institution, or domain"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none py-3 sm:py-4 text-sm sm:text-base focus:ring-0 outline-none transition-all placeholder-[var(--color-text)] placeholder:opacity-20 font-medium"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] transition-all flex items-center justify-center gap-3 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] ${
                showFilters 
                  ? 'neu-concave text-[var(--color-accent)]' 
                  : 'neu-button text-[var(--color-text)] opacity-60 hover:opacity-100'
              }`}
            >
              <Filter size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={3} />
              {showFilters ? 'Collapse' : 'Refine'}
            </button>
          </div>

          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 sm:p-10 neu-convex rounded-[2rem] sm:rounded-[3rem] space-y-8 sm:space-y-10 mb-4 sm:mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] sm:text-[10px] font-black text-[var(--color-text)] opacity-20 uppercase tracking-[0.3em]">Precision Parameters</h3>
                  <button 
                    onClick={clearFilters} 
                    className="text-[9px] sm:text-[10px] font-black text-[var(--color-accent)] hover:opacity-80 transition-all flex items-center gap-2 uppercase tracking-widest"
                  >
                    <X size={12} className="sm:w-[14px] sm:h-[14px]" strokeWidth={3} /> 
                    Reset
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[9px] sm:text-[10px] font-black text-[var(--color-text)] opacity-30 uppercase tracking-[0.2em] px-1">Channel Domain</label>
                    <div className="neu-concave rounded-xl sm:rounded-2xl p-0.5 sm:p-1">
                      <select
                        value={filters.primaryField}
                        onChange={(e) => setFilters({ ...filters, primaryField: e.target.value })}
                        className="w-full bg-transparent border-none rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-[var(--color-text)] outline-none cursor-pointer font-bold"
                      >
                        <option value="">Full Spectrum</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Media">Media</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Logistics">Logistics</option>
                        <option value="Energy">Energy</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[9px] sm:text-[10px] font-black text-[var(--color-text)] opacity-30 uppercase tracking-[0.2em] px-1">Classification</label>
                    <div className="neu-concave rounded-xl sm:rounded-2xl p-0.5 sm:p-1">
                      <select
                        value={filters.nicheGroup}
                        onChange={(e) => setFilters({ ...filters, nicheGroup: e.target.value })}
                        className="w-full bg-transparent border-none rounded-lg sm:rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-[var(--color-text)] outline-none cursor-pointer font-bold"
                      >
                        <option value="">All Tiers</option>
                        <option value="Founders">Founders</option>
                        <option value="Investors">Investors</option>
                        <option value="Operators">Operators</option>
                        <option value="Strategists">Strategists</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-[9px] sm:text-[10px] font-black text-[var(--color-text)] opacity-30 uppercase tracking-[0.2em] px-1">Institution</label>
                    <div className="neu-concave rounded-xl sm:rounded-2xl p-0.5 sm:p-1">
                      <input
                        type="text"
                        placeholder="Organization identity"
                        value={filters.company}
                        onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                        className="w-full bg-transparent border-none py-2.5 sm:py-3 px-4 sm:px-5 text-xs sm:text-sm text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 space-y-4 sm:space-y-6 min-h-[20vh]" />
          )}
        </div>

        <div className="space-y-6 pb-32">
          {results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {results.map((user) => (
                <motion.div
                  key={user.uid}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full p-6 sm:p-8 neu-convex rounded-[2rem] sm:rounded-[3rem] flex flex-col sm:flex-row items-center gap-4 sm:gap-8 hover:scale-[1.01] transition-all group text-center sm:text-left relative overflow-hidden"
                >
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-[1.5rem] neu-concave flex items-center justify-center text-[var(--color-text)] shrink-0 overflow-hidden cursor-pointer group-hover:scale-95 transition-all"
                    onClick={() => onSelectUser?.(user.uid)}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-2xl sm:text-3xl font-black opacity-20">{(user.displayName || '?')[0].toUpperCase()}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectUser?.(user.uid)}>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-2">
                      <h3 className="font-extrabold text-xl sm:text-2xl tracking-tight text-[var(--color-text)]">{user.displayName}</h3>
                      <div className="neu-concave px-2.5 sm:px-3 py-1 rounded-full scale-90">
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[var(--color-accent)]">
                          {user.role === 'admin' ? 'Strategic Architect' : 'Core Node'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 sm:gap-x-8 gap-y-2 mt-2 sm:mt-3 text-xs sm:text-sm text-[var(--color-text)] opacity-60 font-medium tracking-tight">
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="sm:w-4 sm:h-4 text-[var(--color-accent)]" /> 
                        <span>{user.primaryField}</span>
                      </div>
                      {user.company && (
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="sm:w-4 sm:h-4 text-[var(--color-accent)]" /> 
                          <span>{user.company}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-5 mt-4 sm:mt-0">
                    <button 
                      onClick={() => onMessageUser?.(user.uid)}
                      className="p-4 sm:p-5 neu-button rounded-full text-[var(--color-accent)] hover:scale-110 active:scale-90 transition-all shadow-md"
                      title="Send Message"
                    >
                      <MessageSquare size={18} className="sm:w-5 sm:h-5" strokeWidth={3} />
                    </button>
                    <div className="hidden sm:block p-3 text-[var(--color-text)] opacity-10 group-hover:opacity-100 group-hover:translate-x-2 transition-all cursor-pointer" onClick={() => onSelectUser?.(user.uid)}>
                      <ChevronRight size={24} className="sm:w-7 sm:h-7" strokeWidth={3} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (searchTerm.trim().length > 1 || Object.values(filters).some(v => v)) && !loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-40 text-center space-y-8 neu-concave rounded-[4rem]"
            >
              <div className="w-24 h-24 neu-convex rounded-full flex items-center justify-center mx-auto text-[var(--color-text)] opacity-10">
                <User size={40} />
              </div>
              <div className="space-y-4">
                <p className="text-[var(--color-text)] font-extrabold text-2xl tracking-tight leading-none uppercase">Identity Missing</p>
                <p className="text-[var(--color-text)] opacity-30 text-base font-medium">No collective nodes identified matching your query.</p>
              </div>
              <button 
                onClick={clearFilters}
                className="text-[10px] font-black text-[var(--color-accent)] hover:opacity-80 transition-all uppercase tracking-[0.2em] neu-button px-8 py-4 rounded-2xl"
              >
                Reset Parameters
              </button>
            </motion.div>
          ) : !searchTerm && !Object.values(filters).some(v => v) && !loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              className="py-48 text-center space-y-6"
            >
              <SearchIcon size={80} className="mx-auto text-[var(--color-text)]" strokeWidth={1} />
              <div className="space-y-2">
                <p className="text-[10px] font-black text-[var(--color-text)] uppercase tracking-[0.4em]">Collective Directory</p>
                <p className="text-xs text-[var(--color-text)] font-medium italic opacity-60">Scanning for professionals in the fortuna collective node.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
