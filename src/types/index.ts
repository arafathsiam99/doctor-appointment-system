// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR';
  photo_url?: string;
}

export interface Doctor extends User {
  role: 'DOCTOR';
  specialization: string;
}

export interface Patient extends User {
  role: 'PATIENT';
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR';
}

export interface RegisterPatientData {
  name: string;
  email: string;
  password: string;
  photo_url?: string;
}

export interface RegisterDoctorData extends RegisterPatientData {
  specialization: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  doctor?: Doctor;
  patient?: Patient;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  doctorId: string;
  date: string;
}

export interface UpdateAppointmentStatusData {
  appointment_id: string;
  status: 'COMPLETE' | 'CANCELLED';
}

// Specialization Type
export interface Specialization {
  id: string;
  name: string;
}

// Filter Types
export interface DoctorFilters {
  page: number;
  limit: number;
  search?: string;
  specialization?: string;
}

export interface AppointmentFilters {
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  page: number;
  limit?: number;
}

export interface DoctorAppointmentFilters extends AppointmentFilters {
  date?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// UI State Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface ModalState {
  appointmentBooking: boolean;
  statusUpdate: boolean;
  [key: string]: boolean;
}

// Re-export all types from other files
export * from './store';
export * from './api';
export * from './utils';