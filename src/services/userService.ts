import { doc, getDoc, setDoc, deleteDoc, writeBatch, increment, onSnapshot, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

export const followUser = async (followerId: string, followingId: string) => {
  const followId = `${followerId}_${followingId}`;
  const followRef = doc(db, 'follows', followId);
  const followerRef = doc(db, 'users', followerId);
  const followingRef = doc(db, 'users', followingId);

  const batch = writeBatch(db);

  batch.set(followRef, {
    followerId,
    followingId,
    createdAt: serverTimestamp(),
  });

  batch.update(followerRef, {
    followingCount: increment(1)
  });

  batch.update(followingRef, {
    followersCount: increment(1)
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `follows/${followId}`);
  }
};

export const unfollowUser = async (followerId: string, followingId: string) => {
  const followId = `${followerId}_${followingId}`;
  const followRef = doc(db, 'follows', followId);
  const followerRef = doc(db, 'users', followerId);
  const followingRef = doc(db, 'users', followingId);

  const batch = writeBatch(db);

  batch.delete(followRef);

  batch.update(followerRef, {
    followingCount: increment(-1)
  });

  batch.update(followingRef, {
    followersCount: increment(-1)
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `follows/${followId}`);
  }
};

export const isFollowing = async (followerId: string, followingId: string) => {
  const followId = `${followerId}_${followingId}`;
  const followRef = doc(db, 'follows', followId);
  try {
    const snap = await getDoc(followRef);
    return snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `follows/${followId}`);
    return false;
  }
};

export const subscribeToUserProfile = (userId: string, callback: (profile: UserProfile | null) => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      callback({ uid: snap.id, ...snap.data() } as UserProfile);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
  });
};

export const searchUsers = async (searchTerm: string, filters?: { primaryField?: string, company?: string, nicheGroup?: string }) => {
  const usersRef = collection(db, 'users');
  try {
    const snap = await getDocs(usersRef);
    let users = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      users = users.filter(u => 
        u.displayName?.toLowerCase().includes(term) ||
        u.company?.toLowerCase().includes(term) ||
        u.primaryField?.toLowerCase().includes(term)
      );
    }

    if (filters) {
      if (filters.primaryField) {
        users = users.filter(u => u.primaryField?.toLowerCase() === filters.primaryField?.toLowerCase());
      }
      if (filters.company) {
        users = users.filter(u => u.company?.toLowerCase().includes(filters.company!.toLowerCase()));
      }
      if (filters.nicheGroup) {
        users = users.filter(u => u.nicheGroup?.toLowerCase() === filters.nicheGroup?.toLowerCase());
      }
    }

    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'users');
    return [];
  }
};

export const getNetworkUsers = async () => {
  const usersRef = collection(db, 'users');
  try {
    const snap = await getDocs(usersRef);
    return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'users');
    return [];
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  try {
    await setDoc(userRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
};
