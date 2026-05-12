import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  mobileMenuOpen: boolean;
  loadingOverlay: boolean;
}

const initialState: UIState = {
  sidebarOpen: false,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  mobileMenuOpen: false,
  loadingOverlay: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },
    setLoadingOverlay: (state, action: PayloadAction<boolean>) => {
      state.loadingOverlay = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleTheme, setTheme, setMobileMenuOpen, setLoadingOverlay } = uiSlice.actions;
export default uiSlice.reducer;