// DEMO MODE STUB — in-memory chat for prototype phase
// Messages are stored in memory only (reset on refresh).
// Replace with real Firestore implementation when Firebase is configured.

const memoryStore = {};

export const sendMessage = async (roomId, user, text) => {
  if (!text.trim()) return;
  if (!memoryStore[roomId]) memoryStore[roomId] = [];
  const msg = {
    id: `msg-${Date.now()}-${Math.random()}`,
    text: text.trim(),
    uid: user.uid,
    displayName: user.displayName || 'Member',
    primaryField: user.primaryField || '',
    createdAt: { toDate: () => new Date() },
  };
  memoryStore[roomId].push(msg);
  // Notify all active listeners for this room
  if (memoryStore[`__listeners_${roomId}`]) {
    memoryStore[`__listeners_${roomId}`].forEach((cb) => cb([...memoryStore[roomId]]));
  }
};

export const subscribeToMessages = (roomId, callback) => {
  if (!memoryStore[roomId]) memoryStore[roomId] = [];
  if (!memoryStore[`__listeners_${roomId}`]) memoryStore[`__listeners_${roomId}`] = [];

  const listener = memoryStore[`__listeners_${roomId}`];
  listener.push(callback);

  // Send current messages immediately
  callback([...memoryStore[roomId]]);

  // Return unsubscribe
  return () => {
    const idx = listener.indexOf(callback);
    if (idx > -1) listener.splice(idx, 1);
  };
};
