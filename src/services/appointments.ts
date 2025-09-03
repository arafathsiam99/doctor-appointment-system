import { makeApiRequest } from '../lib/api';
import { responseTransformers } from '../lib/response-transformers';
import type {
  Appointment,
  CreateAppointmentData,
  UpdateAppointmentStatusData,
  AppointmentFilters,
  DoctorAppointmentFilters,
  CreateAppointmentResponse,
  GetAppointmentsResponse,
  UpdateAppointmentStatusResponse,
  PaginatedResponse,
} from '../types';

// Appointment service functions
export const appointmentService = {
  /**
   * Create a new appointment
   */
  createAppointment: async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
    const response = await makeApiRequest<CreateAppointmentResponse>(
      'POST',
      '/appointments',
      appointmentData
    );
    
    return responseTransformers.transformAppointment(response.data);
  },

  /**
   * Get patient's appointments with optional filters
   */
  getPatientAppointments: async (filters: AppointmentFilters): Promise<PaginatedResponse<Appointment>> => {
    const response = await makeApiRequest<GetAppointmentsResponse>(
      'GET',
      '/appointments/patient',
      undefined,
      filters
    );
    
    return responseTransformers.transformPaginatedResponse(
      response.data,
      responseTransformers.transformAppointment
    );
  },

  /**
   * Get doctor's appointments with optional filters
   */
  getDoctorAppointments: async (filters: DoctorAppointmentFilters): Promise<PaginatedResponse<Appointment>> => {
    const response = await makeApiRequest<GetAppointmentsResponse>(
      'GET',
      '/appointments/doctor',
      undefined,
      filters
    );
    
    return responseTransformers.transformPaginatedResponse(
      response.data,
      responseTransformers.transformAppointment
    );
  },

  /**
   * Update appointment status (complete or cancel)
   */
  updateAppointmentStatus: async (statusData: UpdateAppointmentStatusData): Promise<Appointment> => {
    const response = await makeApiRequest<UpdateAppointmentStatusResponse>(
      'PATCH',
      '/appointments/update-status',
      statusData
    );
    
    return responseTransformers.transformAppointment(response.data);
  },

  /**
   * Get a specific appointment by ID
   */
  getAppointmentById: async (appointmentId: string): Promise<Appointment> => {
    const response = await makeApiRequest<{ success: boolean; data: Appointment }>(
      'GET',
      `/appointments/${appointmentId}`
    );
    
    return responseTransformers.transformAppointment(response.data);
  },

  /**
   * Cancel an appointment (convenience method)
   */
  cancelAppointment: async (appointmentId: string): Promise<Appointment> => {
    return appointmentService.updateAppointmentStatus({
      appointment_id: appointmentId,
      status: 'CANCELLED',
    });
  },

  /**
   * Complete an appointment (convenience method)
   */
  completeAppointment: async (appointmentId: string): Promise<Appointment> => {
    return appointmentService.updateAppointmentStatus({
      appointment_id: appointmentId,
      status: 'COMPLETE',
    });
  },
};

export default appointmentService;