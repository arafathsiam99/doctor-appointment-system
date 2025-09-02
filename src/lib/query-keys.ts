import type { 
  DoctorFilters, 
  AppointmentFilters, 
  DoctorAppointmentFilters 
} from '@/types';

// Query Keys Factory
export const queryKeys = {
  // Authentication
  auth: ['auth'] as const,
  currentUser: () => [...queryKeys.auth, 'current-user'] as const,

  // Doctors
  doctors: ['doctors'] as const,
  doctorsList: (filters: DoctorFilters) => [...queryKeys.doctors, 'list', filters] as const,
  doctorsInfinite: (filters: Omit<DoctorFilters, 'page'>) => [...queryKeys.doctors, 'infinite', filters] as const,

  // Specializations
  specializations: ['specializations'] as const,
  specializationsList: () => [...queryKeys.specializations, 'list'] as const,

  // Appointments
  appointments: ['appointments'] as const,
  patientAppointments: (filters: AppointmentFilters) => [...queryKeys.appointments, 'patient', filters] as const,
  doctorAppointments: (filters: DoctorAppointmentFilters) => [...queryKeys.appointments, 'doctor', filters] as const,
  appointmentDetails: (id: string) => [...queryKeys.appointments, 'detail', id] as const,

  // Mutations
  mutations: {
    login: ['login'] as const,
    registerPatient: ['register', 'patient'] as const,
    registerDoctor: ['register', 'doctor'] as const,
    createAppointment: ['create', 'appointment'] as const,
    updateAppointmentStatus: ['update', 'appointment', 'status'] as const,
    logout: ['logout'] as const,
  },
} as const;

// Helper function to invalidate related queries
export const getInvalidationKeys = {
  // Invalidate all appointment-related queries
  appointments: () => [queryKeys.appointments],
  
  // Invalidate patient appointments
  patientAppointments: () => [queryKeys.appointments, 'patient'],
  
  // Invalidate doctor appointments
  doctorAppointments: () => [queryKeys.appointments, 'doctor'],
  
  // Invalidate doctors list
  doctors: () => [queryKeys.doctors],
  
  // Invalidate all auth-related queries
  auth: () => [queryKeys.auth],
} as const;

// Type-safe query key utilities
export type QueryKey = typeof queryKeys;
export type DoctorsListKey = ReturnType<typeof queryKeys.doctorsList>;
export type PatientAppointmentsKey = ReturnType<typeof queryKeys.patientAppointments>;
export type DoctorAppointmentsKey = ReturnType<typeof queryKeys.doctorAppointments>;