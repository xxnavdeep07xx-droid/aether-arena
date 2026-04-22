import { create } from 'zustand';

export type ViewName =
  | 'landing'
  | 'home'
  | 'tournaments'
  | 'tournament-detail'
  | 'leaderboard'
  | 'streams'
  | 'profile'
  | 'notifications'
  | 'admin-dashboard'
  | 'admin-tournaments'
  | 'admin-tournament-create'
  | 'admin-registrations'
  | 'admin-games'
  | 'admin-streams'
  | 'admin-affiliates'
  | 'admin-topup'
  | 'admin-analytics'
  | 'admin-settings'
  | 'privacy-policy'
  | 'terms-conditions'
  | 'refund-policy'
  | 'contact'
  | 'settings'
  | 'aether'
  | 'aether-tasks'
  | 'aether-redeem'
  | 'aether-history'
  | 'admin-redemptions'
  | 'admin-aether-manage';

interface AppState {
  currentView: ViewName;
  viewParams: Record<string, string>;
  rightPanelCollapsed: boolean;
  mobileMenuOpen: boolean;
  previousView: ViewName | null;

  navigate: (view: ViewName, params?: Record<string, string>) => void;
  goBack: () => void;
  setRightPanelCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'landing',
  viewParams: {},
  rightPanelCollapsed: false,
  mobileMenuOpen: false,
  previousView: null,

  navigate: (view, params = {}) => {
    const { currentView } = get();
    set({
      previousView: currentView,
      currentView: view,
      viewParams: params,
      mobileMenuOpen: false,
    });
    // Clear search when navigating away from search-related views
    if (!['tournaments', 'home', 'leaderboard'].includes(view)) {
      useSearchStore.getState().setQuery('');
    }
  },

  goBack: () => {
    const { previousView } = get();
    if (previousView) {
      set({ currentView: previousView, previousView: null });
    }
  },

  setRightPanelCollapsed: (collapsed) => set({ rightPanelCollapsed: collapsed }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));

// Auth store
interface AuthState {
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isAdmin: boolean;
    isBanned: boolean;
    league: string;
    leaguePoints: number;
    totalWins: number;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  aetherBalance: number | null;
  setAetherBalance: (balance: number | null) => void;
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  aetherBalance: null,

  setAetherBalance: (balance) => set({ aetherBalance: balance }),
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false, aetherBalance: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// Search store
interface SearchState {
  query: string;
  setQuery: (query: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
}));
