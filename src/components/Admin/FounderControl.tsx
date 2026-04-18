import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/useAuth';
import { 
  ShieldCheck, ShieldAlert, FileText, Check, X, AlertTriangle, 
  UserMinus, UserCheck, History, Search, Filter, ArrowRight,
  Users as UsersIcon, BarChart3, Shield, UserX, Activity
} from 'lucide-react';
import { 
  subscribeToPendingProposals, 
  subscribeToEvidenceLedger, 
  authorizeProposal, 
  rejectProposal,
  subscribeToAllUsers,
  updateUserRole,
  updateUserStatus,
  getSystemStats
} from '../../services/adminService';
import GlassCard from '../UI/GlassCard';
import { UserProfile } from '../../types';

export default function FounderControl() {
  const { user, profile } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'proposals' | 'evidence' | 'users' | 'stats'>('proposals');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;

    const unsubProposals = subscribeToPendingProposals(setProposals);
    const unsubEvidence = subscribeToEvidenceLedger(setEvidence);
    const unsubUsers = subscribeToAllUsers(setAllUsers);

    const fetchStats = async () => {
      const s = await getSystemStats();
      setStats(s);
    };
    fetchStats();

    return () => {
      unsubProposals();
      unsubEvidence();
      unsubUsers();
    };
  }, [user, profile]);

  const handleAuthorize = async (proposalId: string) => {
    if (!user) return;
    await authorizeProposal(proposalId, user.uid);
  };

  const handleReject = async (proposalId: string) => {
    if (!user) return;
    await rejectProposal(proposalId, user.uid);
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white p-8">
        <ShieldAlert size={64} className="text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-gray-400 text-center max-w-md">
          This area is reserved for Founding Members of the FORTUNA network.
        </p>
      </div>
    );
  }

  const filteredProposals = proposals.filter(p => 
    p.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.affectedUserId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvidence = evidence.filter(e => 
    e.violationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-10 border-b border-[var(--color-shadow-dark)]/10 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-5 uppercase">
            <div className="p-4 rounded-2xl neu-convex text-[var(--color-accent)]">
              <ShieldCheck size={32} />
            </div>
            Foundry Control
          </h1>
          <p className="text-[10px] text-[var(--color-text)] opacity-40 mt-3 font-black uppercase tracking-[0.3em]">Institutional Governance & Neural Oversight</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative neu-concave rounded-full p-1 flex items-center w-80">
            <Search size={18} className="ml-5 text-[var(--color-text)] opacity-20" />
            <input 
              type="text" 
              placeholder="Search collective dossiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none py-3 pl-4 pr-6 text-sm text-[var(--color-text)] outline-none placeholder-[var(--color-text)] placeholder:opacity-20 font-bold w-full"
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Channel */}
      <div className="flex px-10 py-4 bg-[var(--color-bg)] border-b border-[var(--color-shadow-dark)]/10 overflow-x-auto no-scrollbar gap-6 items-center">
        <div className="neu-concave p-2 rounded-3xl flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('proposals')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${
              activeTab === 'proposals' ? 'neu-convex text-[var(--color-accent)]' : 'text-[var(--color-text)] opacity-30 hover:opacity-100'
            }`}
          >
            Action Proposals
            {proposals.length > 0 && (
              <span className="ml-3 bg-[var(--color-accent)] text-white px-2 py-0.5 rounded-full text-[9px] shadow-[0_0_10px_var(--color-accent)]">{proposals.length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('evidence')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${
              activeTab === 'evidence' ? 'neu-convex text-[var(--color-accent)]' : 'text-[var(--color-text)] opacity-30 hover:opacity-100'
            }`}
          >
            Evidence Ledger
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${
              activeTab === 'users' ? 'neu-convex text-[var(--color-accent)]' : 'text-[var(--color-text)] opacity-30 hover:opacity-100'
            }`}
          >
            Node Entities
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${
              activeTab === 'stats' ? 'neu-convex text-[var(--color-accent)]' : 'text-[var(--color-text)] opacity-30 hover:opacity-100'
            }`}
          >
            Terminal Matrix
          </button>
        </div>
      </div>

      {/* Tactical Interface Content */}
      <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
        {activeTab === 'proposals' && (
          <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto pb-20">
            {filteredProposals.length === 0 ? (
              <div className="text-center py-32 neu-concave rounded-[4rem] text-[var(--color-text)] opacity-20 italic font-black uppercase tracking-widest">Null Action Proposals Buffer</div>
            ) : (
              filteredProposals.map((proposal) => (
                <div key={proposal.id} className="p-8 neu-convex rounded-[3.5rem] hover:scale-[1.01] transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-8">
                      <div className={`p-6 rounded-[2rem] neu-concave ${
                        proposal.type === 'BAN_INITIATION' ? 'text-[#FF3B30]' : 
                        proposal.type === 'PROVISIONAL_HOLD' ? 'text-[#FFCC00]' :
                        'text-[var(--color-accent)]'
                      }`}>
                        {proposal.type === 'BAN_INITIATION' ? <UserMinus size={32} strokeWidth={3} /> : 
                         proposal.type === 'PROVISIONAL_HOLD' ? <ShieldAlert size={32} strokeWidth={3} /> :
                         <FileText size={32} strokeWidth={3} />}
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-black tracking-tight uppercase text-[var(--color-text)]">{proposal.type.replace(/_/g, ' ')}</span>
                          <div className="neu-concave px-3 py-1 rounded-lg">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text)] opacity-40">
                              ORIGIN: {proposal.proposerId.substring(0, 8)}
                            </span>
                          </div>
                        </div>
                        <p className="text-lg font-medium text-[var(--color-text)] opacity-60">
                          Subject Entity: <span className="font-black text-[var(--color-text)] opacity-100 font-mono tracking-tighter">{proposal.affectedUserId}</span>
                        </p>
                        <div className="p-6 neu-concave rounded-[2rem] border border-[var(--color-shadow-dark)]/5">
                          <p className="text-[9px] text-[var(--color-text)] opacity-20 font-black uppercase tracking-[0.3em] mb-4">Tactical Reasoning</p>
                          <p className="text-lg italic font-medium opacity-80 leading-relaxed text-[var(--color-text)]">"{proposal.data?.explanation || proposal.data?.reasoning || 'No metadata transmitted.'}"</p>
                        </div>
                        <div className="text-[10px] text-[var(--color-text)] opacity-20 font-black uppercase tracking-widest">
                          Signal Logged: {proposal.createdAt.toDate().toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => handleAuthorize(proposal.id)}
                        className="flex items-center justify-center gap-3 neu-button-accent text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                      >
                        <Check size={16} strokeWidth={4} /> AUTHORIZE
                      </button>
                      <button 
                        onClick={() => handleReject(proposal.id)}
                        className="flex items-center justify-center gap-3 neu-button text-[var(--color-text)] px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 active:scale-95 transition-all"
                      >
                        <X size={16} strokeWidth={4} /> DISMISS
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto pb-20">
            {filteredEvidence.length === 0 ? (
              <div className="text-center py-32 neu-concave rounded-[4rem] text-[var(--color-text)] opacity-20 italic font-black uppercase tracking-widest">Security Buffer Equilibrated</div>
            ) : (
              filteredEvidence.map((item) => (
                <div key={item.id} className="p-8 neu-convex rounded-[3.5rem] hover:scale-[1.01] transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-8">
                      <div className={`p-6 rounded-[2rem] neu-concave ${
                        item.severity === 'critical' ? 'text-[#FF3B30]' : 
                        item.severity === 'high' ? 'text-[#FFCC00]' :
                        'text-[var(--color-text)] opacity-20'
                      }`}>
                        <AlertTriangle size={32} strokeWidth={3} />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-black tracking-tight uppercase text-[var(--color-text)]">{item.violationType || 'General Abnormality'}</span>
                          <div className={`px-4 py-1.5 rounded-full ${
                            item.severity === 'critical' ? 'bg-[#FF3B30] text-white shadow-[0_0_15px_#FF3B30]' : 'neu-concave text-[var(--color-text)] opacity-40'
                          }`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.severity}</span>
                          </div>
                        </div>
                        <p className="text-lg font-medium text-[var(--color-text)] opacity-60">
                          Node Under Review: <span className="font-black text-[var(--color-text)] opacity-100 font-mono tracking-tighter">{item.userId}</span>
                        </p>
                        <div className="p-6 neu-concave rounded-[2rem] border border-[var(--color-shadow-dark)]/5">
                          <p className="text-[9px] text-[var(--color-text)] opacity-20 font-black uppercase tracking-[0.3em] mb-4">Evidence Matrix</p>
                          <p className="text-lg font-medium opacity-80 leading-relaxed text-[var(--color-text)]">{item.evidence}</p>
                        </div>
                        <div className="text-[10px] text-[var(--color-text)] opacity-20 font-black uppercase tracking-widest">
                          Dossier Initialized: {item.createdAt.toDate().toLocaleString()} by {item.agentId}
                        </div>
                      </div>
                    </div>
                    
                    <button className="p-6 neu-button rounded-full text-[var(--color-text)] opacity-20 hover:opacity-100 transition-all">
                      <ArrowRight size={28} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="grid grid-cols-1 gap-6">
              {allUsers.filter(u => 
                u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(u => (
                <div key={u.uid} className="p-8 neu-convex rounded-[3rem] flex items-center justify-between hover:scale-[1.01] transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[1.5rem] neu-concave flex items-center justify-center overflow-hidden">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-3xl font-black text-[var(--color-text)] opacity-10">{(u.displayName || '?')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-black tracking-tight text-[var(--color-text)] uppercase">{u.displayName}</h3>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded-lg neu-concave px-3 py-1`}>
                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-accent)]">{u.role}</span>
                          </div>
                          <div className={`p-1 rounded-lg px-3 py-1 ${
                            u.status === 'banned' ? 'bg-[#FF3B30] text-white' : 
                            u.status === 'hold' ? 'bg-[#FFCC00] text-black' : 
                            'neu-concave text-[#34C759]'
                          }`}>
                            <span className="text-[9px] font-black uppercase tracking-widest">{u.status || 'Active'}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-[var(--color-text)] opacity-30 font-mono tracking-tight">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="neu-concave p-1 rounded-2xl flex flex-col gap-1 w-32">
                      <select 
                        value={u.role}
                        onChange={(e) => updateUserRole(u.uid, e.target.value as 'admin' | 'user')}
                        className="bg-transparent border-none px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-text)] outline-none cursor-pointer"
                      >
                        <option value="user">Access: Member</option>
                        <option value="admin">Access: Master</option>
                      </select>
                    </div>
                    <div className="neu-concave p-1 rounded-2xl flex flex-col gap-1 w-32">
                      <select 
                        value={u.status || 'active'}
                        onChange={(e) => updateUserStatus(u.uid, e.target.value as any)}
                        className="bg-transparent border-none px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--color-text)] outline-none cursor-pointer"
                      >
                        <option value="active">State: Clear</option>
                        <option value="hold">State: Hold</option>
                        <option value="banned">State: Terminated</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-10 pb-20">
            <div className="p-10 neu-convex rounded-[4rem] space-y-8 group hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between">
                <div className="p-5 neu-concave rounded-3xl text-[var(--color-text)] opacity-20 group-hover:opacity-100 group-hover:text-[var(--color-accent)] transition-all">
                  <UsersIcon size={40} strokeWidth={3} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text)] opacity-30">Neural Nodes</span>
              </div>
              <div className="space-y-2">
                <div className="text-7xl font-black tracking-tighter text-[var(--color-text)]">{stats.totalUsers}</div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#34C759]">
                  <Activity size={16} strokeWidth={4} /> {stats.activeUsers} Active Links
                </div>
              </div>
            </div>

            <div className="p-10 neu-convex rounded-[4rem] space-y-8 group hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between">
                <div className="p-5 neu-concave rounded-3xl text-[var(--color-text)] opacity-20 group-hover:opacity-100 group-hover:text-[var(--color-accent)] transition-all">
                  <FileText size={40} strokeWidth={3} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text)] opacity-30">Signal Streams</span>
              </div>
              <div className="space-y-2">
                <div className="text-7xl font-black tracking-tighter text-[var(--color-text)]">{stats.totalPosts}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text)] opacity-30">Shared Collective Insights</div>
              </div>
            </div>

            <div className="p-10 neu-convex rounded-[4rem] space-y-8 group hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between">
                <div className="p-5 neu-concave rounded-3xl text-[var(--color-text)] opacity-20 group-hover:opacity-100 group-hover:text-[#FF3B30] transition-all">
                  <Shield size={40} strokeWidth={3} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text)] opacity-30">Boundary Vetoes</span>
              </div>
              <div className="space-y-2">
                <div className="text-7xl font-black tracking-tighter text-[var(--color-text)]">{stats.bannedUsers}</div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF3B30]">
                  <UserX size={16} strokeWidth={4} /> Terminated Entities
                </div>
              </div>
            </div>

            <div className="p-10 neu-convex rounded-[4rem] space-y-8 group hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between">
                <div className="p-5 neu-concave rounded-3xl text-[var(--color-text)] opacity-20 group-hover:opacity-100 group-hover:text-[var(--color-accent)] transition-all">
                  <BarChart3 size={40} strokeWidth={3} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text)] opacity-30">Neural Bridges</span>
              </div>
              <div className="space-y-2">
                <div className="text-7xl font-black tracking-tighter text-[var(--color-text)]">{stats.totalConversations}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text)] opacity-30">Synchronous Private Channels</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
