import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, addDoc, getDoc, writeBatch, setDoc, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

export const subscribeToPendingProposals = (callback: (proposals: any[]) => void) => {
  const q = query(
    collection(db, 'action_proposals'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const proposals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt || { toDate: () => new Date() }
    }));
    callback(proposals);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'action_proposals');
  });
};

export const subscribeToEvidenceLedger = (callback: (evidence: any[]) => void) => {
  const q = query(
    collection(db, 'evidence_ledger'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const evidence = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt || { toDate: () => new Date() }
    }));
    callback(evidence);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'evidence_ledger');
  });
};

export const subscribeToAllUsers = (callback: (users: UserProfile[]) => void) => {
  const q = query(collection(db, 'users'), orderBy('displayName', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    } as UserProfile));
    callback(users);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'users');
  });
};

export const updateUserRole = async (userId: string, role: 'admin' | 'user') => {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, { role });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
};

export const updateUserStatus = async (userId: string, status: 'active' | 'hold' | 'banned') => {
  const userRef = doc(db, 'users', userId);
  try {
    await updateDoc(userRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
};

export const getSystemStats = async () => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const postsSnap = await getDocs(collection(db, 'posts'));
    const convosSnap = await getDocs(collection(db, 'conversations'));
    
    return {
      totalUsers: usersSnap.size,
      totalPosts: postsSnap.size,
      totalConversations: convosSnap.size,
      activeUsers: usersSnap.docs.filter(d => d.data().status === 'active').length,
      bannedUsers: usersSnap.docs.filter(d => d.data().status === 'banned').length,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'system_stats');
    return null;
  }
};

export const authorizeProposal = async (proposalId: string, adminId: string) => {
  const proposalRef = doc(db, 'action_proposals', proposalId);
  try {
    const proposalSnap = await getDoc(proposalRef);
    if (!proposalSnap.exists()) return;
    
    const proposal = proposalSnap.data();
    
    // Create Snapshot before execution
    const snapshotRef = await addDoc(collection(db, 'system_snapshots'), {
      actionId: proposalId,
      preState: { proposal },
      createdAt: serverTimestamp()
    });

    // Execute Action logic based on type
    if (proposal.type === 'PROVISIONAL_HOLD') {
      await updateDoc(doc(db, 'users', proposal.affectedUserId), {
        status: 'hold'
      });
    } else if (proposal.type === 'BAN_INITIATION') {
      await updateDoc(doc(db, 'users', proposal.affectedUserId), {
        status: 'banned'
      });
    }

    // Update Proposal Status
    await updateDoc(proposalRef, {
      status: 'executed',
      authorizedBy: adminId,
      executedAt: serverTimestamp(),
      snapshotId: snapshotRef.id
    });

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `action_proposals/${proposalId}`);
  }
};

export const rejectProposal = async (proposalId: string, adminId: string) => {
  try {
    await updateDoc(doc(db, 'action_proposals', proposalId), {
      status: 'rejected',
      rejectedBy: adminId,
      rejectedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `action_proposals/${proposalId}`);
  }
};

export const userAuthorizeProposal = async (proposalId: string, userId: string, status: 'authorized' | 'rejected') => {
  const proposalRef = doc(db, 'action_proposals', proposalId);
  try {
    const proposalSnap = await getDoc(proposalRef);
    if (!proposalSnap.exists()) return;
    
    const proposal = proposalSnap.data();
    if (proposal.affectedUserId !== userId) {
      throw new Error('Unauthorized: You are not the affected user for this proposal.');
    }

    if (status === 'authorized' && proposal.type === 'CONNECTION_PROPOSAL') {
      // Execute Connection: Create a conversation
      const otherUserId = proposal.data.otherUserId;
      const convoId = [userId, otherUserId].sort().join('_');
      const convoRef = doc(db, 'conversations', convoId);
      
      await setDoc(convoRef, {
        participants: [userId, otherUserId],
        lastMessage: 'AI matched connection initiated.',
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        type: 'direct'
      }, { merge: true });

      // Add a system message
      await addDoc(collection(db, 'conversations', convoId, 'messages'), {
        senderId: 'system',
        text: `The Governor Agent has matched you based on your ${proposal.data.pillar || 'shared'} interests.`,
        createdAt: serverTimestamp()
      });
    }

    await updateDoc(proposalRef, {
      status,
      respondedAt: serverTimestamp()
    });

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `action_proposals/${proposalId}`);
  }
};

export const subscribeToUserProposals = (userId: string, callback: (proposals: any[]) => void) => {
  const q = query(
    collection(db, 'action_proposals'),
    where('affectedUserId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const proposals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt || { toDate: () => new Date() }
    }));
    callback(proposals);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'action_proposals');
  });
};
