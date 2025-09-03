import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { createQueryClient, cacheUtils } from '@/lib/react-query';
import {
  useLogin,
  useCurrentUser,
  useDoctors,
  useSpecializations,
  usePatientAppointments,
  useCreateAppointment,
  useUpdateAppointmentStatus,
} from '@/hooks/queries';
import { authService } from '@/services/auth';
import { doctorService } from '@/services/doctors';
import { appointmentService } from '@/services/appointments';

// Mock services
vi.mock('@/services/auth');
vi.mock('@/services/doctors');
vi.mock('@/services/appointments');

const mockedAuthService = vi.mocked(authService);
const mockedDoctorService = vi.mocked(doctorService);
const mockedAppointmentService = vi.mocked(appointmentService);

// Test wrapper component
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('React Query Configuration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('QueryClient Configuration', () => {
    it('should create QueryClient with correct default options', () => {
      const client = createQueryClient();
      const defaultOptions = client.getDefaultOptions();

      expect(defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000); // 5 minutes
      expect(defaultOptions.queries?.gcTime).toBe(10 * 60 * 1000); // 10 minutes
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
      expect(defaultOptions.queries?.refetchOnReconnect).toBe(true);
      expect(defaultOptions.mutations?.retry).toBe(1);
    });

    it('should handle retry logic correctly', () => {
      const client = createQueryClient();
      const retryFn = client.getDefaultOptions().queries?.retry as Function;

      // Should not retry on 4xx errors
      expect(retryFn(1, { response: { status: 400 } })).toBe(false);
      expect(retryFn(1, { response: { status: 404 } })).toBe(false);

      // Should retry on 5xx errors up to 3 times
      expect(retryFn(1, { response: { status: 500 } })).toBe(true);
      expect(retryFn(2, { response: { status: 500 } })).toBe(true);
      expect(retryFn(3, { response: { status: 500 } })).toBe(false);

      // Should retry on network errors
      expect(retryFn(1, { code: 'NETWORK_ERROR' })).toBe(true);
    });
  });

  describe('Cache Utilities', () => {
    it('should invalidate appointments correctly', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      await cacheUtils.invalidateAppointments(queryClient);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['appointments'],
      });
    });

    it('should invalidate patient appointments correctly', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      await cacheUtils.invalidatePatientAppointments(queryClient);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['appointments', 'patient'],
      });
    });

    it('should remove specific appointment from cache', () => {
      const removeSpy = vi.spyOn(queryClient, 'removeQueries');

      cacheUtils.removeAppointment(queryClient, 'appointment-123');
      expect(removeSpy).toHaveBeenCalledWith({
        queryKey: ['appointments', 'detail', 'appointment-123'],
      });
    });
  });

  describe('Authentication Hooks', () => {
    it('should handle login mutation correctly', async () => {
      const mockLoginResponse = {
        user: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'PATIENT' as const },
        token: 'mock-token',
      };

      mockedAuthService.login.mockResolvedValue(mockLoginResponse);
      mockedAuthService.setToken.mockImplementation(() => {});
      mockedAuthService.setUser.mockImplementation(() => {});

      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useLogin(), { wrapper });

      result.current.mutate({
        email: 'john@example.com',
        password: 'password',
        role: 'PATIENT',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAuthService.login).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password',
        role: 'PATIENT',
      });
      expect(mockedAuthService.setToken).toHaveBeenCalledWith('mock-token');
      expect(mockedAuthService.setUser).toHaveBeenCalledWith(mockLoginResponse.user);
    });

    it('should get current user from cache', () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com', role: 'PATIENT' as const };
      
      // Set user in cache
      queryClient.setQueryData(['auth', 'current-user'], mockUser);

      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useCurrentUser(), { wrapper });

      expect(result.current).toEqual(mockUser);
    });
  });

  describe('Doctor Hooks', () => {
    it('should fetch doctors with correct query key', async () => {
      const mockDoctorsResponse = {
        data: [
          { id: '1', name: 'Dr. Smith', email: 'smith@example.com', role: 'DOCTOR' as const, specialization: 'Cardiology' },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockedDoctorService.getDoctors.mockResolvedValue(mockDoctorsResponse);

      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(
        () => useDoctors({ page: 1, limit: 10, search: 'Smith' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedDoctorService.getDoctors).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'Smith',
      });
      expect(result.current.data).toEqual(mockDoctorsResponse);
    });

    it('should fetch specializations with longer cache time', async () => {
      const mockSpecializations = [
        { id: '1', name: 'Cardiology' },
        { id: '2', name: 'Neurology' },
      ];

      mockedDoctorService.getSpecializations.mockResolvedValue(mockSpecializations);

      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useSpecializations(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSpecializations);
      
      // Check that the query has the correct stale time (30 minutes)
      const queryState = queryClient.getQueryState(['specializations', 'list']);
      expect(queryState?.dataUpdatedAt).toBeDefined();
    });
  });

  describe('Appointment Hooks', () => {
    it('should fetch patient appointments correctly', async () => {
      const mockAppointments = {
        data: [
          {
            id: '1',
            doctorId: 'doc-1',
            patientId: 'patient-1',
            date: '2024-01-15',
            status: 'PENDING' as const,
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockedAppointmentService.getPatientAppointments.mockResolvedValue(mockAppointments);

      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(
        () => usePatientAppointments({ page: 1, status: 'PENDING' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAppointmentService.getPatientAppointments).toHaveBeenCalledWith({
        page: 1,
        status: 'PENDING',
      });
      expect(result.current.data).toEqual(mockAppointments);
    });

    it('should create appointment and invalidate cache', async () => {
      const mockNewAppointment = {
        id: '2',
        doctorId: 'doc-1',
        patientId: 'patient-1',
        date: '2024-01-16',
        status: 'PENDING' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockedAppointmentService.createAppointment.mockResolvedValue(mockNewAppointment);

      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useCreateAppointment(), { wrapper });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate({
        doctorId: 'doc-1',
        date: '2024-01-16',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAppointmentService.createAppointment).toHaveBeenCalledWith({
        doctorId: 'doc-1',
        date: '2024-01-16',
      });

      // Should invalidate patient and doctor appointments
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['appointments', 'patient'],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['appointments', 'doctor'],
      });
    });

    it('should handle optimistic updates for appointment status', async () => {
      const mockUpdatedAppointment = {
        id: '1',
        doctorId: 'doc-1',
        patientId: 'patient-1',
        date: '2024-01-15',
        status: 'COMPLETED' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      // Set up initial appointment data in cache
      const initialAppointments = {
        data: [{
          id: '1',
          doctorId: 'doc-1',
          patientId: 'patient-1',
          date: '2024-01-15',
          status: 'PENDING' as const,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      queryClient.setQueryData(['appointments', 'patient', { page: 1 }], initialAppointments);

      mockedAppointmentService.updateAppointmentStatus.mockResolvedValue(mockUpdatedAppointment);

      const wrapper = createWrapper(queryClient);
      const { result } = renderHook(() => useUpdateAppointmentStatus(), { wrapper });

      result.current.mutate({
        appointment_id: '1',
        status: 'COMPLETE',
      });

      // Wait for the optimistic update to be applied
      await waitFor(() => {
        const optimisticData = queryClient.getQueryData(['appointments', 'patient', { page: 1 }]) as any;
        expect(optimisticData.data[0].status).toBe('COMPLETED');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAppointmentService.updateAppointmentStatus).toHaveBeenCalledWith({
        appointment_id: '1',
        status: 'COMPLETE',
      });
    });
  });
});