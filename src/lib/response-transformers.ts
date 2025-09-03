import type { 
  User, 
  Doctor, 
  Patient, 
  Appointment, 
  Specialization,
  PaginatedResponse,
  ApiResponse 
} from '../types';

/**
 * Response transformation utilities to ensure consistent data format
 */
export const responseTransformers = {
  /**
   * Transform user data to ensure consistent format
   */
  transformUser: (user: any): User => {
    return {
      id: String(user.id),
      name: String(user.name || ''),
      email: String(user.email || ''),
      role: user.role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT',
      photo_url: user.photo_url ? String(user.photo_url) : undefined,
    };
  },

  /**
   * Transform doctor data to ensure consistent format
   */
  transformDoctor: (doctor: any): Doctor => {
    const baseUser = responseTransformers.transformUser(doctor);
    return {
      ...baseUser,
      role: 'DOCTOR' as const,
      specialization: String(doctor.specialization || ''),
    };
  },

  /**
   * Transform patient data to ensure consistent format
   */
  transformPatient: (patient: any): Patient => {
    const baseUser = responseTransformers.transformUser(patient);
    return {
      ...baseUser,
      role: 'PATIENT' as const,
    };
  },

  /**
   * Transform appointment data to ensure consistent format
   */
  transformAppointment: (appointment: any): Appointment => {
    return {
      id: String(appointment.id),
      doctorId: String(appointment.doctorId || appointment.doctor_id),
      patientId: String(appointment.patientId || appointment.patient_id),
      date: String(appointment.date),
      status: appointment.status === 'COMPLETED' ? 'COMPLETED' : 
              appointment.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
      doctor: appointment.doctor ? responseTransformers.transformDoctor(appointment.doctor) : undefined,
      patient: appointment.patient ? responseTransformers.transformPatient(appointment.patient) : undefined,
      createdAt: String(appointment.createdAt || appointment.created_at || new Date().toISOString()),
      updatedAt: String(appointment.updatedAt || appointment.updated_at || new Date().toISOString()),
    };
  },

  /**
   * Transform specialization data to ensure consistent format
   */
  transformSpecialization: (specialization: any): Specialization => {
    return {
      id: String(specialization.id),
      name: String(specialization.name || ''),
    };
  },

  /**
   * Transform paginated response to ensure consistent format
   */
  transformPaginatedResponse: <T>(
    response: any,
    itemTransformer: (item: any) => T
  ): PaginatedResponse<T> => {
    const data = Array.isArray(response.data) ? response.data : [];
    const pagination = response.pagination || {};

    return {
      data: data.map(itemTransformer),
      pagination: {
        page: Number(pagination.page || 1),
        limit: Number(pagination.limit || 10),
        total: Number(pagination.total || 0),
        totalPages: Number(pagination.totalPages || Math.ceil((pagination.total || 0) / (pagination.limit || 10))),
      },
    };
  },

  /**
   * Transform API response to ensure consistent format
   */
  transformApiResponse: <T>(response: any, dataTransformer?: (data: any) => T): ApiResponse<T> => {
    return {
      success: Boolean(response.success !== false),
      data: dataTransformer ? dataTransformer(response.data) : response.data,
      message: response.message ? String(response.message) : undefined,
    };
  },

  /**
   * Transform date string to ensure consistent format
   */
  transformDate: (date: string | Date): string => {
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    // Ensure the date string is in ISO format
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
  },

  /**
   * Transform array of items using a transformer function
   */
  transformArray: <T, U>(items: T[], transformer: (item: T) => U): U[] => {
    return Array.isArray(items) ? items.map(transformer) : [];
  },

  /**
   * Safely extract nested property from object
   */
  safeGet: (obj: any, path: string, defaultValue: any = null): any => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  },
};

export default responseTransformers;