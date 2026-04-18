import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit, where, getDocs, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { runPillarAgent, runNicheAuditor, NicheGroup } from './agentService';

export const sendMessage = async (roomId: string, user: any, text: string) => {
  if (!text.trim()) return;
  
  const path = `rooms/${roomId}/messages`;
  try {
    await addDoc(collection(db, 'rooms', roomId, 'messages'), {
      uid: user.uid,
      displayName: user.displayName || 'Member',
      primaryField: user.primaryField || '',
      text: text.trim(),
      createdAt: serverTimestamp(),
      readBy: [user.uid],
    });

    // Trigger Agents
    runPillarAgent(text, user.nicheGroup as NicheGroup || NicheGroup.SALES);
    runNicheAuditor(text, user.nicheGroup as NicheGroup || NicheGroup.SALES, user.uid);

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const subscribeToMessages = (roomId: string, callback: (msgs: any[]) => void) => {
  const path = `rooms/${roomId}/messages`;
  const q = query(
    collection(db, 'rooms', roomId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt || { toDate: () => new Date() }
    }));
    callback(msgs);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const getOrCreateConversation = async (user1Id: string, user2Id: string) => {
  const convoId = [user1Id, user2Id].sort().join('_');
  const convoRef = doc(db, 'conversations', convoId);
  
  try {
    const snap = await getDoc(convoRef);
    if (!snap.exists()) {
      await setDoc(convoRef, {
        participants: [user1Id, user2Id],
        updatedAt: serverTimestamp(),
        lastMessage: '',
      });
    }
    return convoId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversations/${convoId}`);
    return null;
  }
};

export const sendDirectMessage = async (convoId: string, senderId: string, receiverId: string, text: string) => {
  if (!text.trim()) return;
  
  const path = `conversations/${convoId}/messages`;
  try {
    await addDoc(collection(db, 'conversations', convoId, 'messages'), {
      senderId,
      receiverId,
      text: text.trim(),
      createdAt: serverTimestamp(),
      readBy: [senderId],
    });
    
    await updateDoc(doc(db, 'conversations', convoId), {
      lastMessage: text.trim(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const subscribeToDirectMessages = (convoId: string, callback: (msgs: any[]) => void) => {
  const path = `conversations/${convoId}/messages`;
  const q = query(
    collection(db, 'conversations', convoId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt || { toDate: () => new Date() }
    }));
    callback(msgs);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const subscribeToConversations = (userId: string, callback: (convos: any[]) => void) => {
  const path = 'conversations';
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const convos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(convos);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const markMessageAsRead = async (roomId: string, messageId: string, userId: string) => {
  const msgRef = doc(db, 'rooms', roomId, 'messages', messageId);
  try {
    const snap = await getDoc(msgRef);
    if (snap.exists()) {
      const data = snap.data();
      const readBy = data.readBy || [];
      if (!readBy.includes(userId)) {
        await updateDoc(msgRef, {
          readBy: [...readBy, userId]
        });
      }
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
};

export const markDirectMessageAsRead = async (convoId: string, messageId: string, userId: string) => {
  const msgRef = doc(db, 'conversations', convoId, 'messages', messageId);
  try {
    const snap = await getDoc(msgRef);
    if (snap.exists()) {
      const data = snap.data();
      const readBy = data.readBy || [];
      if (!readBy.includes(userId)) {
        await updateDoc(msgRef, {
          readBy: [...readBy, userId]
        });
      }
    }
  } catch (error) {
    console.error('Error marking direct message as read:', error);
  }
};
