import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit, where, doc, writeBatch, increment, deleteDoc, getDocs, startAfter, QueryDocumentSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { runGovernor, runNicheAuditor, NicheGroup } from './agentService';

export const getPostsPaginated = async (batchSize: number, lastDoc: QueryDocumentSnapshot | null, category?: string) => {
  const path = 'posts';
  try {
    let q;
    if (category && category !== 'feed' && category !== 'general') {
       q = query(
        collection(db, 'posts'),
        where('category', '==', category),
        where('isArchived', '!=', true),
        orderBy('isArchived'),
        orderBy('createdAt', 'desc'),
        limit(batchSize)
      );
    } else {
       q = query(
        collection(db, 'posts'),
        where('isArchived', '!=', true),
        orderBy('isArchived'),
        orderBy('createdAt', 'desc'),
        limit(batchSize)
      );
    }

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
    const posts = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt || { toDate: () => new Date() }
      };
    });

    return { posts, lastVisible };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return { posts: [], lastVisible: null };
  }
};

export const createPost = async (user: any, content: string, category: string = 'general', attachments: string[] = [], nicheGroup?: string) => {
  if (!content.trim()) return;
  
  const path = 'posts';
  try {
    const postData = {
      authorUid: user.uid,
      authorName: user.displayName || 'Member',
      authorHandle: user.displayName?.toLowerCase().replace(/\s/g, '') || 'member',
      avatar: user.avatar || '',
      content: content.trim(),
      category,
      nicheGroup: nicheGroup || user.nicheGroup || 'Sales & Marketing', // Use passed nicheGroup or user's default
      attachments,
      createdAt: serverTimestamp(),
      likesCount: 0,
      followersCount: 0,
      isOfficial: category === 'announcements',
    };

    const docRef = await addDoc(collection(db, 'posts'), postData);

    // Trigger Agents in background
    runGovernor({ ...postData, id: docRef.id });
    runNicheAuditor(content, user.nicheGroup as NicheGroup || NicheGroup.SALES, user.uid);

  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const toggleLike = async (user: any, postId: string, isLiked: boolean) => {
  if (!user) return;
  
  const batch = writeBatch(db);
  const likeId = `${user.uid}_${postId}`;
  const likeRef = doc(db, 'likes', likeId);
  const postRef = doc(db, 'posts', postId);

  if (!isLiked) {
    // Like
    batch.set(likeRef, {
      uid: user.uid,
      postId,
      createdAt: serverTimestamp()
    });
    batch.update(postRef, {
      likesCount: increment(1)
    });
  } else {
    // Unlike
    batch.delete(likeRef);
    batch.update(postRef, {
      likesCount: increment(-1)
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'likes');
  }
};

export const subscribeToUserLikes = (userId: string, callback: (likes: Set<string>) => void) => {
  const q = query(collection(db, 'likes'), where('uid', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const likedPostIds = new Set(snapshot.docs.map(doc => doc.data().postId));
    callback(likedPostIds);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'likes');
  });
};

export const deletePost = async (postId: string) => {
  const path = 'posts';
  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const archivePost = async (postId: string) => {
  const path = 'posts';
  try {
    const postRef = doc(db, 'posts', postId);
    await writeBatch(db).update(postRef, { isArchived: true }).commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const subscribeToUserPosts = (userId: string, callback: (posts: any[]) => void) => {
  const path = 'posts';
  const q = query(
    collection(db, 'posts'),
    where('authorUid', '==', userId),
    where('isArchived', '!=', true),
    orderBy('isArchived'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt || { toDate: () => new Date() }
      };
    });
    callback(posts);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const getUserPostsPaginated = async (userId: string, batchSize: number, lastDoc: QueryDocumentSnapshot | null) => {
  const path = 'posts';
  try {
    let q = query(
      collection(db, 'posts'),
      where('authorUid', '==', userId),
      where('isArchived', '!=', true),
      orderBy('isArchived'),
      orderBy('createdAt', 'desc'),
      limit(batchSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
    const posts = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt || { toDate: () => new Date() }
      };
    });

    return { posts, lastVisible };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return { posts: [], lastVisible: null };
  }
};

export const subscribeToPosts = (callback: (posts: any[]) => void, category?: string) => {
  const path = 'posts';
  let q = query(
    collection(db, 'posts'),
    where('isArchived', '!=', true),
    orderBy('isArchived'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  if (category && category !== 'feed') {
    q = query(
      collection(db, 'posts'),
      where('category', '==', category),
      where('isArchived', '!=', true),
      orderBy('isArchived'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  }

  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt || { toDate: () => new Date() }
      };
    });
    callback(posts);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};
