// DEMO MODE STUB — no-op functions for prototype phase
// These are replaced when real Firebase auth is configured.

export const registerUser = async () => {};
export const loginUser = async () => {};
export const logoutUser = () => {};
export const getUserProfile = async () => null;
export const completeOnboarding = async () => {};
export const subscribeToAuth = (callback) => {
  callback(null);
  return () => {};
};
