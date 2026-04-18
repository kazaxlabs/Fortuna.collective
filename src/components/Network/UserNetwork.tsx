import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import { getNetworkUsers } from '../../services/userService';
import { UserProfile } from '../../types';
import { User, Briefcase, Building2, ChevronRight, MessageSquare, Search, Filter, X } from 'lucide-react';

interface UserNetworkProps {
  onSelectUser: (userId: string) => void;
  onMessageUser: (userId: string) => void;
}

export default function UserNetwork({ onSelectUser, onMessageUser }: UserNetworkProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    primaryField: '',
    company: '',
    nicheGroup: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const allUsers = await getNetworkUsers();
        // Filter out the current user
        setUsers(allUsers.filter(u => u.uid !== currentUser?.uid));
      } catch (error) {
        console.error('Failed to fetch network users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const clearFilters = () => {
    setFilters({ primaryField: '', company: '', nicheGroup: '' });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm || 
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.primaryField?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesField = !filters.primaryField || u.primaryField?.toLowerCase() === filters.primaryField.toLowerCase();
    const matchesCompany = !filters.company || u.company?.toLowerCase().includes(filters.company.toLowerCase());
    const matchesNiche = !filters.nicheGroup || u.nicheGroup?.toLowerCase() === filters.nicheGroup.toLowerCase();

    return matchesSearch && matchesField && matchesCompany && matchesNiche;
  });

  return (
    <div className="h-full bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col p-12 overflow-y-auto no-scrollbar">
      <div className="max-w-6xl mx-auto w-full space-y-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-[var(--color-text)] uppercase">Collective</h1>
            <p className="text-[var(--color-text)] opacity-40 text-sm font-black uppercase tracking-[0.3em]">Strategic Partners in the Neural Network</p>
          </div>
          
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative flex-1 md:w-96 neu-concave rounded-full p-1 flex items-center">
              <Search className="ml-5 text-[var(--color-text)] opacity-20" size={20} />
              <input 
                type="text" 
                placeholder="Search colleagues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none py-4 pl-4 pr-6 text-base text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-bold"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-5 rounded-3xl transition-all shadow-sm ${showFilters ? 'neu-concave text-[var(--color-accent)]' : 'neu-button text-[var(--color-text)] opacity-40 hover:opacity-100'}`}
            >
              <Filter size={24} strokeWidth={3} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="overflow-hidden"
            >
              <div className="p-10 neu-convex rounded-[4rem] space-y-10 border border-[var(--color-shadow-dark)]/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-text)] opacity-40">Refinement Parameters</h3>
                  <button onClick={clearFilters} className="text-[10px] font-black uppercase tracking-widest text-[var(--color-accent)] hover:brightness-110 transition-colors flex items-center gap-3">
                    <X size={16} strokeWidth={4} /> Reset Vector
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text)] opacity-20 ml-2">Industry Field</label>
                    <div className="neu-concave rounded-2xl p-1">
                      <select
                        value={filters.primaryField}
                        onChange={(e) => setFilters({ ...filters, primaryField: e.target.value })}
                        className="w-full bg-transparent border-none py-4 px-5 text-sm text-[var(--color-text)] outline-none font-bold cursor-pointer"
                      >
                        <option value="">All Channels</option>
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

                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text)] opacity-20 ml-2">Strategic Group</label>
                    <div className="neu-concave rounded-2xl p-1">
                      <select
                        value={filters.nicheGroup}
                        onChange={(e) => setFilters({ ...filters, nicheGroup: e.target.value })}
                        className="w-full bg-transparent border-none py-4 px-5 text-sm text-[var(--color-text)] outline-none font-bold cursor-pointer"
                      >
                        <option value="">All Cadres</option>
                        <option value="Founders">Founders</option>
                        <option value="Investors">Investors</option>
                        <option value="Operators">Operators</option>
                        <option value="Strategists">Strategists</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text)] opacity-20 ml-2">Organization</label>
                    <div className="neu-concave rounded-2xl p-1">
                      <input
                        type="text"
                        placeholder="Organization title..."
                        value={filters.company}
                        onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                        className="w-full bg-transparent border-none py-4 px-5 text-sm text-[var(--color-text)] outline-none font-bold placeholder-[var(--color-text)] placeholder:opacity-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_var(--color-accent)]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
            {filteredUsers.map((user) => (
              <motion.div 
                layout
                initial={{ opacity: 0, translateZ: -20 }}
                animate={{ opacity: 1, translateZ: 0 }}
                key={user.uid}
                className="group p-8 neu-convex rounded-[3.5rem] flex items-center gap-8 hover:scale-[1.02] transition-all relative"
              >
                <div 
                  className="w-24 h-24 rounded-[2rem] neu-concave flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
                  onClick={() => onSelectUser(user.uid)}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-4xl font-black text-[var(--color-text)] opacity-10">{(user.displayName || '?')[0].toUpperCase()}</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 cursor-pointer space-y-3" onClick={() => onSelectUser(user.uid)}>
                  <div className="flex items-center gap-4">
                    <h3 className="font-black text-2xl text-[var(--color-text)] truncate tracking-tighter uppercase">{user.displayName}</h3>
                    <div className="neu-concave px-2 py-0.5 rounded-lg">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-accent)] px-2">
                        {user.role === 'admin' ? 'Master' : 'Distinguished'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-xs text-[var(--color-text)] opacity-40 font-bold">
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded-md neu-concave"><Briefcase size={12} strokeWidth={3} /></div> {user.primaryField}
                    </div>
                    {user.company && (
                      <div className="flex items-center gap-3">
                        <div className="p-1 rounded-md neu-concave"><Building2 size={12} strokeWidth={3} /></div> {user.company}
                      </div>
                    )}
                    {user.nicheGroup && (
                      <div className="flex items-center gap-3 text-[var(--color-accent)] opacity-60">
                        <div className="p-1 rounded-md neu-concave text-[var(--color-accent)]"><User size={12} strokeWidth={3} /></div> {user.nicheGroup}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => onMessageUser(user.uid)}
                    className="p-6 rounded-3xl neu-button text-[var(--color-text)] opacity-20 hover:text-[var(--color-accent)] hover:opacity-100 transition-all active:scale-90"
                    title="Direct Message"
                  >
                    <MessageSquare size={26} strokeWidth={3} />
                  </button>
                  <ChevronRight size={28} strokeWidth={3} className="text-[var(--color-text)] opacity-10 group-hover:text-[var(--color-accent)] group-hover:opacity-100 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="py-40 text-center space-y-8 neu-concave rounded-[4rem] border border-dashed border-[var(--color-shadow-dark)]/20">
            <div className="w-24 h-24 neu-convex rounded-full flex items-center justify-center mx-auto">
              <User size={40} className="text-[var(--color-text)] opacity-20" />
            </div>
            <div className="space-y-2">
              <h4 className="text-[var(--color-text)] opacity-60 text-2xl font-black uppercase tracking-tighter">No Figures Identified</h4>
              <p className="text-[var(--color-text)] opacity-20 text-sm italic font-medium">Adjust your tactile parameters to expand the search results.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
