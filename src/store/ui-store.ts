import { create } from 'zustand';
import type { UIState, Notification, ModalState } from '../types';

// Generate unique ID for notifications
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isLoading: false,
  notifications: [],
  modals: {
    appointmentBooking: false,
    statusUpdate: false,
  },

  // Loading actions
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      duration: notification.duration !== undefined ? notification.duration : 5000, // Default 5 seconds
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration (only if duration > 0)
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, newNotification.duration);
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Modal actions
  openModal: (modal: keyof ModalState) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modal]: true,
      },
    }));
  },

  closeModal: (modal: keyof ModalState) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modal]: false,
      },
    }));
  },

  toggleModal: (modal: keyof ModalState) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modal]: !state.modals[modal],
      },
    }));
  },

  closeAllModals: () => {
    const { modals } = get();
    const closedModals = Object.keys(modals).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as ModalState);

    set({ modals: closedModals });
  },
}));

export default useUIStore;