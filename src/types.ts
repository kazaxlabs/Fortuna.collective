export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  primaryField?: string;
  company?: string;
  assetIBring?: string;
  connectionISeeking?: string;
  social?: string;
  role: 'admin' | 'user';
  onboardingComplete: boolean;
  bio?: string;
  avatar?: string;
  location?: string;
  followersCount?: number;
  followingCount?: number;
  status?: 'active' | 'hold' | 'banned';
  nicheGroup?: string;
}

export interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}
