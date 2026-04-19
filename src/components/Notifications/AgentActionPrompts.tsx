import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/useAuth';
import { 
  Sparkles, ShieldAlert, Check, X, Info, ArrowRight, 
  Handshake, Zap, AlertCircle 
} from 'lucide-react';
import { subscribeToUserProposals, userAuthorizeProposal } from '../../services/adminService';
import GlassCard from '../UI/GlassCard';

export default function AgentActionPrompts() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserProposals(user.uid, setProposals);
    return () => unsub();
  }, [user]);

  const handleAction = async (proposalId: string, status: 'authorized' | 'rejected') => {
    if (!user) return;
    await userAuthorizeProposal(proposalId, user.uid, status);
  };

  if (proposals.length === 0) return null;

  return (
    <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
      <div className="flex items-center gap-2 sm:gap-3 px-2">
        <Sparkles size={18} className="sm:w-5 sm:h-5 text-[var(--color-accent)] animate-pulse" />
        <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[var(--color-text)] opacity-40">Agent Intervention</h3>
      </div>
      
      <AnimatePresence mode="popLayout">
        {proposals.map((proposal) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            layout
          >
            <GlassCard className="p-6 sm:p-8 relative overflow-hidden group shadow-2xl rounded-[2rem] sm:rounded-[2.5rem]">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 relative z-10">
                <div className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl neu-concave shrink-0 ${
                  proposal.type === 'CONNECTION_PROPOSAL' ? 'text-[var(--color-accent)]' : 'text-[#FF3B30]'
                }`}>
                  {proposal.type === 'CONNECTION_PROPOSAL' ? <Handshake size={24} className="sm:w-7 sm:h-7" strokeWidth={3} /> : <ShieldAlert size={24} className="sm:w-7 sm:h-7" strokeWidth={3} />}
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-[var(--color-text)]">
                      {proposal.type.replace('_', ' ')}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-[var(--color-text)] opacity-20 font-black uppercase tracking-widest whitespace-nowrap ml-2">
                      {proposal.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <p className="text-sm sm:text-base text-[var(--color-text)] opacity-60 leading-relaxed font-medium italic">
                    "{proposal.data?.reasoning || proposal.data?.explanation || "Strategic intervention proposed."}"
                  </p>

                  <div className="flex items-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                    <button 
                      onClick={() => handleAction(proposal.id, 'authorized')}
                      className="flex-1 neu-button-accent text-white py-3.5 sm:py-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-95 shadow-lg"
                    >
                      <Check size={14} className="sm:w-4 sm:h-4" strokeWidth={4} /> Confirm
                    </button>
                    <button 
                      onClick={() => handleAction(proposal.id, 'rejected')}
                      className="flex-1 neu-button text-[var(--color-text)] py-3.5 sm:py-4 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-95"
                    >
                      <X size={14} className="sm:w-4 sm:h-4" strokeWidth={4} /> Ignore
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
