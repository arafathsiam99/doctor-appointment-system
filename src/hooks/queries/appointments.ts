import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '@/services/appointments';
import { queryKeys } from '@/lib/query-keys';
import { cacheUtils } from '@/lib/react-query';
import type {
  AppointmentFilters,
  DoctorAppointmentFilters,
  CreateAppointmentData,
  UpdateAppointmentStatusData,
  Appointment,
  PaginatedResponse,
} from '@/types';

// Get patient appointments
export const usePatientAppointments = (filters: AppointmentFilters) => {
  return useQuery({
    queryKey: queryKeys.patientAppointments(filters),
    queryFn: () => appointmentService.getPatientAppointments(filters),
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
    // Appointments change frequently, shorter stale time
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get doctor appointments
export const useDoctorAppointments = (filters: DoctorAppointmentFilters) => {
  return useQuery({
    queryKey: queryKeys.doctorAppointments(filters),
    queryFn: () => appointmentService.getDoctorAppointments(filters),
    // Keep previous data while fetching new data
    placeholderData: (previousData) => previousData,
    // Appointments change frequently, shorter stale time
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get specific appointment by ID
export const useAppointment = (appointmentId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.appointmentDetails(appointmentId),
    queryFn: () => appointmentService.getAppointmentById(appointmentId),
    enabled: enabled && !!appointmentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Create appointment mutation
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.mutations.createAppointment,
    mutationFn: (appointmentData: CreateAppointmentData) => 
      appointmentService.createAppointment(appointmentData),
    onSuccess: (newAppointment) => {
      // Invalidate patient appointments to refetch with new appointment
      cacheUtils.invalidatePatientAppointments(queryClient);
      
      // Invalidate doctor appointments as well
      cacheUtils.invalidateDoctorAppointments(queryClient);
      
      // Optionally add the new appointment to existing cache
      // This provides immediate feedback without waiting for refetch
      const patientAppointmentQueries = queryClient.getQueriesData({
        queryKey: ['appointments', 'patient'],
      });
      
      patientAppointmentQueries.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'data' in data) {
          const paginatedData = data as PaginatedResponse<Appointment>;
          queryClient.setQueryData(queryKey, {
            ...paginatedData,
            data: [newAppointment, ...paginatedData.data],
            pagination: {
              ...paginatedData.pagination,
              total: paginatedData.pagination.total + 1,
            },
          });
        }
      });
    },
    onError: (error) => {
      console.error('Failed to create appointment:', error);
    },
  });
};

// Update appointment status mutation with optimistic updates
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.mutations.updateAppointmentStatus,
    mutationFn: (statusData: UpdateAppointmentStatusData) => 
      appointmentService.updateAppointmentStatus(statusData),
    
    // Optimistic update - immediately update UI before API call completes
    onMutate: async (statusData) => {
      const { appointment_id, status } = statusData;
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['appointments'] });
      
      // Snapshot the previous values
      const previousPatientAppointments = queryClient.getQueriesData({
        queryKey: ['appointments', 'patient'],
      });
      const previousDoctorAppointments = queryClient.getQueriesData({
        queryKey: ['appointments', 'doctor'],
      });
      
      // Optimistically update appointment status in all relevant caches
      const updateAppointmentStatus = (appointment: Appointment) => {
        if (appointment.id === appointment_id) {
          return {
            ...appointment,
            status: status === 'COMPLETE' ? 'COMPLETED' as const : 'CANCELLED' as const,
            updatedAt: new Date().toISOString(),
          };
        }
        return appointment;
      };
      
      // Update patient appointments cache
      previousPatientAppointments.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'data' in data) {
          const paginatedData = data as PaginatedResponse<Appointment>;
          queryClient.setQueryData(queryKey, {
            ...paginatedData,
            data: paginatedData.data.map(updateAppointmentStatus),
          });
        }
      });
      
      // Update doctor appointments cache
      previousDoctorAppointments.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'data' in data) {
          const paginatedData = data as PaginatedResponse<Appointment>;
          queryClient.setQueryData(queryKey, {
            ...paginatedData,
            data: paginatedData.data.map(updateAppointmentStatus),
          });
        }
      });
      
      // Update individual appointment cache if it exists
      const appointmentDetailKey = queryKeys.appointmentDetails(appointment_id);
      const existingAppointment = queryClient.getQueryData<Appointment>(appointmentDetailKey);
      if (existingAppointment) {
        queryClient.setQueryData(appointmentDetailKey, updateAppointmentStatus(existingAppointment));
      }
      
      // Return context for rollback
      return {
        previousPatientAppointments,
        previousDoctorAppointments,
        previousAppointment: existingAppointment,
      };
    },
    
    onSuccess: (updatedAppointment, statusData) => {
      // Update caches with the actual server response
      const { appointment_id } = statusData;
      
      // Update individual appointment cache
      queryClient.setQueryData(
        queryKeys.appointmentDetails(appointment_id),
        updatedAppointment
      );
      
      // The optimistic updates should already be correct, but we can
      // invalidate to ensure consistency with server state
      cacheUtils.invalidatePatientAppointments(queryClient);
      cacheUtils.invalidateDoctorAppointments(queryClient);
    },
    
    onError: (error, statusData, context) => {
      console.error('Failed to update appointment status:', error);
      
      // Rollback optimistic updates on error
      if (context) {
        const { previousPatientAppointments, previousDoctorAppointments, previousAppointment } = context;
        
        // Restore patient appointments
        previousPatientAppointments.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
        
        // Restore doctor appointments
        previousDoctorAppointments.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
        
        // Restore individual appointment
        if (previousAppointment) {
          queryClient.setQueryData(
            queryKeys.appointmentDetails(statusData.appointment_id),
            previousAppointment
          );
        }
      }
    },
  });
};

// Cancel appointment mutation (convenience hook)
export const useCancelAppointment = () => {
  const updateAppointmentStatus = useUpdateAppointmentStatus();
  
  return {
    ...updateAppointmentStatus,
    mutate: (appointmentId: string) => {
      updateAppointmentStatus.mutate({
        appointment_id: appointmentId,
        status: 'CANCELLED',
      });
    },
    mutateAsync: (appointmentId: string) => {
      return updateAppointmentStatus.mutateAsync({
        appointment_id: appointmentId,
        status: 'CANCELLED',
      });
    },
  };
};

// Complete appointment mutation (convenience hook)
export const useCompleteAppointment = () => {
  const updateAppointmentStatus = useUpdateAppointmentStatus();
  
  return {
    ...updateAppointmentStatus,
    mutate: (appointmentId: string) => {
      updateAppointmentStatus.mutate({
        appointment_id: appointmentId,
        status: 'COMPLETE',
      });
    },
    mutateAsync: (appointmentId: string) => {
      return updateAppointmentStatus.mutateAsync({
        appointment_id: appointmentId,
        status: 'COMPLETE',
      });
    },
  };
};