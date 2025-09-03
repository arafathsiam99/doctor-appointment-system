import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUIStore } from '../../store/ui-store';
import type { Notification } from '../../types';

describe('UIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      isLoading: false,
      notifications: [],
      modals: {
        appointmentBooking: false,
        statusUpdate: false,
      },
    });
    
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useUIStore.getState();
      
      expect(state.isLoading).toBe(false);
      expect(state.notifications).toEqual([]);
      expect(state.modals).toEqual({
        appointmentBooking: false,
        statusUpdate: false,
      });
    });
  });

  describe('Loading State', () => {
    it('should set loading state to true', () => {
      const { setLoading } = useUIStore.getState();
      setLoading(true);

      const state = useUIStore.getState();
      expect(state.isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      // Set initial loading state to true
      useUIStore.setState({ isLoading: true });

      const { setLoading } = useUIStore.getState();
      setLoading(false);

      const state = useUIStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('Notifications', () => {
    it('should add notification with generated ID', () => {
      const notificationData = {
        type: 'success' as const,
        message: 'Operation successful',
        duration: 3000,
      };

      const { addNotification } = useUIStore.getState();
      addNotification(notificationData);

      const state = useUIStore.getState();
      
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0]).toMatchObject(notificationData);
      expect(state.notifications[0].id).toBeDefined();
      expect(typeof state.notifications[0].id).toBe('string');
    });

    it('should add notification with default duration', () => {
      const notificationData = {
        type: 'info' as const,
        message: 'Information message',
      };

      const { addNotification } = useUIStore.getState();
      addNotification(notificationData);

      const state = useUIStore.getState();
      
      expect(state.notifications[0].duration).toBe(5000);
    });

    it('should add multiple notifications', () => {
      const { addNotification } = useUIStore.getState();
      
      addNotification({
        type: 'success',
        message: 'First notification',
      });
      
      addNotification({
        type: 'error',
        message: 'Second notification',
      });

      const state = useUIStore.getState();
      
      expect(state.notifications).toHaveLength(2);
      expect(state.notifications[0].message).toBe('First notification');
      expect(state.notifications[1].message).toBe('Second notification');
    });

    it('should auto-remove notification after duration', () => {
      const { addNotification } = useUIStore.getState();
      
      addNotification({
        type: 'success',
        message: 'Auto-remove notification',
        duration: 1000,
      });

      // Check notification is added
      expect(useUIStore.getState().notifications).toHaveLength(1);

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      // Check notification is removed
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });

    it('should not auto-remove notification with duration 0', () => {
      const { addNotification } = useUIStore.getState();
      
      addNotification({
        type: 'warning',
        message: 'Persistent notification',
        duration: 0,
      });

      // Check notification is added
      expect(useUIStore.getState().notifications).toHaveLength(1);

      // Fast-forward time
      vi.advanceTimersByTime(10000);

      // Check notification is still there
      expect(useUIStore.getState().notifications).toHaveLength(1);
    });

    it('should remove specific notification by ID', () => {
      const { addNotification, removeNotification } = useUIStore.getState();
      
      addNotification({
        type: 'success',
        message: 'First notification',
      });
      
      addNotification({
        type: 'error',
        message: 'Second notification',
      });

      const state = useUIStore.getState();
      const firstNotificationId = state.notifications[0].id;

      removeNotification(firstNotificationId);

      const updatedState = useUIStore.getState();
      
      expect(updatedState.notifications).toHaveLength(1);
      expect(updatedState.notifications[0].message).toBe('Second notification');
    });

    it('should clear all notifications', () => {
      const { addNotification, clearNotifications } = useUIStore.getState();
      
      addNotification({
        type: 'success',
        message: 'First notification',
      });
      
      addNotification({
        type: 'error',
        message: 'Second notification',
      });

      expect(useUIStore.getState().notifications).toHaveLength(2);

      clearNotifications();

      expect(useUIStore.getState().notifications).toHaveLength(0);
    });
  });

  describe('Modals', () => {
    it('should open modal', () => {
      const { openModal } = useUIStore.getState();
      openModal('appointmentBooking');

      const state = useUIStore.getState();
      
      expect(state.modals.appointmentBooking).toBe(true);
      expect(state.modals.statusUpdate).toBe(false);
    });

    it('should close modal', () => {
      // Set initial modal state to open
      useUIStore.setState({
        modals: {
          appointmentBooking: true,
          statusUpdate: false,
        },
      });

      const { closeModal } = useUIStore.getState();
      closeModal('appointmentBooking');

      const state = useUIStore.getState();
      
      expect(state.modals.appointmentBooking).toBe(false);
      expect(state.modals.statusUpdate).toBe(false);
    });

    it('should toggle modal from closed to open', () => {
      const { toggleModal } = useUIStore.getState();
      toggleModal('statusUpdate');

      const state = useUIStore.getState();
      
      expect(state.modals.statusUpdate).toBe(true);
      expect(state.modals.appointmentBooking).toBe(false);
    });

    it('should toggle modal from open to closed', () => {
      // Set initial modal state to open
      useUIStore.setState({
        modals: {
          appointmentBooking: false,
          statusUpdate: true,
        },
      });

      const { toggleModal } = useUIStore.getState();
      toggleModal('statusUpdate');

      const state = useUIStore.getState();
      
      expect(state.modals.statusUpdate).toBe(false);
      expect(state.modals.appointmentBooking).toBe(false);
    });

    it('should close all modals', () => {
      // Set initial state with multiple modals open
      useUIStore.setState({
        modals: {
          appointmentBooking: true,
          statusUpdate: true,
        },
      });

      const { closeAllModals } = useUIStore.getState();
      closeAllModals();

      const state = useUIStore.getState();
      
      expect(state.modals.appointmentBooking).toBe(false);
      expect(state.modals.statusUpdate).toBe(false);
    });

    it('should handle dynamic modal keys', () => {
      const { openModal, closeModal } = useUIStore.getState();
      
      // Add a new modal dynamically
      useUIStore.setState((state) => ({
        modals: {
          ...state.modals,
          customModal: false,
        },
      }));

      openModal('customModal');

      let state = useUIStore.getState();
      expect(state.modals.customModal).toBe(true);

      closeModal('customModal');

      state = useUIStore.getState();
      expect(state.modals.customModal).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple operations simultaneously', () => {
      const { setLoading, addNotification, openModal } = useUIStore.getState();
      
      // Perform multiple operations
      setLoading(true);
      addNotification({
        type: 'info',
        message: 'Loading started',
      });
      openModal('appointmentBooking');

      const state = useUIStore.getState();
      
      expect(state.isLoading).toBe(true);
      expect(state.notifications).toHaveLength(1);
      expect(state.notifications[0].message).toBe('Loading started');
      expect(state.modals.appointmentBooking).toBe(true);
    });

    it('should maintain state consistency across operations', () => {
      const { addNotification, removeNotification, openModal, closeModal } = useUIStore.getState();
      
      // Add notifications
      addNotification({ type: 'success', message: 'Success 1' });
      addNotification({ type: 'error', message: 'Error 1' });
      addNotification({ type: 'info', message: 'Info 1' });

      // Open modals
      openModal('appointmentBooking');
      openModal('statusUpdate');

      let state = useUIStore.getState();
      expect(state.notifications).toHaveLength(3);
      expect(state.modals.appointmentBooking).toBe(true);
      expect(state.modals.statusUpdate).toBe(true);

      // Remove middle notification
      const middleNotificationId = state.notifications[1].id;
      removeNotification(middleNotificationId);

      // Close one modal
      closeModal('appointmentBooking');

      state = useUIStore.getState();
      expect(state.notifications).toHaveLength(2);
      expect(state.notifications[0].message).toBe('Success 1');
      expect(state.notifications[1].message).toBe('Info 1');
      expect(state.modals.appointmentBooking).toBe(false);
      expect(state.modals.statusUpdate).toBe(true);
    });
  });
});