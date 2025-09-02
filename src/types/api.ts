import type { 
  User, 
  Doctor, 
  Patient, 
  Appointment, 
  Specialization,
  LoginCredentials,
  RegisterPatientData,
  RegisterDoctorData,
  CreateAppointmentData,
  UpdateAppointmentStatusData,
  DoctorFilters,
  AppointmentFilters,
  DoctorAppointmentFilters,
  PaginatedResponse,
  ApiResponse
} from './index';

// API Endpoints
export interface ApiEndpoints {
  // Authentication
  login: '/auth/login';
  registerPatient: '/auth/register/patient';
  registerDoctor: '/auth/register/doctor';
  
  // Doctors
  doctors: '/doctors';
  specializations: '/specializations';
  
  // Appointments
  appointments: '/appointments';
  patientAppointments: '/appointments/patient';
  doctorAppointments: '/appointments/doctor';
  updateAppointmentStatus: '/appointments/update-status';
}

// API Request Types
export interface LoginRequest extends LoginCredentials {}

export interface RegisterPatientRequest extends RegisterPatientData {}

export interface RegisterDoctorRequest extends RegisterDoctorData {}

export interface CreateAppointmentRequest extends CreateAppointmentData {}

export interface UpdateAppointmentStatusRequest extends UpdateAppointmentStatusData {}

export interface GetDoctorsRequest extends DoctorFilters {}

export interface GetPatientAppointmentsRequest extends AppointmentFilters {}

export interface GetDoctorAppointmentsRequest extends DoctorAppointmentFilters {}

// API Response Types
export interface LoginResponse extends ApiResponse<{
  user: User;
  token: string;
}> {}

export interface RegisterResponse extends ApiResponse<{
  user: User;
  token: string;
}> {}

export interface GetDoctorsResponse extends ApiResponse<PaginatedResponse<Doctor>> {}

export interface GetSpecializationsResponse extends ApiResponse<Specialization[]> {}

export interface CreateAppointmentResponse extends ApiResponse<Appointment> {}

export interface GetAppointmentsResponse extends ApiResponse<PaginatedResponse<Appointment>> {}

export interface UpdateAppointmentStatusResponse extends ApiResponse<Appointment> {}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

// Request Configuration
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}