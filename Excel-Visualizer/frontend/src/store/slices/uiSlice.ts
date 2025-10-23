import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

export interface Modal {
  id: string;
  type: 'confirm' | 'info' | 'custom';
  title: string;
  content: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export interface UIState {
  // Loading states
  isGlobalLoading: boolean;
  loadingText: string;
  
  // Sidebar
  isSidebarOpen: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Modals
  modals: Modal[];
  
  // Theme
  theme: 'light' | 'dark';
  
  // Chart preferences
  chartPreferences: {
    defaultColors: string[];
    defaultChartType: string;
    animationsEnabled: boolean;
  };
  
  // Layout preferences
  layoutPreferences: {
    compactMode: boolean;
    showPreview: boolean;
  };
}

// Initial state
const initialState: UIState = {
  isGlobalLoading: false,
  loadingText: '',
  isSidebarOpen: true,
  notifications: [],
  modals: [],
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  chartPreferences: {
    defaultColors: [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
    ],
    defaultChartType: 'bar',
    animationsEnabled: true,
  },
  layoutPreferences: {
    compactMode: false,
    showPreview: true,
  },
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading states
    setGlobalLoading: (state, action: PayloadAction<{ isLoading: boolean; text?: string }>) => {
      state.isGlobalLoading = action.payload.isLoading;
      state.loadingText = action.payload.text || '';
    },
    
    // Sidebar
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    
    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
      
      // Auto-remove notification after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          // This will be handled by the notification component
        }, notification.duration || 5000);
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // Modals
    showModal: (state, action: PayloadAction<Omit<Modal, 'id'>>) => {
      const modal: Modal = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
      };
      state.modals.push(modal);
    },
    hideModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.id !== action.payload);
    },
    clearAllModals: (state) => {
      state.modals = [];
    },
    
    // Theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      localStorage.setItem('theme', newTheme);
    },
    
    // Chart preferences
    updateChartPreferences: (state, action: PayloadAction<Partial<UIState['chartPreferences']>>) => {
      state.chartPreferences = {
        ...state.chartPreferences,
        ...action.payload,
      };
      localStorage.setItem('chartPreferences', JSON.stringify(state.chartPreferences));
    },
    
    // Layout preferences
    updateLayoutPreferences: (state, action: PayloadAction<Partial<UIState['layoutPreferences']>>) => {
      state.layoutPreferences = {
        ...state.layoutPreferences,
        ...action.payload,
      };
      localStorage.setItem('layoutPreferences', JSON.stringify(state.layoutPreferences));
    },
    
    // Utility actions
    showSuccessNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        ...action.payload,
        type: 'success',
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        duration: 5000,
      };
      state.notifications.push(notification);
    },
    
    showErrorNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        ...action.payload,
        type: 'error',
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        duration: 7000,
      };
      state.notifications.push(notification);
    },
    
    showWarningNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        ...action.payload,
        type: 'warning',
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        duration: 6000,
      };
      state.notifications.push(notification);
    },
    
    showInfoNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        ...action.payload,
        type: 'info',
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        duration: 5000,
      };
      state.notifications.push(notification);
    },
    
    showConfirmModal: (
      state,
      action: PayloadAction<{
        title: string;
        content: string;
        onConfirm: () => void;
        onCancel?: () => void;
        confirmText?: string;
        cancelText?: string;
      }>
    ) => {
      const modal: Modal = {
        ...action.payload,
        type: 'confirm',
        id: Math.random().toString(36).substr(2, 9),
      };
      state.modals.push(modal);
    },
  },
});

export const {
  setGlobalLoading,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearAllNotifications,
  showModal,
  hideModal,
  clearAllModals,
  setTheme,
  toggleTheme,
  updateChartPreferences,
  updateLayoutPreferences,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  showConfirmModal,
} = uiSlice.actions;

export default uiSlice.reducer;