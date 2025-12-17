import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/models';
import { fakeApi } from '../services/fakeApi';

const AUTH_STORAGE_KEY = '@waqt_lkhair_auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  quickLogin: () => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  toggleCreatorMode: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await fakeApi.login(email, password);
      if (user) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ error: 'Identifiants incorrects', isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Erreur de connexion', isLoading: false });
      return false;
    }
  },

  quickLogin: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await fakeApi.quickLogin();
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Erreur de connexion rapide', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ error: 'Erreur de déconnexion', isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },

  updateUser: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  toggleCreatorMode: async () => {
    const { user } = get();
    if (!user) return;

    const updatedUser = { ...user, isCreator: !user.isCreator };
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
